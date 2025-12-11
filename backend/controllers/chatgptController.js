const axios = require('axios');
const { logger, aiRequest, aiResponse, aiError } = require('../utils/logger');
const { errors, asyncHandler } = require('../middlewares/errorHandler');
const { getFromCache, setInCache, getTTL, isCacheEnabled } = require('../services/cacheService');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-5-nano';
const PROVIDER = 'chatgpt';

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
 * Generic ChatGPT request handler with logging, caching and error handling
 */
const handleChatGPTRequest = (feature) => asyncHandler(async (req, res) => {
  const { task, data } = req.body;
  const taskContent = task || data;
  const model = req.body.model || DEFAULT_MODEL;
  const token = process.env.CHATGPT_API_KEY;
  const skipCache = req.query.skipCache === 'true';

  if (!token) {
    throw errors.AI_TOKEN_MISSING('ChatGPT');
  }

  // Check cache first (unless skipCache is true)
  if (!skipCache) {
    const cached = await getFromCache(PROVIDER, model, feature, taskContent);
    if (cached.hit) {
      return res.json({
        ...cached.data.result,
        cached: true,
        cachedAt: cached.data.cachedAt
      });
    }
  }

  // Log request
  aiRequest(model, taskContent.length, feature);

  try {
    const { result, durationMs } = await callOpenAI(taskContent, model, token);
    
    // Log response
    aiResponse(model, result.length, durationMs, feature);
    
    // Save to cache
    await setInCache(PROVIDER, model, feature, taskContent, result, getTTL(feature));
    
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