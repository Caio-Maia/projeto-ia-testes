import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Divider, Typography } from '@mui/material';

function TokenDialog({ open, onClose, permitClose }) {
    const [chatgptToken, setChatgptToken] = useState('');
    const [geminiToken, setGeminiToken] = useState('');
    const [jiraToken, setJiraToken] = useState('');
    const [jiraEmail, setJiraEmail] = useState('');
    const [jiraBaseUrl, setJiraBaseUrl] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    useEffect(() => {
        if (open) {
            setChatgptToken(localStorage.getItem('chatgptToken') || '');
            setGeminiToken(localStorage.getItem('geminiToken') || '');
            setJiraToken(localStorage.getItem('jiraToken') || '');
            setJiraEmail(localStorage.getItem('jiraEmail') || '');
            setJiraBaseUrl(localStorage.getItem('jiraBaseUrl') || '');
        }
    }, [open]);

    useEffect(() => {
        // Habilita o botão se pelo menos um dos tokens estiver preenchido
        setIsSubmitDisabled(
            !chatgptToken && !geminiToken && !jiraToken && !jiraEmail && !jiraBaseUrl
        );
    }, [chatgptToken, geminiToken, jiraToken, jiraEmail, jiraBaseUrl]);

    const handleSubmit = () => {
        if (chatgptToken) localStorage.setItem('chatgptToken', chatgptToken);
        if (geminiToken) localStorage.setItem('geminiToken', geminiToken);
        if (jiraToken) localStorage.setItem('jiraToken', jiraToken);
        if (jiraEmail) localStorage.setItem('jiraEmail', jiraEmail);
        if (jiraBaseUrl) localStorage.setItem('jiraBaseUrl', jiraBaseUrl);
        onClose(false);
    };

    const handleClose = (e) => {
        if (!permitClose) {
            e.preventDefault();
        } else {
            onClose(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            disableEscapeKeyDown={!permitClose}
            PaperProps={{ onClick: (e) => e.stopPropagation() }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
                <DialogTitle>Insira seus tokens</DialogTitle>
                {permitClose && (
                    <Button onClick={handleClose} sx={{
                        color: 'grey',
                        minWidth: '36px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '1px',
                        padding: '0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        x
                    </Button>
                )}
            </Box>
            <DialogContent>
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Tokens IA</Typography>
                <TextField
                    label="Token ChatGPT"
                    fullWidth
                    value={chatgptToken}
                    onChange={(e) => setChatgptToken(e.target.value)}
                    margin="dense"
                />
                <TextField
                    label="Token Gemini"
                    fullWidth
                    value={geminiToken}
                    onChange={(e) => setGeminiToken(e.target.value)}
                    margin="dense"
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Credenciais JIRA</Typography>
                <TextField
                    label="Token JIRA (API Token)"
                    fullWidth
                    value={jiraToken}
                    onChange={(e) => setJiraToken(e.target.value)}
                    margin="dense"
                />
                <TextField
                    label="E-mail JIRA"
                    fullWidth
                    value={jiraEmail}
                    onChange={(e) => setJiraEmail(e.target.value)}
                    margin="dense"
                />
                <TextField
                    label="URL Base JIRA (ex: https://suaempresa.atlassian.net)"
                    fullWidth
                    value={jiraBaseUrl}
                    onChange={(e) => setJiraBaseUrl(e.target.value)}
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    variant="contained"
                    color="primary"
                >
                    Enviar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TokenDialog;