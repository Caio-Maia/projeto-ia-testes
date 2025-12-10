/**
 * Centralized Error Handler for Frontend
 * 
 * Padroniza o tratamento de erros retornados pelo backend.
 * Mapeia códigos de erro para mensagens amigáveis ao usuário.
 */

/**
 * Códigos de erro do backend e suas mensagens amigáveis
 */
const ERROR_MESSAGES = {
  // Autenticação/Autorização
  UNAUTHORIZED: 'Não autorizado. Verifique seu token.',
  FORBIDDEN: 'Acesso negado.',
  AI_TOKEN_MISSING: 'Token da API não configurado. Configure nas configurações.',
  
  // Validação
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos preenchidos.',
  BAD_REQUEST: 'Requisição inválida.',
  
  // Recursos
  NOT_FOUND: 'Recurso não encontrado.',
  
  // Rate Limiting
  TOO_MANY_REQUESTS: 'Muitas requisições. Aguarde um momento e tente novamente.',
  
  // Serviços externos
  AI_SERVICE_ERROR: 'Erro no serviço de IA. Tente novamente.',
  EXTERNAL_SERVICE_ERROR: 'Erro no serviço externo.',
  
  // Servidor
  INTERNAL_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
  
  // Default
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado.',
};

/**
 * Mensagens por código HTTP
 */
const HTTP_STATUS_MESSAGES = {
  400: 'Requisição inválida',
  401: 'Não autorizado. Verifique seu token.',
  403: 'Acesso negado.',
  404: 'Recurso não encontrado.',
  429: 'Muitas requisições. Aguarde um momento.',
  500: 'Erro interno do servidor.',
  502: 'Serviço indisponível no momento.',
  503: 'Serviço temporariamente indisponível.',
  504: 'Tempo de resposta esgotado.',
};

/**
 * Classe de erro padronizada para o frontend
 */
export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  /**
   * Retorna mensagem amigável para exibição
   */
  getUserMessage() {
    return this.message;
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
      'Erro de conexão. Verifique sua internet e tente novamente.',
      'NETWORK_ERROR',
      0
    );
  }

  // Erro de timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return new AppError(
      'A requisição demorou muito. Tente novamente.',
      'TIMEOUT_ERROR',
      408
    );
  }

  // Erro com resposta do Axios
  if (error.response) {
    const { status, data } = error.response;
    
    // Backend retorna { error: string, code?: string, details?: any }
    if (data) {
      const code = data.code || 'UNKNOWN_ERROR';
      const message = data.error || data.message || HTTP_STATUS_MESSAGES[status] || 'Erro desconhecido';
      const details = data.details || data.stack;
      
      return new AppError(message, code, status, details);
    }

    // Resposta sem body
    const message = HTTP_STATUS_MESSAGES[status] || `Erro HTTP ${status}`;
    return new AppError(message, 'HTTP_ERROR', status);
  }

  // Erro de request (requisição não enviada)
  if (error.request) {
    return new AppError(
      'Não foi possível conectar ao servidor.',
      'CONNECTION_ERROR',
      0
    );
  }

  // Erro genérico
  return new AppError(
    error.message || 'Ocorreu um erro inesperado.',
    'UNKNOWN_ERROR',
    null
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
    const message = data.error || data.message || HTTP_STATUS_MESSAGES[status] || 'Erro desconhecido';
    
    return new AppError(message, code, status, data.details);
  } catch {
    // Não conseguiu fazer parse do JSON
    const message = HTTP_STATUS_MESSAGES[status] || `Erro HTTP ${status}`;
    return new AppError(message, 'HTTP_ERROR', status);
  }
};

/**
 * Extrai mensagem de erro para exibição
 * Útil para componentes que só precisam da string
 * 
 * @param {Error|Object} error - Erro capturado
 * @returns {string} - Mensagem amigável
 */
export const getErrorMessage = (error) => {
  const appError = parseError(error);
  return appError.message;
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
  isAuthError,
  isRateLimitError,
  isNetworkError,
  isRetryableError,
  logError,
  ERROR_MESSAGES,
};

export default errorHandler;
