import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, Typography, Paper, CircularProgress, Container } from '@mui/material';

function PromptPage() {
    const [selectedFile, setSelectedFile] = useState(''); // Nome do arquivo selecionado
    const [content, setContent] = useState('');  // Conteúdo do arquivo
    const [isLoading, setIsLoading] = useState(false);  // Controle de carregamento
    const [fileList] = useState(['taskModel', 'testCasesModel']);  // Lista dos arquivos disponíveis
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        const fetchPromptFromBackend = async (fileName) => {
            setIsLoading(true);
            try {
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
                const response = await axios.get(`${backendUrl}/api/files/${fileName}`);
                const promptContent = response.data.content;
                setContent(promptContent);
                localStorage.setItem(`${fileName}Prompt`, promptContent);
            } catch (error) {
                console.error('Erro ao buscar o conteúdo do arquivo:', error);
                setContent(''); // Limpa o conteúdo no caso de erro
                showSnackbar('Erro ao carregar o conteúdo do arquivo.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
    
        if (selectedFile) {
            const localPromptContent = localStorage.getItem(`${selectedFile}Prompt`);
            if (localPromptContent) {
                setContent(localPromptContent);
            } else {
                fetchPromptFromBackend(selectedFile);
            }
        } else {
            setContent(''); // Limpa o conteúdo quando nenhum arquivo é selecionado
        }
    }, [selectedFile]);

    const handleSave = () => {
        localStorage.setItem(`${selectedFile}Prompt`, content);
        showSnackbar('Conteúdo salvo com sucesso!', 'success');
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '40px' }}>
            <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Edição de Prompt
                </Typography>

                <FormControl fullWidth margin="normal">
                    <InputLabel shrink={!!selectedFile}>Selecione o arquivo</InputLabel>
                    <Select
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        displayEmpty
                    >
                        {fileList.map((file) => (
                            <MenuItem key={file} value={file}>
                                {file}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <CircularProgress />
                    </div>
                ) : selectedFile ? (
                    <div>
                        <TextField
                            label="Conteúdo do Arquivo"
                            fullWidth
                            multiline
                            rows={10}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            margin="dense"
                            variant="outlined"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            style={{ marginTop: '20px', width: '100%' }}
                            disabled={!selectedFile}
                        >
                            Salvar
                        </Button>
                    </div>
                ) : (
                    <Typography variant="body1" color="textSecondary" align="center" style={{ marginTop: '20px' }}>
                        Selecione um arquivo para editar
                    </Typography>
                )}
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default PromptPage;
