import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { useDarkMode } from '../stores/hooks';
import { FaSun, FaMoon } from 'react-icons/fa';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'} arrow>
        <IconButton
          onClick={toggleDarkMode}
          sx={{
            color: isDarkMode ? '#fbbf24' : '#f59e0b',
            backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderRadius: '8px',
            padding: '10px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              transform: 'scale(1.05)'
            }
          }}
        >
          {isDarkMode ? (
            <FaSun size={20} />
          ) : (
            <FaMoon size={20} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default DarkModeToggle;
