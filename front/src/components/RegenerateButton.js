import React, { useState } from 'react';
import { IconButton, Tooltip, Menu, MenuItem, Box, CircularProgress, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AI_MODELS } from '../utils/aiModels';
import { parseError, logError } from '../utils/errorHandler';

/**
 * Botão para regenerar conteúdo com IA selecionada
 * @param {Object} generation - Objeto de geração com dados e tipo
 * @param {function} onRegenerateStart - Callback quando regeneração começa
 * @param {function} onRegenerateComplete - Callback quando regeneração termina
 * @param {function} onRegenerateError - Callback quando há erro
 */
const RegenerateButton = ({ generation, onRegenerateStart, onRegenerateComplete, onRegenerateError, size = 'medium' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingModel, setLoadingModel] = useState(null);
  const [status, setStatus] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRegenerate = async (model) => {
    if (!generation) return;

    setIsLoading(true);
    setLoadingModel(model.label);
    setStatus(null);

    try {
      onRegenerateStart?.(model);

      // Preparar dados para regeneração
      const regenerationPayload = {
        originalPrompt: generation.description || generation.prompt || '',
        type: generation.type,
        model: model,
        previousGeneration: generation.generation,
      };

      // Chamar API de regeneração baseado no tipo
      let endpoint = '';
      const requestBody = {
        prompt: regenerationPayload.originalPrompt,
        model: model.version,
      };

      // Determinar endpoint baseado no tipo
      if (generation.type?.toLowerCase().includes('tarefa') || generation.type?.toLowerCase().includes('task')) {
        endpoint = '/api/improve-task';
      } else if (generation.type?.toLowerCase().includes('teste') || generation.type?.toLowerCase().includes('test')) {
        endpoint = '/api/generate-tests';
      } else if (generation.type?.toLowerCase().includes('codigo') || generation.type?.toLowerCase().includes('code')) {
        endpoint = '/api/generate-code';
      } else if (generation.type?.toLowerCase().includes('risco') || generation.type?.toLowerCase().includes('risk')) {
        endpoint = '/api/analyze-risks';
      }

      if (!endpoint) {
        throw new Error('Tipo de geração não reconhecido');
      }

      // Fazer requisição
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.statusText}`);
      }

      const data = await response.json();

      // Preparar nova geração
      const newGeneration = {
        ...generation,
        generation: data.generation || data.result || data.content || '',
        model: `${model.label}`,
        date: new Date().toLocaleString('pt-BR'),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      setStatus({
        type: 'success',
        message: `Regenerado com sucesso usando ${model.label}!`
      });

      onRegenerateComplete?.(newGeneration, model);

      // Limpar status após 3 segundos
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      const appError = parseError(error);
      logError('RegenerateButton', error);

      setStatus({
        type: 'error',
        message: `Erro ao regenerar: ${appError.message}`
      });

      onRegenerateError?.(appError, model);

      // Limpar status após 5 segundos
      setTimeout(() => setStatus(null), 5000);
    } finally {
      setIsLoading(false);
      setLoadingModel(null);
      handleClose();
    }
  };

  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;

  return (
    <>
      <Tooltip title="Regenerar com IA diferente">
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <IconButton
            onClick={handleClick}
            disabled={isLoading}
            size={size}
            sx={{
              borderRadius: '50%',
              background: '#f0f9ff',
              color: '#0ea5e9',
              '&:hover': {
                background: '#e0f2fe',
                boxShadow: 3
              },
              '&:disabled': {
                background: '#f3f4f6',
                color: '#d1d5db'
              }
            }}
          >
            {isLoading ? (
              <CircularProgress size={iconSize} sx={{ color: '#0ea5e9' }} />
            ) : (
              <RefreshIcon sx={{ fontSize: iconSize }} />
            )}
          </IconButton>
        </Box>
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
        PaperProps={{
          sx: {
            maxHeight: '400px',
            width: '250px',
          }
        }}
      >
        {/* Seção ChatGPT */}
        <MenuItem disabled sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#6b7280' }}>
          🤖 ChatGPT
        </MenuItem>
        {AI_MODELS.filter(m => m.apiName === 'chatgpt').map(model => (
          <MenuItem
            key={model.version}
            onClick={() => handleRegenerate(model)}
            disabled={isLoading && loadingModel === model.label}
            sx={{
              fontSize: '0.9rem',
              pl: 3,
              '&:disabled': {
                opacity: 0.6,
              }
            }}
          >
            {isLoading && loadingModel === model.label && (
              <CircularProgress size={16} sx={{ mr: 1, color: '#0ea5e9' }} />
            )}
            {model.label}
          </MenuItem>
        ))}

        {/* Divider */}
        <Box sx={{ borderTop: '1px solid #e5e7eb', my: 0.5 }} />

        {/* Seção Gemini */}
        <MenuItem disabled sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#6b7280' }}>
          ✨ Google Gemini
        </MenuItem>
        {AI_MODELS.filter(m => m.apiName === 'gemini').map(model => (
          <MenuItem
            key={model.version}
            onClick={() => handleRegenerate(model)}
            disabled={isLoading && loadingModel === model.label}
            sx={{
              fontSize: '0.9rem',
              pl: 3,
              '&:disabled': {
                opacity: 0.6,
              }
            }}
          >
            {isLoading && loadingModel === model.label && (
              <CircularProgress size={16} sx={{ mr: 1, color: '#0ea5e9' }} />
            )}
            {model.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Status Alert */}
      {status && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1300, maxWidth: '300px' }}>
          <Alert
            severity={status.type}
            onClose={() => setStatus(null)}
            sx={{
              boxShadow: 3,
              borderRadius: 2
            }}
          >
            {status.message}
          </Alert>
        </Box>
      )}
    </>
  );
};

export default RegenerateButton;
