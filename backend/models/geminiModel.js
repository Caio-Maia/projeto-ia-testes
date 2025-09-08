const axios = require('axios');
const AIModel = require('./aiModel');

class GeminiModel extends AIModel {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-1.5-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async _makeRequest(prompt) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      if (!response.data.candidates || 
          !response.data.candidates[0] || 
          !response.data.candidates[0].content || 
          !response.data.candidates[0].content.parts[0].text) {
        throw new Error('Invalid response from Gemini API');
      }

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Error making request to Gemini API: ${error.message}`);
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

module.exports = GeminiModel;