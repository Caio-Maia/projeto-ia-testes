/**
 * Feedback Storage Service
 * 
 * Abstrai o armazenamento de feedback, permitindo:
 * - Local (localStorage): Para uso pessoal/privado
 * - Backend (API): Para uso compartilhado/empresarial
 * 
 * Configurável via:
 * - Variável de ambiente REACT_APP_FEEDBACK_STORAGE ('local' | 'backend' | 'user-choice')
 * - Preferência do usuário (quando REACT_APP_FEEDBACK_STORAGE = 'user-choice')
 */

import axios from 'axios';

const STORAGE_KEY = 'feedbackStorageMode';
const FEEDBACKS_KEY = 'localFeedbacks';

/**
 * Obtém o modo de armazenamento configurado
 * @returns {'local' | 'backend'} Modo de armazenamento
 */
export const getStorageMode = () => {
  const envMode = process.env.REACT_APP_FEEDBACK_STORAGE || 'user-choice';
  
  if (envMode === 'user-choice') {
    // Usuário pode escolher - verifica preferência salva
    return localStorage.getItem(STORAGE_KEY) || 'backend';
  }
  
  return envMode; // 'local' ou 'backend' forçado por variável de ambiente
};

/**
 * Verifica se o usuário pode escolher o modo de armazenamento
 * @returns {boolean}
 */
export const canUserChooseStorage = () => {
  const envMode = process.env.REACT_APP_FEEDBACK_STORAGE || 'user-choice';
  return envMode === 'user-choice';
};

/**
 * Define o modo de armazenamento preferido pelo usuário
 * @param {'local' | 'backend'} mode 
 */
export const setStorageMode = (mode) => {
  if (canUserChooseStorage()) {
    localStorage.setItem(STORAGE_KEY, mode);
  }
};

/**
 * Obtém feedbacks do localStorage
 */
const getLocalFeedbacks = () => {
  try {
    const data = localStorage.getItem(FEEDBACKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Salva feedbacks no localStorage
 */
const saveLocalFeedbacks = (feedbacks) => {
  localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
};

/**
 * Gera ID único para feedback local
 */
const generateLocalId = () => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// API DO SERVIÇO
// ============================================

/**
 * Submete feedback
 * @param {Object} feedbackData - Dados do feedback
 * @returns {Promise<Object>} Feedback criado
 */
export const submitFeedback = async (feedbackData) => {
  const mode = getStorageMode();
  
  if (mode === 'local') {
    // Salvar localmente
    const feedbacks = getLocalFeedbacks();
    const newFeedback = {
      id: generateLocalId(),
      ...feedbackData,
      createdAt: new Date().toISOString()
    };
    feedbacks.unshift(newFeedback);
    saveLocalFeedbacks(feedbacks);
    return { feedback: newFeedback };
  }
  
  // Enviar para backend
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const response = await axios.post(`${backendUrl}/api/feedback`, feedbackData);
  return response.data;
};

/**
 * Obtém estatísticas de feedback
 * @returns {Promise<Array>} Estatísticas agrupadas por tipo
 */
export const getFeedbackStats = async () => {
  const mode = getStorageMode();
  
  if (mode === 'local') {
    const feedbacks = getLocalFeedbacks();
    
    // Agrupa por tipo
    const stats = {};
    feedbacks.forEach(f => {
      if (!stats[f.type]) {
        stats[f.type] = { _id: f.type, ratings: [], total: 0 };
      }
      
      const ratingObj = stats[f.type].ratings.find(r => r.rating === f.rating);
      if (ratingObj) {
        ratingObj.count++;
      } else {
        stats[f.type].ratings.push({ rating: f.rating, count: 1 });
      }
      stats[f.type].total++;
    });
    
    return Object.values(stats);
  }
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const response = await axios.get(`${backendUrl}/api/feedback/stats`);
  return response.data;
};

/**
 * Obtém feedbacks recentes com comentários
 * @returns {Promise<Array>} Lista de feedbacks recentes
 */
export const getRecentFeedback = async () => {
  const mode = getStorageMode();
  
  if (mode === 'local') {
    const feedbacks = getLocalFeedbacks();
    // Retorna os 50 mais recentes com comentário
    return feedbacks
      .filter(f => f.comment && f.comment.trim() !== '')
      .slice(0, 50);
  }
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const response = await axios.get(`${backendUrl}/api/feedback/recent`);
  return response.data;
};

/**
 * Regenera conteúdo baseado em feedback
 * @param {string} feedbackId - ID do feedback
 * @param {Object} model - Modelo de IA selecionado
 * @param {string} token - Token da API
 * @returns {Promise<Object>} Conteúdo regenerado
 */
export const regenerateFeedback = async (feedbackId, model, token) => {
  const mode = getStorageMode();
  
  if (mode === 'local') {
    // Para regeneração local, precisamos chamar a API de IA diretamente
    // mas o feedback fica salvo localmente
    const feedbacks = getLocalFeedbacks();
    const feedback = feedbacks.find(f => f.id === feedbackId);
    
    if (!feedback) {
      throw new Error('Feedback não encontrado');
    }
    
    // Chama API de regeneração do backend (apenas para a IA, não salva feedback lá)
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    // Monta o histórico de conversação
    const conversationHistory = feedback.conversationHistory || [];
    conversationHistory.push({
      role: 'user',
      content: `Por favor, ajuste o texto anterior com base neste feedback: ${feedback.comment}`
    });
    
    // Chama a API correta baseada no modelo
    const apiName = model.apiName || model;
    let response;
    
    if (apiName === 'chatgpt') {
      response = await axios.post(
        `${backendUrl}/api/chatgpt/improve-task`,
        { 
          task: conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n'),
          model: model.version || model 
        }
      );
    } else if (apiName === 'gemini') {
      response = await axios.post(
        `${backendUrl}/api/gemini/improve-task?token=${token}`,
        { 
          data: conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n'),
          model: model.version || model 
        }
      );
    }
    
    const regeneratedContent = response.data.data || response.data;
    
    // Atualiza feedback local com novo histórico
    feedback.conversationHistory = [...conversationHistory, {
      role: 'assistant',
      content: regeneratedContent
    }];
    saveLocalFeedbacks(feedbacks);
    
    return { data: regeneratedContent, conversationHistory: feedback.conversationHistory };
  }
  
  // Usa backend para regeneração
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const response = await axios.post(
    `${backendUrl}/api/feedback/regenerate?token=${token}`,
    { feedbackId, model }
  );
  return response.data;
};

/**
 * Limpa todos os feedbacks locais
 */
export const clearLocalFeedbacks = () => {
  localStorage.removeItem(FEEDBACKS_KEY);
};

/**
 * Exporta feedbacks locais como JSON
 * @returns {string} JSON string dos feedbacks
 */
export const exportLocalFeedbacks = () => {
  const feedbacks = getLocalFeedbacks();
  return JSON.stringify(feedbacks, null, 2);
};

/**
 * Importa feedbacks de JSON para localStorage
 * @param {string} jsonString - JSON dos feedbacks
 */
export const importLocalFeedbacks = (jsonString) => {
  try {
    const feedbacks = JSON.parse(jsonString);
    if (Array.isArray(feedbacks)) {
      saveLocalFeedbacks(feedbacks);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export default {
  getStorageMode,
  setStorageMode,
  canUserChooseStorage,
  submitFeedback,
  getFeedbackStats,
  getRecentFeedback,
  regenerateFeedback,
  clearLocalFeedbacks,
  exportLocalFeedbacks,
  importLocalFeedbacks
};
