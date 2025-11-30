import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  InputLabel
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const HistoryDrawer = ({ inSidebar = false, open = true, sidebarOpen = true }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const tabOptions = [
    { label: 'Todos', value: 0, icon: <HistoryIcon sx={{ mr: 1, mb: '-3px' }} /> },
    { label: 'Tarefas', value: 1, icon: <AssignmentTurnedInIcon sx={{ mr: 1, mb: '-3px', color: '#1976d2' }} /> },
    { label: 'Casos de Teste', value: 2, icon: <BugReportIcon sx={{ mr: 1, mb: '-3px', color: '#388e3c' }} /> },
    { label: 'Código de Teste', value: 3, icon: <CodeIcon sx={{ mr: 1, mb: '-3px', color: '#fbc02d' }} /> },
    { label: 'Análise de Riscos', value: 4, icon: <WarningAmberIcon sx={{ mr: 1, mb: '-3px', color: '#d84315' }} /> }
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

  // Render button that adapts based on sidebar state
  const renderButton = () => {
    // When in sidebar and sidebar is closed, show only icon
    if (inSidebar && !sidebarOpen) {
      return (
        <Box sx={{ position: 'relative', px: 0.5, mx: 0.5 }}>
          <Tooltip title="Histórico de gerações" arrow placement="right">
            <IconButton
              onClick={handleDrawerOpen}
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                background: 'linear-gradient(90deg, #388e3c 30%, #1976d2 120%)',
                color: 'white',
                p: 1.2,
                fontWeight: 600,
                fontSize: 16,
                transition: '.2s',
                minWidth: 48,
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1565c0 70%, #388e3c 120%)',
                  boxShadow: 7
                }
              }}
            >
              <HistoryIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }

    // When in sidebar and sidebar is open, or when not in sidebar, show full button
    return (
      <Box sx={{ position: 'relative', ml: inSidebar ? 0 : 2 }}>
        <Tooltip title="Histórico de gerações" arrow>
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
            Histórico
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
        sx={{ width: '400px', flexShrink: 0, '& .MuiDrawer-paper': { width: '400px' } }}
      >
        <Box sx={{ px: 3, pt: 2, pb: 1, bgcolor: '#f5f7fa' }}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="history-type-select-label" sx={{ fontWeight: 500, fontSize: 15 }}>Tipo</InputLabel>
            <Select
              labelId="history-type-select-label"
              id="history-type-select"
              value={activeTab}
              label="Tipo"
              onChange={handleTabChange}
              sx={{
                fontWeight: 600,
                fontSize: 15,
                background: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 5px #0001',
                '.MuiSelect-select': { py: 1.2 },
                minHeight: 46
              }}
            >
              {tabOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 15, fontWeight: activeTab === opt.value ? 700 : 500 }}>
                  <Box display="flex" alignItems="center">{opt.icon} {opt.label}</Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <List>
          {generations.length > 0 ? (generations.map((gen) => (
            <ListItem
              key={gen.id}
              button
              onClick={() => handleDialogOpen(gen)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: '.15s',
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
                primary={<span style={{ fontWeight: 600, fontSize: 16, color: '#111' }}>{gen.description || gen.model}</span>}
                secondary={
                  <>
                    <Typography component="span" variant="caption" color="text.secondary">
                      {gen.date}
                    </Typography>
                  </>
                }
              />
              <Chip
                label={gen.type}
                size="small"
                variant="outlined"
                color={gen.type === 'Tarefa' ? 'primary' : gen.type === 'Caso de Teste' ? 'success' : gen.type === 'Código de Teste' ? 'warning' : 'default'}
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
            <ListItemText primary="Nenhum histórico disponível" />
          </ListItem>
        )}
        </List>
      </Drawer>

      {/* Dialog para exibir o conteúdo da geração */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth={'lg'}>
        <DialogTitle sx={{ pb: 1.5, mb: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={700}>{selectedGeneration?.description || selectedGeneration?.type}</Typography>
              <Typography color="textSecondary" variant="caption">
                {`${selectedGeneration?.date}`}
              </Typography>
            </Box>
            <IconButton
              onClick={handleDialogClose}
              sx={{
                ml: 2,
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
        <Typography color="textPrimary" variant="body2">{selectedGeneration?.model}</Typography>
        <Divider sx={{ mt: 1, mb: 0.5 }} />
        </DialogTitle>
        <DialogContent>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedGeneration?.generation}</ReactMarkdown>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HistoryDrawer;
