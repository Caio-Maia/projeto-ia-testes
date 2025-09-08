
import React, { useState, useEffect } from 'react';
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
import { AI_MODELS } from '../utils/aiModels';
import { addVersion, getVersions, restoreVersion } from '../utils/generationHistory';

function ImproveTaskPage() {
    const [prompt, setPrompt] = useState('');
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

    useEffect(() => {
        const localPromptContent = localStorage.getItem('taskModelPrompt');
        if (!localPromptContent) {
            fetchPromptFromBackend('taskModel');
        } else {
            setPrompt(localPromptContent);
        }
    }, []);

    const fetchPromptFromBackend = async (fileName) => {
        setIsLoading(true);
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            const response = await axios.get(`${backendUrl}/api/files/${fileName}`);
            const promptContent = response.data.content;
            setPrompt(promptContent);
            localStorage.setItem('taskModelPrompt', promptContent);
        } catch (error) {
            console.error('Erro ao buscar o conteúdo do arquivo:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModelChange = (event) => {
        const { apiName, version } = event.target.value;
        setModel({ apiName, version });
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
                setError('Credenciais do JIRA não configuradas.');
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
            if (!response.data.fields.description.content[0].content[0].text) setError('Descrição não encontrada para esta task.');
            const description = 'Titulo: '+ response.data.fields.summary + '\n\nDescrição: ' + response.data.fields.description.content[0].content[0].text || '';
            setTaskDescription(description);
        } catch (err) {
            setError('Erro ao buscar descrição no backend. Verifique o código e as credenciais.');
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
## Modo Educacional:
- Explique passo a passo como a IA chegou nas sugestões de melhoria.
- Dê dicas e explique conceitos teóricos envolvidos (por que cada critério/caso é importante? O que é um teste negativo? Por que valores-limite?)
- Liste conceitos e práticas recomendadas citadas no texto.
- Sugira estudos/leituras sobre BDD, critérios de aceitação, valores-limite e testes.
- As explicações devem ser claras e direcionadas para o aprendizado prático de QA e requisitos.
`;
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
            setError('Erro ao melhorar a tarefa');
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
                    >
                        Melhore sua História de Usuário
                    </Typography>
                </Box>
                {generationId && getVersions(generationId).length > 0 && (
                    <Box my={2} display="flex" justifyContent="center">
                        <Button variant="outlined" color="secondary" onClick={openVersionsModal}>
                          Ver versões anteriores
                        </Button>
                    </Box>
                )}

                <FormControl 
                    required 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mb: { xs: 2, sm: 3 } }}
                >
                    <InputLabel id="model-select-label">Select Model</InputLabel>
                    <Select
                        labelId="model-select-label"
                        id="model-select"
                        value={model}
                        onChange={handleModelChange}
                        label="Select Model"
                        renderValue={(selected) =>
                            selected.apiName ? `${selected.apiName} (${selected.version})` : ''
                        }
                    >
                        {options.map((option) => (
                            <MenuItem key={option.apiName} value={option}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box 
                    display="flex" 
                    flexDirection={isMobile ? "column" : "row"}
                    gap={isMobile ? 1 : 2} 
                    alignItems={isMobile ? "stretch" : "center"} 
                    sx={{ mb: 2 }}
                >
                    <TextField
                        label="Código da Task JIRA (ex: SOD-12)"
                        value={jiraTaskCode}
                        onChange={handleJiraTaskCodeChange}
                        variant="outlined"
                        size="small"
                        style={{ flex: 1 }}
                        disabled={!isJiraEnabled}
                        helperText={!isJiraEnabled ? "Desabilitado ao preencher descrição manual" : ""}
                        fullWidth={isMobile}
                    />
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={fetchJiraTaskDescription}
                        disabled={!jiraTaskCode || isJiraLoading || !isJiraEnabled}
                        fullWidth={isMobile}
                        sx={{ mt: isMobile ? 1 : 0 }}
                    >
                        {isJiraLoading ? <CircularProgress size={20} /> : 'Buscar JIRA'}
                    </Button>
                </Box>

                <TextField
                    required
                    label="Task Description"
                    multiline
                    rows={isMobile ? 4 : 6}
                    value={taskDescription}
                    onChange={handleTaskDescriptionChange}
                    variant="outlined"
                    fullWidth
                    sx={{ mb: { xs: 2, sm: 3 } }}
                    disabled={!isManualEnabled}
                    helperText={!isManualEnabled ? "Desabilitado ao buscar task do JIRA" : ""}
                />

                <Box textAlign="center">
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isButtonDisabled || isLoading}
                        onClick={handleSubmit}
                        size={isMobile ? "medium" : "large"}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Submit'}
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
                <Alert severity="success">Cartão JIRA atualizado com sucesso!</Alert>
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
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        overflowX: 'auto'
                    }}
                    className="card-responsive"
                >
                    {/* Modo Educacional - Tooltips, dicas e estudo */}
                    {educationMode && (
                        <Box mb={3}>
                            <Box display="flex" gap={2} alignItems="center" mb={1}>
                                <InfoOutlinedIcon color="primary" />
                                <Typography variant="subtitle1" color="primary">
                                    Modo Educacional!
                                </Typography>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="body2"><b>💡 Dica:</b> Explique passo a passo seu raciocínio para construir critérios de aceitação e casos de teste robustos.</Typography>
                                <Typography variant="body2"><b>🧩 Conceito:</b> Diferencie testes positivos (usuário faz ação certa) e negativos (usuário erra ou há exceção).</Typography>
                                <Typography variant="body2"><b>🛡️ Cobertura:</b> Explore valores-limite e partições de equivalência para garantir qualidade.</Typography>
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
                            <Typography variant="subtitle2" color="primary">Sugestões de Estudo:</Typography>
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
                                color="secondary"
                                onClick={handleOpenJiraDialog}
                                size={isMobile ? "small" : "medium"}
                            >
                                Atualizar cartão JIRA
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
                        <DialogTitle>Versões anteriores desta tarefa</DialogTitle>
                        <DialogContent>
                            {versions.length === 0 && <Typography>Nenhuma versão salva.</Typography>}
                            {versions.map((v, idx) => (
                                <Box key={idx} mb={3} p={2} sx={{ border: '1px solid #eee', borderRadius: 2, background: '#f9f9f9' }}>
                                    <Typography variant="caption">{v.date && (new Date(v.date)).toLocaleString()}</Typography>
                                    <Box mt={1} mb={1}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{v.content || ''}</ReactMarkdown>
                                    </Box>
                                    <Button variant="outlined" size="small" onClick={() => handleRestore(idx)}>Restaurar esta versão</Button>
                                </Box>
                            ))}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeVersionsModal} color="primary">Fechar</Button>
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
                <DialogTitle>Atualizar cartão JIRA ({jiraTaskCode})</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" gutterBottom>
                        O texto abaixo será enviado para o cartão JIRA:
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
                    <Button onClick={handleCloseJiraDialog} disabled={jiraUpdateLoading}>Cancelar</Button>
                    <Button
                        onClick={handleConfirmJiraUpdate}
                        variant="contained"
                        color="primary"
                        disabled={jiraUpdateLoading}
                    >
                        {jiraUpdateLoading ? <CircularProgress size={20} /> : 'Confirmar atualização'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}

export default ImproveTaskPage;
