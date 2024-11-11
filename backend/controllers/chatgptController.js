const axios = require('axios');

const improveTaskChatGPT = async (req, res) => {
  const { task } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: task }]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
      }
    });
    res.json(response.data.choices[0].message.content);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao melhorar a tarefa com ChatGPT' });
  }
};

const generateTestsChatGPT = async (req, res) => {
  const { task } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Crie casos de teste para: ${task}` }]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
      }
    });
    res.json(response.data.choices[0].message.content);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar casos de teste com ChatGPT' });
  }
};

module.exports = { improveTaskChatGPT, generateTestsChatGPT };