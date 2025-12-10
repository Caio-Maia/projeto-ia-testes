/**
 * AI Queue - Fila para processamento assíncrono de IA
 * 
 * Processa requisições de IA que podem demorar muito:
 * - Análise de cobertura de testes
 * - Geração de múltiplos casos de teste
 * - Análises complexas de risco
 */

const { createWorker, addJob, getJobStatus } = require('./queueService');
const { logger } = require('../utils/logger');

const QUEUE_NAME = 'ai-tasks';

/**
 * Tipos de jobs suportados
 */
const JOB_TYPES = {
  ANALYZE_COVERAGE: 'analyze-coverage',
  BATCH_GENERATE_TESTS: 'batch-generate-tests',
  COMPLEX_RISK_ANALYSIS: 'complex-risk-analysis',
};

/**
 * Processador de jobs de IA
 * Recebe um job e executa a operação apropriada
 */
const aiJobProcessor = async (job) => {
  const { type, data, token, model } = job.data;
  
  logger.info({ jobId: job.id, type, model }, 'Processing AI job');
  
  try {
    // Atualiza progresso inicial
    await job.updateProgress(10);
    
    let result;
    
    switch (type) {
      case JOB_TYPES.ANALYZE_COVERAGE:
        result = await processCoverageAnalysis(job, data, token, model);
        break;
        
      case JOB_TYPES.BATCH_GENERATE_TESTS:
        result = await processBatchTests(job, data, token, model);
        break;
        
      case JOB_TYPES.COMPLEX_RISK_ANALYSIS:
        result = await processComplexRiskAnalysis(job, data, token, model);
        break;
        
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
    
    await job.updateProgress(100);
    
    logger.info({ jobId: job.id, type }, 'AI job completed');
    return result;
    
  } catch (error) {
    logger.error({ jobId: job.id, type, error: error.message }, 'AI job failed');
    throw error;
  }
};

/**
 * Processa análise de cobertura de testes
 */
const processCoverageAnalysis = async (job, data, token, model) => {
  const { requirements, testCases, options = {} } = data;
  
  await job.updateProgress(20);
  
  // Importa controller dinamicamente para evitar dependências circulares
  const { analyzeWithAIInternal } = require('../controllers/coverageController');
  
  const result = await analyzeWithAIInternal({
    requirements,
    testCases,
    model,
    token,
    language: options.language || 'pt-BR',
    onProgress: async (progress) => {
      await job.updateProgress(20 + Math.floor(progress * 0.7)); // 20% a 90%
    }
  });
  
  await job.updateProgress(95);
  
  return {
    type: 'coverage-analysis',
    analysis: result,
    completedAt: new Date().toISOString(),
  };
};

/**
 * Processa geração de testes em batch
 */
const processBatchTests = async (job, data, token, model) => {
  const { tasks, options = {} } = data;
  const results = [];
  const total = tasks.length;
  
  for (let i = 0; i < total; i++) {
    const task = tasks[i];
    
    // Atualiza progresso
    await job.updateProgress(Math.floor((i / total) * 90) + 10);
    
    try {
      // Importa dinamicamente
      const aiService = require('./aiService');
      
      const result = await aiService.generateContent({
        provider: options.provider || 'chatgpt',
        prompt: task.prompt,
        model,
        token,
      });
      
      results.push({
        taskId: task.id || i,
        success: true,
        content: result,
      });
    } catch (error) {
      results.push({
        taskId: task.id || i,
        success: false,
        error: error.message,
      });
    }
  }
  
  return {
    type: 'batch-tests',
    total,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
    completedAt: new Date().toISOString(),
  };
};

/**
 * Processa análise de risco complexa
 */
const processComplexRiskAnalysis = async (job, data, token, model) => {
  const { features, options = {} } = data;
  const results = [];
  const total = features.length;
  
  for (let i = 0; i < total; i++) {
    const feature = features[i];
    
    await job.updateProgress(Math.floor((i / total) * 90) + 10);
    
    try {
      const aiService = require('./aiService');
      
      const result = await aiService.generateContent({
        provider: options.provider || 'chatgpt',
        prompt: `Analise os riscos de implementação da seguinte feature:\n\n${feature}`,
        model,
        token,
      });
      
      results.push({
        feature: feature.substring(0, 100),
        success: true,
        analysis: result,
      });
    } catch (error) {
      results.push({
        feature: feature.substring(0, 100),
        success: false,
        error: error.message,
      });
    }
  }
  
  return {
    type: 'risk-analysis',
    total,
    successful: results.filter(r => r.success).length,
    results,
    completedAt: new Date().toISOString(),
  };
};

/**
 * Inicializa o worker de AI
 * Deve ser chamado no startup da aplicação
 */
const initAIWorker = () => {
  const worker = createWorker(QUEUE_NAME, aiJobProcessor, {
    concurrency: parseInt(process.env.AI_QUEUE_CONCURRENCY || '2'),
  });
  
  if (worker) {
    logger.info({ queue: QUEUE_NAME }, 'AI Worker initialized');
  }
  
  return worker;
};

/**
 * Adiciona job de análise de cobertura à fila
 */
const queueCoverageAnalysis = async (requirements, testCases, token, model, options = {}) => {
  return addJob(QUEUE_NAME, JOB_TYPES.ANALYZE_COVERAGE, {
    type: JOB_TYPES.ANALYZE_COVERAGE,
    data: { requirements, testCases, options },
    token,
    model,
  }, {
    priority: options.priority || 1,
  });
};

/**
 * Adiciona job de geração de testes em batch
 */
const queueBatchTests = async (tasks, token, model, options = {}) => {
  return addJob(QUEUE_NAME, JOB_TYPES.BATCH_GENERATE_TESTS, {
    type: JOB_TYPES.BATCH_GENERATE_TESTS,
    data: { tasks, options },
    token,
    model,
  }, {
    priority: options.priority || 2,
  });
};

/**
 * Adiciona job de análise de risco complexa
 */
const queueComplexRiskAnalysis = async (features, token, model, options = {}) => {
  return addJob(QUEUE_NAME, JOB_TYPES.COMPLEX_RISK_ANALYSIS, {
    type: JOB_TYPES.COMPLEX_RISK_ANALYSIS,
    data: { features, options },
    token,
    model,
  }, {
    priority: options.priority || 3,
  });
};

/**
 * Obtém status de um job de IA
 */
const getAIJobStatus = async (jobId) => {
  return getJobStatus(QUEUE_NAME, jobId);
};

module.exports = {
  QUEUE_NAME,
  JOB_TYPES,
  initAIWorker,
  queueCoverageAnalysis,
  queueBatchTests,
  queueComplexRiskAnalysis,
  getAIJobStatus,
};
