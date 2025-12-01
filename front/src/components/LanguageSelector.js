import React from 'react';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import { FaGlobe } from 'react-icons/fa';

function LanguageSelector() {
  const { language, changeLanguage, t } = useLanguage();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    handleClose();
  };

  const languages = [
    { code: 'pt-BR', label: t('common.portuguese') },
    { code: 'en-US', label: t('common.english') },
  ];

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <Box>
      <Button
        onClick={handleClick}
        sx={{
          textTransform: 'none',
          color: 'white',
          fontWeight: '700',
          fontSize: '0.95rem',
          px: 2.2,
          py: 0.8,
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '8px',
          transition: '0.2s ease-in-out',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
          },
          '&:active': {
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
          }
        }}
      >
        <FaGlobe style={{ fontSize: '1rem' }} />
        <Typography 
          component="span"
          sx={{
            fontWeight: '700',
            display: { xs: 'none', sm: 'inline' },
            letterSpacing: '0.3px'
          }}
        >
          {currentLanguage?.flag} {currentLanguage?.label}
        </Typography>
        <Typography 
          component="span"
          sx={{
            fontWeight: '700',
            display: { xs: 'inline', sm: 'none' },
            fontSize: '1.1rem'
          }}
        >
          {currentLanguage?.flag}
        </Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
            borderRadius: '8px',
            mt: 1.5,
            minWidth: '220px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          }
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={language === lang.code}
            sx={{
              py: 1.4,
              px: 2.2,
              fontSize: '0.95rem',
              fontWeight: language === lang.code ? '700' : '500',
              backgroundColor: language === lang.code ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
              color: language === lang.code ? '#3b82f6' : '#1f2937',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
              },
              transition: '0.2s ease-in-out',
              borderRadius: '6px',
              margin: '6px 8px',
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              borderLeft: language === lang.code ? '3px solid #3b82f6' : '3px solid transparent',
              paddingLeft: language === lang.code ? '18.5px' : '21.5px',
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{lang.flag}</span>
            <Typography sx={{ fontWeight: 'inherit' }}>
              {lang.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default LanguageSelector;
