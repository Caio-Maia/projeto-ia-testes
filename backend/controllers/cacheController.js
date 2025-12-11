/**
 * Cache Controller
 * 
 * API endpoints para gerenciamento do cache de prompts de IA.
 */

const { asyncHandler } = require('../middlewares/errorHandler');
const { 
  getCacheStats, 
  clearCache, 
  invalidateCache,
  isCacheEnabled 
} = require('../services/cacheService');
const { logger } = require('../utils/logger');

/**
 * GET /api/cache/stats
 * Retorna estatísticas do cache
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await getCacheStats();
  res.json(stats);
});

/**
 * GET /api/cache/health
 * Health check do cache
 */
const healthCheck = asyncHandler(async (req, res) => {
  const enabled = isCacheEnabled();
  const stats = enabled ? await getCacheStats() : null;
  
  res.json({
    status: enabled ? 'ok' : 'disabled',
    enabled,
    timestamp: new Date().toISOString(),
    ...(stats && { 
      redisConnected: stats.redisConnected,
      cachedPrompts: stats.cachedPrompts 
    })
  });
});

/**
 * DELETE /api/cache
 * Limpa todo o cache
 */
const clear = asyncHandler(async (req, res) => {
  if (!isCacheEnabled()) {
    return res.status(503).json({ 
      error: 'Cache not enabled',
      message: 'Redis is not configured or not available'
    });
  }
  
  const success = await clearCache();
  
  if (success) {
    logger.info('Cache cleared by API request');
    res.json({ message: 'Cache cleared successfully' });
  } else {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

/**
 * DELETE /api/cache/invalidate
 * Invalida cache por padrão
 * Query params:
 * - provider: chatgpt, gemini
 * - feature: improve-task, generate-tests, generate-code, analyze-risks
 * - model: modelo específico
 */
const invalidate = asyncHandler(async (req, res) => {
  if (!isCacheEnabled()) {
    return res.status(503).json({ 
      error: 'Cache not enabled',
      message: 'Redis is not configured or not available'
    });
  }
  
  const { provider, feature, model } = req.query;
  
  // Build pattern
  let pattern = 'ai:';
  if (provider) {
    pattern += `${provider}:`;
    if (model) {
      pattern += `${model}:`;
      if (feature) {
        pattern += `${feature}:*`;
      } else {
        pattern += '*';
      }
    } else if (feature) {
      pattern += `*:${feature}:*`;
    } else {
      pattern += '*';
    }
  } else if (feature) {
    pattern += `*:*:${feature}:*`;
  } else {
    pattern += '*';
  }
  
  const count = await invalidateCache(pattern);
  
  logger.info({ pattern, count }, 'Cache invalidated by API request');
  
  res.json({ 
    message: 'Cache invalidated',
    pattern,
    keysRemoved: count
  });
});

module.exports = {
  getStats,
  healthCheck,
  clear,
  invalidate
};
