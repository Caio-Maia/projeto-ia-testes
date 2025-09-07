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
  Tabs, 
  Tab,
  IconButton,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

const HistoryDrawer = ({ inSidebar = false, open = true }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  
  const handleDialogOpen = (generation) => {
    setSelectedGeneration(generation);
    setDialogOpen(true);
  };
  const handleDialogClose = () => setDialogOpen(false);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  // Render different button based on whether it's in the sidebar or not
  const renderButton = () => {
    if (inSidebar) {
      return (
        <ListItem 
          button 
          onClick={handleDrawerOpen}
          sx={{
            minHeight: 48,
            px: 2.5,
            justifyContent: open ? 'initial' : 'center',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : 'auto',
              justifyContent: 'center',
            }}
          >
            <Tooltip title={!open ? "Histórico" : ""} placement="right">
              <HistoryIcon />
            </Tooltip>
          </ListItemIcon>
          {open && <ListItemText primary="Histórico" />}
        </ListItem>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 2 }}>
          <Button 
            onClick={handleDrawerOpen} 
            variant="contained" 
            color="success" 
            style={{ position: 'fixed' }}
            startIcon={<HistoryIcon />}
          >
            Histórico
          </Button>
        </Box>
      );
    }
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Todos" />
            <Tab label="Tarefas" />
            <Tab label="Casos de Teste" />
            <Tab label="Código de Teste" />
            <Tab label="Análise de Riscos" />
          </Tabs>
        </Box>
        
        <List>
          {generations.length > 0 ? (generations.map((gen) => (
            <ListItem key={gen.id} button onClick={() => handleDialogOpen(gen)}>
              <ListItemText 
                primary={`${gen.type} ${gen.id}`} 
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {gen.description || gen.model}
                    </Typography>
                    <br />
                    {gen.date}
                  </>
                } 
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
        <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{`${selectedGeneration?.type} ${selectedGeneration?.id}`}</Typography>
          <Button onClick={handleDialogClose} style={{ color: 'grey' }}>
            x
          </Button>
        </Box>
        <Typography color="textPrimary" variant="body1">{`${selectedGeneration?.model}`}</Typography>
        {selectedGeneration?.description && (
          <Typography color="textPrimary" variant="body2">{selectedGeneration.description}</Typography>
        )}
        <Typography color="textSecondary" variant="body2">{`${selectedGeneration?.date}`}</Typography>
        </DialogTitle>
        <DialogContent>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedGeneration?.generation}</ReactMarkdown>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HistoryDrawer;
