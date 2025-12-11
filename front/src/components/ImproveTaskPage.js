import React, { useState } from 'react';
import {
    Box, Button, TextField, Typography, Grid,
    Alert, Snackbar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    useMediaQuery, useTheme, Switch, FormControlLabel, Tooltip
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StreamIcon from '@mui/icons-material/Stream';
import FeedbackComponent from './FeedbackComponent';
import ModelSelector from './ModelSelector';
import { useLanguage, useDarkMode } from '../stores/hooks';
import { 
    useJira, 
    useGenerationHistory,
    useEducationMode,
    usePrompt,
    useImproveTaskMutation,
    useImproveTaskStream
} from '../hooks';

function ImproveTaskPage() {
    const { t } = useLanguage();
    const { isDarkMode } = useDarkMode();
    const { prompt } = usePrompt('taskModel');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Custom Hooks
    const { educationMode } = useEducationMode();
    
    // Estado para modo streaming
    const [useStreaming, setUseStreaming] = useState(true);
    
    // React Query Mutation para melhorar tarefa (modo normal)
    const [generationId, setGenerationId] = useState(null);
    const [result, setResult] = useState('');
    const [error, setError] = useState(null);
    
    const improveTaskMutation = useImproveTaskMutation({
        onSuccess: (data, variables, id) => {
            setResult(data);
            setGenerationId(id);
        },
        onError: (err) => {
            setError(err.message);
        }
    });
    
    // Hook de streaming
    const { 
        improveTask: improveTaskStream,
        isStreaming,
        abort: abortStream,
        generationId: streamGenerationId
    } = useImproveTaskStream();
    
    // Loading combinado
    const isLoading = improveTaskMutation.isPending || isStreaming;
    
    // Usar generationId do streaming se disponível
    const activeGenerationId = streamGenerationId || generationId;
    
    const { 
        fetchTask, 
        updateDescription, 
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
    } = useGenerationHistory(activeGenerationId);

    // Local state
    const [model, setModel] = useState({ apiName: '', version: '' });
    const [taskDescription, setTaskDescription] = useState('');
    const [jiraTaskCode, setJiraTaskCode] = useState('');

    // Novos estados para dialog de atualização JIRA
    const [jiraDialogOpen, setJiraDialogOpen] = useState(false);
    const [jiraUpdateLoading, setJiraUpdateLoading] = useState(false);
    const [jiraUpdateSuccess, setJiraUpdateSuccess] = useState(false);

    // Exclusividade: só pode preencher um dos campos
    const isManualEnabled = !jiraTaskCode;
    const isJiraEnabled = !taskDescription;

    // Só permite submit se um dos campos estiver preenchido e modelo selecionado
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
            setError(t('improveTask.jiraNotConfigured'));
            return;
        }
        try {
            const response = await fetchTask(jiraTaskCode);
            if (!response?.fields?.description?.content?.[0]?.content?.[0]?.text) {
                setError(t('improveTask.descriptionNotFound'));
                return;
            }
            const description = 'Titulo: '+ response.fields.summary + '\n\nDescrição: ' + response.fields.description.content[0].content[0].text || '';
            setTaskDescription(description);
        } catch (err) {
            setError(jiraError || t('improveTask.errorFetchingJira'));
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userStory = taskDescription;
        
        // Add education mode instruction if enabled
        let promptText = `${prompt}

Aqui está uma história de usuário:

"${userStory}"
`;
        if (educationMode) {
            promptText += `

---
## ${t('improveTask.educationalPrompt')}`;
        }
        
        const taskInfo = jiraTaskCode
            ? `JIRA: ${jiraTaskCode} - ${userStory.substring(0, 100)}`
            : `Manual: ${userStory.substring(0, 100)}`;
        
        if (useStreaming) {
            // Usa streaming (SSE)
            setResult(''); // Limpa resultado anterior
            console.log('[Streaming] Iniciando streaming...');
            await improveTaskStream(promptText, model, taskInfo, {
                onChunk: (chunk, fullContent) => {
                    console.log('[Streaming] Chunk recebido:', chunk.length, 'chars');
                    setResult(fullContent);
                },
                onComplete: (finalContent, id) => {
                    console.log('[Streaming] Completo:', finalContent.length, 'chars');
                    setResult(finalContent);
                    setGenerationId(id);
                },
                onError: (err) => {
                    console.error('[Streaming] Erro:', err);
                    setError(err.message);
                }
            });
        } else {
            // Usa React Query mutation (modo normal)
            improveTaskMutation.mutate({ 
                promptText, 
                model, 
                taskInfo,
                generationId 
            });
        }
    };

    // --- NOVO: Extração do texto após "Versão Ajustada:" ---
    const extractJiraUpdateText = () => {
        if (!result) return '';
        const marker = 'Versão Ajustada:';
        const idx = result.indexOf(marker);
        if (idx === -1) return '';
        return result.substring(idx + marker.length).trim();
    };

    // --- NOVO: Handler para abrir dialog ---
    const handleOpenJiraDialog = () => {
        setJiraDialogOpen(true);
    };

    const handleCloseJiraDialog = () => {
        setJiraDialogOpen(false);
    };

    // --- NOVO: Handler para atualizar cartão JIRA ---
    const handleConfirmJiraUpdate = async () => {
        setJiraUpdateLoading(true);
        setError(null);
        setJiraUpdateSuccess(false);
        try {
            const newDescription = extractJiraUpdateText();
            if (!jiraTaskCode || !newDescription) {
                setError('Dados insuficientes para atualizar o cartão JIRA.');
                setJiraUpdateLoading(false);
                return;
            }
            await updateDescription(jiraTaskCode, newDescription);
            setJiraUpdateSuccess(true);
            setJiraDialogOpen(false);
        } catch (err) {
            setError(jiraError || 'Erro ao atualizar cartão JIRA.');
            console.error(err);
        } finally {
            setJiraUpdateLoading(false);
        }
    };

    const handleRegeneratedContent = (regeneratedContent) => {
        if (generationId && result) {
            addNewVersion(result, { type: 'task', model: model.version });
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
            spacing={isMobile ? 2 : 3}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ 
                padding: { xs: 2, sm: 4, md: 10 },
                minHeight: '81vh'
            }}
            className="responsive-container"
        >
            <Grid 
                item 
                xs={12} 
                sx={{ 
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '90%', md: '1000px' }
                }}
            >
                <Box textAlign="center" mb={isMobile ? 2 : 3}>
                    <Typography 
                        variant={isMobile ? "h5" : "h4"} 
                        component="h1"
                        className="heading-responsive"
                        sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}
                    >
                        {t('improveTask.title')}
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
                    flexDirection={isMobile ? "column" : "row"}
                    gap={isMobile ? 1 : 2} 
                    alignItems={isMobile ? "stretch" : "center"} 
                    sx={{ mb: 2 }}
                >
                    <TextField
                        label={t('improveTask.jiraCode')}
                        value={jiraTaskCode}
                        onChange={handleJiraTaskCodeChange}
                        variant="outlined"
                        size="small"
                        style={{ flex: 1 }}
                        disabled={!isJiraEnabled}
                        helperText={!isJiraEnabled ? t('improveTask.disabledManual') : ""}
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
                        {isJiraLoading ? <CircularProgress size={20} /> : t('improveTask.fetchJira')}
                    </Button>
                </Box>

                <TextField
                    required
                    label={t('improveTask.taskDescription')}
                    multiline
                    rows={isMobile ? 4 : 6}
                    value={taskDescription}
                    onChange={handleTaskDescriptionChange}
                    variant="outlined"
                    fullWidth
                    sx={{ mb: { xs: 2, sm: 3 } }}
                    disabled={!isManualEnabled}
                    helperText={!isManualEnabled ? t('improveTask.disabledJira') : ""}
                />

                <Box textAlign="center" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Tooltip title={t('improveTask.streamingTooltip') || "Streaming mostra a resposta em tempo real conforme é gerada"}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={useStreaming}
                                    onChange={(e) => setUseStreaming(e.target.checked)}
                                    color="primary"
                                    size="small"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <StreamIcon fontSize="small" />
                                    <Typography variant="body2">Streaming</Typography>
                                </Box>
                            }
                        />
                    </Tooltip>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={isButtonDisabled || isLoading}
                            onClick={handleSubmit}
                            size={isMobile ? "medium" : "large"}
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
                            {isLoading ? <CircularProgress size={24} /> : t('common.submit')}
                        </Button>
                        {isStreaming && (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={abortStream}
                                size={isMobile ? "medium" : "large"}
                            >
                                {t('common.cancel') || 'Cancelar'}
                            </Button>
                        )}
                    </Box>
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
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: { xs: '90%', sm: 600 },
                    px: 2,
                    zIndex: 1000
                }}
            >{error && (
                <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
                    <Alert severity="error">{error}</Alert>
                </Snackbar>
            )}
            </Box>
            <Snackbar
                open={jiraUpdateSuccess}
                autoHideDuration={4000}
                onClose={() => setJiraUpdateSuccess(false)}
            >
                <Alert severity="success">{t('improveTask.jiraUpdateSuccess')}</Alert>
            </Snackbar>
            {result && (
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', sm: '90%', md: '1000px' },
                        marginTop: { xs: 2, sm: 3, md: 4 },
                        backgroundColor: isDarkMode ? '#1a202c' : '#fff',
                        padding: { xs: '15px', sm: '20px' },
                        borderRadius: '8px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
                        overflowX: 'auto',
                        '&:hover': {
                          boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
                          transition: '0.2s ease-in-out'
                        }
                    }}
                    className="card-responsive"
                >
                    {/* Modo Educacional - Tooltips, dicas e estudo */}
                    {educationMode && (
                        <Box mb={3}>
                            <Box display="flex" gap={2} alignItems="center" mb={1}>
                                <InfoOutlinedIcon color="primary" />
                                <Typography variant="subtitle1" color="primary">
                                    {t('improveTask.educationalMode')}
                                </Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#1f2937' }}><b>{t('improveTask.tip')}</b> Explique passo a passo seu raciocínio para construir critérios de aceitação e casos de teste robustos.</Typography>
                                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#1f2937' }}><b>{t('improveTask.concept')}</b> Diferencie testes positivos (usuário faz ação certa) e negativos (usuário erra ou há exceção).</Typography>
                                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#1f2937' }}><b>{t('improveTask.coverage')}</b> Explore valores-limite e partições de equivalência para garantir qualidade.</Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontStyle: 'italic' }}>
                                    Explicação e raciocínio fornecidos pela IA abaixo 👇:
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Apresentação do resultado e explicação */}
                    <Box sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', position: 'relative' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                        {isStreaming && (
                            <Box 
                                component="span" 
                                sx={{ 
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '20px',
                                    backgroundColor: 'primary.main',
                                    animation: 'blink 1s infinite',
                                    verticalAlign: 'text-bottom',
                                    ml: 0.5,
                                    '@keyframes blink': {
                                        '0%, 50%': { opacity: 1 },
                                        '51%, 100%': { opacity: 0 }
                                    }
                                }}
                            />
                        )}
                    </Box>
                    {educationMode && (
                        <Box mt={3}>
                            <Typography variant="subtitle2" color="primary">{t('improveTask.studySuggestions')}:</Typography>
                            <ul style={{ color: '#1565c0', margin: 0, paddingLeft: '1.3em' }}>
                                <li>Valores-limite</li>
                                <li>Particionamento de Equivalência</li>
                                <li>Critérios de Aceitação</li>
                                <li>Behavior Driven Development (BDD)</li>
                                <li>Tipos de Testes (Positivo x Negativo)</li>
                            </ul>
                        </Box>
                    )}

                    {/* Botão para atualizar cartão JIRA */}
                    {jiraTaskCode && extractJiraUpdateText() && (
                        <Box textAlign="right" sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenJiraDialog}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
                                    transform: 'translateY(-2px)',
                                    transition: '0.2s ease-in-out'
                                  }
                                }}
                            >
                                {t('improveTask.updateJira')}
                            </Button>
                        </Box>
                    )}
                    
                    {/* Feedback component */}
                    {generationId && (
                        <Box mt={isMobile ? 2 : 3}>
                            <FeedbackComponent 
                                generationId={generationId} 
                                type="task" 
                                originalContent={result}
                                onRegenerateContent={handleRegeneratedContent}
                            />
                        </Box>
                    )}
                    <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md" PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' } }}>
                        <DialogTitle sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>{t('improveTask.previousVersions')}</DialogTitle>
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

            {/* Dialog de confirmação para atualizar cartão JIRA */}
            <Dialog 
                open={jiraDialogOpen} 
                onClose={handleCloseJiraDialog} 
                maxWidth="md" 
                fullWidth
                fullScreen={isMobile}
                PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' } }}
            >
                <DialogTitle sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>{t('improveTask.jiraUpdateTitle')} ({jiraTaskCode})</DialogTitle>
                <DialogContent sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                        {t('improveTask.jiraUpdateText')}
                    </Typography>
                    <Box
                        sx={{
                            backgroundColor: isDarkMode ? '#1a202c' : '#f5f5f5',
                            borderRadius: 2,
                            padding: 2,
                            minHeight: 120,
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            overflowX: 'auto',
                            color: isDarkMode ? '#d1d5db' : '#1f2937',
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                        }}
                    >
                        {extractJiraUpdateText()}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#ffffff', borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
                    <Button 
                      onClick={handleCloseJiraDialog} 
                      disabled={jiraUpdateLoading}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: isDarkMode ? '#d1d5db' : '#6b7280',
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#232b33' : '#f3f4f6',
                          transition: '0.2s ease-in-out'
                        }
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleConfirmJiraUpdate}
                        variant="contained"
                        color="primary"
                        disabled={jiraUpdateLoading}
                        sx={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
                            transition: '0.2s ease-in-out'
                          }
                        }}
                    >
                        {jiraUpdateLoading ? <CircularProgress size={20} /> : t('improveTask.confirmUpdate')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}

export default ImproveTaskPage;
