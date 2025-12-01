import { AI_MODELS } from './aiModels';

/**
 * Organiza modelos por provedor (ChatGPT e Gemini)
 */
export const getModelsByProvider = () => {
  const grouped = {
    chatgpt: [],
    gemini: []
  };

  AI_MODELS.forEach(model => {
    if (model.apiName === 'chatgpt') {
      grouped.chatgpt.push(model);
    } else if (model.apiName === 'gemini') {
      grouped.gemini.push(model);
    }
  });

  return grouped;
};

/**
 * Retorna dados formatados para MenuItems com headers de grupo
 */
export const getGroupedModelsForMenu = () => {
  const grouped = getModelsByProvider();
  return [
    {
      group: 'ChatGPT',
      models: grouped.chatgpt,
      icon: '🤖'
    },
    {
      group: 'Gemini',
      models: grouped.gemini,
      icon: '✨'
    }
  ];
};

/**
 * Obtém apenas modelos de um provedor específico
 */
export const getModelsByType = (type) => {
  return AI_MODELS.filter(model => model.apiName === type);
};
