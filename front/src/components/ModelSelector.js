import React, { useState, useMemo } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getGroupedModelsForMenu } from '../utils/modelUtils';
import { AI_MODELS } from '../utils/aiModels';
import { useDarkMode } from '../contexts/DarkModeContext';

/**
 * Componente de Select para escolher modelos de IA
 * Organiza os modelos por provedor (ChatGPT e Gemini) com headers colapsáveis
 * 
 * Props:
 * - value: modelo selecionado
 * - onChange: callback quando modelo muda
 * - label: label do select (padrão: 'Select Model')
 * - required: se o campo é obrigatório
 * - disabled: se o select está desabilitado
 */
function ModelSelector({ value, onChange, label = 'Select Model', required = true, disabled = false }) {
  const { isDarkMode } = useDarkMode();
  const groupedModels = useMemo(() => getGroupedModelsForMenu(), []);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Converter objeto modelo para string ID
  const getModelId = (model) => {
    if (!model || !model.apiName) return '';
    return `${model.apiName}::${model.version}`;
  };

  // Converter string ID de volta para objeto modelo
  const getModelFromId = (id) => {
    if (!id) return null;
    const [apiName, version] = id.split('::');
    const model = AI_MODELS.find(m => m.apiName === apiName && m.version === version);
    return model || null;
  };

  const handleChange = (e) => {
    const modelId = e.target.value;
    const selectedModel = getModelFromId(modelId);
    if (selectedModel) {
      // Criar evento sintético com o objeto modelo
      onChange({ target: { value: selectedModel } });
    }
  };

  // Toggle para expandir/recolher grupos
  const toggleGroup = (groupName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const renderValue = (selected) => {
    if (!selected) return '';
    const model = getModelFromId(selected);
    if (!model || !model.apiName) return '';
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <span>{model.apiName === 'chatgpt' ? '🤖' : '✨'}</span>
        <span>{model.label}</span>
      </Box>
    );
  };

  // Render items customizado
  const renderMenuItems = () => {
    const items = [];
    
    groupedModels.forEach((group) => {
      const isExpanded = expandedGroups[group.group] === true; // Colapsado por padrão
      const groupKey = `${group.group}-header`;
      
      // Header colapsável - como um div clicável
      items.push(
        <Box
          key={groupKey}
          component="div"
          role="option"
          onMouseDown={(e) => toggleGroup(group.group, e)}
          sx={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1a202c 0%, #232b33 100%)'
              : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: isDarkMode ? '#60a5fa' : '#1e40af',
            letterSpacing: '0.5px',
            py: 1.5,
            px: 2,
            borderBottom: `2px solid ${isDarkMode ? '#374151' : '#bfdbfe'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: isDarkMode
                ? 'linear-gradient(135deg, #232b33 0%, #2d3748 100%)'
                : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              paddingRight: 3
            }
          }}
        >
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <span>{group.icon}</span>
            <span>{group.group}</span>
            <Typography variant="caption" sx={{ ml: 'auto', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
              ({group.models.length})
            </Typography>
          </Box>
          <ExpandMoreIcon 
            sx={{
              transition: 'transform 0.3s ease-in-out',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              color: isDarkMode ? '#60a5fa' : '#1e40af'
            }}
          />
        </Box>
      );

      // Modelos - apenas mostrar se expandido
      if (isExpanded) {
        group.models.forEach((model) => {
          items.push(
            <MenuItem 
              key={`${model.apiName}-${model.version}`} 
              value={getModelId(model)}
              sx={{
                py: 1.2,
                px: 3,
                ml: 2,
                borderLeft: '5px solid transparent',
                transition: 'all 0.2s ease',
                backgroundColor: isDarkMode ? '#0f1419' : 'transparent',
                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                '&:hover': {
                  borderLeftColor: model.apiName === 'chatgpt' ? '#3b82f6' : '#22c55e',
                  backgroundColor: model.apiName === 'chatgpt' 
                    ? isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)'
                    : isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.08)',
                },
                '&.Mui-selected': {
                  borderLeftColor: model.apiName === 'chatgpt' ? '#3b82f6' : '#22c55e',
                  backgroundColor: model.apiName === 'chatgpt' 
                    ? isDarkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)'
                    : isDarkMode ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.15)',
                  fontWeight: 600,
                  color: isDarkMode ? '#f3f4f6' : '#1f2937'
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <Box display="flex" flexDirection="column" flex={1}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                    {model.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280', mt: 0.5 }}>
                    {model.version}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          );
        });
      }
    });
    
    return items;
  };

  return (
    <FormControl 
      required={required}
      disabled={disabled}
      fullWidth 
      variant="outlined" 
      sx={{ mb: 3 }}
    >
      <InputLabel id="model-select-label" sx={{ color: isDarkMode ? '#d1d5db' : '#666' }}>{label}</InputLabel>
      <Select
        labelId="model-select-label"
        id="model-select"
        value={getModelId(value)}
        onChange={handleChange}
        label={label}
        renderValue={renderValue}
        sx={{
          backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
          color: isDarkMode ? '#f3f4f6' : '#1f2937',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDarkMode ? '#374151' : '#ccc'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDarkMode ? '#4b5563' : '#999'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3b82f6'
          }
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 400,
              backgroundColor: isDarkMode ? '#0f1419' : '#ffffff',
              color: isDarkMode ? '#f3f4f6' : '#1f2937'
            }
          }
        }}
      >
        {renderMenuItems()}
      </Select>
    </FormControl>
  );
}

export default ModelSelector;
