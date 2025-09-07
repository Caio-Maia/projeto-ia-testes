const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { getFileContent, updateFileContent } = require('../controllers/fileController');
const { getTaskJira, updateTaskJira } = require('../controllers/jiraController');
const { submitFeedback, getFeedbackStats, getRecentFeedback, regenerateContent } = require('../controllers/feedbackController');

// Unified AI routes
router.post('/ai/improve-task', AIController.improveTask);
router.post('/ai/generate-tests', AIController.generateTests);
router.post('/ai/generate-test-code', AIController.generateTestCode);
router.post('/ai/analyze-risks', AIController.analyzeRisks);
router.get('/ai/models', AIController.getAvailableModels);

// Legacy routes for backward compatibility
const { improveTaskChatGPT, generateTestsChatGPT } = require('../controllers/chatgptController');
const { improveTaskGemini, generateTestsGemini } = require('../controllers/geminiController');
const { generateTestCodeChatGPT, generateTestCodeGemini, analyzeRisks } = require('../controllers/codeGenerationController');

// Legacy ChatGPT routes
router.post('/chatgpt/improve-task', improveTaskChatGPT);
router.post('/chatgpt/generate-tests', generateTestsChatGPT);
router.post('/chatgpt/generate-test-code', generateTestCodeChatGPT);

// Legacy Gemini routes
router.post('/gemini/improve-task', improveTaskGemini);
router.post('/gemini/generate-tests', generateTestsGemini);
router.post('/gemini/generate-test-code', generateTestCodeGemini);

// Legacy risk analysis route
router.post('/analyze-risks', analyzeRisks);

// Rotas para feedback
router.post('/feedback', submitFeedback);
router.get('/feedback/stats', getFeedbackStats);
router.get('/feedback/recent', getRecentFeedback);
router.post('/feedback/regenerate', regenerateContent);

router.get('/files/:filename', getFileContent);
router.put('/files/:filename', updateFileContent);

router.post('/jira-task', getTaskJira);
router.post('/jira-task/update', updateTaskJira);

module.exports = router;