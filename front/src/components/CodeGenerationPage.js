import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Grid,
  Alert, Snackbar, CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StopIcon from '@mui/icons-material/Stop';
import FeedbackComponent from './FeedbackComponent';
import ModelSelector from './ModelSelector';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useLanguage, useDarkMode } from '../stores/hooks';
import { 
  useGenerationHistory,
  useGenerateTestCodeStream
} from '../hooks';

function CodeGenerationPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  
  // Estado local
  const [generationId, setGenerationId] = useState(null);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  
  // Hook de streaming
  const { 
    generateTestCode: generateTestCodeStream,
    isStreaming,
    abort: abortStream,
    generationId: streamGenerationId
  } = useGenerateTestCodeStream();
  
  // Loading
  const isLoading = isStreaming;
  
  // Usar generationId do streaming se disponível
  const activeGenerationId = streamGenerationId || generationId;
  
  const { 
    versions, 
    showHistory, 
    addNewVersion,
    restore: handleRestore, 
    toggleHistory 
  } = useGenerationHistory(activeGenerationId);

  // Local state
  const [testCases, setTestCases] = useState('');
  const [framework, setFramework] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [model, setModel] = useState({ apiName: '', version: '' });
  
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
    e.preventDefault();
    
    // Validar modelo selecionado
    if (!model || !model.apiName) {
      setError(t('generateCode.selectModel') || 'Por favor, selecione um modelo');
      return;
    }
    
    const promptText = testCases;
    const taskInfo = `${framework} tests in ${language}`;
    
    // Usa streaming (SSE)
    setResult(''); // Limpa resultado anterior
    await generateTestCodeStream(promptText, model, taskInfo, {
      onChunk: (chunk, fullContent) => {
        setResult(fullContent);
      },
      onComplete: (finalContent, id) => {
        setResult(finalContent);
        setGenerationId(id);
      },
      onError: (err) => {
        setError(err.message);
      }
    });
  };

  // Handler do callback de uma nova geração vinda do FeedbackComponent (regeneração)
  const handleRegeneratedContent = (regeneratedContent) => {
    if (generationId && result) {
      addNewVersion(result, { type: 'code', model: model.version });
    }
    setResult(regeneratedContent);
  };

  // Handler para abrir/fechar modal
  const openVersionsModal = () => toggleHistory();
  const closeVersionsModal = () => toggleHistory();
  const handleRestoreVersion = (idx) => {
    const restored = handleRestore(idx);
    if (restored?.content) setResult(restored.content);
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
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
            {t('generateCode.title')}
          </Typography>
        </Box>
        {generationId && versions.length > 0 && (
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

        <Box textAlign="center" display="flex" justifyContent="center" gap={2}>
          {isLoading ? (
            <Button
              variant="outlined"
              color="error"
              onClick={abortStream}
              startIcon={<StopIcon />}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                padding: '10px 32px',
                borderColor: '#ef4444',
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: '#fef2f2',
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  transition: '0.2s ease-in-out'
                }
              }}
            >
              {t('common.cancel') || 'Cancelar'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              disabled={isButtonDisabled}
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
              {t('generateCode.submit')}
            </Button>
          )}
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
                type="code" 
                originalContent={result}
                onRegenerateContent={handleRegeneratedContent}
              />
            </Box>
          )}

          <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md" PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' } }}>
            <DialogTitle sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>{t('generateCode.previousVersions')}</DialogTitle>
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
                    onClick={() => handleRestoreVersion(idx)}
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

export default CodeGenerationPage;