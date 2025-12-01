const aiService = require('../services/aiService');

/**
 * Controller for AI operations
 */
class AIController {
  /**
   * Get configuration for the specified AI model
   * @param {object} req - The request object
   * @returns {object} - The model configuration
   */
  static getModelConfig(req) {
    const modelType = req.body.modelType?.toLowerCase() || 'chatgpt';
    
    if (modelType === 'chatgpt') {
      return {
        apiKey: process.env.CHATGPT_API_KEY || req.headers['x-chatgpt-api-key'],
        model: req.body.modelVersion || 'gpt-5-nano'
      };
    } else if (modelType === 'gemini') {
      return {
        apiKey: req.query.token || process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'],
        model: req.body.modelVersion || 'gemini-2.5-flash-lite'
      };
    }
    
    throw new Error(`Unsupported model type: ${modelType}`);
  }

  /**
   * Improve a task description
   * @param {object} req - The request object
   * @param {object} res - The response object
   */
  static async improveTask(req, res) {
    try {
      const { task, data } = req.body;
      const taskContent = task || data;
      
      if (!taskContent) {
        return res.status(400).json({ error: 'Task content is required' });
      }
      
      const modelType = req.body.modelType?.toLowerCase() || 'chatgpt';
      const config = this.getModelConfig(req);
      
      const result = await aiService.improveTask(modelType, taskContent, config);
      
      if (modelType === 'gemini') {
        return res.json({ data: result });
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Error improving task:', error);
      return res.status(500).json({ error: `Error improving task: ${error.message}` });
    }
  }

  /**
   * Generate test cases for a task
   * @param {object} req - The request object
   * @param {object} res - The response object
   */
  static async generateTests(req, res) {
    try {
      const { task, data } = req.body;
      const taskContent = task || data;
      
      if (!taskContent) {
        return res.status(400).json({ error: 'Task content is required' });
      }
      
      const modelType = req.body.modelType?.toLowerCase() || 'chatgpt';
      const config = this.getModelConfig(req);
      
      const result = await aiService.generateTests(modelType, taskContent, config);
      
      if (modelType === 'gemini') {
        return res.json({ data: result });
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Error generating tests:', error);
      return res.status(500).json({ error: `Error generating tests: ${error.message}` });
    }
  }

  /**
   * Generate test code for test cases
   * @param {object} req - The request object
   * @param {object} res - The response object
   */
  static async generateTestCode(req, res) {
    try {
      const { testCases, framework, language } = req.body;
      
      if (!testCases || !framework) {
        return res.status(400).json({ error: 'Test cases and framework are required' });
      }
      
      const modelType = req.body.modelType?.toLowerCase() || 'chatgpt';
      const config = this.getModelConfig(req);
      
      const result = await aiService.generateTestCode(
        modelType, 
        testCases, 
        framework, 
        language || 'JavaScript', 
        config
      );
      
      if (modelType === 'gemini') {
        return res.json({ data: result });
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Error generating test code:', error);
      return res.status(500).json({ error: `Error generating test code: ${error.message}` });
    }
  }

  /**
   * Analyze implementation risks for a feature
   * @param {object} req - The request object
   * @param {object} res - The response object
   */
  static async analyzeRisks(req, res) {
    try {
      const { feature } = req.body;
      
      if (!feature) {
        return res.status(400).json({ error: 'Feature description is required' });
      }
      
      const modelType = req.body.modelType?.toLowerCase() || req.body.model || 'chatgpt';
      const config = this.getModelConfig(req);
      
      const result = await aiService.analyzeRisks(modelType, feature, config);
      
      if (modelType === 'gemini') {
        return res.json({ data: result });
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Error analyzing risks:', error);
      return res.status(500).json({ error: `Error analyzing risks: ${error.message}` });
    }
  }

  /**
   * Get available AI models and versions
   * @param {object} req - The request object
   * @param {object} res - The response object
   */
  static getAvailableModels(req, res) {
    try {
      const modelTypes = aiService.getAvailableModelTypes();
      
      const models = modelTypes.map(type => ({
        type,
        versions: aiService.getAvailableVersions(type)
      }));
      
      return res.json({ models });
    } catch (error) {
      console.error('Error getting available models:', error);
      return res.status(500).json({ error: `Error getting available models: ${error.message}` });
    }
  }
}

module.exports = AIController;