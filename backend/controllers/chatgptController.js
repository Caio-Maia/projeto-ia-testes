const axios = require('axios');
const { logger, aiRequest, aiResponse, aiError } = require('../utils/logger');
const { errors, asyncHandler } = require('../middlewares/errorHandler');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-5-nano';

/**
 * Helper function to call OpenAI API
 */
const callOpenAI = async (content, model, token) => {
  const startTime = Date.now();
  
  const response = await axios.post(
    OPENAI_API_URL,
    { model, messages: [{ role: 'user', content }] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  const result = response.data.choices[0].message.content;
  const durationMs = Date.now() - startTime;
  
  return { result, durationMs };
};

/**
 * Generic ChatGPT request handler with logging and error handling
 */
const handleChatGPTRequest = (feature) => asyncHandler(async (req, res) => {
  const { task, data } = req.body;
  const taskContent = task || data;
  const model = req.body.model || DEFAULT_MODEL;
  const token = process.env.CHATGPT_API_KEY;

  if (!token) {
    throw errors.AI_TOKEN_MISSING('ChatGPT');
  }

  // Log request
  aiRequest(model, taskContent.length, feature);

  try {
    const { result, durationMs } = await callOpenAI(taskContent, model, token);
    
    // Log response
    aiResponse(model, result.length, durationMs, feature);
    
    res.json(result);
  } catch (error) {
    // Log error
    aiError(model, error, feature);
    
    // Re-throw with proper error
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw errors.AI_SERVICE_ERROR('ChatGPT', errorMessage);
  }
});

const improveTaskChatGPT = handleChatGPTRequest('improve-task');
const generateTestsChatGPT = handleChatGPTRequest('generate-tests');

module.exports = { improveTaskChatGPT, generateTestsChatGPT };