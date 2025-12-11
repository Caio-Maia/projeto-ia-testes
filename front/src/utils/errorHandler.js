/**
 * Centralized Error Handler for Frontend
 * 
 * Padroniza o tratamento de erros retornados pelo backend.
 * Mapeia códigos de erro para chaves de tradução i18n.
 */

/**
 * Mapeamento de códigos de erro para chaves de tradução
 */
const ERROR_TRANSLATION_KEYS = {
  // Autenticação/Autorização
  UNAUTHORIZED: 'errors.unauthorized',
  FORBIDDEN: 'errors.forbidden',
  AI_TOKEN_MISSING: 'errors.aiTokenMissing',
  
  // Validação
  VALIDATION_ERROR: 'errors.validationError',
  BAD_REQUEST: 'errors.badRequest',
  
  // Recursos
  NOT_FOUND: 'errors.notFound',
  
  // Rate Limiting
  TOO_MANY_REQUESTS: 'errors.tooManyRequests',
  
  // Serviços externos
  AI_SERVICE_ERROR: 'errors.aiServiceError',
  EXTERNAL_SERVICE_ERROR: 'errors.externalServiceError',
  
  // Servidor
  INTERNAL_ERROR: 'errors.internalError',
  
  // Rede
  NETWORK_ERROR: 'errors.networkError',
  CONNECTION_ERROR: 'errors.connectionError',
  TIMEOUT_ERROR: 'errors.timeoutError',
  
  // Default
  UNKNOWN_ERROR: 'errors.unknownError',
  HTTP_ERROR: 'errors.httpError',
};

/**
 * Mapeamento de códigos HTTP para chaves de tradução
 */
const HTTP_STATUS_TRANSLATION_KEYS = {
  400: 'errors.http400',
  401: 'errors.http401',
  403: 'errors.http403',
  404: 'errors.http404',
  429: 'errors.http429',
  500: 'errors.http500',
  502: 'errors.http502',
  503: 'errors.http503',
  504: 'errors.http504',
};

/**
 * Mensagens de fallback (quando tradutor não está disponível)
 */
const FALLBACK_MESSAGES = {
  'errors.unauthorized': 'Unauthorized. Check your token.',
  'errors.forbidden': 'Access denied.',
  'errors.aiTokenMissing': 'API token not configured.',
  'errors.validationError': 'Invalid data.',
  'errors.badRequest': 'Invalid request.',
  'errors.notFound': 'Resource not found.',
  'errors.tooManyRequests': 'Too many requests. Wait a moment.',
  'errors.aiServiceError': 'AI service error. Try again.',
  'errors.externalServiceError': 'External service error.',
  'errors.internalError': 'Internal server error.',
  'errors.networkError': 'Connection error. Check your internet.',
  'errors.connectionError': 'Could not connect to server.',
  'errors.timeoutError': 'Request took too long.',
  'errors.unknownError': 'An unexpected error occurred.',
  'errors.httpError': 'HTTP Error',
  'errors.http400': 'Invalid request',
  'errors.http401': 'Unauthorized.',
  'errors.http403': 'Access denied.',
  'errors.http404': 'Resource not found.',
  'errors.http429': 'Too many requests.',
  'errors.http500': 'Internal server error.',
  'errors.http502': 'Service unavailable.',
  'errors.http503': 'Service temporarily unavailable.',
  'errors.http504': 'Response timeout.',
};

/**
 * Classe de erro padronizada para o frontend
 */
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = null, details = null, translationKey = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.translationKey = translationKey || ERROR_TRANSLATION_KEYS[code] || 'errors.unknownError';
    this.isOperational = true;
  }

  /**
   * Retorna a chave de tradução para uso com i18n
   */
  getTranslationKey() {
    return this.translationKey;
  }

  /**
   * Retorna mensagem traduzida usando a função de tradução fornecida
   * @param {Function} t - Função de tradução (ex: do useLanguage)
   * @returns {string} - Mensagem traduzida
   */
  getTranslatedMessage(t) {
    if (typeof t === 'function') {
      const translated = t(this.translationKey);
      // Se a tradução retornar a própria chave, usa o fallback
      if (translated === this.translationKey) {
        return FALLBACK_MESSAGES[this.translationKey] || this.message;
      }
      return translated;
    }
    return FALLBACK_MESSAGES[this.translationKey] || this.message;
  }

  /**
   * Retorna mensagem de fallback (sem tradução)
   */
  getFallbackMessage() {
    return FALLBACK_MESSAGES[this.translationKey] || this.message;
  }
}

/**
 * Extrai informações de erro de diferentes formatos de resposta
 * 
 * @param {Error|Object} error - Erro capturado
 * @returns {AppError} - Erro padronizado
 */
export const parseError = (error) => {
  // Já é um AppError
  if (error instanceof AppError) {
    return error;
  }

  // Erro de rede (sem resposta)
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return new AppError(
      FALLBACK_MESSAGES['errors.networkError'],
      'NETWORK_ERROR',
      0,
      null,
      'errors.networkError'
    );
  }

  // Erro de timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new AppError(
      FALLBACK_MESSAGES['errors.timeoutError'],
      'TIMEOUT_ERROR',
      408,
      null,
      'errors.timeoutError'
    );
  }

  // Erro com resposta do Axios
  if (error.response) {
    const { status, data } = error.response;
    
    // Backend retorna { error: string, code?: string, details?: any }
    if (data) {
      const code = data.code || 'UNKNOWN_ERROR';
      const translationKey = ERROR_TRANSLATION_KEYS[code] || HTTP_STATUS_TRANSLATION_KEYS[status] || 'errors.unknownError';
      const message = data.error || data.message || FALLBACK_MESSAGES[translationKey] || 'Unknown error';
      const details = data.details || data.stack;
      
      return new AppError(message, code, status, details, translationKey);
    }

    // Resposta sem body
    const translationKey = HTTP_STATUS_TRANSLATION_KEYS[status] || 'errors.httpError';
    const message = FALLBACK_MESSAGES[translationKey] || `HTTP Error ${status}`;
    return new AppError(message, 'HTTP_ERROR', status, null, translationKey);
  }

  // Erro de request (requisição não enviada)
  if (error.request) {
    return new AppError(
      FALLBACK_MESSAGES['errors.connectionError'],
      'CONNECTION_ERROR',
      0,
      null,
      'errors.connectionError'
    );
  }

  // Erro genérico
  return new AppError(
    error.message || FALLBACK_MESSAGES['errors.unknownError'],
    'UNKNOWN_ERROR',
    null,
    null,
    'errors.unknownError'
  );
};

/**
 * Extrai erro de resposta de streaming (SSE)
 * 
 * @param {Response} response - Resposta do fetch
 * @returns {Promise<AppError>} - Erro padronizado
 */
export const parseStreamError = async (response) => {
  const status = response.status;
  
  try {
    const data = await response.json();
    const code = data.code || 'UNKNOWN_ERROR';
    const translationKey = ERROR_TRANSLATION_KEYS[code] || HTTP_STATUS_TRANSLATION_KEYS[status] || 'errors.unknownError';
    const message = data.error || data.message || FALLBACK_MESSAGES[translationKey] || 'Unknown error';
    
    return new AppError(message, code, status, data.details, translationKey);
  } catch {
    // Não conseguiu fazer parse do JSON
    const translationKey = HTTP_STATUS_TRANSLATION_KEYS[status] || 'errors.httpError';
    const message = FALLBACK_MESSAGES[translationKey] || `HTTP Error ${status}`;
    return new AppError(message, 'HTTP_ERROR', status, null, translationKey);
  }
};

/**
 * Extrai mensagem de erro traduzida para exibição
 * 
 * @param {Error|Object} error - Erro capturado
 * @param {Function} t - Função de tradução (opcional)
 * @returns {string} - Mensagem amigável (traduzida se t fornecido)
 */
export const getErrorMessage = (error, t = null) => {
  const appError = parseError(error);
  
  if (t && typeof t === 'function') {
    return appError.getTranslatedMessage(t);
  }
  
  return appError.getFallbackMessage();
};

/**
 * Retorna a chave de tradução para um erro
 * 
 * @param {Error|Object} error - Erro capturado
 * @returns {string} - Chave de tradução (ex: 'errors.unauthorized')
 */
export const getErrorTranslationKey = (error) => {
  const appError = parseError(error);
  return appError.getTranslationKey();
};

/**
 * Verifica se é um erro de autenticação
 * 
 * @param {Error|AppError} error - Erro a verificar
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  const appError = error instanceof AppError ? error : parseError(error);
  return (
    appError.statusCode === 401 ||
    appError.code === 'UNAUTHORIZED' ||
    appError.code === 'AI_TOKEN_MISSING'
  );
};

/**
 * Verifica se é um erro de rate limiting
 * 
 * @param {Error|AppError} error - Erro a verificar
 * @returns {boolean}
 */
export const isRateLimitError = (error) => {
  const appError = error instanceof AppError ? error : parseError(error);
  return appError.statusCode === 429 || appError.code === 'TOO_MANY_REQUESTS';
};

/**
 * Verifica se é um erro de rede/conexão
 * 
 * @param {Error|AppError} error - Erro a verificar
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  const appError = error instanceof AppError ? error : parseError(error);
  return (
    appError.code === 'NETWORK_ERROR' ||
    appError.code === 'CONNECTION_ERROR' ||
    appError.statusCode === 0
  );
};

/**
 * Verifica se o erro é recuperável (pode tentar novamente)
 * 
 * @param {Error|AppError} error - Erro a verificar
 * @returns {boolean}
 */
export const isRetryableError = (error) => {
  const appError = error instanceof AppError ? error : parseError(error);
  const retryableCodes = [408, 429, 500, 502, 503, 504];
  const retryableErrorCodes = ['TIMEOUT_ERROR', 'NETWORK_ERROR', 'INTERNAL_ERROR'];
  
  return (
    retryableCodes.includes(appError.statusCode) ||
    retryableErrorCodes.includes(appError.code)
  );
};

/**
 * Loga erro no console com formatação adequada
 * 
 * @param {string} context - Contexto onde o erro ocorreu
 * @param {Error|AppError} error - Erro a logar
 */
export const logError = (context, error) => {
  const appError = error instanceof AppError ? error : parseError(error);
  
  console.error(`[${context}] Error:`, {
    message: appError.message,
    code: appError.code,
    translationKey: appError.translationKey,
    statusCode: appError.statusCode,
    details: appError.details,
  });
};

/**
 * Módulo exportado para uso com import default
 */
const errorHandler = {
  AppError,
  parseError,
  parseStreamError,
  getErrorMessage,
  getErrorTranslationKey,
  isAuthError,
  isRateLimitError,
  isNetworkError,
  isRetryableError,
  logError,
  ERROR_TRANSLATION_KEYS,
  HTTP_STATUS_TRANSLATION_KEYS,
  FALLBACK_MESSAGES,
};

export default errorHandler;
