const AIModelFactory = require('../models/aiModelFactory');

/**
 * Service for handling AI operations
 */
class AIService {
  /**
   * Create an instance of the AIService
   */
  constructor() {
    this.modelInstances = new Map();
  }

  /**
   * Get or create an AI model instance
   * @param {string} type - The type of AI model
   * @param {object} config - Configuration for the model
   * @returns {AIModel} - An instance of the requested AI model
   */
  getModel(type, config) {
    const key = `${type}-${config.model || 'default'}`;
    
    if (!this.modelInstances.has(key)) {
      this.modelInstances.set(key, AIModelFactory.createModel(type, config));
    }
    
    return this.modelInstances.get(key);
  }

  /**
   * Improve a task description
   * @param {string} type - The type of AI model to use
   * @param {string} task - The task description to improve
   * @param {object} config - Configuration for the model
   * @param {object} options - Additional options
   * @returns {Promise<string>} - The improved task description
   */
  async improveTask(type, task, config, options = {}) {
    const model = this.getModel(type, config);
    return model.improveTask(task, options);
  }

  /**
   * Generate test cases for a task
   * @param {string} type - The type of AI model to use
   * @param {string} task - The task to generate tests for
   * @param {object} config - Configuration for the model
   * @param {object} options - Additional options
   * @returns {Promise<string>} - The generated test cases
   */
  async generateTests(type, task, config, options = {}) {
    const model = this.getModel(type, config);
    return model.generateTests(task, options);
  }

  /**
   * Generate test code for test cases
   * @param {string} type - The type of AI model to use
   * @param {string} testCases - The test cases to generate code for
   * @param {string} framework - The testing framework to use
   * @param {string} language - The programming language to use
   * @param {object} config - Configuration for the model
   * @param {object} options - Additional options
   * @returns {Promise<string>} - The generated test code
   */
  async generateTestCode(type, testCases, framework, language, config, options = {}) {
    const model = this.getModel(type, config);
    return model.generateTestCode(testCases, framework, language, options);
  }

  /**
   * Analyze implementation risks for a feature
   * @param {string} type - The type of AI model to use
   * @param {string} feature - The feature to analyze
   * @param {object} config - Configuration for the model
   * @param {object} options - Additional options
   * @returns {Promise<string>} - The risk analysis
   */
  async analyzeRisks(type, feature, config, options = {}) {
    const model = this.getModel(type, config);
    return model.analyzeRisks(feature, options);
  }

  /**
   * Get available model versions for a specific model type
   * @param {string} type - The type of AI model
   * @returns {Array<object>} - Available model versions with details
   */
  getAvailableVersions(type) {
    return AIModelFactory.getAvailableVersions(type);
  }

  /**
   * Get all available AI model types
   * @returns {Array<string>} - Available model types
   */
  getAvailableModelTypes() {
    return AIModelFactory.getAvailableModelTypes();
  }

  /**
   * Get the default model version for a specific model type
   * @param {string} type - The type of AI model
   * @returns {string} - The default model version ID
   */
  getDefaultVersion(type) {
    return AIModelFactory.getDefaultVersion(type);
  }

  /**
   * Get full configuration for all AI models
   * @returns {object} - AI models configuration
   */
  getModelsConfig() {
    return AIModelFactory.getModelsConfig();
  }
}

// Create a singleton instance
const aiService = new AIService();

module.exports = aiService;