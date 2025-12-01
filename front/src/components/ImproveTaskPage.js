
import React, { useState } from 'react';
import axios from 'axios';
import {
    Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Grid,
    Alert, Snackbar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    useMediaQuery, useTheme
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import FeedbackComponent from './FeedbackComponent';
import ModelSelector from './ModelSelector';
import { AI_MODELS } from '../utils/aiModels';
import { addVersion, getVersions, restoreVersion } from '../utils/generationHistory';
import { useLanguage } from '../contexts/LanguageContext';
import { usePrompt } from '../hooks/usePrompt';

function ImproveTaskPage() {
    const { t } = useLanguage();
    const { prompt } = usePrompt('taskModel');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState({ apiName: '', version: '' });
    const [error, setError] = useState(null);
    const [result, setResult] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [versions, setVersions] = useState([]);
    const [taskDescription, setTaskDescription] = useState('');
    const [jiraTaskCode, setJiraTaskCode] = useState('');
    const [isJiraLoading, setIsJiraLoading] = useState(false);
    const [generationId, setGenerationId] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Education mode state (read from localStorage)
    const [educationMode] = useState(() => {
        const savedMode = localStorage.getItem('educationMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    // Novos estados para dialog de atualização JIRA
    const [jiraDialogOpen, setJiraDialogOpen] = useState(false);
    const [jiraUpdateLoading, setJiraUpdateLoading] = useState(false);
    const [jiraUpdateSuccess, setJiraUpdateSuccess] = useState(false);

    // Exclusividade: só pode preencher um dos campos
    const isManualEnabled = !jiraTaskCode;
    const isJiraEnabled = !taskDescription;

    // Só permite submit se um dos campos estiver preenchido e modelo selecionado
    const isButtonDisabled = (!taskDescription && !jiraTaskCode) || model.apiName === '';
    const options = AI_MODELS;

    
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
                setError(t('improveTask.jiraNotConfigured'));
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
            if (!response.data.fields.description.content[0].content[0].text) setError(t('improveTask.descriptionNotFound'));
            const description = 'Titulo: '+ response.data.fields.summary + '\n\nDescrição: ' + response.data.fields.description.content[0].content[0].text || '';
            setTaskDescription(description);
        } catch (err) {
            setError(t('improveTask.errorFetchingJira'));
            console.error(err);
        } finally {
            setIsJiraLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        setIsLoading(true);
        setError(null);
        e.preventDefault();
        let token = localStorage.getItem(`${model.apiName}Token`);
        if (!token) {
            setError('Sem token para realizar requisição');
            setIsLoading(false);
            return;
        }
        try {
            const backendUrl =  'http://localhost:5000';
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
            
            const response = await axios.post(
                `${backendUrl}/api/${model.apiName}/improve-task?token=${token}`,
                {
                    model: model.version,
                    data: promptText,
                    educationMode // Sinaliza explicitamente para o backend também
                }
            );
            setResult(response.data.data);
            if (generationId) {
                addVersion(generationId, response.data.data, { type: 'task', model: model.version });
            }
            const taskInfo = jiraTaskCode
                ? `JIRA: ${jiraTaskCode} - ${userStory.substring(0, 100)}`
                : `Manual: ${userStory.substring(0, 100)}`;
            const id = saveGenerationToLocalStorage(
                response.data.data,
                'task',
                model.version,
                taskInfo
            );
            setGenerationId(id);
            setVersions(getVersions(id));
        } catch (error) {
            setError(t('improveTask.errorImproving'));
            console.error('Erro ao melhorar a tarefa:', error);
        } finally {
            setIsLoading(false);
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
            const backendUrl = 'http://localhost:5000';
            const jiraToken = localStorage.getItem('jiraToken');
            const jiraEmail = localStorage.getItem('jiraEmail');
            const jiraBaseUrl = localStorage.getItem('jiraBaseUrl');
            const newDescription = extractJiraUpdateText();
            if (!jiraTaskCode || !jiraToken || !jiraEmail || !jiraBaseUrl || !newDescription) {
                setError('Dados insuficientes para atualizar o cartão JIRA.');
                setJiraUpdateLoading(false);
                return;
            }
            await axios.post(`${backendUrl}/api/jira-task/update`, {
                jiraTaskCode,
                jiraToken,
                jiraEmail,
                jiraBaseUrl,
                newDescription
            });
            setJiraUpdateSuccess(true);
            setJiraDialogOpen(false);
        } catch (err) {
            setError('Erro ao atualizar cartão JIRA.');
            console.error(err);
        } finally {
            setJiraUpdateLoading(false);
        }
    };

    const handleRegeneratedContent = (regeneratedContent) => {
        if (generationId && result) {
            addVersion(generationId, result, { type: 'task', model: model.version });
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
                        sx={{ fontWeight: 700, color: '#1f2937' }}
                    >
                        {t('improveTask.title')}
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

                <Box textAlign="center">
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
                        backgroundColor: '#fff',
                        padding: { xs: '15px', sm: '20px' },
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
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
                                <Typography variant="body2"><b>{t('improveTask.tip')}</b> Explique passo a passo seu raciocínio para construir critérios de aceitação e casos de teste robustos.</Typography>
                                <Typography variant="body2"><b>{t('improveTask.concept')}</b> Diferencie testes positivos (usuário faz ação certa) e negativos (usuário erra ou há exceção).</Typography>
                                <Typography variant="body2"><b>{t('improveTask.coverage')}</b> Explore valores-limite e partições de equivalência para garantir qualidade.</Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                    Explicação e raciocínio fornecidos pela IA abaixo 👇:
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Apresentação do resultado e explicação */}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
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
                    <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md">
                        <DialogTitle>{t('improveTask.previousVersions')}</DialogTitle>
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

            {/* Dialog de confirmação para atualizar cartão JIRA */}
            <Dialog 
                open={jiraDialogOpen} 
                onClose={handleCloseJiraDialog} 
                maxWidth="md" 
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>{t('improveTask.jiraUpdateTitle')} ({jiraTaskCode})</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" gutterBottom>
                        {t('improveTask.jiraUpdateText')}
                    </Typography>
                    <Box
                        sx={{
                            backgroundColor: '#f5f5f5',
                            borderRadius: 2,
                            padding: 2,
                            minHeight: 120,
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            overflowX: 'auto'
                        }}
                    >
                        {extractJiraUpdateText()}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                      onClick={handleCloseJiraDialog} 
                      disabled={jiraUpdateLoading}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: '#6b7280',
                        '&:hover': {
                          backgroundColor: '#f3f4f6',
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
