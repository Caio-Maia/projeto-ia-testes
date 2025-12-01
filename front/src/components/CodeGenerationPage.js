import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, Grid,
  Alert, Snackbar, CircularProgress, FormControl, InputLabel, Select, MenuItem
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

function CodeGenerationPage() {
  const { t } = useLanguage();
  const [testCases, setTestCases] = useState('');
  const [framework, setFramework] = useState('');
  const [language, setLanguage] = useState('JavaScript');
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
  
  const isButtonDisabled = testCases === '' || framework === '' || model.apiName === '';

  const frameworkOptions = [
    'Jest',
    'Mocha',
    'Cypress',
    'Playwright',
    'Selenium',
    'TestCafe',
    'WebdriverIO',
    'Puppeteer'
  ];

  const languageOptions = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#'
  ];

  const handleTestCasesChange = (event) => {
    setTestCases(event.target.value);
  };

  const handleFrameworkChange = (event) => {
    setFramework(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleModelChange = (event) => {
    const selectedModel = event.target.value;
    setModel(selectedModel);
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    setError(null);
    e.preventDefault();
    
    // Validar modelo selecionado
    if (!model || !model.apiName) {
      setError(t('generateCode.selectModel') || 'Por favor, selecione um modelo');
      setIsLoading(false);
      return;
    }
    
    let token = localStorage.getItem(`${model.apiName}Token`);
    if (!token) {
      setError(t('generateCode.tokenNotFound') || 'Token não configurado para ' + model.apiName);
      setIsLoading(false);
      return;
    }
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      // PROMPT EDUCACIONAL
      let educationalPrompt = '';
      if (educationMode) {
        educationalPrompt += `\n\n---\n${t('generateCode.educationalPrompt')}\n`;
      }
      const response = await axios.post(
        `${backendUrl}/api/${model.apiName}/generate-test-code?token=${token}`,
        {
          testCases,
          framework,
          language,
          model: model.version,
          educationMode,
          promptSupplement: educationMode ? educationalPrompt : undefined
        }
      );
      
      const resultData = model.apiName === 'gemini' ? response.data.data : response.data;
      setResult(resultData);
      // Save as first version if not present yet
      if (generationId) {
        addVersion(generationId, resultData, { framework, language, type: 'code', model: model.version });
      }
      // Save to local storage and get the ID
      const id = saveGenerationToLocalStorage(resultData, 'code', model.version, `${framework} tests in ${language}`);
      setGenerationId(id);
      // update versions
      setVersions(getVersions(id));
    } catch (error) {
      setError(t('generateCode.errorGenerating'));
      console.error('Erro ao gerar código de teste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler do callback de uma nova geração vinda do FeedbackComponent (regeneração)
  const handleRegeneratedContent = (regeneratedContent) => {
    // Salva versão anterior
    if (generationId && result)  {
      addVersion(generationId, result, { type: 'code', model: model.version });
    }
    setResult(regeneratedContent);
    if (generationId) setVersions(getVersions(generationId));
  };

  // Handler para abrir/fechar modal
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
      <Grid size={{ xs:10, md:6, lg:4 }} style={{ minWidth: '1000px' }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1f2937' }}>
            {t('generateCode.title')}
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

        <FormControl required fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="framework-select-label">{t('generateCode.framework')}</InputLabel>
          <Select
            labelId="framework-select-label"
            id="framework-select"
            value={framework}
            onChange={handleFrameworkChange}
            label="Framework de Teste"
          >
            {frameworkOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="language-select-label">{t('generateCode.language')}</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            label="Linguagem"
          >
            {languageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          required
          label={t('generateCode.testCases')}
          multiline
          rows={8}
          value={testCases}
          onChange={handleTestCasesChange}
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          placeholder={t('generateCode.testCasesPlaceholder')}
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
            {isLoading ? <CircularProgress size={24} /> : t('generateCode.submit')}
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
                type="code" 
                originalContent={result}
                onRegenerateContent={handleRegeneratedContent}
              />
            </Box>
          )}

          <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md">
            <DialogTitle>{t('generateCode.previousVersions')}</DialogTitle>
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

export default CodeGenerationPage;