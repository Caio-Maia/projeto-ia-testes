import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Grid,  Alert, Snackbar, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
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
import { AI_MODELS } from '../utils/aiModels';
import { useLanguage } from '../contexts/LanguageContext';
import { usePrompt } from '../hooks/usePrompt';

function GenerateTestsPage() {
  const { t } = useLanguage();
  const { prompt } = usePrompt('testCasesModel');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [taskDescription, setTaskDescription] = useState('');
  const [jiraTaskCode, setJiraTaskCode] = useState('');
  const [isJiraLoading, setIsJiraLoading] = useState(false);
  const [model, setModel] = useState({ apiName: '', version: '' });
  const [result, setResult] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  
  // Education mode state (read from localStorage)
  const [educationMode] = useState(() => {
    const savedMode = localStorage.getItem('educationMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  // Exclusividade: só pode preencher um dos campos
  const isManualEnabled = !jiraTaskCode;
  const isJiraEnabled = !taskDescription;
  
  const isButtonDisabled = (!taskDescription && !jiraTaskCode) || model.apiName === '';

  const handleModelChange = (event) => {
    const selectedModel = event.target.value;
    setModel(selectedModel);
  };

  const handleTaskDescriptionChange = (event) => {
    setTaskDescription(event.target.value);
    if (event.target.value) setJiraTaskCode('');
  };

  const handleJiraTaskCodeChange = (event) => {
    setJiraTaskCode(event.target.value);
    if (event.target.value) setTaskDescription('');
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
        setError(t('generateTests.jiraNotConfigured'));
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
      if (!response.data.fields.description.content[0].content[0].text) setError(t('generateTests.descriptionNotFound'));
      const description = 'Titulo: '+ response.data.fields.summary + '\n\nDescrição: ' + response.data.fields.description.content[0].content[0].text || '';
      setTaskDescription(description);
    } catch (err) {
      setError(t('generateTests.errorFetchingJira'));
      console.error(err);
    } finally {
      setIsJiraLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    setError(null);
    e.preventDefault();
    
    // Validar modelo selecionado
    if (!model || !model.apiName) {
      setError(t('generateTests.selectModel') || 'Por favor, selecione um modelo');
      setIsLoading(false);
      return;
    }
    
    let token = localStorage.getItem(`${model.apiName}Token`);
    if (!token) {
      setError(t('generateTests.tokenNotFound') || 'Token não configurado para ' + model.apiName);
      setIsLoading(false);
      return;
    }
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      
      // Add education mode instruction if enabled
      let promptText = `${prompt} \n\n Aqui está uma história de usuário:\n\n "${taskDescription}"`;
      
      let educationalPrompt = '';
      if (educationMode) {
        educationalPrompt += `\n\n---\n${t('generateTests.educationalPrompt')}\n`;
      }
      const response = await axios.post(`${backendUrl}/api/${model.apiName}/generate-tests?token=${token}`, {
        model: model.version,
        data: promptText + (educationMode ? educationalPrompt : ''),
        educationMode,
        promptSupplement: educationMode ? educationalPrompt : undefined
      });
      
      setResult(response.data.data);
      if (generationId) {
        addVersion(generationId, response.data.data, { type: 'testcase', model: model.version });
      }
      const id = saveGenerationToLocalStorage(response.data.data, 'testcase', model.version);
      setGenerationId(id);
      setVersions(getVersions(id));
    } catch (error) {
      setError(error);
      console.error('Erro ao gerar casos de teste: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratedContent = (regeneratedContent) => {
    if (generationId && result) {
      addVersion(generationId, result, { type: 'testcase', model: model.version });
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
      <Grid size={{xs:10, md:6, lg:4}} style={{minWidth: '1000px'}}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1f2937' }}>
            {t('generateTests.title')}
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
          flexDirection="column"
          gap={2} 
          sx={{ mb: 3 }}
        >
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              label={t('generateTests.jiraCode')}
              value={jiraTaskCode}
              onChange={handleJiraTaskCodeChange}
              variant="outlined"
              size="small"
              style={{ flex: 1 }}
              disabled={!isJiraEnabled}
              helperText={!isJiraEnabled ? t('generateTests.disabledManual') : ""}
              fullWidth
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={fetchJiraTaskDescription}
              disabled={!jiraTaskCode || isJiraLoading || !isJiraEnabled}
              sx={{ 
                mt: 1,
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
              {isJiraLoading ? <CircularProgress size={20} /> : t('generateTests.fetchJira')}
            </Button>
          </Box>
        </Box>

        <TextField required
          label={t('generateTests.taskDescription')}
          multiline
          rows={6}
          value={taskDescription}
          onChange={handleTaskDescriptionChange}
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          disabled={!isManualEnabled}
          helperText={!isManualEnabled ? t('generateTests.disabledManual') : ""}
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
            {t('common.submit')}
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
          >{error && (
        <Snackbar open={error} autoHideDuration={4}>
          <Alert severity="error">{t('generateTests.errorGenerating')}</Alert>
        </Snackbar>
      )}
      </Box>
      {result && (
        <Box
          sx={{
            width: '100%',
            maxWidth: '1000px',
            marginTop: 4,
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
            overflowX: 'auto',
            '&:hover': {
              boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
              transition: '0.2s ease-in-out'
            }
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          
          {/* Feedback component */}
          {generationId && (
            <Box mt={3}>
              <FeedbackComponent 
                generationId={generationId} 
                type="testcase" 
                originalContent={result}
                onRegenerateContent={handleRegeneratedContent}
              />
            </Box>
          )}

          <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md">
            <DialogTitle>{t('generateTests.previousVersions')}</DialogTitle>
            <DialogContent>
              {versions.length === 0 && <Typography>{t('common.noVersions')}</Typography>}
              {versions.map((v, idx) => (
                <Box key={idx} mb={3} p={2} sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                  <Typography variant="caption">{v.date && (new Date(v.date)).toLocaleString()}</Typography>
                  <Box mt={1} mb={1}>
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
                        backgroundColor: '#f0f9ff',
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
            <DialogActions>
              <Button 
                onClick={closeVersionsModal} 
                color="primary"
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#f0f9ff',
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

export default GenerateTestsPage;