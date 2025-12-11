/**
 * Redis Configuration
 * 
 * Configuração de conexão com Redis para BullMQ.
 * Suporta Redis local ou serviços cloud (Redis Cloud, Upstash, etc.)
 */

const { logger } = require('../utils/logger');

/**
 * Opções de conexão Redis
 * Configurável via variáveis de ambiente
 */
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Necessário para BullMQ
  enableReadyCheck: false,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.warn({ times }, 'Redis connection failed, queue features disabled');
      return null; // Para de tentar após 3 tentativas
    }
    return Math.min(times * 200, 2000); // Retry com backoff
  }
};

/**
 * Verifica se Redis está habilitado
 * Desabilita em ambiente de desenvolvimento se não houver Redis
 */
const isRedisEnabled = () => {
  return process.env.REDIS_ENABLED === 'true' || process.env.REDIS_HOST;
};

/**
 * Configurações padrão para filas
 */
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600, // Remove jobs completos após 1 hora
    count: 100, // Mantém últimos 100 jobs completos
  },
  removeOnFail: {
    age: 86400, // Remove jobs falhos após 24 horas
  },
};

module.exports = {
  redisConnection,
  isRedisEnabled,
  defaultJobOptions,
};
