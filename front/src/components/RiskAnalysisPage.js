import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, Grid,
  Alert, Snackbar, CircularProgress, useMediaQuery, useTheme
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import FeedbackComponent from './FeedbackComponent';
import ModelSelector from './ModelSelector';
import { addVersion, getVersions, restoreVersion } from '../utils/generationHistory';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../contexts/DarkModeContext';

function RiskAnalysisPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [feature, setFeature] = useState('');
  const [jiraTaskCode, setJiraTaskCode] = useState('');
  const [isJiraLoading, setIsJiraLoading] = useState(false);
  const [model, setModel] = useState({ apiName: '', version: '' });
  const [result, setResult] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  const [educationMode] = React.useState(() => {
    const saved = localStorage.getItem('educationMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Exclusividade: só pode preencher um dos campos
  const isManualEnabled = !jiraTaskCode;
  const isJiraEnabled = !feature;
  
  const isButtonDisabled = (!feature && !jiraTaskCode) || model.apiName === '';

  const handleFeatureChange = (event) => {
    setFeature(event.target.value);
    if (event.target.value) setJiraTaskCode('');
  };

  const handleJiraTaskCodeChange = (event) => {
    setJiraTaskCode(event.target.value);
    if (event.target.value) setFeature('');
  };

  const fetchJiraTaskDescription = async () => {
    if (!jiraTaskCode) return;
    setIsJiraLoading(true);
    setError(null);
    try {
      const backendUrl = 'http://localhost:5000';
      const jiraToken = localStorage.getItem('jiraToken');
      const jiraEmail = localStorage.getItem('jiraEmail');
      const jiraBaseUrl = localStorage.getItem('jiraBaseUrl');
      if (!jiraToken || !jiraEmail || !jiraBaseUrl) {
        setError(t('riskAnalysis.jiraNotConfigured'));
        setIsJiraLoading(false);
        return;
      }
      const response = await axios.post(
        `${backendUrl}/api/jira-task`,
        {
          jiraTaskCode,
          jiraToken,
          jiraEmail,
          jiraBaseUrl
        }
      );
      if (!response.data.fields.description.content[0].content[0].text) setError(t('riskAnalysis.descriptionNotFound'));
      const description = 'Titulo: '+ response.data.fields.summary + '\n\nDescrição: ' + response.data.fields.description.content[0].content[0].text || '';
      setFeature(description);
    } catch (err) {
      setError(t('riskAnalysis.errorFetchingJira'));
      console.error(err);
    } finally {
      setIsJiraLoading(false);
    }
  };

  const handleModelChange = (event) => {
    const selectedModel = event.target.value;
    setModel(selectedModel);
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    setError(null);
    e.preventDefault();
    
    let token;
    if (model.apiName === 'gemini') {
      token = localStorage.getItem('geminiToken');
    } else if (model.apiName === 'chatgpt') {
      token = localStorage.getItem('chatgptToken');
    } else {
      setError('Sem token para realizar requisição');
      setIsLoading(false);
      return;
    }
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      let educationalPrompt = '';
      if (educationMode) {
        educationalPrompt += `\n\n---\n${t('riskAnalysis.educationalPrompt')}\n`;
      }
      const response = await axios.post(
        `${backendUrl}/api/analyze-risks?token=${token}`,
        {
          feature,
          model,
          educationMode,
          promptSupplement: educationMode ? educationalPrompt : undefined
        }
      );
      
      const resultData = model.apiName === 'gemini' ? response.data.data : response.data;
      setResult(resultData);
      if (generationId) {
        addVersion(generationId, resultData, { type: 'risk', model });
      }
      // Save to local storage and get the ID
      const id = saveGenerationToLocalStorage(resultData, 'risk', model, `Risk Analysis: ${feature.substring(0, 50)}...`);
      setGenerationId(id);
      setVersions(getVersions(id));
    } catch (error) {
      setError(t('riskAnalysis.errorAnalyzing'));
      console.error('Erro ao analisar riscos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratedContent = (regeneratedContent) => {
    if (generationId && result) {
      addVersion(generationId, result, { type: 'risk', model });
    }
    setResult(regeneratedContent);
    if (generationId) setVersions(getVersions(generationId));
  };
  const openVersionsModal = () => {
    if (generationId) setVersions(getVersions(generationId));
    setShowHistory(true);
  };
  const closeVersionsModal = () => setShowHistory(false);
  const handleRestore = idx => {
    if (!generationId) return;
    const v = restoreVersion(generationId, idx);
    if (v && v.content) setResult(v.content);
    setShowHistory(false);
  };

  return (
    <Grid
      container
      spacing={3}
      direction="column"
      alignItems="center"
      justifyContent="center"
      padding={10}
      style={{ minHeight: '81vh' }}
    >
      <Grid size={{xs:10, md:6, lg:4}} style={{ minWidth: '1000px' }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
            {t('riskAnalysis.title')}
          </Typography>
        </Box>
        {generationId && getVersions(generationId).length > 0 && (
          <Box my={2} display="flex" justifyContent="center">
              <Button 
                variant="outlined" 
                color="primary"
                onClick={openVersionsModal}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  '&:hover': {
                    backgroundColor: '#f0f9ff',
                    borderColor: '#2563eb',
                    color: '#2563eb',
                    transition: '0.2s ease-in-out'
                  }
                }}
              >
                {t('common.previousVersions')}
              </Button>
          </Box>
        )}

        <ModelSelector
          value={model}
          onChange={handleModelChange}
          label={t('common.selectModel')}
          required
        />

        <Box 
          display="flex" 
          flexDirection={isMobile ? "column" : "row"}
          gap={isMobile ? 1 : 2} 
          alignItems={isMobile ? "stretch" : "center"} 
          sx={{ mb: 3 }}
        >
          <TextField
            label={t('riskAnalysis.jiraCode')}
            value={jiraTaskCode}
            onChange={handleJiraTaskCodeChange}
            variant="outlined"
            size="small"
            style={{ flex: 1 }}
            disabled={!isJiraEnabled}
            helperText={!isJiraEnabled ? t('riskAnalysis.disabledManual') : ""}
            fullWidth={isMobile}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={fetchJiraTaskDescription}
            disabled={!jiraTaskCode || isJiraLoading || !isJiraEnabled}
            fullWidth={isMobile}
            sx={{ 
              mt: isMobile ? 1 : 0,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: '#3b82f6',
              color: '#3b82f6',
              '&:hover': {
                backgroundColor: '#f0f9ff',
                borderColor: '#2563eb',
                color: '#2563eb',
                transition: '0.2s ease-in-out'
              },
              '&:disabled': {
                borderColor: '#d1d5db',
                color: '#9ca3af'
              }
            }}
          >
            {isJiraLoading ? <CircularProgress size={20} /> : t('riskAnalysis.fetchJira')}
          </Button>
        </Box>

        <TextField
          required
          label={t('riskAnalysis.featureDescription')}
          multiline
          rows={8}
          value={feature}
          onChange={handleFeatureChange}
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          placeholder={t('riskAnalysis.featurePlaceholder')}
          disabled={!isManualEnabled}
          helperText={!isManualEnabled ? t('riskAnalysis.disabledManual') : ""}
        />

        <Box textAlign="center">
          <Button
            variant="contained"
            color="primary"
            disabled={isButtonDisabled || isLoading}
            onClick={handleSubmit}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              fontWeight: 600,
              textTransform: 'none',
              padding: '10px 32px',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
                transform: 'translateY(-2px)',
                transition: '0.2s ease-in-out'
              },
              '&:disabled': {
                background: '#d1d5db',
                color: '#9ca3af'
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : t('riskAnalysis.submit')}
          </Button>
        </Box>
      </Grid>
      
      <div hidden={!isLoading}>
        <CircularProgress />
      </div>
      
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-22%)',
          width: '100%',
          maxWidth: 600,
          px: 2,
        }}
      >
        {error && (
          <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}
      </Box>
      
      {result && (
        <Box
          sx={{
            width: '100%',
            maxWidth: '1000px',
            marginTop: 4,
            backgroundColor: isDarkMode ? '#1a202c' : '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
            overflowX: 'auto',
            '&:hover': {
              boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
              transition: '0.2s ease-in-out'
            }
          }}
        >
          <Box sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </Box>
          
          {/* Feedback component */}
          {generationId && (
            <Box mt={3}>
              <FeedbackComponent 
                generationId={generationId} 
                type="risk" 
                originalContent={result}
                onRegenerateContent={handleRegeneratedContent}
              />
            </Box>
          )}

          <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md" PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' } }}>
            <DialogTitle sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>{t('riskAnalysis.previousVersions')}</DialogTitle>
            <DialogContent sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' }}>
              {versions.length === 0 && <Typography sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{t('common.noVersions')}</Typography>}
              {versions.map((v, idx) => (
                <Box key={idx} mb={3} p={2} sx={{ border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, borderRadius: '8px', background: isDarkMode ? '#232b33' : '#f9fafb' }}>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{v.date && (new Date(v.date)).toLocaleString()}</Typography>
                  <Box mt={1} mb={1} sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{v.content || ''}</ReactMarkdown>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleRestore(idx)}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      '&:hover': {
                        backgroundColor: isDarkMode ? '#1a202c' : '#f0f9ff',
                        borderColor: '#2563eb',
                        color: '#2563eb',
                        transition: '0.2s ease-in-out'
                      }
                    }}
                  >
                    {t('common.restoreVersion')}
                  </Button>
                </Box>
              ))}
            </DialogContent>
            <DialogActions sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#ffffff', borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
              <Button 
                onClick={closeVersionsModal} 
                color="primary"
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  color: isDarkMode ? '#d1d5db' : '#3b82f6',
                  '&:hover': {
                    backgroundColor: isDarkMode ? '#232b33' : '#f0f9ff',
                    transition: '0.2s ease-in-out'
                  }
                }}
              >
                {t('common.close')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Grid>
  );
}

export default RiskAnalysisPage;