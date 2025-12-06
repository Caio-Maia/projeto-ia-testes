/**
 * Centralized Error Handler
 * 
 * Padroniza o tratamento de erros em toda a aplicação.
 * Diferencia erros operacionais (previsíveis) de erros de programação.
 */

const { logger } = require('../utils/logger');

/**
 * Classe de erro customizada para erros operacionais
 * Erros que podemos prever e tratar gracefully
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'UNKNOWN_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    // Captura stack trace excluindo o construtor
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erros comuns pré-definidos
 */
const errors = {
  // Autenticação/Autorização
  UNAUTHORIZED: (message = 'Não autorizado') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  FORBIDDEN: (message = 'Acesso negado') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  // Validação
  VALIDATION_ERROR: (message = 'Dados inválidos') => 
    new AppError(message, 400, 'VALIDATION_ERROR'),
  
  BAD_REQUEST: (message = 'Requisição inválida') => 
    new AppError(message, 400, 'BAD_REQUEST'),
  
  // Recursos
  NOT_FOUND: (resource = 'Recurso') => 
    new AppError(`${resource} não encontrado`, 404, 'NOT_FOUND'),
  
  // Rate Limiting
  TOO_MANY_REQUESTS: (message = 'Muitas requisições') => 
    new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  
  // Serviços externos
  AI_SERVICE_ERROR: (provider, message = 'Erro no serviço de IA') => 
    new AppError(`${provider}: ${message}`, 502, 'AI_SERVICE_ERROR'),
  
  AI_TOKEN_MISSING: (provider) => 
    new AppError(`Token da API ${provider} não configurado`, 401, 'AI_TOKEN_MISSING'),
  
  EXTERNAL_SERVICE_ERROR: (service, message = 'Erro no serviço externo') => 
    new AppError(`${service}: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR'),
  
  // Servidor
  INTERNAL_ERROR: (message = 'Erro interno do servidor') => 
    new AppError(message, 500, 'INTERNAL_ERROR'),
};

/**
 * Middleware de tratamento de erros
 * Deve ser o último middleware registrado
 */
const errorHandler = (err, req, res, next) => {
  // Se já respondeu, passa para o próximo handler
  if (res.headersSent) {
    return next(err);
  }

  // Log do erro
  if (err.isOperational) {
    // Erros operacionais: log como warning
    logger.warn({
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
    }, 'Operational error');
  } else {
    // Erros de programação: log como error com stack
    logger.error({
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    }, 'Unexpected error');
  }

  // Resposta ao cliente
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  // Erro inesperado: não expõe detalhes
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  return res.status(statusCode).json({
    error: isProduction ? 'Erro interno do servidor' : err.message,
    code: 'INTERNAL_ERROR',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

/**
 * Wrapper para funções async em rotas
 * Captura erros e passa para o errorHandler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handler para rotas não encontradas
 */
const notFoundHandler = (req, res, next) => {
  next(errors.NOT_FOUND('Rota'));
};

module.exports = {
  AppError,
  errors,
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
