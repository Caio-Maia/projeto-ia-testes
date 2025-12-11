const axios = require('axios');
const { getFromCache, setInCache, getTTL } = require('../services/cacheService');
const { logger } = require('../utils/logger');

// API Constants
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_CHATGPT_MODEL = 'gpt-5-nano';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite';

/**
 * Call OpenAI API
 */
const callOpenAI = async (content, model) => {
  const response = await axios.post(
    OPENAI_API_URL,
    { model, messages: [{ role: 'user', content }] },
    { headers: { Authorization: `Bearer ${process.env.CHATGPT_API_KEY}` } }
  );
  return response.data.choices[0].message.content;
};

/**
 * Call Gemini API
 */
const callGemini = async (content, model, token) => {
  const response = await axios.post(
    `${GEMINI_API_URL}/${model}:generateContent?key=${token}`,
    { contents: [{ parts: [{ text: content }] }] }
  );
  
  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Não foi possível obter uma resposta válida do Gemini');
  }
  return text;
};

/**
 * Build test code generation prompt
 */
const buildTestCodePrompt = (testCases, framework, language = 'JavaScript') => 
  `Generate ${language} test code using the ${framework} framework for the following test cases:\n\n${testCases}\n\nPlease provide complete, runnable test code with proper setup and teardown if needed.`;

/**
 * Build risk analysis prompt
 */
const buildRiskPrompt = (feature) => 
  `Analyze the following feature and identify potential implementation risks, quality concerns, and possible bugs:\n\n${feature}\n\nProvide a detailed analysis with specific risks categorized by severity (High, Medium, Low) and include recommendations for mitigation.`;

// Generate test code using ChatGPT
const generateTestCodeChatGPT = async (req, res) => {
  const { testCases, framework, language, model } = req.body;
  const skipCache = req.query.skipCache === 'true';
  const selectedModel = model || DEFAULT_CHATGPT_MODEL;
  
  if (!testCases || !framework) {
    return res.status(400).json({ error: 'Test cases and framework are required' });
  }
  
  const prompt = buildTestCodePrompt(testCases, framework, language);
  
  // Check cache first
  if (!skipCache) {
    const cached = await getFromCache('chatgpt', selectedModel, 'generate-code', prompt);
    if (cached.hit) {
      return res.json({
        ...cached.data.result,
        cached: true,
        cachedAt: cached.data.cachedAt
      });
    }
  }
  
  try {
    const result = await callOpenAI(prompt, selectedModel);
    
    // Save to cache
    await setInCache('chatgpt', selectedModel, 'generate-code', prompt, result, getTTL('generate-code'));
    
    res.json(result);
  } catch (error) {
    console.error('Error generating test code with ChatGPT:', error.message);
    res.status(500).json({ error: 'Error generating test code with ChatGPT' });
  }
};

// Generate test code using Gemini
const generateTestCodeGemini = async (req, res) => {
  const { testCases, framework, language, model } = req.body;
  const token = req.query.token;
  const skipCache = req.query.skipCache === 'true';
  const selectedModel = model || DEFAULT_GEMINI_MODEL;
  
  if (!testCases || !framework) {
    return res.status(400).json({ error: 'Test cases and framework are required' });
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const prompt = buildTestCodePrompt(testCases, framework, language);
  
  // Check cache first
  if (!skipCache) {
    const cached = await getFromCache('gemini', selectedModel, 'generate-code', prompt);
    if (cached.hit) {
      return res.json({
        data: cached.data.result,
        cached: true,
        cachedAt: cached.data.cachedAt
      });
    }
  }
  
  try {
    const result = await callGemini(prompt, selectedModel, token);
    
    // Save to cache
    await setInCache('gemini', selectedModel, 'generate-code', prompt, result, getTTL('generate-code'));
    
    res.json({ data: result });
  } catch (error) {
    console.error('Error generating test code with Gemini:', error.message);
    res.status(500).json({ error: 'Error generating test code with Gemini' });
  }
};

// Analyze implementation risks
const analyzeRisks = async (req, res) => {
  const { feature, model } = req.body;
  const token = req.query.token;
  const skipCache = req.query.skipCache === 'true';
  
  if (!feature) {
    return res.status(400).json({ error: 'Feature description is required' });
  }
  
  const prompt = buildRiskPrompt(feature);
  
  // Determine provider and model
  const isGemini = model === 'gemini' || model?.startsWith('gemini-');
  const isChatGPT = model === 'chatgpt' || model?.startsWith('gpt-');
  const provider = isGemini ? 'gemini' : 'chatgpt';
  const selectedModel = isGemini 
    ? (model === 'gemini' ? DEFAULT_GEMINI_MODEL : model)
    : (model === 'chatgpt' ? DEFAULT_CHATGPT_MODEL : model);
  
  // Check cache first
  if (!skipCache) {
    const cached = await getFromCache(provider, selectedModel, 'analyze-risks', prompt);
    if (cached.hit) {
      if (isGemini) {
        return res.json({
          data: cached.data.result,
          cached: true,
          cachedAt: cached.data.cachedAt
        });
      }
      return res.json({
        ...cached.data.result,
        cached: true,
        cachedAt: cached.data.cachedAt
      });
    }
  }
  
  try {
    if (isChatGPT) {
      const result = await callOpenAI(prompt, selectedModel);
      await setInCache('chatgpt', selectedModel, 'analyze-risks', prompt, result, getTTL('analyze-risks'));
      res.json(result);
    } else if (isGemini) {
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      const result = await callGemini(prompt, selectedModel, token);
      await setInCache('gemini', selectedModel, 'analyze-risks', prompt, result, getTTL('analyze-risks'));
      res.json({ data: result });
    } else {
      return res.status(400).json({ error: 'Invalid model specified' });
    }
  } catch (error) {
    console.error('Error analyzing risks:', error.message);
    res.status(500).json({ error: 'Error analyzing implementation risks' });
  }
};

module.exports = {
  generateTestCodeChatGPT,
  generateTestCodeGemini,
  analyzeRisks
};