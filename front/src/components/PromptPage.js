import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, Button, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, 
  Typography, Paper, CircularProgress, Container, Box, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Tooltip, Divider, Card, CardContent
} from '@mui/material';
import { useLanguage, useDarkMode } from '../stores/hooks';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentIcon from '@mui/icons-material/Assignment';

function PromptPage() {
    const { t, language } = useLanguage();
    const { isDarkMode } = useDarkMode();
    const [selectedFile, setSelectedFile] = useState('');
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fileList] = useState(['taskModel', 'testCasesModel']);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [isDirty, setIsDirty] = useState(false);
    const [history, setHistory] = useState([]);
    const [diffOpen, setDiffOpen] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [serverContent, setServerContent] = useState('');
    const [syncLoading, setSyncLoading] = useState(false);

    // Carrega histórico do localStorage
    const loadHistory = (fileName) => {
        const historyKey = `${fileName}History`;
        const savedHistory = localStorage.getItem(historyKey);
        setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    };

    // Obtém título e descrição traduzidos para cada prompt
    const getFileTitle = (file) => {
        const titles = {
            taskModel: t('promptPage.taskModelTitle'),
            testCasesModel: t('promptPage.testCasesModelTitle')
        };
        return titles[file] || file;
    };

    useEffect(() => {
        const fetchPromptFromBackend = async (fileName) => {
            setIsLoading(true);
            try {
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
                const response = await axios.get(`${backendUrl}/api/files/${fileName}?language=${language}`);
                const promptContent = response.data.content;
                
                // Salva o conteúdo do servidor
                setServerContent(promptContent);
                
                // Tenta carregar versão local modificada
                const localKey = `${fileName}PromptLocal`;
                const localContent = localStorage.getItem(localKey);
                
                if (localContent) {
                    // Usa a versão local se existir
                    setContent(localContent);
                    setOriginalContent(localContent);
                } else {
                    // Usa a versão do servidor
                    setContent(promptContent);
                    setOriginalContent(promptContent);
                }
                
                setIsDirty(false);
                loadHistory(fileName);
            } catch (error) {
                console.error('Erro ao buscar o conteúdo do arquivo:', error);
                // Tenta carregar do localStorage como fallback
                const localKey = `${selectedFile}PromptLocal`;
                const cached = localStorage.getItem(localKey) || localStorage.getItem(`${selectedFile}Prompt`);
                if (cached) {
                    setContent(cached);
                    setOriginalContent(cached);
                    setIsDirty(false);
                } else {
                    setContent('');
                    showSnackbar(t('promptPage.errorLoading'), 'error');
                }
                loadHistory(fileName);
            } finally {
                setIsLoading(false);
            }
        };
    
        if (selectedFile) {
            loadHistory(selectedFile);
            fetchPromptFromBackend(selectedFile);
        } else {
            setContent('');
            setOriginalContent('');
            setServerContent('');
            setHistory([]);
            setIsDirty(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFile, language]);

    // Atualiza contadores ao mudar conteúdo
    useEffect(() => {
        setCharCount(content.length);
        setWordCount(content.split(/\s+/).filter(w => w.length > 0).length);
        setIsDirty(content !== originalContent);
    }, [content, originalContent]);

    const handleSave = () => {
        if (!selectedFile) return;

        // Salva versão anterior no histórico (local)
        const historyKey = `${selectedFile}History`;
        const currentHistory = history.length > 0 ? history : [];
        const locale = language === 'en' ? 'en-US' : 'pt-BR';
        const newHistory = [
            {
                id: Date.now(),
                content: originalContent,
                timestamp: new Date().toISOString(),
                description: `${t('promptPage.previousVersion')} - ${new Date().toLocaleString(locale)}`
            },
            ...currentHistory.slice(0, 9) // Keep only the last 10 versions
        ];
        
        localStorage.setItem(historyKey, JSON.stringify(newHistory));
        setHistory(newHistory);

        // Salva APENAS localmente (não envia ao servidor)
        const localKey = `${selectedFile}PromptLocal`;
        localStorage.setItem(localKey, content);
        setOriginalContent(content);
        setIsDirty(false);
        showSnackbar(t('promptPage.savedLocally'), 'success');
    };

    const handleSyncWithServer = async () => {
        if (!selectedFile) return;

        setSyncLoading(true);
        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            const response = await axios.get(`${backendUrl}/api/files/${selectedFile}?language=${language}`);
            const promptContent = response.data.content;
            
            // Remove a versão local customizada
            const localKey = `${selectedFile}PromptLocal`;
            localStorage.removeItem(localKey);
            
            // Carrega a versão do servidor
            setServerContent(promptContent);
            setContent(promptContent);
            setOriginalContent(promptContent);
            setIsDirty(false);
            
            showSnackbar(t('promptPage.syncSuccess'), 'success');
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            showSnackbar(t('promptPage.syncError'), 'error');
        } finally {
            setSyncLoading(false);
        }
    };

    const hasServerChanges = () => {
        return content !== serverContent;
    };

    const handleReset = () => {
        setContent(originalContent);
        setIsDirty(false);
        showSnackbar(t('promptPage.discardChanges'), 'info');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        showSnackbar(t('promptPage.copiedToClipboard'), 'success');
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${selectedFile}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showSnackbar(t('promptPage.downloadSuccess'), 'success');
    };

    const handleRestoreVersion = (version) => {
        setContent(version.content);
        setDiffOpen(false);
        showSnackbar(t('promptPage.versionRestored'), 'info');
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Hero */}
            <Paper 
              elevation={0}
              sx={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                p: 4, 
                mb: 4, 
                borderRadius: 3,
                color: '#ffffff',
                textAlign: 'center',
              }}
            >
              <Typography variant="h3" fontWeight={800} mb={1}>
                {t('promptPage.title')}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.95 }}>
                {t('promptPage.subtitle')}
              </Typography>
            </Paper>

            {/* Main Content */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                {/* Sidebar - Seleção de Arquivo */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 2.5,
                    border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                    backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                    width: '100%',
                    maxWidth: 500
                  }}
                >
                  <Typography variant="h6" fontWeight={700} mb={3} sx={{ color: isDarkMode ? '#f3f4f6' : '#1e293b', textAlign: 'center' }}>
                    {t('promptPage.files')}
                  </Typography>
                  
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: isDarkMode ? '#d1d5db' : '#666' }}>
                      {t('promptPage.selectFile')}
                    </InputLabel>
                    <Select
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        label={t('promptPage.selectFile')}
                        sx={{
                          color: isDarkMode ? '#d1d5db' : '#1f2937',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? '#4b5563' : '#ccc'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? '#4b5563' : '#999'
                          },
                          '& .MuiSvgIcon-root': {
                            color: isDarkMode ? '#d1d5db' : '#1f2937'
                          }
                        }}
                    >
                        {fileList.map((file) => (
                            <MenuItem key={file} value={file}>
                                {getFileTitle(file)}
                            </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                      {selectedFile && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          
                          <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#666', display: 'block', mb: 1 }}>
                            {t('promptPage.fileStatus')}
                          </Typography>
                          
                          {isDirty && (
                            <Chip 
                              label={t('promptPage.unsavedChanges')} 
                              color="warning" 
                              size="small"
                              sx={{ width: '100%', mb: 2 }}
                            />
                          )}
                          
                          {!isDirty && (
                            <Chip 
                              label={t('promptPage.allSynced')} 
                              color="success" 
                              size="small"
                              sx={{ width: '100%', mb: 2 }}
                            />
                          )}

                          <Divider sx={{ my: 2 }} />
                          
                          <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#666', display: 'block', mb: 1.5, fontWeight: 600 }}>
                            {t('promptPage.history')} ({history.length})
                          </Typography>
                          
                          {history.length > 0 ? (
                            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                              {history.map((version, idx) => (
                                <Card 
                                  key={version.id}
                                  sx={{ 
                                    mb: 1, 
                                    cursor: 'pointer',
                                    backgroundColor: isDarkMode ? '#0f1419' : '#f8f9fa',
                                    border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      backgroundColor: isDarkMode ? '#232b33' : '#f0f4f8',
                                      borderColor: '#3b82f6'
                                    }
                                  }}
                                  onClick={() => handleRestoreVersion(version)}
                                >
                                  <CardContent sx={{ p: 1.5 }}>
                                    <Typography variant="caption" sx={{ color: isDarkMode ? '#d1d5db' : '#475569', fontSize: '0.75rem' }}>
                                      v{history.length - idx}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', display: 'block', fontSize: '0.7rem' }}>
                                      {new Date(version.timestamp).toLocaleString('pt-BR')}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#6b7280' : '#cbd5e1' }}>
                              {t('promptPage.noHistory')}
                            </Typography>
                          )}
                        </>
                      )}
                    </Paper>

                {/* Main Editor */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    borderRadius: 2.5,
                    border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                    backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                    overflow: 'hidden',
                    width: '100%'
                  }}
                >
                    {!selectedFile ? (
                        <Box
                          sx={{ 
                            p: 6, 
                            borderRadius: 2.5,
                            border: `2px dashed ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                            backgroundColor: isDarkMode ? '#1a202c' : '#f8f9fa',
                            textAlign: 'center'
                          }}
                        >
                          <AssignmentIcon sx={{ fontSize: 64, color: isDarkMode ? '#4b5563' : '#cbd5e1', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                            {t('promptPage.selectFileToEdit')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#6b7280' : '#cbd5e1', mt: 1 }}>
                            {t('promptPage.selectFileHint')}
                          </Typography>
                        </Box>
                    ) : isLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                          <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                          {/* Toolbar */}
                          <Box 
                            sx={{ 
                              background: isDarkMode ? '#0f1419' : 'linear-gradient(135deg, #f5f7fa 0%, #f1f5f9 100%)',
                              p: 2,
                              borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                              display: 'flex',
                              gap: 1,
                              flexWrap: 'wrap',
                              alignItems: 'center'
                            }}
                          >
                            <Tooltip title={t('promptPage.saveLocallyTooltip')}>
                              <span>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={!isDirty}
                                    sx={{ fontWeight: 600 }}
                                >
                                    {t('promptPage.saveLocally')}
                                </Button>
                              </span>
                            </Tooltip>

                            {hasServerChanges() && (
                              <Tooltip title={t('promptPage.syncTooltip')}>
                                <span>
                                  <Button
                                      variant="contained"
                                      color="info"
                                      startIcon={<RefreshIcon />}
                                      onClick={handleSyncWithServer}
                                      disabled={syncLoading}
                                      sx={{ fontWeight: 600 }}
                                  >
                                      {syncLoading ? t('promptPage.syncing') : t('promptPage.syncWithServer')}
                                  </Button>
                                </span>
                              </Tooltip>
                            )}

                            <Tooltip title={t('promptPage.discardTooltip')}>
                              <span>
                                <Button
                                    variant="outlined"
                                    startIcon={<RestartAltIcon />}
                                    onClick={handleReset}
                                    disabled={!isDirty}
                                >
                                    {t('promptPage.discard')}
                                </Button>
                              </span>
                            </Tooltip>

                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                            <Tooltip title={t('promptPage.copyTooltip')}>
                              <IconButton size="small" onClick={handleCopy}>
                                <ContentCopyIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('promptPage.downloadTooltip')}>
                              <IconButton size="small" onClick={handleDownload}>
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('promptPage.historyTooltip')}>
                              <IconButton size="small" onClick={() => setDiffOpen(true)}>
                                <HistoryIcon />
                              </IconButton>
                            </Tooltip>

                            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {hasServerChanges() && (
                                  <Chip 
                                    label={t('promptPage.modifiedLocally')} 
                                    color="warning" 
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                                {charCount} {t('promptPage.characters')} • {wordCount} {t('promptPage.words')}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Editor */}
                          <Box sx={{ p: 3 }}>
                            <TextField
                                label={t('promptPage.fileContent')}
                                fullWidth
                                multiline
                                rows={16}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                variant="outlined"
                                placeholder={t('promptPage.placeholder')}
                                sx={{
                                  backgroundColor: isDarkMode ? '#0f1419' : '#ffffff',
                                  '& .MuiInputBase-input': {
                                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem'
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                      borderColor: isDarkMode ? '#374151' : '#ccc'
                                    },
                                    '&:hover fieldset': {
                                      borderColor: isDarkMode ? '#4b5563' : '#999'
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#3b82f6'
                                    }
                                  },
                                  '& .MuiInputLabel-root': {
                                    color: isDarkMode ? '#d1d5db' : '#666'
                                  }
                                }}
                            />
                          </Box>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* History/Diff Dialog */}
            <Dialog open={diffOpen} onClose={() => setDiffOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#f5f7fa', color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
                {t('promptPage.versionHistory')}
              </DialogTitle>
              <DialogContent sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' }}>
                {history.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {history.map((version, idx) => (
                      <Card key={version.id} sx={{ mb: 2, backgroundColor: isDarkMode ? '#1a202c' : '#f8f9fa' }}>
                        <CardContent sx={{ cursor: 'pointer', '&:hover': { backgroundColor: isDarkMode ? '#232b33' : '#f0f4f8' } }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: isDarkMode ? '#d1d5db' : '#1e293b', fontWeight: 600 }}>
                                {t('promptPage.version')} {history.length - idx}
                              </Typography>
                              <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                                {new Date(version.timestamp).toLocaleString(language === 'en' ? 'en-US' : 'pt-BR')}
                              </Typography>
                            </Box>
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleRestoreVersion(version)}
                            >
                              {t('promptPage.restore')}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', mt: 2 }}>
                    {t('promptPage.noVersionsAvailable')}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#f5f7fa' }}>
                <Button onClick={() => setDiffOpen(false)}>{t('promptPage.close')}</Button>
              </DialogActions>
            </Dialog>

            {/* Snackbar */}
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
