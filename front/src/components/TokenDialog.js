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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    IconButton,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useDarkMode } from '../stores/hooks';

function TokenDialog({ open, onClose, permitClose, onSuccess }) {
    const { isDarkMode } = useDarkMode();
    const [formValues, setFormValues] = useState({
        chatgptToken: '',
        geminiToken: '',
        jiraToken: '',
        jiraEmail: '',
        jiraBaseUrl: '',
    });
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
    const [selectedManagementTool, setSelectedManagementTool] = useState('jira');
    const [showTokens, setShowTokens] = useState({
        chatgpt: false,
        gemini: false,
        jira: false,
        trello: false,
    });

    const aiProviders = [
        {
            key: 'chatgpt',
            label: 'OpenAI ChatGPT',
            storageKey: 'chatgptToken',
            placeholder: 'sk-...',
            helperText: 'Obtenha em openai.com/api-keys',
            enabled: true,
        },
        {
            key: 'gemini',
            label: 'Google Gemini',
            storageKey: 'geminiToken',
            placeholder: 'AIza...',
            helperText: 'Obtenha em aistudio.google.com',
            enabled: true,
        },
    ];

    const workToolsConfig = {
        jira: [
        {
            key: 'jiraBaseUrl',
            label: 'URL Base',
            placeholder: 'https://suaempresa.atlassian.net',
            helperText: 'Exemplo: https://suaempresa.atlassian.net',
            enabled: true,
        },
        {
            key: 'jiraEmail',
            label: 'E-mail',
            placeholder: 'seu.email@empresa.com',
            helperText: 'E-mail da sua conta JIRA',
            enabled: true,
        },
        {
            key: 'jiraToken',
            label: 'Token API',
            placeholder: 'ATATT...',
            helperText: 'Obtenha em id.atlassian.com/manage-profile/security',
            secure: true,
            visibilityKey: 'jira',
            enabled: true,
        },
        ],
    };

    const managementTools = [
        { value: 'jira', label: 'JIRA' },
    ];

    const workTools = workToolsConfig[selectedManagementTool] || [];

    useEffect(() => {
        if (open) {
            setFormValues({
                chatgptToken: localStorage.getItem('chatgptToken') || '',
                geminiToken: localStorage.getItem('geminiToken') || '',
                jiraToken: localStorage.getItem('jiraToken') || '',
                jiraEmail: localStorage.getItem('jiraEmail') || '',
                jiraBaseUrl: localStorage.getItem('jiraBaseUrl') || '',
            });
        }
    }, [open]);

    useEffect(() => {
        const hasAnyValue = Object.values(formValues).some((value) => Boolean(value));
        setIsSubmitDisabled(!hasAnyValue);
    }, [formValues]);

    const handleSubmit = () => {
        Object.entries(formValues).forEach(([key, value]) => {
            if (value) {
                localStorage.setItem(key, value);
            }
        });

        onClose(false);
        
        // Call onSuccess callback if provided (used for redirect after token setup)
        if (onSuccess && (formValues.chatgptToken || formValues.geminiToken)) {
            onSuccess();
        }
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

    const tokenFieldProps = (tokenName) => ({
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

    const updateField = (key, value) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const inputBaseSx = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? '#1a202c' : '#fff',
            color: isDarkMode ? '#f3f4f6' : '#1f2937',
            '& fieldset': {
                borderColor: isDarkMode ? '#374151' : '#ccc',
            },
            '&:hover fieldset': {
                borderColor: isDarkMode ? '#4b5563' : '#999',
            },
            '&.Mui-focused fieldset': {
                borderColor: isDarkMode ? '#60a5fa' : '#1976d2',
            },
        },
        '& .MuiInputLabel-root': {
            color: isDarkMode ? '#d1d5db' : '#666',
        },
        '& .MuiFormHelperText-root': {
            color: isDarkMode ? '#9ca3af' : '#666',
        },
    };

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
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    backgroundColor: isDarkMode ? '#0f1419' : '#ffffff',
                    border: 'none',
                    outline: 'none'
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
                            IA e ferramentas de trabalho
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
            <DialogContent sx={{ p: 0, backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' }}>
                {/* AI Tokens Section */}
                <Paper 
                    elevation={0}
                    sx={{
                        p: 2,
                        mx: 2,
                        mt: 2,
                        mb: 0,
                        backgroundColor: isDarkMode ? '#1a202c' : '#f8f9fa',
                        borderRadius: 2
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Box sx={{ fontSize: '1.5rem' }}>🤖</Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937', flex: 1 }}>
                            Provedores de IA
                        </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                        {aiProviders.map((provider) => (
                            <Grid size={12} key={provider.key}>
                                <TextField
                                    label={`Token ${provider.label}`}
                                    placeholder={provider.placeholder}
                                    fullWidth
                                    value={provider.enabled ? (formValues[provider.storageKey] || '') : ''}
                                    onChange={(e) => updateField(provider.storageKey, e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    disabled={!provider.enabled}
                                    {...tokenFieldProps(provider.key)}
                                    helperText={provider.helperText}
                                    sx={inputBaseSx}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                <Divider sx={{ mx: 2, mt: 2, borderColor: isDarkMode ? '#374151' : '#e5e7eb' }} />

                {/* JIRA Section */}
                <Paper 
                    elevation={0}
                    sx={{
                        p: 2,
                        mx: 2,
                        my: 2,
                        backgroundColor: isDarkMode ? '#1a202c' : '#f8f9fa',
                        borderRadius: 2
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Box sx={{ fontSize: '1.5rem' }}>📋</Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937', flex: 1 }}>
                            Ferramentas de Gestão
                        </Typography>
                    </Box>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel sx={{ color: isDarkMode ? '#d1d5db' : '#666' }}>Ferramenta</InputLabel>
                        <Select
                            value={selectedManagementTool}
                            label="Ferramenta"
                            onChange={(e) => setSelectedManagementTool(e.target.value)}
                            sx={{
                                backgroundColor: isDarkMode ? '#1a202c' : '#fff',
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isDarkMode ? '#374151' : '#ccc',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isDarkMode ? '#4b5563' : '#999',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: isDarkMode ? '#60a5fa' : '#1976d2',
                                },
                            }}
                        >
                            {managementTools.map((tool) => (
                                <MenuItem key={tool.value} value={tool.value}>
                                    {tool.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Grid container spacing={2}>
                        {workTools.map((field) => (
                        <Grid size={12} key={field.key}>
                            <TextField
                                label={`JIRA ${field.label}`}
                                placeholder={field.placeholder}
                                fullWidth
                                value={formValues[field.key] || ''}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                variant="outlined"
                                size="small"
                                type={field.key === 'jiraEmail' ? 'email' : 'text'}
                                helperText={field.helperText}
                                {...(field.secure ? tokenFieldProps(field.visibilityKey) : {})}
                                sx={inputBaseSx}
                            />
                        </Grid>
                        ))}
                    </Grid>
                </Paper>
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ p: 2, gap: 1, backgroundColor: isDarkMode ? '#1a202c' : '#f9fafb', borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
                {permitClose && (
                    <Button 
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'none',
                          color: isDarkMode ? '#d1d5db' : '#6b7280',
                          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                          backgroundColor: isDarkMode ? '#232b33' : '#fff',
                          fontSize: '1rem',
                          padding: '8px 16px',
                          minWidth: 'auto',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#374151' : '#fee2e2',
                            color: isDarkMode ? '#f3f4f6' : '#ef4444',
                            borderColor: isDarkMode ? '#4b5563' : '#fca5a5',
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