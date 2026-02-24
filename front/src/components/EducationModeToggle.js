import React from 'react';
import { FormControlLabel, Switch, Tooltip, Box, Typography } from '@mui/material';
import { useLanguage } from '../stores/hooks';
import { useSettingsStore } from '../stores/settingsStore';
import SchoolIcon from '@mui/icons-material/School';

function EducationModeToggle() {
  const { t } = useLanguage();
  const educationMode = useSettingsStore((state) => state.educationMode);
  const setEducationMode = useSettingsStore((state) => state.setEducationMode);

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