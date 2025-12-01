import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    Box, 
    Typography,
    Paper,
    Grid,
    InputAdornment,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function TokenDialog({ open, onClose, permitClose }) {
    const [chatgptToken, setChatgptToken] = useState('');
    const [geminiToken, setGeminiToken] = useState('');
    const [jiraToken, setJiraToken] = useState('');
    const [jiraEmail, setJiraEmail] = useState('');
    const [jiraBaseUrl, setJiraBaseUrl] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [showTokens, setShowTokens] = useState({
        chatgpt: false,
        gemini: false,
        jira: false
    });

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

    const handleClose = () => {
        if (permitClose) {
            onClose(false);
        }
    };

    const toggleTokenVisibility = (tokenName) => {
        setShowTokens(prev => ({
            ...prev,
            [tokenName]: !prev[tokenName]
        }));
    };

    const tokenFieldProps = (tokenName, value) => ({
        type: showTokens[tokenName] ? 'text' : 'password',
        InputProps: {
            endAdornment: (
                <InputAdornment position="end">
                    <IconButton
                        onClick={() => toggleTokenVisibility(tokenName)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                        sx={{
                            backgroundColor: 'transparent',
                            '&:hover': {
                                backgroundColor: 'transparent'
                            }
                        }}
                    >
                        {showTokens[tokenName] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                </InputAdornment>
            )
        }
    });

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            disableEscapeKeyDown={!permitClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ 
                onClick: (e) => e.stopPropagation(),
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                }
            }}
        >
            {/* Header */}
            <Box 
                sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <LockIcon sx={{ color: '#fff', fontSize: 28 }} />
                    <Box>
                        <DialogTitle sx={{ p: 0, color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
                            Configurar Tokens
                        </DialogTitle>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Adicione seus tokens de API
                        </Typography>
                    </Box>
                </Box>
                {permitClose && (
                    <IconButton 
                        onClick={handleClose}
                        sx={{
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.2)'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>

            {/* Content */}
            <DialogContent sx={{ pt: 3, pb: 2 }}>
                {/* AI Tokens Section */}
                <Paper 
                    elevation={0}
                    sx={{
                        p: 2.5,
                        mb: 3,
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: 2
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Box sx={{ fontSize: '1.5rem' }}>🤖</Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                            Tokens IA
                        </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Token ChatGPT"
                                placeholder="sk-..."
                                fullWidth
                                value={chatgptToken}
                                onChange={(e) => setChatgptToken(e.target.value)}
                                variant="outlined"
                                size="small"
                                {...tokenFieldProps('chatgpt', chatgptToken)}
                                helperText="Obtenha em openai.com/api-keys"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#fff'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Token Gemini"
                                placeholder="AIza..."
                                fullWidth
                                value={geminiToken}
                                onChange={(e) => setGeminiToken(e.target.value)}
                                variant="outlined"
                                size="small"
                                {...tokenFieldProps('gemini', geminiToken)}
                                helperText="Obtenha em aistudio.google.com"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#fff'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* JIRA Section */}
                <Paper 
                    elevation={0}
                    sx={{
                        p: 2.5,
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: 2
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Box sx={{ fontSize: '1.5rem' }}>📋</Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                            Credenciais JIRA
                        </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="URL Base JIRA"
                                placeholder="https://suaempresa.atlassian.net"
                                fullWidth
                                value={jiraBaseUrl}
                                onChange={(e) => setJiraBaseUrl(e.target.value)}
                                variant="outlined"
                                size="small"
                                helperText="Exemplo: https://suaempresa.atlassian.net"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#fff'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="E-mail JIRA"
                                placeholder="seu.email@empresa.com"
                                type="email"
                                fullWidth
                                value={jiraEmail}
                                onChange={(e) => setJiraEmail(e.target.value)}
                                variant="outlined"
                                size="small"
                                helperText="E-mail da sua conta JIRA"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#fff'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Token JIRA (API Token)"
                                placeholder="ATATT..."
                                fullWidth
                                value={jiraToken}
                                onChange={(e) => setJiraToken(e.target.value)}
                                variant="outlined"
                                size="small"
                                {...tokenFieldProps('jira', jiraToken)}
                                helperText="Obtenha em id.atlassian.com/manage-profile/security"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: '#fff'
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ p: 2, gap: 1, backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                {permitClose && (
                    <Button 
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'none',
                          color: '#6b7280',
                          borderColor: '#e5e7eb',
                          backgroundColor: '#fff',
                          fontSize: '1rem',
                          padding: '8px 16px',
                          minWidth: 'auto',
                          '&:hover': {
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            borderColor: '#fca5a5',
                            transition: '0.2s ease-in-out'
                          }
                        }}
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
                          transition: '0.2s ease-in-out'
                        },
                        '&:disabled': {
                            background: '#d1d5db',
                            color: '#9ca3af'
                        }
                    }}
                >
                    Salvar Tokens
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TokenDialog;