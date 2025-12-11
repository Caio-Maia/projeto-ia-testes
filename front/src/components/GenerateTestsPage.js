import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid,  Alert, Snackbar, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FeedbackComponent from './FeedbackComponent';
import ModelSelector from './ModelSelector';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useLanguage, useDarkMode } from '../stores/hooks';
import { 
  useJira, 
  useGenerationHistory,
  useEducationMode,
  usePrompt,
  useGenerateTestsMutation
} from '../hooks';

function GenerateTestsPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const { prompt } = usePrompt('testCasesModel');
  
  // Custom Hooks
  const { educationMode } = useEducationMode();
  
  // React Query Mutation para gerar testes
  const [generationId, setGenerationId] = useState(null);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  
  const generateTestsMutation = useGenerateTestsMutation({
    onSuccess: (data, variables, id) => {
      setResult(data);
      setGenerationId(id);
    },
    onError: (err) => {
      setError(err.message);
    }
  });
  
  const isLoading = generateTestsMutation.isPending;
  
  const { 
    fetchTask, 
    loading: isJiraLoading, 
    error: jiraError,
    isConfigured: isJiraConfigured 
  } = useJira();
  const { 
    versions, 
    showHistory, 
    addNewVersion,
    restore: handleRestore, 
    toggleHistory 
  } = useGenerationHistory(generationId);

  // Local state
  const [taskDescription, setTaskDescription] = useState('');
  const [jiraTaskCode, setJiraTaskCode] = useState('');
  const [model, setModel] = useState({ apiName: '', version: '' });
  
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
    if (!isJiraConfigured) {
      setError(t('generateTests.jiraNotConfigured'));
      return;
    }
    try {
      const response = await fetchTask(jiraTaskCode);
      if (!response?.fields?.description?.content?.[0]?.content?.[0]?.text) {
        setError(t('generateTests.descriptionNotFound'));
        return;
      }
      const description = 'Titulo: '+ response.fields.summary + '\n\nDescrição: ' + response.fields.description.content[0].content[0].text || '';
      setTaskDescription(description);
    } catch (err) {
      setError(jiraError || t('generateTests.errorFetchingJira'));
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar modelo selecionado
    if (!model || !model.apiName) {
      setError(t('generateTests.selectModel') || 'Por favor, selecione um modelo');
      return;
    }
    
    // Add education mode instruction if enabled
    let promptText = `${prompt} \n\n Aqui está uma história de usuário:\n\n "${taskDescription}"`;
    
    if (educationMode) {
      promptText += `\n\n---\n${t('generateTests.educationalPrompt')}\n`;
    }
    
    const taskInfo = jiraTaskCode
      ? `JIRA: ${jiraTaskCode} - ${taskDescription.substring(0, 100)}`
      : `Manual: ${taskDescription.substring(0, 100)}`;
    
    // Usa React Query mutation
    generateTestsMutation.mutate({ 
      promptText, 
      model, 
      taskInfo,
      generationId 
    });
  };

  const handleRegeneratedContent = (regeneratedContent) => {
    if (generationId && result) {
      addNewVersion(result, { type: 'testcase', model: model.version });
    }
    setResult(regeneratedContent);
  };

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
      <Grid size={{xs:10, md:6, lg:4}} style={{minWidth: '1000px'}}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
            {t('generateTests.title')}
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
                type="testcase" 
                originalContent={result}
                onRegenerateContent={handleRegeneratedContent}
              />
            </Box>
          )}

          <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md" PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' } }}>
            <DialogTitle sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>{t('generateTests.previousVersions')}</DialogTitle>
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

export default GenerateTestsPage;