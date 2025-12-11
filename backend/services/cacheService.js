/**
 * Cache Service
 * 
 * Serviço de cache com Redis para armazenar respostas de IA
 * para prompts idênticos, reduzindo custos e latência.
 */

const Redis = require('ioredis');
const crypto = require('crypto');
const { redisConnection, isRedisEnabled } = require('../config/redis');
const { logger } = require('../utils/logger');

let redisClient = null;
let cacheEnabled = false;

/**
 * Inicializa a conexão com Redis para cache
 */
const initCache = async () => {
  if (!isRedisEnabled()) {
    logger.info('Cache disabled: Redis not configured');
    return false;
  }

  try {
    redisClient = new Redis({
      ...redisConnection,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Cache Redis connection failed after 3 attempts');
          return null;
        }
        return Math.min(times * 200, 2000);
      }
    });

    await redisClient.connect();
    
    redisClient.on('error', (err) => {
      logger.error({ error: err.message }, 'Cache Redis error');
      cacheEnabled = false;
    });

    redisClient.on('connect', () => {
      logger.info('Cache Redis connected');
      cacheEnabled = true;
    });

    redisClient.on('close', () => {
      logger.info('Cache Redis connection closed');
      cacheEnabled = false;
    });

    cacheEnabled = true;
    logger.info('Cache service initialized');
    return true;
  } catch (error) {
    logger.warn({ error: error.message }, 'Failed to initialize cache, continuing without cache');
    cacheEnabled = false;
    return false;
  }
};

/**
 * Gera hash único para o prompt
 * @param {string} prompt - O prompt enviado para a IA
 * @param {string} model - O modelo de IA usado
 * @param {string} feature - A feature (improve-task, generate-tests, etc.)
 * @returns {string} Hash SHA256
 */
const hashPrompt = (prompt, model, feature) => {
  const content = `${feature}:${model}:${prompt}`;
  return crypto.createHash('sha256').update(content).digest('hex');
};

/**
 * Gera a chave de cache
 * @param {string} provider - Provider (chatgpt, gemini)
 * @param {string} model - Modelo usado
 * @param {string} feature - Feature
 * @param {string} promptHash - Hash do prompt
 * @returns {string} Chave de cache
 */
const getCacheKey = (provider, model, feature, promptHash) => {
  return `ai:${provider}:${model}:${feature}:${promptHash}`;
};

/**
 * Obtém resposta do cache
 * @param {string} provider - Provider (chatgpt, gemini)
 * @param {string} model - Modelo usado
 * @param {string} feature - Feature
 * @param {string} prompt - Prompt original
 * @returns {Promise<{hit: boolean, data: any}>}
 */
const getFromCache = async (provider, model, feature, prompt) => {
  if (!cacheEnabled || !redisClient) {
    return { hit: false, data: null };
  }

  try {
    const promptHash = hashPrompt(prompt, model, feature);
    const cacheKey = getCacheKey(provider, model, feature, promptHash);
    
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      const data = JSON.parse(cached);
      logger.info({ 
        provider, 
        model, 
        feature, 
        cacheKey: cacheKey.substring(0, 30) + '...' 
      }, 'Cache HIT');
      
      // Incrementa contador de hits
      await redisClient.incr('cache:stats:hits');
      
      return { hit: true, data };
    }

    // Incrementa contador de misses
    await redisClient.incr('cache:stats:misses');
    
    return { hit: false, data: null };
  } catch (error) {
    logger.error({ error: error.message }, 'Cache get error');
    return { hit: false, data: null };
  }
};

/**
 * Salva resposta no cache
 * @param {string} provider - Provider (chatgpt, gemini)
 * @param {string} model - Modelo usado
 * @param {string} feature - Feature
 * @param {string} prompt - Prompt original
 * @param {any} data - Dados a serem cacheados
 * @param {number} ttlSeconds - Tempo de vida em segundos (padrão: 1 hora)
 * @returns {Promise<boolean>}
 */
const setInCache = async (provider, model, feature, prompt, data, ttlSeconds = 3600) => {
  if (!cacheEnabled || !redisClient) {
    return false;
  }

  try {
    const promptHash = hashPrompt(prompt, model, feature);
    const cacheKey = getCacheKey(provider, model, feature, promptHash);
    
    const cacheData = {
      result: data,
      cachedAt: new Date().toISOString(),
      provider,
      model,
      feature,
      promptLength: prompt.length
    };

    await redisClient.setex(cacheKey, ttlSeconds, JSON.stringify(cacheData));
    
    logger.info({ 
      provider, 
      model, 
      feature, 
      ttlSeconds,
      cacheKey: cacheKey.substring(0, 30) + '...' 
    }, 'Cache SET');
    
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Cache set error');
    return false;
  }
};

/**
 * Invalida cache por padrão
 * @param {string} pattern - Padrão para invalidar (ex: 'ai:chatgpt:*')
 * @returns {Promise<number>} Número de chaves removidas
 */
const invalidateCache = async (pattern) => {
  if (!cacheEnabled || !redisClient) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info({ pattern, count: keys.length }, 'Cache invalidated');
    }
    return keys.length;
  } catch (error) {
    logger.error({ error: error.message }, 'Cache invalidate error');
    return 0;
  }
};

/**
 * Obtém estatísticas do cache
 * @returns {Promise<object>}
 */
const getCacheStats = async () => {
  if (!cacheEnabled || !redisClient) {
    return { enabled: false };
  }

  try {
    const [hits, misses, keys] = await Promise.all([
      redisClient.get('cache:stats:hits'),
      redisClient.get('cache:stats:misses'),
      redisClient.keys('ai:*')
    ]);

    const totalHits = parseInt(hits || '0');
    const totalMisses = parseInt(misses || '0');
    const total = totalHits + totalMisses;
    const hitRate = total > 0 ? ((totalHits / total) * 100).toFixed(2) : 0;

    return {
      enabled: true,
      hits: totalHits,
      misses: totalMisses,
      hitRate: `${hitRate}%`,
      cachedPrompts: keys.length,
      redisConnected: redisClient.status === 'ready'
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Cache stats error');
    return { enabled: true, error: error.message };
  }
};

/**
 * Limpa todo o cache
 * @returns {Promise<boolean>}
 */
const clearCache = async () => {
  if (!cacheEnabled || !redisClient) {
    return false;
  }

  try {
    const keys = await redisClient.keys('ai:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    // Reset stats
    await redisClient.set('cache:stats:hits', '0');
    await redisClient.set('cache:stats:misses', '0');
    
    logger.info({ count: keys.length }, 'Cache cleared');
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Cache clear error');
    return false;
  }
};

/**
 * Fecha a conexão do cache
 */
const closeCache = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    cacheEnabled = false;
    logger.info('Cache connection closed');
  }
};

/**
 * Verifica se o cache está habilitado
 */
const isCacheEnabled = () => cacheEnabled;

/**
 * TTL padrão por feature (em segundos)
 */
const DEFAULT_TTL = {
  'improve-task': 3600,      // 1 hora
  'generate-tests': 3600,    // 1 hora
  'generate-code': 1800,     // 30 minutos
  'analyze-risks': 3600,     // 1 hora
  'analyze-coverage': 1800,  // 30 minutos
};

/**
 * Obtém TTL para uma feature
 */
const getTTL = (feature) => DEFAULT_TTL[feature] || 3600;

module.exports = {
  initCache,
  getFromCache,
  setInCache,
  invalidateCache,
  getCacheStats,
  clearCache,
  closeCache,
  isCacheEnabled,
  getTTL,
  hashPrompt
};
