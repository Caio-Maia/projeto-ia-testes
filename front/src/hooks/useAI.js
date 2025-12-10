import { useState, useCallback } from 'react';
import axios from 'axios';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import { addVersion, getVersions } from '../utils/generationHistory';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

/**
 * Custom Hook para chamadas de IA
 * 
 * Abstrai a lógica comum de:
 * - Loading state
 * - Error handling
 * - Token management
 * - API calls
 * 
 * @param {string} endpoint - Endpoint relativo (ex: 'improve-task', 'generate-tests')
 * @returns {Object} { data, loading, error, execute, reset }
 * 
 * @example
 * const { data, loading, error, execute } = useAI('improve-task');
 * await execute({ task: 'descrição', model: { apiName: 'chatgpt', version: 'gpt-4o' } });
 */
export const useAI = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Executa a chamada de IA
   * @param {Object} options
   * @param {string} options.task - Descrição da tarefa / prompt
   * @param {Object} options.model - Modelo selecionado { apiName, version }
   * @param {string} options.prompt - Prompt do sistema (opcional)
   * @param {boolean} options.educationMode - Modo educacional (opcional)
   * @param {Object} options.extraData - Dados extras para enviar (opcional)
   */
  const execute = useCallback(async (options) => {
    const { task, model, prompt = '', educationMode = false, extraData = {} } = options;

    // Validações
    if (!model?.apiName) {
      setError('Por favor, selecione um modelo');
      return null;
    }

    const token = localStorage.getItem(`${model.apiName}Token`);
    if (!token) {
      setError(`Token não configurado para ${model.apiName}`);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Monta o prompt completo
      let fullPrompt = prompt ? `${prompt}\n\n${task}` : task;

      const response = await axios.post(
        `${BACKEND_URL}/api/${model.apiName}/${endpoint}?token=${token}`,
        {
          model: model.version,
          data: fullPrompt,
          task: fullPrompt,
          educationMode,
          ...extraData
        }
      );

      // Normaliza resposta (ChatGPT retorna string, Gemini retorna { data: string })
      const result = typeof response.data === 'string' 
        ? response.data 
        : response.data.data || response.data;

      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || 'Erro ao processar requisição';
      
      setError(errorMessage);
      console.error(`useAI [${endpoint}] error:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  /**
   * Reseta o estado do hook
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData, // Permite manipular dados externamente (ex: histórico)
    setError
  };
};

/**
 * Hook específico para melhorar tarefas
 * Inclui lógica de persistência e histórico
 */
export const useImproveTask = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationId, setGenerationId] = useState(null);

  const improveTask = useCallback(async (promptText, model, taskInfo = '') => {
    if (!model?.apiName) {
      setError('Por favor, selecione um modelo');
      return null;
    }

    const token = localStorage.getItem(`${model.apiName}Token`);
    if (!token) {
      setError('Sem token para realizar requisição');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const educationMode = JSON.parse(localStorage.getItem('educationMode') || 'false');

      const response = await axios.post(
        `${BACKEND_URL}/api/${model.apiName}/improve-task?token=${token}`,
        {
          model: model.version,
          data: promptText,
          educationMode
        }
      );

      const data = response.data.data || response.data;
      setResult(data);

      // Salva no histórico se já existir generationId
      if (generationId) {
        addVersion(generationId, data, { type: 'task', model: model.version });
      }

      // Salva no localStorage e atualiza generationId
      const id = saveGenerationToLocalStorage(data, 'task', model.version, taskInfo);
      setGenerationId(id);

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao melhorar a tarefa';
      setError(errorMessage);
      console.error('useImproveTask error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  const reset = useCallback(() => {
    setResult('');
    setError(null);
    setLoading(false);
    setGenerationId(null);
  }, []);

  return { 
    result, 
    setResult,
    loading, 
    error, 
    setError,
    generationId, 
    improveTask, 
    reset,
    getVersions: () => generationId ? getVersions(generationId) : []
  };
};

/**
 * Hook específico para gerar casos de teste
 * Inclui lógica de persistência e histórico
 */
export const useGenerateTests = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationId, setGenerationId] = useState(null);

  const generateTests = useCallback(async (promptText, model, taskInfo = '') => {
    if (!model?.apiName) {
      setError('Por favor, selecione um modelo');
      return null;
    }

    const token = localStorage.getItem(`${model.apiName}Token`);
    if (!token) {
      setError('Sem token para realizar requisição');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const educationMode = JSON.parse(localStorage.getItem('educationMode') || 'false');

      const response = await axios.post(
        `${BACKEND_URL}/api/${model.apiName}/generate-tests?token=${token}`,
        {
          model: model.version,
          data: promptText,
          educationMode
        }
      );

      const data = response.data.data || response.data;
      setResult(data);

      if (generationId) {
        addVersion(generationId, data, { type: 'tests', model: model.version });
      }

      const id = saveGenerationToLocalStorage(data, 'tests', model.version, taskInfo);
      setGenerationId(id);

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao gerar casos de teste';
      setError(errorMessage);
      console.error('useGenerateTests error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  const reset = useCallback(() => {
    setResult('');
    setError(null);
    setLoading(false);
    setGenerationId(null);
  }, []);

  return { 
    result, 
    setResult,
    loading, 
    error, 
    setError,
    generationId, 
    generateTests, 
    reset,
    getVersions: () => generationId ? getVersions(generationId) : []
  };
};

/**
 * Hook específico para gerar código de teste
 * Inclui lógica de persistência e histórico
 */
export const useGenerateTestCode = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationId, setGenerationId] = useState(null);

  const generateTestCode = useCallback(async (promptText, model, taskInfo = '', extraConfig = {}) => {
    if (!model?.apiName) {
      setError('Por favor, selecione um modelo');
      return null;
    }

    const token = localStorage.getItem(`${model.apiName}Token`);
    if (!token) {
      setError('Sem token para realizar requisição');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const educationMode = JSON.parse(localStorage.getItem('educationMode') || 'false');

      const response = await axios.post(
        `${BACKEND_URL}/api/${model.apiName}/generate-test-code?token=${token}`,
        {
          model: model.version,
          data: promptText,
          educationMode,
          ...extraConfig
        }
      );

      const data = response.data.data || response.data;
      setResult(data);

      if (generationId) {
        addVersion(generationId, data, { type: 'code', model: model.version });
      }

      const id = saveGenerationToLocalStorage(data, 'code', model.version, taskInfo);
      setGenerationId(id);

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao gerar código de teste';
      setError(errorMessage);
      console.error('useGenerateTestCode error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  const reset = useCallback(() => {
    setResult('');
    setError(null);
    setLoading(false);
    setGenerationId(null);
  }, []);

  return { 
    result, 
    setResult,
    loading, 
    error, 
    setError,
    generationId, 
    generateTestCode, 
    reset,
    getVersions: () => generationId ? getVersions(generationId) : []
  };
};

/**
 * Hook específico para análise de riscos
 * Inclui lógica de persistência e histórico
 */
export const useAnalyzeRisks = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationId, setGenerationId] = useState(null);

  const analyzeRisks = useCallback(async (feature, model, taskInfo = '') => {
    if (!model?.apiName) {
      setError('Por favor, selecione um modelo');
      return null;
    }

    const token = localStorage.getItem(`${model.apiName}Token`);
    if (!token) {
      setError('Sem token para realizar requisição');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const educationMode = JSON.parse(localStorage.getItem('educationMode') || 'false');

      const response = await axios.post(
        `${BACKEND_URL}/api/analyze-risks?token=${token}`,
        {
          feature,
          model,
          educationMode,
          provider: model.apiName
        }
      );

      const data = model.apiName === 'gemini' ? response.data.data : response.data;
      setResult(data);

      if (generationId) {
        addVersion(generationId, data, { type: 'risk', model: model.version });
      }

      const id = saveGenerationToLocalStorage(data, 'risk', model.version, taskInfo);
      setGenerationId(id);

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao analisar riscos';
      setError(errorMessage);
      console.error('useAnalyzeRisks error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [generationId]);

  const reset = useCallback(() => {
    setResult('');
    setError(null);
    setLoading(false);
    setGenerationId(null);
  }, []);

  return { 
    result, 
    setResult,
    loading, 
    error, 
    setError,
    generationId, 
    analyzeRisks, 
    reset,
    getVersions: () => generationId ? getVersions(generationId) : []
  };
};

export default useAI;
