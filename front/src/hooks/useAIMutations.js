import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import { addVersion } from '../utils/generationHistory';
import { parseError, logError } from '../utils/errorHandler';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

/**
 * Helper para obter token do localStorage
 */
const getToken = (apiName) => localStorage.getItem(`${apiName}Token`);

/**
 * Helper para obter educationMode
 */
const getEducationMode = () => JSON.parse(localStorage.getItem('educationMode') || 'false');

/**
 * Helper para normalizar resposta da API
 */
const normalizeResponse = (response) => {
  return typeof response.data === 'string' 
    ? response.data 
    : response.data.data || response.data;
};

// ============================================
// API Functions
// ============================================

/**
 * Melhora descrição de tarefa via IA
 */
const improveTaskAPI = async ({ promptText, model }) => {
  const token = getToken(model.apiName);
  if (!token) throw new Error('Sem token para realizar requisição');

  const response = await axios.post(
    `${BACKEND_URL}/api/${model.apiName}/improve-task?token=${token}`,
    {
      model: model.version,
      task: promptText,
      educationMode: getEducationMode()
    }
  );

  return normalizeResponse(response);
};

/**
 * Gera casos de teste via IA
 */
const generateTestsAPI = async ({ promptText, model }) => {
  const token = getToken(model.apiName);
  if (!token) throw new Error('Sem token para realizar requisição');

  const response = await axios.post(
    `${BACKEND_URL}/api/${model.apiName}/generate-tests?token=${token}`,
    {
      model: model.version,
      task: promptText,
      educationMode: getEducationMode()
    }
  );

  return normalizeResponse(response);
};

/**
 * Gera código de teste via IA
 */
const generateTestCodeAPI = async ({ promptText, model, extraConfig = {} }) => {
  const token = getToken(model.apiName);
  if (!token) throw new Error('Sem token para realizar requisição');

  const response = await axios.post(
    `${BACKEND_URL}/api/${model.apiName}/generate-test-code?token=${token}`,
    {
      model: model.version,
      task: promptText,
      educationMode: getEducationMode(),
      ...extraConfig
    }
  );

  return normalizeResponse(response);
};

/**
 * Analisa riscos via IA
 */
const analyzeRisksAPI = async ({ feature, model }) => {
  const token = getToken(model.apiName);
  if (!token) throw new Error('Sem token para realizar requisição');

  const response = await axios.post(
    `${BACKEND_URL}/api/analyze-risks?token=${token}`,
    {
      feature,
      model,
      educationMode: getEducationMode(),
      provider: model.apiName
    }
  );

  return model.apiName === 'gemini' ? response.data.data : response.data;
};

// ============================================
// React Query Mutations
// ============================================

/**
 * Mutation para melhorar tarefa
 * 
 * @example
 * const mutation = useImproveTaskMutation();
 * mutation.mutate({ promptText: '...', model: {...}, taskInfo: '...' });
 * 
 * // Acessar dados
 * mutation.data // resultado
 * mutation.isPending // loading
 * mutation.error // erro
 */
export const useImproveTaskMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['improveTask'],
    mutationFn: improveTaskAPI,
    onSuccess: (data, variables) => {
      const { model, taskInfo = '', generationId } = variables;
      
      // Salva no histórico se já existir generationId
      if (generationId) {
        addVersion(generationId, data, { type: 'task', model: model.version });
      }

      // Salva no localStorage
      const id = saveGenerationToLocalStorage(data, 'task', model.version, taskInfo);
      
      // Invalida queries relacionadas ao histórico
      queryClient.invalidateQueries({ queryKey: ['generationHistory'] });

      // Callback opcional do usuário
      options.onSuccess?.(data, variables, id);
    },
    onError: (error, variables) => {
      const appError = parseError(error);
      logError('useImproveTaskMutation', error);
      options.onError?.(appError, variables);
    },
    ...options,
  });
};

/**
 * Mutation para gerar casos de teste
 */
export const useGenerateTestsMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['generateTests'],
    mutationFn: generateTestsAPI,
    onSuccess: (data, variables) => {
      const { model, taskInfo = '', generationId } = variables;
      
      if (generationId) {
        addVersion(generationId, data, { type: 'tests', model: model.version });
      }

      const id = saveGenerationToLocalStorage(data, 'tests', model.version, taskInfo);
      queryClient.invalidateQueries({ queryKey: ['generationHistory'] });

      options.onSuccess?.(data, variables, id);
    },
    onError: (error, variables) => {
      const appError = parseError(error);
      logError('useGenerateTestsMutation', error);
      options.onError?.(appError, variables);
    },
    ...options,
  });
};

/**
 * Mutation para gerar código de teste
 */
export const useGenerateTestCodeMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['generateTestCode'],
    mutationFn: generateTestCodeAPI,
    onSuccess: (data, variables) => {
      const { model, taskInfo = '', generationId } = variables;
      
      if (generationId) {
        addVersion(generationId, data, { type: 'code', model: model.version });
      }

      const id = saveGenerationToLocalStorage(data, 'code', model.version, taskInfo);
      queryClient.invalidateQueries({ queryKey: ['generationHistory'] });

      options.onSuccess?.(data, variables, id);
    },
    onError: (error, variables) => {
      const appError = parseError(error);
      logError('useGenerateTestCodeMutation', error);
      options.onError?.(appError, variables);
    },
    ...options,
  });
};

/**
 * Mutation para análise de riscos
 */
export const useAnalyzeRisksMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['analyzeRisks'],
    mutationFn: analyzeRisksAPI,
    onSuccess: (data, variables) => {
      const { model, taskInfo = '', generationId } = variables;
      
      if (generationId) {
        addVersion(generationId, data, { type: 'risk', model: model.version });
      }

      const id = saveGenerationToLocalStorage(data, 'risk', model.version, taskInfo);
      queryClient.invalidateQueries({ queryKey: ['generationHistory'] });

      options.onSuccess?.(data, variables, id);
    },
    onError: (error, variables) => {
      const appError = parseError(error);
      logError('useAnalyzeRisksMutation', error);
      options.onError?.(appError, variables);
    },
    ...options,
  });
};

// ============================================
// Convenience Wrappers
// ============================================

/**
 * Hook que encapsula a mutation com estado adicional
 * Mantém compatibilidade com a API existente
 * 
 * @example
 * const { mutate, result, loading, error, generationId } = useImproveTaskWithState();
 * mutate({ promptText: '...', model: {...}, taskInfo: '...' });
 */
export const useImproveTaskWithState = () => {
  const [generationId, setGenerationId] = useState(null);
  
  const mutation = useImproveTaskMutation({
    onSuccess: (data, variables, id) => {
      setGenerationId(id);
    }
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    result: mutation.data || '',
    loading: mutation.isPending,
    error: mutation.error?.message || null,
    generationId,
    reset: () => {
      mutation.reset();
      setGenerationId(null);
    }
  };
};
