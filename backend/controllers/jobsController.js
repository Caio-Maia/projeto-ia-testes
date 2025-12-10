/**
 * Jobs Controller
 * 
 * API para gerenciamento de jobs em filas.
 * Permite consultar status, listar jobs e cancelar operações.
 */

const { 
  getJobStatus, 
  listJobs, 
  cancelJob, 
  getQueueStats,
  isRedisEnabled 
} = require('../services/queueService');
const { getAIJobStatus, QUEUE_NAME } = require('../services/aiQueueService');
const { logger } = require('../utils/logger');

/**
 * GET /api/jobs/:jobId
 * Obtém status de um job
 */
const getJob = async (req, res) => {
  const { jobId } = req.params;
  const { queue = QUEUE_NAME } = req.query;

  try {
    const status = await getJobStatus(queue, jobId);
    
    if (status.status === 'not_found') {
      return res.status(404).json(status);
    }
    
    res.json(status);
  } catch (error) {
    logger.error({ jobId, error: error.message }, 'Error getting job status');
    res.status(500).json({ error: 'Erro ao obter status do job' });
  }
};

/**
 * GET /api/jobs
 * Lista jobs de uma fila
 */
const listQueueJobs = async (req, res) => {
  const { queue = QUEUE_NAME, status = 'all', limit = 20 } = req.query;

  try {
    if (!isRedisEnabled()) {
      return res.json({
        available: false,
        message: 'Queue system not available (Redis not configured)',
        jobs: []
      });
    }

    const jobs = await listJobs(queue, status, parseInt(limit));
    
    res.json({
      available: true,
      queue,
      filter: status,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    logger.error({ queue, error: error.message }, 'Error listing jobs');
    res.status(500).json({ error: 'Erro ao listar jobs' });
  }
};

/**
 * DELETE /api/jobs/:jobId
 * Cancela um job pendente
 */
const cancelQueueJob = async (req, res) => {
  const { jobId } = req.params;
  const { queue = QUEUE_NAME } = req.query;

  try {
    const cancelled = await cancelJob(queue, jobId);
    
    if (!cancelled) {
      return res.status(400).json({ 
        error: 'Não foi possível cancelar o job',
        message: 'Job não encontrado ou já está em execução'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Job cancelado com sucesso',
      jobId 
    });
  } catch (error) {
    logger.error({ jobId, error: error.message }, 'Error cancelling job');
    res.status(500).json({ error: 'Erro ao cancelar job' });
  }
};

/**
 * GET /api/jobs/stats
 * Obtém estatísticas das filas
 */
const getStats = async (req, res) => {
  const { queue = QUEUE_NAME } = req.query;

  try {
    const stats = await getQueueStats(queue);
    res.json(stats);
  } catch (error) {
    logger.error({ queue, error: error.message }, 'Error getting queue stats');
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
};

/**
 * GET /api/jobs/health
 * Verifica saúde do sistema de filas
 */
const healthCheck = async (req, res) => {
  try {
    const enabled = isRedisEnabled();
    
    if (!enabled) {
      return res.json({
        status: 'disabled',
        message: 'Queue system not configured',
        redis: {
          enabled: false,
          host: process.env.REDIS_HOST || 'not configured'
        }
      });
    }

    const stats = await getQueueStats(QUEUE_NAME);
    
    res.json({
      status: stats.available ? 'healthy' : 'unhealthy',
      redis: {
        enabled: true,
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      queues: {
        [QUEUE_NAME]: stats.counts || {}
      }
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Queue health check failed');
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
};

module.exports = {
  getJob,
  listQueueJobs,
  cancelQueueJob,
  getStats,
  healthCheck,
};
