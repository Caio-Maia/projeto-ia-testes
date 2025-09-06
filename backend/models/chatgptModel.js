const axios = require('axios');
const AIModel = require('./aiModel');

class ChatGPTModel extends AIModel {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-3.5-turbo';
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async _makeRequest(prompt) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('ChatGPT API error:', error);
      throw new Error(`Error making request to ChatGPT API: ${error.message}`);
    }
  }

  async improveTask(task, options = {}) {
    const prompt = options.prompt || task;
    return this._makeRequest(prompt);
  }

  async generateTests(task, options = {}) {
    const prompt = options.prompt || `Crie casos de teste para: ${task}`;
    return this._makeRequest(prompt);
  }

  async generateTestCode(testCases, framework, language = 'JavaScript', options = {}) {
    const prompt = options.prompt || 
      `Generate ${language} test code using the ${framework} framework for the following test cases:\n\n${testCases}\n\nPlease provide complete, runnable test code with proper setup and teardown if needed.`;
    
    return this._makeRequest(prompt);
  }

  async analyzeRisks(feature, options = {}) {
    const prompt = options.prompt || 
      `Analyze the following feature and identify potential implementation risks, quality concerns, and possible bugs:\n\n${feature}\n\nProvide a detailed analysis with specific risks categorized by severity (High, Medium, Low) and include recommendations for mitigation.`;
    
    return this._makeRequest(prompt);
  }
}

module.exports = ChatGPTModel;