const express = require('express');
const router = express.Router();

// Controllers
const { improveTaskChatGPT, generateTestsChatGPT } = require('../controllers/chatgptController');
const { improveTaskGemini, generateTestsGemini } = require('../controllers/geminiController');
const { getFileContent, updateFileContent } = require('../controllers/fileController');
const { getTaskJira, updateTaskJira } = require('../controllers/jiraController');
const { getFeedbackStats, getRecentFeedback, regenerateContent, submitFeedback } = require('../controllers/feedbackController');
const { generateTestCodeChatGPT, generateTestCodeGemini, analyzeRisks } = require('../controllers/codeGenerationController');
const { createConversation, sendMessage, getConversationHistory, regenerateWithFeedback } = require('../controllers/chatgptConversationController');
const { analyzeCoverage, analyzeCoverageAsync, extractRequirements, parseTestCases } = require('../controllers/coverageController');
const { streamChatGPT, streamGemini, streamAI } = require('../controllers/streamController');
const { getJob, listQueueJobs, cancelQueueJob, getStats, healthCheck } = require('../controllers/jobsController');
const auditController = require('../controllers/auditController');
const cacheController = require('../controllers/cacheController');

// Validação
const { validate } = require('../middlewares/validate');
const {
  improveTaskSchema,
  generateTestsSchema,
  generateTestCodeSchema,
  analyzeRisksSchema,
  feedbackSchema,
  regenerateContentSchema,
  jiraTaskSchema,
  jiraUpdateSchema,
  conversationSchema,
  conversationMessageSchema,
  regenerateWithFeedbackSchema,
  analyzeCoverageSchema,
  extractRequirementsSchema,
  parseTestCasesSchema,
} = require('../validations/schemas');

// ============================================
// ROTAS (Protegidas por CORS, Rate Limit e Helmet)
// ============================================

// Rotas para ChatGPT
router.post('/chatgpt/improve-task', validate(improveTaskSchema), improveTaskChatGPT);
router.post('/chatgpt/generate-tests', validate(generateTestsSchema), generateTestsChatGPT);
router.post('/chatgpt/generate-test-code', validate(generateTestCodeSchema), generateTestCodeChatGPT);

// Rotas para ChatGPT Conversations API
router.post('/chatgpt-conversation', validate(conversationSchema), createConversation);
router.post('/chatgpt-conversation/message', validate(conversationMessageSchema), sendMessage);
router.post('/chatgpt-conversation/regenerate', validate(regenerateWithFeedbackSchema), regenerateWithFeedback);
router.get('/chatgpt-conversation/:conversationId', getConversationHistory);

// Rotas para Gemini
router.post('/gemini/improve-task', validate(improveTaskSchema), improveTaskGemini);
router.post('/gemini/generate-tests', validate(generateTestsSchema), generateTestsGemini);
router.post('/gemini/generate-test-code', validate(generateTestCodeSchema), generateTestCodeGemini);

router.get('/files/:filename', getFileContent);
router.put('/files/:filename', updateFileContent);

router.post('/jira-task', validate(jiraTaskSchema), getTaskJira);
router.post('/jira-task/update', validate(jiraUpdateSchema), updateTaskJira);

router.post('/analyze-risks', validate(analyzeRisksSchema), analyzeRisks);

router.post('/feedback', validate(feedbackSchema), submitFeedback);
router.post('/feedback/regenerate', validate(regenerateContentSchema), regenerateContent);
router.get('/feedback/stats', getFeedbackStats);
router.get('/feedback/recent', getRecentFeedback);

// Rotas para Análise de Cobertura de Testes
router.post('/analyze-coverage', analyzeCoverage);
router.post('/analyze-coverage/async', validate(analyzeCoverageSchema), analyzeCoverageAsync);
// Provider-specific endpoints (chatgpt/gemini) to match front-end pattern /api/{provider}/analyze-coverage
router.post('/chatgpt/analyze-coverage', analyzeCoverage);
router.post('/chatgpt/analyze-coverage/async', validate(analyzeCoverageSchema), analyzeCoverageAsync);
router.post('/gemini/analyze-coverage', analyzeCoverage);
router.post('/gemini/analyze-coverage/async', validate(analyzeCoverageSchema), analyzeCoverageAsync);
router.post('/extract-requirements', validate(extractRequirementsSchema), extractRequirements);
router.post('/parse-test-cases', validate(parseTestCasesSchema), parseTestCases);

// ============================================
// ROTAS DE STREAMING (Server-Sent Events)
// ============================================
router.post('/stream/chatgpt', streamChatGPT);
router.post('/stream/gemini', streamGemini);
router.post('/stream/:provider', streamAI);

// ============================================
// ROTAS DE JOBS (Filas Assíncronas)
// ============================================
router.get('/jobs/health', healthCheck);
router.get('/jobs/stats', getStats);
router.get('/jobs', listQueueJobs);
router.get('/jobs/:jobId', getJob);
router.delete('/jobs/:jobId', cancelQueueJob);

// ============================================
// ROTAS DE AUDIT LOG
// ============================================
router.get('/audit/logs', auditController.getLogs);
router.get('/audit/stats', auditController.getStats);
router.get('/audit/stats/hourly', auditController.getHourlyStats);
router.get('/audit/actions', auditController.getActions);
router.get('/audit/resources', auditController.getResources);
router.get('/audit/errors', auditController.getRecentErrors);
router.get('/audit/logs/:id', auditController.getLogById);
router.delete('/audit/logs', auditController.clearOldLogs);

// ============================================
// ROTAS DE CACHE
// ============================================
router.get('/cache/health', cacheController.healthCheck);
router.get('/cache/stats', cacheController.getStats);
router.delete('/cache', cacheController.clear);
router.delete('/cache/invalidate', cacheController.invalidate);

module.exports = router;