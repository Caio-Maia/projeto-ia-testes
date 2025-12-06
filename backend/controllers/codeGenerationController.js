const axios = require('axios');

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
  
  if (!testCases || !framework) {
    return res.status(400).json({ error: 'Test cases and framework are required' });
  }
  
  try {
    const prompt = buildTestCodePrompt(testCases, framework, language);
    const result = await callOpenAI(prompt, model || DEFAULT_CHATGPT_MODEL);
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
  
  if (!testCases || !framework) {
    return res.status(400).json({ error: 'Test cases and framework are required' });
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const prompt = buildTestCodePrompt(testCases, framework, language);
    const result = await callGemini(prompt, model || DEFAULT_GEMINI_MODEL, token);
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
  
  if (!feature) {
    return res.status(400).json({ error: 'Feature description is required' });
  }
  
  const prompt = buildRiskPrompt(feature);
  
  try {
    if (model === 'chatgpt' || model?.startsWith('gpt-')) {
      const result = await callOpenAI(prompt, model === 'chatgpt' ? DEFAULT_CHATGPT_MODEL : model);
      res.json(result);
    } else if (model === 'gemini' || model?.startsWith('gemini-')) {
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      const result = await callGemini(prompt, model === 'gemini' ? DEFAULT_GEMINI_MODEL : model, token);
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