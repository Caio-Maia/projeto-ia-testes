const express = require('express');
const router = express.Router();
const { improveTaskChatGPT, generateTestsChatGPT } = require('../controllers/chatgptController');
const { improveTaskGemini, generateTestsGemini } = require('../controllers/geminiController');
const { getFileContent, updateFileContent } = require('../controllers/fileController');

// Rotas para ChatGPT
router.post('/chatgpt/improve-task', improveTaskChatGPT);
router.post('/chatgpt/generate-tests', generateTestsChatGPT);

// Rotas para Gemini 1.5 Flash
router.post('/gemini/improve-task', improveTaskGemini);
router.post('/gemini/generate-tests', generateTestsGemini);

router.get('/files/:filename', getFileContent);
router.put('/files/:filename', updateFileContent);

module.exports = router;