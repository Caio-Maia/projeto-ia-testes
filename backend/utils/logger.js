/**
 * Structured Logging with Pino
 * 
 * Pino é um logger extremamente rápido para Node.js
 * com suporte a JSON estruturado e níveis de log.
 */

const pino = require('pino');

// Configuração do logger baseada no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Configuração de transporte
const transport = isProduction
  ? undefined // Em produção, usa stdout padrão (JSON)
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };

const logger = pino({
  level: logLevel,
  transport,
  base: {
    env: process.env.NODE_ENV || 'development',
  },
  // Customiza serialização de erros
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

// Métodos helpers para logging estruturado
const logHelpers = {
  /**
   * Log de requisição de IA
   */
  aiRequest: (model, promptLength, feature) => {
    logger.info({ model, promptLength, feature }, 'AI request started');
  },

  /**
   * Log de resposta de IA
   */
  aiResponse: (model, responseLength, durationMs, feature) => {
    logger.info({ model, responseLength, durationMs, feature }, 'AI request completed');
  },

  /**
   * Log de erro de IA
   */
  aiError: (model, error, feature) => {
    logger.error(
      { 
        model, 
        feature,
        error: error.message,
        code: error.response?.status,
        details: error.response?.data?.error 
      }, 
      'AI request failed'
    );
  },

  /**
   * Log de feedback
   */
  feedback: (action, data) => {
    logger.info({ action, ...data }, `Feedback ${action}`);
  },

  /**
   * Log de validação falhou
   */
  validationError: (path, errors) => {
    logger.warn({ path, errors }, 'Validation failed');
  },

  /**
   * Log de segurança
   */
  security: (event, details) => {
    logger.warn({ event, ...details }, `Security event: ${event}`);
  },
};

// Exporta logger com helpers
module.exports = {
  logger,
  ...logHelpers,
};
