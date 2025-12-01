import React, { useState, useEffect } from 'react';
import { FormControlLabel, Switch, Tooltip, Box, Typography } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';
import SchoolIcon from '@mui/icons-material/School';

function EducationModeToggle() {
  const { t } = useLanguage();
  
  // Initialize from localStorage or default to false
  const [educationMode, setEducationMode] = useState(() => {
    const savedMode = localStorage.getItem('educationMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Update localStorage when educationMode changes
  useEffect(() => {
    localStorage.setItem('educationMode', JSON.stringify(educationMode));
  }, [educationMode]);

  const handleChange = (event) => {
    setEducationMode(event.target.checked);
  };

  return (
    <Box display="flex" alignItems="center">
      <Tooltip title={
        educationMode 
          ? t('common.educationModeEnabled')
          : t('common.educationModeDisabled')
      }>
        <FormControlLabel
          control={
            <Switch
              checked={educationMode}
              onChange={handleChange}
              color="primary"
            />
          }
          label={
            <Box display="flex" alignItems="center">
              <SchoolIcon color={educationMode ? "primary" : "disabled"} sx={{ mr: 1 }} />
              <Typography variant="body2">
                {t('common.educationMode')}
              </Typography>
            </Box>
          }
        />
      </Tooltip>
    </Box>
  );
}

export default EducationModeToggle;