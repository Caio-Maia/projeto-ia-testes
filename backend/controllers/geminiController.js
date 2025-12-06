const axios = require('axios');
const { aiRequest, aiResponse, aiError } = require('../utils/logger');
const { errors, asyncHandler } = require('../middlewares/errorHandler');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

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
 * Generic Gemini request handler with logging and error handling
 */
const handleGeminiRequest = (feature) => asyncHandler(async (req, res) => {
  const prompt = req.body.data || req.body.task;
  const model = req.body.model || DEFAULT_MODEL;
  const token = req.query.token || process.env.GEMINI_API_KEY;

  if (!token) {
    throw errors.AI_TOKEN_MISSING('Gemini');
  }

  // Log request
  aiRequest(model, prompt.length, feature);

  try {
    const { result, durationMs } = await callGeminiAPI(prompt, model, token);
    
    // Log response
    aiResponse(model, result.length, durationMs, feature);
    
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