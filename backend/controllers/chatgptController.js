const axios = require('axios');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-5-nano';

/**
 * Helper function to call OpenAI API
 */
const callOpenAI = async (content, model, token) => {
  const response = await axios.post(
    OPENAI_API_URL,
    { model, messages: [{ role: 'user', content }] },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.choices[0].message.content;
};

/**
 * Generic ChatGPT request handler
 */
const handleChatGPTRequest = (errorMessage) => async (req, res) => {
  const { task, data } = req.body;
  const taskContent = task || data;
  const model = req.body.model || DEFAULT_MODEL;
  const token = process.env.CHATGPT_API_KEY;

  if (!token) {
    return res.status(401).json({ error: 'ChatGPT API key not configured' });
  }

  try {
    const result = await callOpenAI(taskContent, model, token);
    res.json(result);
  } catch (error) {
    console.error(errorMessage, error.response?.data || error.message);
    res.status(500).json({ error: errorMessage });
  }
};

const improveTaskChatGPT = handleChatGPTRequest('Erro ao melhorar a tarefa com ChatGPT');
const generateTestsChatGPT = handleChatGPTRequest('Erro ao gerar casos de teste com ChatGPT');

module.exports = { improveTaskChatGPT, generateTestsChatGPT };