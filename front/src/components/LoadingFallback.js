import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingFallback = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: 2
      }}
    >
      <CircularProgress 
        size={60}
        sx={{
          color: '#3b82f6'
        }}
      />
      <Typography 
        variant="h6" 
        sx={{
          color: '#6b7280',
          fontWeight: 500
        }}
      >
        Carregando...
      </Typography>
    </Box>
  );
};

export default LoadingFallback;
