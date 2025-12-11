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
        id: 'gpt-4.1',
        name: 'ChatGPT 4.1',
        description: 'Latest GPT-4.1 model with enhanced capabilities',
        isDefault: false
      },
      {
        id: 'gpt-5',
        name: 'ChatGPT 5',
        description: 'GPT-5 model with advanced reasoning and capabilities',
        isDefault: false
      },
      {
        id: 'gpt-5-mini',
        name: 'ChatGPT 5 Mini',
        description: 'Lightweight GPT-5 model for efficient processing',
        isDefault: false
      },
      {
        id: 'gpt-5-nano',
        name: 'ChatGPT 5 Nano',
        description: 'Ultra-lightweight GPT-5 model for fast responses',
        isDefault: true
      },
      {
        id: 'gpt-5.1',
        name: 'ChatGPT 5.1',
        description: 'Latest GPT-5.1 model with improved performance',
        isDefault: false
      },
      {
        id: 'gpt-5-pro',
        name: 'ChatGPT 5 Pro',
        description: 'High-capability GPT-5 Pro model for complex tasks',
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
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: 'Lightweight model with improved efficiency',
        isDefault: true
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Fast model with balanced performance',
        isDefault: false
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'High-capability model for complex tasks',
        isDefault: false
      },
      {
        id: 'gemini-3.0-pro-preview',
        name: 'Gemini 3.0 Pro Preview',
        description: 'Latest Gemini 3.0 model in preview (experimental)',
        isDefault: false
      }
    ],
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  },

  /**
   * Claude model configurations
   */
  claude: {
    versions: [
      
    ],
    apiEndpoint: ''
  }
};

module.exports = aiModelsConfig;