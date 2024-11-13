import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Drawer, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, Box, Typography } from '@mui/material';

const HistoryDrawer = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState(null);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  
  const handleDialogOpen = (generation) => {
    setSelectedGeneration(generation);
    setDialogOpen(true);
  };
  const handleDialogClose = () => setDialogOpen(false);

  /*const handleDelete = (id) => {
    const updatedGenerations = generations.filter((gen) => gen.id !== id);
    localStorage.setItem('generations', JSON.stringify(updatedGenerations));
    setGenerations(updatedGenerations);
  };*/

  const taskGenerations = JSON.parse(localStorage.getItem('taskGenerations')) || [];
  const testGenerations = JSON.parse(localStorage.getItem('testGenerations')) || [];

  const generations = [...taskGenerations, ...testGenerations];
  generations.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      {/* Botão para abrir a Drawer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 2 }}>
      <Button onClick={handleDrawerOpen} variant="contained" color="success" style={{ position: 'fixed',  }}>
        Histórico
      </Button>
      </Box>

      {/* Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose} sx={{ width: '400px', flexShrink: 0, '& .MuiDrawer-paper': { width: '400px' } }}>
        <List>
          {generations.length > 0 ? (generations.map((gen) => (
            <ListItem key={gen.id} button onClick={() => handleDialogOpen(gen)}>
              <ListItemText primary={`${gen.type} ${gen.id}`} secondary={gen.date} />
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
