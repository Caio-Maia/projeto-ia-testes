const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

/**
 * Helper function to call Gemini API
 */
const callGeminiAPI = async (prompt, model, token) => {
  const response = await axios.post(
    `${GEMINI_API_URL}/${model}:generateContent?key=${token}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );

  if (response.status === 400) {
    throw { status: 400, data: response.data };
  }

  const candidates = response.data?.candidates;
  if (!candidates?.[0]?.content?.parts?.[0]?.text) {
    throw { status: 400, message: 'Não foi possível obter uma resposta válida do Gemini' };
  }

  return candidates[0].content.parts[0].text;
};

/**
 * Generic Gemini request handler
 */
const handleGeminiRequest = (errorMessage) => async (req, res) => {
  const prompt = req.body.data;
  const model = req.body.model || DEFAULT_MODEL;
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const result = await callGeminiAPI(prompt, model, token);
    res.json({ data: result });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json(error.data || { error: error.message });
    }
    console.error(errorMessage, error.response?.data || error.message);
    res.status(500).json({ error: errorMessage });
  }
};

const improveTaskGemini = handleGeminiRequest('Erro ao tentar melhorar a tarefa com Gemini');
const generateTestsGemini = handleGeminiRequest('Erro ao tentar gerar casos de teste com Gemini');

module.exports = { improveTaskGemini, generateTestsGemini };