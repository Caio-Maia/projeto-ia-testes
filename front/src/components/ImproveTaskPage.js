
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Grid2,
    Alert, Snackbar, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';

function ImproveTaskPage() {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState({ apiName: '', version: '' });
    const [error, setError] = useState(null);
    const [result, setResult] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [jiraTaskCode, setJiraTaskCode] = useState('');
    const [isJiraLoading, setIsJiraLoading] = useState(false);

    // Novos estados para dialog de atualização JIRA
    const [jiraDialogOpen, setJiraDialogOpen] = useState(false);
    const [jiraUpdateLoading, setJiraUpdateLoading] = useState(false);
    const [jiraUpdateSuccess, setJiraUpdateSuccess] = useState(false);

    // Exclusividade: só pode preencher um dos campos
    const isManualEnabled = !jiraTaskCode;
    const isJiraEnabled = !taskDescription;

    // Só permite submit se um dos campos estiver preenchido e modelo selecionado
    const isButtonDisabled = (!taskDescription && !jiraTaskCode) || model.apiName === '';

    const options = [
        { label: 'ChatGPT', apiName: 'chatgpt', version: 'chatgpt-4' },
        { label: 'Gemini 1.5 Flash', apiName: 'gemini', version: 'gemini-1.5-flash-latest' },
        { label: 'Gemini 2.0 Flash', apiName: 'gemini', version: 'gemini-2.0-flash' },
    ];

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
            const response = await axios.post(
                `${backendUrl}/api/${model.apiName}/improve-task?token=${token}`,
                {
                    model: model.version,
                    data: `${prompt} \n\n Aqui está uma história de usuário:\n\n "${userStory}"`
                }
            );
            setResult(response.data.data);

            const taskInfo = jiraTaskCode
                ? `JIRA: ${jiraTaskCode} - ${userStory.substring(0, 100)}`
                : `Manual: ${userStory.substring(0, 100)}`;
            saveGenerationToLocalStorage(
                response.data.data,
                'task',
                model.version,
                taskInfo
            );
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

    return (
        <Grid2
            container
            spacing={3}
            direction="column"
            alignItems="center"
            justifyContent="center"
            padding={10}
            style={{ minHeight: '81vh' }}
        >
            <Grid2 item xs={10} md={6} lg={4} style={{ minWidth: '1000px' }}>
                <Box textAlign="center">
                    <Typography variant="h4" gutterBottom>
                        Melhore sua História de Usuário
                    </Typography>
                </Box>

                <FormControl required fullWidth variant="outlined" sx={{ mb: 3 }}>
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

                <Box display="flex" gap={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                        label="Código da Task JIRA (ex: SOD-12)"
                        value={jiraTaskCode}
                        onChange={handleJiraTaskCodeChange}
                        variant="outlined"
                        size="small"
                        style={{ flex: 1 }}
                        disabled={!isJiraEnabled}
                        helperText={!isJiraEnabled ? "Desabilitado ao preencher descrição manual" : ""}
                    />
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={fetchJiraTaskDescription}
                        disabled={!jiraTaskCode || isJiraLoading || !isJiraEnabled}
                    >
                        {isJiraLoading ? <CircularProgress size={20} /> : 'Buscar JIRA'}
                    </Button>
                </Box>

                <TextField
                    required
                    label="Task Description"
                    multiline
                    rows={6}
                    value={taskDescription}
                    onChange={handleTaskDescriptionChange}
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 3 }}
                    disabled={!isManualEnabled}
                    helperText={!isManualEnabled ? "Desabilitado ao buscar task do JIRA" : ""}
                />

                <Box textAlign="center">
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isButtonDisabled || isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </Box>
            </Grid2>
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
                        maxWidth: '1000px',
                        marginTop: 4,
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        overflowX: 'auto'
                    }}
                >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                    {/* Botão para atualizar cartão JIRA */}
                    {jiraTaskCode && extractJiraUpdateText() && (
                        <Box textAlign="right" sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleOpenJiraDialog}
                            >
                                Atualizar cartão JIRA
                            </Button>
                        </Box>
                    )}
                </Box>
            )}

            {/* Dialog de confirmação para atualizar cartão JIRA */}
            <Dialog open={jiraDialogOpen} onClose={handleCloseJiraDialog} maxWidth="md" fullWidth>
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
                            whiteSpace: 'pre-wrap'
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
        </Grid2>
    );
}

export default ImproveTaskPage;
