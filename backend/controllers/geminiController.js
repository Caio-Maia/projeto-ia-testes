const axios = require('axios');
const { aiRequest, aiResponse, aiError } = require('../utils/logger');
const { errors, asyncHandler } = require('../middlewares/errorHandler');
const { getFromCache, setInCache, getTTL } = require('../services/cacheService');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const PROVIDER = 'gemini';

/**
 * Helper function to call Gemini API
 */
const callGeminiAPI = async (prompt, model, token) => {
  const startTime = Date.now();
  
  const response = await axios.post(
    `${GEMINI_API_URL}/${model}:generateContent?key=${token}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );

  const candidates = response.data?.candidates;
  if (!candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Não foi possível obter uma resposta válida do Gemini');
  }

  const result = candidates[0].content.parts[0].text;
  const durationMs = Date.now() - startTime;

  return { result, durationMs };
};

/**
 * Generic Gemini request handler with logging, caching and error handling
 */
const handleGeminiRequest = (feature) => asyncHandler(async (req, res) => {
  const prompt = req.body.data || req.body.task;
  const model = req.body.model || DEFAULT_MODEL;
  const token = req.query.token || process.env.GEMINI_API_KEY;
  const skipCache = req.query.skipCache === 'true';

  if (!token) {
    throw errors.AI_TOKEN_MISSING('Gemini');
  }

  // Check cache first (unless skipCache is true)
  if (!skipCache) {
    const cached = await getFromCache(PROVIDER, model, feature, prompt);
    if (cached.hit) {
      return res.json({
        data: cached.data.result,
        cached: true,
        cachedAt: cached.data.cachedAt
      });
    }
  }

  // Log request
  aiRequest(model, prompt.length, feature);

  try {
    const { result, durationMs } = await callGeminiAPI(prompt, model, token);
    
    // Log response
    aiResponse(model, result.length, durationMs, feature);
    
    // Save to cache
    await setInCache(PROVIDER, model, feature, prompt, result, getTTL(feature));
    
    res.json({ data: result });
  } catch (error) {
    // Log error
    aiError(model, error, feature);
    
    // Handle specific Gemini errors
    if (error.response?.status === 400) {
      throw errors.BAD_REQUEST(error.response?.data?.error?.message || 'Requisição inválida para Gemini');
    }
    
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw errors.AI_SERVICE_ERROR('Gemini', errorMessage);
  }
});

const improveTaskGemini = handleGeminiRequest('improve-task');
const generateTestsGemini = handleGeminiRequest('generate-tests');

module.exports = { improveTaskGemini, generateTestsGemini };