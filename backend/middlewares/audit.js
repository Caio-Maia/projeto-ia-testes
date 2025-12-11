/**
 * Audit Middleware
 * 
 * Middleware para logging automático de operações via AuditLog.
 * Pode ser usado como middleware de rota ou chamado manualmente.
 * 
 * @module middlewares/audit
 */

const AuditLog = require('../models/auditLogModel');
const logger = require('../utils/logger');

/**
 * Mapeia rotas para ações de audit
 */
const routeActionMap = {
  // ChatGPT
  'POST /api/improve-task': { action: 'IMPROVE_TASK', resource: 'ai', feature: 'improve-task' },
  'POST /api/generate-tests': { action: 'GENERATE_TESTS', resource: 'ai', feature: 'generate-tests' },
  'POST /api/generate-test-code': { action: 'GENERATE_CODE', resource: 'ai', feature: 'generate-code' },
  'POST /api/analyze-risks': { action: 'ANALYZE_RISKS', resource: 'ai', feature: 'analyze-risks' },
  'POST /api/analyze-coverage': { action: 'ANALYZE_COVERAGE', resource: 'ai', feature: 'analyze-coverage' },
  
  // Gemini
  'POST /api/gemini/improve-task': { action: 'IMPROVE_TASK', resource: 'ai', feature: 'improve-task' },
  'POST /api/gemini/generate-tests': { action: 'GENERATE_TESTS', resource: 'ai', feature: 'generate-tests' },
  'POST /api/gemini/generate-test-code': { action: 'GENERATE_CODE', resource: 'ai', feature: 'generate-code' },
  'POST /api/gemini/analyze-risks': { action: 'ANALYZE_RISKS', resource: 'ai', feature: 'analyze-risks' },
  'POST /api/gemini/analyze-coverage': { action: 'ANALYZE_COVERAGE', resource: 'ai', feature: 'analyze-coverage' },
  
  // Streaming
  'POST /api/stream/chatgpt': { action: 'STREAM_START', resource: 'stream', feature: 'stream' },
  'POST /api/stream/gemini': { action: 'STREAM_START', resource: 'stream', feature: 'stream' },
  
  // JIRA
  'GET /api/jira/task': { action: 'JIRA_FETCH', resource: 'jira', feature: 'jira' },
  'PUT /api/jira/task': { action: 'JIRA_UPDATE', resource: 'jira', feature: 'jira' },
  
  // Feedback
  'POST /api/feedback': { action: 'FEEDBACK_CREATE', resource: 'feedback', feature: 'feedback' },
  
  // Jobs
  'POST /api/analyze-coverage/async': { action: 'JOB_CREATE', resource: 'job', feature: 'job' }
};

/**
 * Extrai informações da request para o audit log
 */
function extractRequestInfo(req) {
  const body = req.body || {};
  
  return {
    model: body.model?.version || body.model || null,
    promptLength: body.task?.length || body.prompt?.length || body.requirements?.length || 0,
    taskCode: body.taskCode || req.query?.taskCode || null,
    generationId: body.generationId || null
  };
}

/**
 * Extrai informações da response para o audit log
 */
function extractResponseInfo(res, responseBody) {
  return {
    statusCode: res.statusCode,
    responseLength: typeof responseBody === 'string' ? responseBody.length : 
                    JSON.stringify(responseBody || '').length
  };
}

/**
 * Middleware de audit automático
 * Registra a operação quando a response é finalizada
 */
function auditMiddleware(options = {}) {
  return async (req, res, next) => {
    const startTime = Date.now();
    const routeKey = `${req.method} ${req.path}`;
    const routeInfo = routeActionMap[routeKey];
    
    // Se não está mapeado, ignora
    if (!routeInfo && !options.logAll) {
      return next();
    }
    
    // Captura o body da response
    const originalSend = res.send;
    let responseBody;
    
    res.send = function(body) {
      responseBody = body;
      return originalSend.call(this, body);
    };
    
    // Quando a response terminar, registra o audit log
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const requestInfo = extractRequestInfo(req);
        const responseInfo = extractResponseInfo(res, responseBody);
        const success = res.statusCode >= 200 && res.statusCode < 400;
        
        const action = routeInfo?.action || 'API_ERROR';
        const resource = routeInfo?.resource || 'system';
        
        await AuditLog.create({
          action,
          resource,
          method: req.method,
          path: req.originalUrl,
          statusCode: responseInfo.statusCode,
          details: {
            feature: routeInfo?.feature,
            model: requestInfo.model,
            promptLength: requestInfo.promptLength,
            responseLength: responseInfo.responseLength,
            taskCode: requestInfo.taskCode,
            generationId: requestInfo.generationId
          },
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent'),
          duration,
          success,
          errorMessage: !success ? extractErrorMessage(responseBody) : null
        });
        
        logger.debug({
          msg: 'Audit log recorded',
          action,
          resource,
          duration,
          success
        });
      } catch (error) {
        // Não falha a request se o audit log falhar
        logger.error({
          msg: 'Failed to record audit log',
          error: error.message
        });
      }
    });
    
    next();
  };
}

/**
 * Extrai mensagem de erro do body da response
 */
function extractErrorMessage(body) {
  if (!body) return null;
  
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    return parsed.error?.message || parsed.message || parsed.error || null;
  } catch {
    return null;
  }
}

/**
 * Helper para logging manual de operações de IA
 */
async function logAIOperation(req, action, details, options = {}) {
  try {
    await AuditLog.logAI(action, details, req, options);
  } catch (error) {
    logger.error({ msg: 'Failed to log AI operation', error: error.message });
  }
}

/**
 * Helper para logging manual de operações JIRA
 */
async function logJiraOperation(req, action, details, options = {}) {
  try {
    await AuditLog.logJira(action, details, req, options);
  } catch (error) {
    logger.error({ msg: 'Failed to log JIRA operation', error: error.message });
  }
}

/**
 * Helper para logging manual de erros
 */
async function logError(req, error, options = {}) {
  try {
    await AuditLog.logError('API_ERROR', error, req, options);
  } catch (err) {
    logger.error({ msg: 'Failed to log error', error: err.message });
  }
}

/**
 * Helper para logging de rate limit
 */
async function logRateLimit(req) {
  try {
    await AuditLog.create({
      action: 'RATE_LIMIT_HIT',
      resource: 'system',
      method: req.method,
      path: req.originalUrl,
      statusCode: 429,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Rate limit exceeded'
    });
  } catch (error) {
    logger.error({ msg: 'Failed to log rate limit', error: error.message });
  }
}

/**
 * Helper para logging de streaming
 */
async function logStreamOperation(req, action, details, options = {}) {
  try {
    await AuditLog.create({
      action,
      resource: 'stream',
      method: req?.method,
      path: req?.originalUrl,
      statusCode: options.statusCode,
      details: {
        provider: details.provider,
        feature: details.feature,
        model: details.model,
        chunksCount: details.chunksCount,
        totalLength: details.totalLength
      },
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get?.('User-Agent'),
      duration: options.duration,
      success: options.success !== false,
      errorMessage: options.errorMessage
    });
  } catch (error) {
    logger.error({ msg: 'Failed to log stream operation', error: error.message });
  }
}

module.exports = {
  auditMiddleware,
  logAIOperation,
  logJiraOperation,
  logError,
  logRateLimit,
  logStreamOperation,
  routeActionMap
};
