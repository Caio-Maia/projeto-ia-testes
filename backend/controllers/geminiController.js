const axios = require('axios');
const { readMarkdownFile } = require('../utils');

const improveTaskGemini = async (req, res) => {
  const prompt = req.body.data;
  const model = req.body.model === undefined ? 'gemini-1.5-flash' : req.body.model;
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}-latest:generateContent?key=${token}`, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    console.log('Request:', response.config.data);
    console.log('Status:', response.status );
    if(response.status == 400) {
      return res.status(400).json(response.data);
    }
    if (!response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content || !response.data.candidates[0].content.parts[0].text) {
      return res.status(400).json({ error: 'Não foi possível obter uma resposta válida do Gemini' });
    }
    const improvedContent = response.data.candidates[0].content.parts[0].text;
    res.json({data: improvedContent});
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.error(error);
    }
    res.status(500).json({ error: 'Erro ao tentar melhorar a tarefa com Gemini' });
  }
};

const generateTestsGemini = async (req, res) => {
  const prompt = req.body.data;
  const model = req.body.model === undefined ? 'gemini-1.5-flash' : req.body.model;
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}-latest:generateContent?key=${token}`, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    console.log('Request:', response.config.data);
    console.log('Status:', response.status );
    if(response.status == 400) {
      return res.status(400).json(response.data);
    }
    if (!response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content || !response.data.candidates[0].content.parts[0].text) {
      return res.status(400).json({ error: 'Não foi possível obter uma resposta válida do Gemini' });
    }
    const improvedContent = response.data.candidates[0].content.parts[0].text;
    res.json({data: improvedContent});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao tentar gerar casos de teste com Gemini' });
  }
};

module.exports = { improveTaskGemini, generateTestsGemini };