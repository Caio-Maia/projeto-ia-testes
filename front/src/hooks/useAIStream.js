import { useState, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import { addVersion } from '../utils/generationHistory';
import { AppError, parseStreamError, logError } from '../utils/errorHandler';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

/**
 * Hook para streaming de respostas de IA via Server-Sent Events (SSE)
 * 
 * Benefícios:
 * - Mostra resposta em tempo real conforme é gerada
 * - Menor tempo percebido de espera
 * - Melhor UX para respostas longas
 * 
 * @example
 * const { stream, result, isStreaming, error, abort } = useAIStream();
 * 
 * await stream({
 *   provider: 'chatgpt',
 *   promptText: 'Minha tarefa...',
 *   model: { apiName: 'chatgpt', version: 'gpt-4o' },
 *   feature: 'improve-task'
 * });
 */
export const useAIStream = () => {
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [generationId, setGenerationId] = useState(null);
  const abortControllerRef = useRef(null);
  const fullContentRef = useRef('');

  /**
   * Aborta o streaming atual
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  /**
   * Inicia streaming de resposta
   */
  const stream = useCallback(async (options) => {
    const { 
      provider = 'chatgpt', 
      promptText, 
      model, 
      feature = 'stream',
      taskInfo = '',
      existingGenerationId = null,
      onChunk = null,
      onComplete = null,
      onError = null
    } = options;

    // Validações
    if (!model?.apiName) {
      const err = new AppError('Por favor, selecione um modelo', 'VALIDATION_ERROR', 400);
      setError(err.message);
      onError?.(err);
      return null;
    }

    const token = localStorage.getItem(`${model.apiName}Token`);
    if (!token) {
      const err = new AppError(`Token não configurado para ${model.apiName}`, 'AI_TOKEN_MISSING', 401);
      setError(err.message);
      onError?.(err);
      return null;
    }

    // Abortar streaming anterior se existir
    abort();

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    fullContentRef.current = '';

    setIsStreaming(true);
    setError(null);
    setResult('');

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/stream/${provider}?token=${token}&feature=${feature}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            task: promptText,
            model: model.version
          }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        const appError = await parseStreamError(response);
        throw appError;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Função para processar uma linha SSE
      const processLine = (line) => {
        if (!line.startsWith('data: ')) return false;
        
        const data = line.slice(6).trim();
        if (!data) return false;

        try {
          const parsed = JSON.parse(data);
          
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          
          if (parsed.content) {
            fullContentRef.current += parsed.content;
            // Forçar atualização síncrona para streaming em tempo real
            flushSync(() => {
              setResult(fullContentRef.current);
            });
            onChunk?.(parsed.content, fullContentRef.current);
          }
          
          if (parsed.done) {
            const finalContent = parsed.fullContent || fullContentRef.current;
            setResult(finalContent);

            if (existingGenerationId) {
              addVersion(existingGenerationId, finalContent, { 
                type: feature, 
                model: model.version 
              });
            }

            const id = saveGenerationToLocalStorage(
              finalContent, 
              feature, 
              model.version, 
              taskInfo
            );
            setGenerationId(id);
            onComplete?.(finalContent, id);
            return true; // Indica que terminou
          }
        } catch (parseError) {
          if (!parseError.message.includes('Unexpected')) {
            console.warn('Parse error:', parseError);
          }
        }
        return false;
      };

      // Loop de leitura com processamento imediato de cada chunk
      let isDone = false;
      while (!isDone) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Processar dados restantes no buffer
          if (buffer.trim()) {
            buffer.split('\n').forEach(line => processLine(line));
          }
          break;
        }

        // Decodificar chunk recebido
        const text = decoder.decode(value, { stream: true });
        buffer += text;
        
        // Processar linhas completas imediatamente
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Manter última linha incompleta
        
        for (const line of lines) {
          if (processLine(line)) {
            isDone = true;
            break;
          }
        }
      }

      return fullContentRef.current;

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Streaming abortado pelo usuário');
        return null;
      }

      // Erro já é AppError ou precisa ser parseado
      const appError = err instanceof AppError ? err : new AppError(
        err.message || 'Erro durante streaming',
        'STREAM_ERROR',
        null
      );
      
      setError(appError.message);
      onError?.(appError);
      logError('useAIStream', appError);
      return null;

    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [abort]);

  /**
   * Reseta o estado do hook
   */
  const reset = useCallback(() => {
    abort();
    setResult('');
    setError(null);
    setIsStreaming(false);
    setGenerationId(null);
    fullContentRef.current = '';
  }, [abort]);

  return {
    stream,
    result,
    setResult,
    isStreaming,
    error,
    setError,
    generationId,
    abort,
    reset
  };
};

// ============================================
// Hooks específicos com streaming
// ============================================

/**
 * Hook para melhorar tarefa com streaming
 */
export const useImproveTaskStream = () => {
  const streamHook = useAIStream();

  const improveTask = useCallback(async (promptText, model, taskInfo = '', options = {}) => {
    return streamHook.stream({
      provider: model.apiName,
      promptText,
      model,
      feature: 'improve-task',
      taskInfo,
      ...options
    });
  }, [streamHook]);

  return {
    ...streamHook,
    improveTask,
    loading: streamHook.isStreaming
  };
};

/**
 * Hook para gerar casos de teste com streaming
 */
export const useGenerateTestsStream = () => {
  const streamHook = useAIStream();

  const generateTests = useCallback(async (promptText, model, taskInfo = '', options = {}) => {
    return streamHook.stream({
      provider: model.apiName,
      promptText,
      model,
      feature: 'generate-tests',
      taskInfo,
      ...options
    });
  }, [streamHook]);

  return {
    ...streamHook,
    generateTests,
    loading: streamHook.isStreaming
  };
};

/**
 * Hook para gerar código de teste com streaming
 */
export const useGenerateTestCodeStream = () => {
  const streamHook = useAIStream();

  const generateTestCode = useCallback(async (promptText, model, taskInfo = '', options = {}) => {
    return streamHook.stream({
      provider: model.apiName,
      promptText,
      model,
      feature: 'generate-test-code',
      taskInfo,
      ...options
    });
  }, [streamHook]);

  return {
    ...streamHook,
    generateTestCode,
    loading: streamHook.isStreaming
  };
};

/**
 * Hook para análise de riscos com streaming
 */
export const useAnalyzeRisksStream = () => {
  const streamHook = useAIStream();

  const analyzeRisks = useCallback(async (feature, model, taskInfo = '', options = {}) => {
    return streamHook.stream({
      provider: model.apiName,
      promptText: feature,
      model,
      feature: 'analyze-risks',
      taskInfo,
      ...options
    });
  }, [streamHook]);

  return {
    ...streamHook,
    analyzeRisks,
    loading: streamHook.isStreaming
  };
};

export default useAIStream;
