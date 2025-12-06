import React from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { exportGeneration } from '../utils/exportUtils';

/**
 * Componente de botão de exportação reutilizável
 * @param {Object} data - Dados a exportar { description, type, model, generation }
 * @param {function} onExportSuccess - Callback quando exportação é bem-sucedida
 * @param {function} onExportError - Callback quando exportação falha
 */
const ExportButton = ({ data, onExportSuccess, onExportError, size = 'medium' }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format) => {
    const result = exportGeneration(data, format);
    
    if (result.success) {
      onExportSuccess?.(result.message);
    } else {
      onExportError?.(result.message);
    }
    
    handleClose();
  };

  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;

  return (
    <>
      <Tooltip title="Exportar em diferentes formatos">
        <IconButton
          onClick={handleClick}
          size={size}
          sx={{
            borderRadius: '50%',
            background: '#e3f2fd',
            color: '#1976d2',
            '&:hover': {
              background: '#bbdefb',
              boxShadow: 3
            }
          }}
        >
          <FileDownloadIcon sx={{ fontSize: iconSize }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
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

export default ExportButton;
