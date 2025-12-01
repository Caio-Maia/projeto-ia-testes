const axios = require('axios');

/**
 * ChatGPT Conversation API Controller
 * Uses the new OpenAI Conversations API for better conversation management
 * with integrated feedback loop
 */

// Create a new conversation with initial message
const createConversation = async (req, res) => {
  const { topic, initialMessage } = req.body;
  const chatgptToken = process.env.CHATGPT_API_KEY;

  if (!chatgptToken) {
    return res.status(401).json({ error: 'ChatGPT API key not configured' });
  }

  if (!initialMessage) {
    return res.status(400).json({ error: 'Initial message is required' });
  }

  try {
    // Create conversation with initial message
    const response = await axios.post(
      'https://api.openai.com/v1/conversations',
      {
        metadata: { topic: topic || 'default' },
        items: [
          {
            type: 'message',
            role: 'user',
            content: initialMessage
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatgptToken}`
        }
      }
    );

    const conversationId = response.data.id;

    // Get AI response for initial message
    const messageResponse = await axios.post(
      `https://api.openai.com/v1/conversations/${conversationId}/messages`,
      {
        model: 'gpt-5-nano', // or any model you prefer
        system: 'You are a helpful assistant for software testing and quality assurance.'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatgptToken}`
        }
      }
    );

    res.status(201).json({
      conversationId,
      metadata: response.data.metadata,
      createdAt: response.data.created_at,
      initialResponse: messageResponse.data
    });
  } catch (error) {
    console.error('Error creating conversation:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error creating conversation',
      details: error.response?.data || error.message
    });
  }
};

// Send message to existing conversation
const sendMessage = async (req, res) => {
  const { conversationId, message, model } = req.body;
  const chatgptToken = process.env.CHATGPT_API_KEY;

  if (!chatgptToken) {
    return res.status(401).json({ error: 'ChatGPT API key not configured' });
  }

  if (!conversationId || !message) {
    return res.status(400).json({ error: 'Conversation ID and message are required' });
  }

  try {
    // Add user message to conversation
    const messageResponse = await axios.post(
      `https://api.openai.com/v1/conversations/${conversationId}/messages`,
      {
        role: 'user',
        content: message
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatgptToken}`
        }
      }
    );

    // Get AI response
    const aiResponse = await axios.post(
      `https://api.openai.com/v1/conversations/${conversationId}/messages`,
      {
        model: model || 'gpt-5-nano'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatgptToken}`
        }
      }
    );

    res.json({
      conversationId,
      userMessage: message,
      aiResponse: aiResponse.data
    });
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error sending message',
      details: error.response?.data || error.message
    });
  }
};

// Get conversation history
const getConversationHistory = async (req, res) => {
  const { conversationId } = req.params;
  const chatgptToken = process.env.CHATGPT_API_KEY;

  if (!chatgptToken) {
    return res.status(401).json({ error: 'ChatGPT API key not configured' });
  }

  if (!conversationId) {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  try {
    const response = await axios.get(
      `https://api.openai.com/v1/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${chatgptToken}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching conversation:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching conversation',
      details: error.response?.data || error.message
    });
  }
};

// Regenerate response with feedback
const regenerateWithFeedback = async (req, res) => {
  const { conversationId, feedback, messageIndex, model } = req.body;
  const chatgptToken = process.env.CHATGPT_API_KEY;

  if (!chatgptToken) {
    return res.status(401).json({ error: 'ChatGPT API key not configured' });
  }

  if (!conversationId || !feedback) {
    return res.status(400).json({ error: 'Conversation ID and feedback are required' });
  }

  try {
    // Add feedback message to conversation
    const feedbackMessage = `Please revise your previous response based on this feedback: ${feedback}`;

    const feedbackResponse = await axios.post(
      `https://api.openai.com/v1/conversations/${conversationId}/messages`,
      {
        role: 'user',
        content: feedbackMessage
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatgptToken}`
        }
      }
    );

    // Get AI response to feedback
    const aiResponse = await axios.post(
      `https://api.openai.com/v1/conversations/${conversationId}/messages`,
      {
        model: model || 'gpt-5-nano'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatgptToken}`
        }
      }
    );

    res.json({
      conversationId,
      feedback,
      revisedResponse: aiResponse.data
    });
  } catch (error) {
    console.error('Error regenerating with feedback:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error regenerating response',
      details: error.response?.data || error.message
    });
  }
};

module.exports = {
  createConversation,
  sendMessage,
  getConversationHistory,
  regenerateWithFeedback
};
