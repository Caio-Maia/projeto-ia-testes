const express = require('express');
const router = express.Router();
const { improveTaskChatGPT, generateTestsChatGPT } = require('../controllers/chatgptController');
const { improveTaskGemini, generateTestsGemini } = require('../controllers/geminiController');
const { getFileContent, updateFileContent } = require('../controllers/fileController');
const { getTaskJira, updateTaskJira } = require('../controllers/jiraController');
const { getFeedbackStats, getRecentFeedback, regenerateContent, submitFeedback } = require('../controllers/feedbackController');
const { generateTestCodeChatGPT, generateTestCodeGemini, analyzeRisks } = require('../controllers/codeGenerationController');

// Rotas para ChatGPT
router.post('/chatgpt/improve-task', improveTaskChatGPT);
router.post('/chatgpt/generate-tests', generateTestsChatGPT);
router.post('/chatgpt/generate-test-code', generateTestCodeChatGPT);

// Rotas para Gemini
router.post('/gemini/improve-task', improveTaskGemini);
router.post('/gemini/generate-tests', generateTestsGemini);
router.post('/gemini/generate-test-code', generateTestCodeGemini);

router.get('/files/:filename', getFileContent);
router.put('/files/:filename', updateFileContent);

router.post('/jira-task', getTaskJira);
router.post('/jira-task/update', updateTaskJira);

router.post('/analyze-risks', analyzeRisks);

router.post('/feedback', submitFeedback);
router.post('/feedback/regenerate', regenerateContent);
router.get('/feedback/stats', getFeedbackStats);
router.get('/feedback/recent', getRecentFeedback);

module.exports = router;