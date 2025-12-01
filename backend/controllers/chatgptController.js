const axios = require('axios');

const improveTaskChatGPT = async (req, res) => {
  const { task, data } = req.body;
  const taskContent = task || data;
  const model = req.body.model || 'gpt-5-nano';
  const token = process.env.CHATGPT_API_KEY;
  
  if (!token) {
    return res.status(401).json({ error: 'ChatGPT API key not configured' });
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model,
      messages: [{ role: 'user', content: taskContent }]
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    res.json(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error improving task with ChatGPT:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao melhorar a tarefa com ChatGPT' });
  }
};

const generateTestsChatGPT = async (req, res) => {
  const { task, data } = req.body;
  const taskContent = task || data;
  const model = req.body.model || 'gpt-5-nano';
  const token = process.env.CHATGPT_API_KEY;
  
  if (!token) {
    return res.status(401).json({ error: 'ChatGPT API key not configured' });
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model,
      messages: [{ role: 'user', content: taskContent }]
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    res.json(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating tests with ChatGPT:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao gerar casos de teste com ChatGPT' });
  }
};

module.exports = { improveTaskChatGPT, generateTestsChatGPT };