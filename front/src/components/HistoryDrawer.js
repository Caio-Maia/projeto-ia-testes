import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage, useDarkMode } from '../stores/hooks';
import { exportGeneration } from '../utils/exportUtils';
import RegenerateButton from './RegenerateButton';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  IconButton,
  Tooltip,
  Chip,
  Divider,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Pagination,
  Menu,
  Alert
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const HistoryDrawer = ({ inSidebar = false, open = true, sidebarOpen = true }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [exportMessage, setExportMessage] = useState(null);
  const itemsPerPage = 10;
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();

  // Map of type strings to canonical keys for consistent color/styling
  const getCanonicalTypeKey = (typeString) => {
    if (!typeString) return null;
    const normalized = String(typeString).toLowerCase().trim();
    
    const typeMap = {
      'tarefa': 'task',
      'tarefas': 'task',
      'task': 'task',
      'tasks': 'task',
      'caso de teste': 'testCase',
      'casos de teste': 'testCase',
      'test case': 'testCase',
      'test cases': 'testCase',
      'codigo de teste': 'testCode',
      'código de teste': 'testCode',
      'test code': 'testCode',
      'analise de riscos': 'riskAnalysis',
      'análise de riscos': 'riskAnalysis',
      'analysis of risks': 'riskAnalysis',
      'risk analysis': 'riskAnalysis',
    };
    
    return typeMap[normalized] || null;
  };

  // Get translated label for a generation type
  const getTypeLabel = (gen) => {
    const typeKey = getCanonicalTypeKey(gen.type);
    if (typeKey === 'task') return t('common.task');
    if (typeKey === 'testCase') return t('common.testCase');
    if (typeKey === 'testCode') return t('common.testCode');
    if (typeKey === 'riskAnalysis') return t('common.riskAnalysis');
    return gen.type || t('common.history');
  };

  // Get color variant for chip based on canonical type
  const getTypeColor = (gen) => {
    const typeKey = getCanonicalTypeKey(gen.type);
    if (typeKey === 'task') return 'primary';
    if (typeKey === 'testCase') return 'success';
    if (typeKey === 'testCode') return 'warning';
    return 'default';
  };

  const tabOptions = [
    { label: t('common.all'), value: 0, icon: <HistoryIcon sx={{ mr: 1, mb: '-3px' }} /> },
    { label: t('common.task'), value: 1, icon: <AssignmentTurnedInIcon sx={{ mr: 1, mb: '-3px', color: '#1976d2' }} /> },
    { label: t('common.testCase'), value: 2, icon: <BugReportIcon sx={{ mr: 1, mb: '-3px', color: '#388e3c' }} /> },
    { label: t('common.testCode'), value: 3, icon: <CodeIcon sx={{ mr: 1, mb: '-3px', color: '#fbc02d' }} /> },
    { label: t('common.riskAnalysis'), value: 4, icon: <WarningAmberIcon sx={{ mr: 1, mb: '-3px', color: '#d84315' }} /> }
  ];

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  
  const handleDialogOpen = (generation) => {
    setSelectedGeneration(generation);
    setDialogOpen(true);
  };
  const handleDialogClose = () => setDialogOpen(false);
  
  const handleTabChange = (event) => {
    setActiveTab(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = (format) => {
    if (!selectedGeneration) return;
    
    const result = exportGeneration(selectedGeneration, format);
    
    setExportMessage({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
    
    handleExportMenuClose();
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleRegenerateComplete = (newGeneration, model) => {
    // Atualizar o selectedGeneration com a nova geração
    setSelectedGeneration(newGeneration);
    
    // Salvar nova geração no localStorage baseado no tipo
    const typeKey = getStorageKeyByType(newGeneration.type);
    if (typeKey) {
      const generations = JSON.parse(localStorage.getItem(typeKey)) || [];
      generations.push(newGeneration);
      localStorage.setItem(typeKey, JSON.stringify(generations));
    }

    setExportMessage({
      type: 'success',
      message: `✅ Regenerado com sucesso usando ${model.label}!`
    });

    setTimeout(() => setExportMessage(null), 3000);
  };

  const handleRegenerateError = (error, model) => {
    setExportMessage({
      type: 'error',
      message: `❌ Erro ao regenerar com ${model.label}: ${error.message}`
    });

    setTimeout(() => setExportMessage(null), 5000);
  };

  const getStorageKeyByType = (type) => {
    const typeStr = String(type).toLowerCase();
    if (typeStr.includes('tarefa') || typeStr.includes('task')) return 'taskGenerations';
    if (typeStr.includes('teste') || typeStr.includes('test')) return 'testGenerations';
    if (typeStr.includes('codigo') || typeStr.includes('code')) return 'codeGenerations';
    if (typeStr.includes('risco') || typeStr.includes('risk')) return 'riskGenerations';
    return null;
  };

  const taskGenerations = JSON.parse(localStorage.getItem('taskGenerations')) || [];
  const testGenerations = JSON.parse(localStorage.getItem('testGenerations')) || [];
  const codeGenerations = JSON.parse(localStorage.getItem('codeGenerations')) || [];
  const riskGenerations = JSON.parse(localStorage.getItem('riskGenerations')) || [];

  // Get generations based on active tab
  const getActiveGenerations = () => {
    switch (activeTab) {
      case 0: // All
        return [...taskGenerations, ...testGenerations, ...codeGenerations, ...riskGenerations];
      case 1: // Tasks
        return taskGenerations;
      case 2: // Test Cases
        return testGenerations;
      case 3: // Test Code
        return codeGenerations;
      case 4: // Risk Analysis
        return riskGenerations;
      default:
        return [];
    }
  };

  const generations = getActiveGenerations();
  generations.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate pagination
  const totalPages = Math.ceil(generations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGenerations = generations.slice(startIndex, endIndex);

  // Render button that adapts based on sidebar state
  const renderButton = () => {
    // When in sidebar, render as a list item for consistency
    if (inSidebar) {
      return (
        <ListItem
          onClick={handleDrawerOpen}
          sx={{
            minHeight: 48,
            px: 2,
            mx: 0.5,
            borderRadius: '6px',
            mb: 0.5,
            backgroundColor: isDarkMode ? 'rgba(56, 142, 60, 0.15)' : 'rgba(56, 142, 60, 0.1)',
            color: '#388e3c',
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(56, 142, 60, 0.25)' : 'rgba(56, 142, 60, 0.2)',
              color: '#388e3c',
              transform: 'translateX(3px)'
            },
            transition: '0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center'
          }}
        >
          <Tooltip title={!sidebarOpen ? t('common.history') : ""} placement="right">
            <HistoryIcon sx={{ minWidth: 24, mr: sidebarOpen ? 2 : 'auto' }} />
          </Tooltip>
          {sidebarOpen && (
            <ListItemText 
              primary={t('common.history')}
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'inherit'
                }
              }}
            />
          )}
        </ListItem>
      );
    }

    // When not in sidebar, show original button style
    return (
      <Box sx={{ position: 'relative', ml: 2 }}>
        <Tooltip title={t('common.history')} arrow>
          <Button
            onClick={handleDrawerOpen}
            sx={{
              borderRadius: 5,
              boxShadow: 3,
              background: 'linear-gradient(90deg, #388e3c 30%, #1976d2 120%)',
              color: 'white',
              px: 3,
              py: 1.1,
              fontWeight: 600,
              fontSize: 16,
              transition: '.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 70%, #388e3c 120%)',
                boxShadow: 7
              }
            }}
            startIcon={<HistoryIcon sx={{ mb: '-2px' }} />}
          >
            {t('common.history')}
          </Button>
        </Tooltip>
      </Box>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Drawer */}
      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
        sx={{ width: '400px', flexShrink: 0, '& .MuiDrawer-paper': { width: '400px', backgroundColor: isDarkMode ? '#0f1419' : '#ffffff' } }}
      >
        <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: isDarkMode ? '#1a202c' : '#f5f7fa' }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="history-type-select-label" sx={{ fontWeight: 500, fontSize: 15, color: isDarkMode ? '#d1d5db' : '#666' }}>{t('common.generationType')}</InputLabel>
            <Select
              labelId="history-type-select-label"
              id="history-type-select"
              value={activeTab}
              label={t('common.generationType')}
              onChange={handleTabChange}
              sx={{
                fontWeight: 600,
                fontSize: 15,
                background: isDarkMode ? '#0f1419' : '#ffffff',
                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                borderRadius: 2,
                boxShadow: '0 2px 5px #0001',
                '.MuiSelect-select': { py: 1.2 },
                minHeight: 46,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#374151' : '#ccc'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#4b5563' : '#999'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#60a5fa' : '#1976d2'
                }
              }}
            >
              {tabOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 15, fontWeight: activeTab === opt.value ? 700 : 500, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff', color: isDarkMode ? '#f3f4f6' : '#1f2937', '&:hover': { backgroundColor: isDarkMode ? '#232b33' : '#f5f5f5' } }}>
                  <Box display="flex" alignItems="center">{opt.icon} {opt.label}</Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <List>
          {generations.length > 0 ? (paginatedGenerations.map((gen) => (
            <ListItem
              key={gen.id}
              onClick={() => handleDialogOpen(gen)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: '.15s',
                cursor: 'pointer',
                '&:hover': {
                  background: 'rgba(33,150,243,0.08)',
                  boxShadow: 2
                },
                px: 2,
                py: 1.2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <ListItemText
                primary={<span style={{ fontWeight: 600, fontSize: 16, color: isDarkMode ? '#f3f4f6' : '#111' }}>{gen.description || gen.model}</span>}
                secondary={
                  <>
                    <Typography component="span" variant="caption" color={isDarkMode ? 'rgba(209, 213, 219, 0.7)' : 'text.secondary'}>
                      {gen.date}
                    </Typography>
                  </>
                }
              />
              <Chip
                label={getTypeLabel(gen)}
                size="small"
                variant="outlined"
                color={getTypeColor(gen)}
                sx={{
                  ml: 1,
                  flexShrink: 0,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  maxWidth: '120px',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    px: 1
                  }
                }}
              />
            </ListItem>
          ))): (<ListItem>
            <ListItemText primary={t('common.noHistoryAvailable')} />
          </ListItem>
        )}
        </List>

        {/* Pagination Controls */}
        {generations.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, borderTop: '1px solid #e0e0e0' }}>
            <Pagination 
              count={totalPages} 
              page={currentPage} 
              onChange={handlePageChange}
              color="primary"
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '0.9rem',
                  minWidth: 32,
                  height: 32
                }
              }}
            />
          </Box>
        )}
      </Drawer>

      {/* Dialog para exibir o conteúdo da geração */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth={'lg'} PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f1419' : '#ffffff', color: isDarkMode ? '#f3f4f6' : '#1f2937', border: 'none', outline: 'none' } }}>
        <DialogTitle sx={{ pb: 1.5, mb: 0, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={700} color={isDarkMode ? '#f3f4f6' : '#1f2937'}>{selectedGeneration?.description || selectedGeneration?.type}</Typography>
              <Typography color={isDarkMode ? 'rgba(209, 213, 219, 0.7)' : 'textSecondary'} variant="caption">
                {`${selectedGeneration?.date}`}
              </Typography>
            </Box>
            <Box display="flex" gap={1} alignItems="center">
              <RegenerateButton
                generation={selectedGeneration}
                onRegenerateComplete={handleRegenerateComplete}
                onRegenerateError={handleRegenerateError}
                size="medium"
              />
              <Tooltip title="Exportar em diferentes formatos">
                <IconButton
                  onClick={handleExportClick}
                  sx={{
                    borderRadius: '50%',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    boxShadow: '0 2px 6px #0002',
                    transition: '.18s',
                    '&:hover': {
                      background: '#bbdefb',
                      boxShadow: 3
                    },
                    width: 42,
                    height: 42
                  }}
                >
                  <FileDownloadIcon sx={{ fontSize: 24 }} />
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={handleDialogClose}
                sx={{
                  ml: 1,
                  borderRadius: '50%',
                  background: '#f3f3f3',
                  boxShadow: '0 2px 6px #0002',
                  transition: '.18s',
                  '&:hover': {
                    background: '#ffcdd2',
                    color: '#b71c1c'
                  },
                  width: 42,
                  height: 42
                }}
              >
                <CloseIcon sx={{ fontSize: 30 }} />
              </IconButton>
            </Box>
          </Box>
          <Typography color={isDarkMode ? '#d1d5db' : 'textPrimary'} variant="body2">{selectedGeneration?.model}</Typography>
          <Divider sx={{ mt: 1, mb: 0.5, borderColor: isDarkMode ? '#374151' : 'divider' }} />
          
          {/* Export Message */}
          {exportMessage && (
            <Alert severity={exportMessage.type} sx={{ mt: 1 }}>
              {exportMessage.message}
            </Alert>
          )}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#ffffff', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedGeneration?.generation}</ReactMarkdown>
        </DialogContent>
      </Dialog>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleExport('pdf')} sx={{ fontSize: '0.9rem' }}>
          📄 Exportar como PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('docx')} sx={{ fontSize: '0.9rem' }}>
          📝 Exportar como Word (.docx)
        </MenuItem>
        <MenuItem onClick={() => handleExport('md')} sx={{ fontSize: '0.9rem' }}>
          📋 Exportar como Markdown
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')} sx={{ fontSize: '0.9rem' }}>
          { } Exportar como JSON
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')} sx={{ fontSize: '0.9rem' }}>
          📊 Exportar como CSV
        </MenuItem>
      </Menu>
    </>
  );
};

export default HistoryDrawer;
