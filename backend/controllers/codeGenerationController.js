const axios = require('axios');

// Generate test code using ChatGPT
const generateTestCodeChatGPT = async (req, res) => {
  const { testCases, framework, language } = req.body;
  
  if (!testCases || !framework) {
    return res.status(400).json({ error: 'Test cases and framework are required' });
  }
  
  try {
    const prompt = `Generate ${language || 'JavaScript'} test code using the ${framework} framework for the following test cases:\n\n${testCases}\n\nPlease provide complete, runnable test code with proper setup and teardown if needed.`;
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
      }
    });
    
    res.json(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating test code with ChatGPT:', error);
    res.status(500).json({ error: 'Error generating test code with ChatGPT' });
  }
};

// Generate test code using Gemini
const generateTestCodeGemini = async (req, res) => {
  const { testCases, framework, language } = req.body;
  const model = req.body.model || 'gemini-1.5-flash';
  const token = req.query.token;
  
  if (!testCases || !framework) {
    return res.status(400).json({ error: 'Test cases and framework are required' });
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const prompt = `Generate ${language || 'JavaScript'} test code using the ${framework} framework for the following test cases:\n\n${testCases}\n\nPlease provide complete, runnable test code with proper setup and teardown if needed.`;
    
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${token}`, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    if (!response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content || !response.data.candidates[0].content.parts[0].text) {
      return res.status(400).json({ error: 'Não foi possível obter uma resposta válida do Gemini' });
    }
    
    const generatedCode = response.data.candidates[0].content.parts[0].text;
    res.json({ data: generatedCode });
  } catch (error) {
    console.error('Error generating test code with Gemini:', error);
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
  
  try {
    let riskAnalysis;
    
    if (model === 'chatgpt') {
      const prompt = `Analyze the following feature and identify potential implementation risks, quality concerns, and possible bugs:\n\n${feature}\n\nProvide a detailed analysis with specific risks categorized by severity (High, Medium, Low) and include recommendations for mitigation.`;
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`
        }
      });
      
      riskAnalysis = response.data.choices[0].message.content;
      res.json(riskAnalysis);
    } else if (model === 'gemini') {
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      
      const prompt = `Analyze the following feature and identify potential implementation risks, quality concerns, and possible bugs:\n\n${feature}\n\nProvide a detailed analysis with specific risks categorized by severity (High, Medium, Low) and include recommendations for mitigation.`;
      
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${token}`, {
        contents: [{ parts: [{ text: prompt }] }],
      });
      
      if (!response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content || !response.data.candidates[0].content.parts[0].text) {
        return res.status(400).json({ error: 'Não foi possível obter uma resposta válida do Gemini' });
      }
      
      riskAnalysis = response.data.candidates[0].content.parts[0].text;
      res.json({ data: riskAnalysis });
    } else {
      return res.status(400).json({ error: 'Invalid model specified' });
    }
  } catch (error) {
    console.error('Error analyzing risks:', error);
    res.status(500).json({ error: 'Error analyzing implementation risks' });
  }
};

module.exports = {
  generateTestCodeChatGPT,
  generateTestCodeGemini,
  analyzeRisks
};