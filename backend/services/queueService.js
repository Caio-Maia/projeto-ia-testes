/**
 * Queue Service
 * 
 * Serviço de filas para processamento assíncrono de tarefas longas.
 * Usa BullMQ com Redis para persistência e escalabilidade.
 * 
 * Casos de uso:
 * - Análise de cobertura de testes (pode levar minutos)
 * - Processamento em batch de múltiplas tarefas
 * - Operações que excedem timeout de HTTP
 */

const { Queue, Worker, QueueEvents } = require('bullmq');
const { redisConnection, isRedisEnabled, defaultJobOptions } = require('../config/redis');
const { logger } = require('../utils/logger');

// Cache de filas criadas
const queues = new Map();
const workers = new Map();
const queueEvents = new Map();

/**
 * Cria ou retorna uma fila existente
 * @param {string} name - Nome da fila
 * @param {Object} options - Opções da fila
 * @returns {Queue|null} - Instância da fila ou null se Redis desabilitado
 */
const getQueue = (name, options = {}) => {
  if (!isRedisEnabled()) {
    logger.debug({ queue: name }, 'Redis disabled, queue not created');
    return null;
  }

  if (queues.has(name)) {
    return queues.get(name);
  }

  const queue = new Queue(name, {
    connection: redisConnection,
    defaultJobOptions: {
      ...defaultJobOptions,
      ...options.defaultJobOptions,
    },
    ...options,
  });

  queues.set(name, queue);
  logger.info({ queue: name }, 'Queue created');

  return queue;
};

/**
 * Cria um worker para processar jobs de uma fila
 * @param {string} queueName - Nome da fila
 * @param {Function} processor - Função processadora
 * @param {Object} options - Opções do worker
 * @returns {Worker|null}
 */
const createWorker = (queueName, processor, options = {}) => {
  if (!isRedisEnabled()) {
    return null;
  }

  const worker = new Worker(queueName, processor, {
    connection: redisConnection,
    concurrency: options.concurrency || 3,
    ...options,
  });

  // Event listeners
  worker.on('completed', (job, result) => {
    logger.info({ 
      queue: queueName, 
      jobId: job.id, 
      name: job.name,
      duration: Date.now() - job.timestamp 
    }, 'Job completed');
  });

  worker.on('failed', (job, error) => {
    logger.error({ 
      queue: queueName, 
      jobId: job?.id, 
      name: job?.name,
      error: error.message,
      attempts: job?.attemptsMade 
    }, 'Job failed');
  });

  worker.on('error', (error) => {
    logger.error({ queue: queueName, error: error.message }, 'Worker error');
  });

  workers.set(queueName, worker);
  logger.info({ queue: queueName, concurrency: options.concurrency || 3 }, 'Worker created');

  return worker;
};

/**
 * Obtém eventos da fila para monitoramento
 * @param {string} queueName - Nome da fila
 * @returns {QueueEvents|null}
 */
const getQueueEvents = (queueName) => {
  if (!isRedisEnabled()) {
    return null;
  }

  if (queueEvents.has(queueName)) {
    return queueEvents.get(queueName);
  }

  const events = new QueueEvents(queueName, {
    connection: redisConnection,
  });

  queueEvents.set(queueName, events);
  return events;
};

/**
 * Adiciona um job à fila
 * @param {string} queueName - Nome da fila
 * @param {string} jobName - Nome/tipo do job
 * @param {Object} data - Dados do job
 * @param {Object} options - Opções do job
 * @returns {Promise<Object>} - { jobId, status } ou resultado síncrono
 */
const addJob = async (queueName, jobName, data, options = {}) => {
  const queue = getQueue(queueName);
  
  // Se Redis não disponível, retorna indicador para processamento síncrono
  if (!queue) {
    return { 
      sync: true, 
      message: 'Queue not available, process synchronously' 
    };
  }

  const job = await queue.add(jobName, data, options);
  
  logger.info({ 
    queue: queueName, 
    jobId: job.id, 
    name: jobName 
  }, 'Job added to queue');

  return {
    jobId: job.id,
    status: 'queued',
    queue: queueName,
  };
};

/**
 * Obtém status de um job
 * @param {string} queueName - Nome da fila
 * @param {string} jobId - ID do job
 * @returns {Promise<Object>} - Status e resultado do job
 */
const getJobStatus = async (queueName, jobId) => {
  const queue = getQueue(queueName);
  
  if (!queue) {
    return { error: 'Queue not available' };
  }

  const job = await queue.getJob(jobId);
  
  if (!job) {
    return { 
      jobId, 
      status: 'not_found',
      error: 'Job not found' 
    };
  }

  const state = await job.getState();
  const progress = job.progress || 0;
  
  const result = {
    jobId: job.id,
    name: job.name,
    status: state,
    progress,
    createdAt: new Date(job.timestamp).toISOString(),
    processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
    finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    attempts: job.attemptsMade,
  };

  if (state === 'completed') {
    result.result = job.returnvalue;
  } else if (state === 'failed') {
    result.error = job.failedReason;
  }

  return result;
};

/**
 * Lista jobs de uma fila
 * @param {string} queueName - Nome da fila
 * @param {string} status - Filtro de status
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>}
 */
const listJobs = async (queueName, status = 'all', limit = 20) => {
  const queue = getQueue(queueName);
  
  if (!queue) {
    return [];
  }

  let jobs = [];
  
  if (status === 'all' || status === 'waiting') {
    jobs = jobs.concat(await queue.getWaiting(0, limit));
  }
  if (status === 'all' || status === 'active') {
    jobs = jobs.concat(await queue.getActive(0, limit));
  }
  if (status === 'all' || status === 'completed') {
    jobs = jobs.concat(await queue.getCompleted(0, limit));
  }
  if (status === 'all' || status === 'failed') {
    jobs = jobs.concat(await queue.getFailed(0, limit));
  }

  return jobs.slice(0, limit).map(job => ({
    jobId: job.id,
    name: job.name,
    status: job.state,
    progress: job.progress || 0,
    createdAt: new Date(job.timestamp).toISOString(),
  }));
};

/**
 * Cancela um job
 * @param {string} queueName - Nome da fila
 * @param {string} jobId - ID do job
 * @returns {Promise<boolean>}
 */
const cancelJob = async (queueName, jobId) => {
  const queue = getQueue(queueName);
  
  if (!queue) {
    return false;
  }

  const job = await queue.getJob(jobId);
  
  if (!job) {
    return false;
  }

  const state = await job.getState();
  
  if (state === 'active') {
    // Não pode cancelar job ativo diretamente
    return false;
  }

  await job.remove();
  logger.info({ queue: queueName, jobId }, 'Job cancelled');
  return true;
};

/**
 * Obtém estatísticas da fila
 * @param {string} queueName - Nome da fila
 * @returns {Promise<Object>}
 */
const getQueueStats = async (queueName) => {
  const queue = getQueue(queueName);
  
  if (!queue) {
    return { available: false };
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    available: true,
    queue: queueName,
    counts: {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    },
  };
};

/**
 * Fecha todas as conexões (para shutdown graceful)
 */
const closeAll = async () => {
  const closePromises = [];

  for (const [name, worker] of workers) {
    logger.info({ worker: name }, 'Closing worker');
    closePromises.push(worker.close());
  }

  for (const [name, events] of queueEvents) {
    logger.info({ queueEvents: name }, 'Closing queue events');
    closePromises.push(events.close());
  }

  for (const [name, queue] of queues) {
    logger.info({ queue: name }, 'Closing queue');
    closePromises.push(queue.close());
  }

  await Promise.all(closePromises);
  
  workers.clear();
  queueEvents.clear();
  queues.clear();
  
  logger.info('All queue connections closed');
};

module.exports = {
  getQueue,
  createWorker,
  getQueueEvents,
  addJob,
  getJobStatus,
  listJobs,
  cancelJob,
  getQueueStats,
  closeAll,
  isRedisEnabled,
};
