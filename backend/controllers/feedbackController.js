const Feedback = require('../models/feedbackModel');
const axios = require('axios');
const { Op, fn, col, literal } = require('sequelize');

// Submit feedback for a generation
const submitFeedback = async (req, res) => {
  try {
    const { generationId, type, rating, comment, originalContent, conversationHistory } = req.body;
    
    if (!generationId || !type || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const feedback = await Feedback.create({
      generationId,
      type,
      rating,
      comment,
      originalContent,
      conversationHistory: conversationHistory || []
    });
    
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Error submitting feedback' });
  }
};

// Get feedback statistics for dashboard
const getFeedbackStats = async (req, res) => {
  try {
    // Get all feedback entries
    const allFeedback = await Feedback.findAll({
      attributes: ['type', 'rating']
    });
    
    // Process the data to match the format of the MongoDB aggregation
    const stats = {};
    
    allFeedback.forEach(feedback => {
      const type = feedback.type;
      const rating = feedback.rating;
      
      if (!stats[type]) {
        stats[type] = {
          _id: type,
          ratings: [],
          total: 0
        };
      }
      
      // Find if rating already exists in the array
      let ratingObj = stats[type].ratings.find(r => r.rating === rating);
      if (!ratingObj) {
        ratingObj = { rating, count: 0 };
        stats[type].ratings.push(ratingObj);
      }
      
      ratingObj.count++;
      stats[type].total++;
    });
    
    res.json(Object.values(stats));
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({ error: 'Error getting feedback statistics' });
  }
};

// Get recent feedback with comments
const getRecentFeedback = async (req, res) => {
  try {
    const recentFeedback = await Feedback.findAll({
      where: {
        comment: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: '' }
          ]
        }
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.json(recentFeedback);
  } catch (error) {
    console.error('Error getting recent feedback:', error);
    res.status(500).json({ error: 'Error getting recent feedback' });
  }
};

// Regenerate content based on feedback
const regenerateContent = async (req, res) => {
  try {
    const { feedbackId, model } = req.body;
    const token = req.query.token;

    if (!feedbackId || !model) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the feedback from the database
    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Prepare conversation history for the AI
    const conversationHistory = feedback.conversationHistory || [];
    
    // Add the feedback comment as the latest user message
    conversationHistory.push({
      role: 'user',
      content: `Por favor, ajuste o texto anterior com base neste feedback: ${feedback.comment}`
    });

    let response;
    const apiName = model.apiName || model; // Suporta tanto objeto { apiName, version } quanto string
    
    if (apiName === 'chatgpt') {
      // Use ChatGPT API with chat completions (standard endpoint)
      const chatgptToken = token || process.env.CHATGPT_API_KEY;
      
      if (!chatgptToken) {
        return res.status(401).json({ error: 'ChatGPT API key not configured' });
      }

      response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: model.version || model, // Usar versão do modelo (ex: gpt-4-turbo)
        messages: conversationHistory
      }, {
        headers: {
          Authorization: `Bearer ${chatgptToken}`
        }
      });
      
      const regeneratedContent = response.data.choices[0].message.content;
      
      // Update conversation history
      const updatedHistory = [...conversationHistory, {
        role: 'assistant',
        content: regeneratedContent
      }];
      
      await feedback.update({
        conversationHistory: updatedHistory
      });
      
      res.json({ data: regeneratedContent, conversationHistory: updatedHistory });
    } else if (apiName === 'gemini') {
      // Use Gemini API
      if (!token) {
        return res.status(401).json({ error: 'Gemini token not provided' });
      }

      const geminiMessages = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const modelVersion = model.version || model;
      response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${token}`, {
        contents: geminiMessages
      });

      if (!response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content || !response.data.candidates[0].content.parts[0].text) {
        return res.status(400).json({ error: 'Não foi possível obter uma resposta válida do Gemini' });
      }

      const regeneratedContent = response.data.candidates[0].content.parts[0].text;

      // Update conversation history
      const updatedHistory = [...conversationHistory, {
        role: 'assistant',
        content: regeneratedContent
      }];

      await feedback.update({
        conversationHistory: updatedHistory
      });

      res.json({ data: regeneratedContent, conversationHistory: updatedHistory });
    } else {
      return res.status(400).json({ error: 'Modelo não suportado' });
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.error('Erro 400 (bad request) recebido da API IA:');
      console.error(JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({
        error: error.response.data.error || 'Erro 400 na requisição ao provedor IA',
        provider: error.response.data
      });
    }
    // Log detalhadamente outros erros
    if(error.response) {
      console.error('Erro de response:', error.response.status, error.response.data);
    } else {
      console.error('Erro desconhecido:', error.message);
    }
    return res.status(500).json({ error: 'Error regenerating content' });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackStats,
  getRecentFeedback,
  regenerateContent
};