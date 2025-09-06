/**
 * Configuration for AI models
 */
const aiModelsConfig = {
  /**
   * ChatGPT model configurations
   */
  chatgpt: {
    versions: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective model for most use cases',
        isDefault: true
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'More capable model for complex tasks',
        isDefault: false
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Latest GPT-4 model with improved performance',
        isDefault: false
      }
    ],
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
  },
  
  /**
   * Gemini model configurations
   */
  gemini: {
    versions: [
      {
        id: 'gemini-1.0-pro',
        name: 'Gemini 1.0 Pro',
        description: 'Original Gemini model',
        isDefault: false
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient model for most use cases',
        isDefault: true
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'More capable model for complex tasks',
        isDefault: false
      }
    ],
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  }
};

module.exports = aiModelsConfig;