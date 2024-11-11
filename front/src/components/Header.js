import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Link as RouterLink } from 'react-router-dom'
import HistoryDrawer from './HistoryDrawer';
import { IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import TokenDialog from './TokenDialog';

function Header() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenTokenDialog = () => {
    setDialogOpen(true);
  };

  return (
    <header style={{padding:'24px'}}>
        <AppBar position="fixed">
        <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              color: 'inherit',
              flexGrow: 1,
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Task & Test Case Generator
          </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
            <HistoryDrawer />
            <IconButton color="inherit" onClick={handleOpenTokenDialog}>
              <SettingsIcon />
            </IconButton>
            <TokenDialog open={dialogOpen} onClose={setDialogOpen} permitClose={true}/>
          </Box>
        </Toolbar>
      </AppBar>
    </header>
  );
}

export default Header;