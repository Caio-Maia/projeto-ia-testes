const ChatGPTModel = require('./chatgptModel');
const GeminiModel = require('./geminiModel');
const aiModelsConfig = require('../config/aiModels');

/**
 * Factory class for creating AI model instances
 */
class AIModelFactory {
  /**
   * Available AI model types
   */
  static MODEL_TYPES = {
    CHATGPT: 'chatgpt',
    GEMINI: 'gemini'
  };

  /**
   * Create an instance of an AI model
   * @param {string} type - The type of AI model to create
   * @param {object} config - Configuration for the model
   * @returns {AIModel} - An instance of the requested AI model
   */
  static createModel(type, config = {}) {
    switch (type.toLowerCase()) {
      case this.MODEL_TYPES.CHATGPT:
        return new ChatGPTModel(config);
      case this.MODEL_TYPES.GEMINI:
        return new GeminiModel(config);
      default:
        throw new Error(`Unsupported AI model type: ${type}`);
    }
  }

  /**
   * Get available model versions for a specific model type
   * @param {string} type - The type of AI model
   * @returns {Array<object>} - Available model versions with details
   */
  static getAvailableVersions(type) {
    const modelType = type.toLowerCase();
    if (aiModelsConfig[modelType]) {
      return aiModelsConfig[modelType].versions;
    }
    return [];
  }

  /**
   * Get available model version IDs for a specific model type
   * @param {string} type - The type of AI model
   * @returns {Array<string>} - Available model version IDs
   */
  static getAvailableVersionIds(type) {
    const versions = this.getAvailableVersions(type);
    return versions.map(version => version.id);
  }

  /**
   * Get the default model version for a specific model type
   * @param {string} type - The type of AI model
   * @returns {string} - The default model version ID
   */
  static getDefaultVersion(type) {
    const versions = this.getAvailableVersions(type);
    const defaultVersion = versions.find(version => version.isDefault);
    return defaultVersion ? defaultVersion.id : versions[0]?.id;
  }

  /**
   * Get all available AI model types
   * @returns {Array<string>} - Available model types
   */
  static getAvailableModelTypes() {
    return Object.keys(aiModelsConfig);
  }

  /**
   * Get full configuration for all AI models
   * @returns {object} - AI models configuration
   */
  static getModelsConfig() {
    return aiModelsConfig;
  }
}

module.exports = AIModelFactory;