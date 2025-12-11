/**
 * Hooks de Compatibilidade - Zustand
 * 
 * Esses hooks fornecem a mesma interface dos contextos antigos,
 * mas usando Zustand internamente. Isso permite migração gradual.
 * 
 * @example
 * // Em vez de:
 * import { useDarkMode } from '../contexts/DarkModeContext';
 * 
 * // Use:
 * import { useDarkMode } from '../stores/hooks';
 */

import { useSettingsStore } from './settingsStore';
import { useTokensStore } from './tokensStore';
import { useUIStore } from './uiStore';
import { useGenerationStore } from './generationStore';
import translations from '../locales/translations';

// ============================================
// Dark Mode Hook (compatibilidade)
// ============================================

/**
 * Hook de compatibilidade para DarkModeContext
 * @returns {{ isDarkMode: boolean, toggleDarkMode: function }}
 */
export const useDarkMode = () => {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  
  return {
    isDarkMode: darkMode,
    toggleDarkMode,
  };
};

// ============================================
// Language Hook (compatibilidade)
// ============================================

/**
 * Hook de compatibilidade para LanguageContext
 * @returns {{ language: string, changeLanguage: function, t: function }}
 */
export const useLanguage = () => {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  
  /**
   * Função de tradução
   * @param {string} key - Chave da tradução (ex: 'common.save')
   * @returns {string}
   */
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Retornar a chave se não encontrar a tradução
      }
    }
    
    return value || key;
  };
  
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };
  
  return {
    language,
    changeLanguage,
    t,
  };
};

// ============================================
// Education Mode Hook
// ============================================

/**
 * Hook para modo educacional
 * @returns {{ educationMode: boolean, toggleEducationMode: function }}
 */
export const useEducationMode = () => {
  const educationMode = useSettingsStore((state) => state.educationMode);
  const toggleEducationMode = useSettingsStore((state) => state.toggleEducationMode);
  
  return {
    educationMode,
    toggleEducationMode,
  };
};

// ============================================
// Tokens Hook
// ============================================

/**
 * Hook para gerenciar tokens de API
 * @returns {{ tokens: Object, setToken: function, getToken: function, hasValidToken: function }}
 */
export const useTokens = () => {
  const tokens = useTokensStore((state) => state.tokens);
  const setToken = useTokensStore((state) => state.setToken);
  const getToken = useTokensStore((state) => state.getToken);
  const hasValidToken = useTokensStore((state) => state.hasValidToken);
  const removeToken = useTokensStore((state) => state.removeToken);
  
  return {
    tokens,
    setToken,
    getToken,
    hasValidToken,
    removeToken,
  };
};

// ============================================
// Notifications Hook
// ============================================

/**
 * Hook para notificações
 * @returns {{ notifications: Array, notify: Object, removeNotification: function }}
 */
export const useNotifications = () => {
  const notifications = useUIStore((state) => state.notifications);
  const addNotification = useUIStore((state) => state.addNotification);
  const removeNotification = useUIStore((state) => state.removeNotification);
  const notifySuccess = useUIStore((state) => state.notifySuccess);
  const notifyError = useUIStore((state) => state.notifyError);
  const notifyWarning = useUIStore((state) => state.notifyWarning);
  const notifyInfo = useUIStore((state) => state.notifyInfo);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    notify: {
      success: notifySuccess,
      error: notifyError,
      warning: notifyWarning,
      info: notifyInfo,
    },
  };
};

// ============================================
// Generation Hook
// ============================================

/**
 * Hook para gerenciamento de gerações
 * @returns {{ current: Object, history: Object, actions: Object }}
 */
export const useGeneration = () => {
  const current = useGenerationStore((state) => state.current);
  const history = useGenerationStore((state) => state.history);
  const startGeneration = useGenerationStore((state) => state.startGeneration);
  const completeGeneration = useGenerationStore((state) => state.completeGeneration);
  const setGenerationError = useGenerationStore((state) => state.setGenerationError);
  const appendOutput = useGenerationStore((state) => state.appendOutput);
  const resetCurrent = useGenerationStore((state) => state.resetCurrent);
  const getHistory = useGenerationStore((state) => state.getHistory);
  
  return {
    current,
    history,
    isLoading: current.isLoading,
    output: current.output,
    error: current.error,
    actions: {
      start: startGeneration,
      complete: completeGeneration,
      setError: setGenerationError,
      append: appendOutput,
      reset: resetCurrent,
      getHistory,
    },
  };
};

// ============================================
// UI Hook
// ============================================

/**
 * Hook para estado da UI
 * @returns {{ dialogs: Object, drawers: Object, loading: Object }}
 */
export const useUI = () => {
  const tokenDialogOpen = useUIStore((state) => state.tokenDialogOpen);
  const openTokenDialog = useUIStore((state) => state.openTokenDialog);
  const closeTokenDialog = useUIStore((state) => state.closeTokenDialog);
  const historyDrawerOpen = useUIStore((state) => state.historyDrawerOpen);
  const toggleHistoryDrawer = useUIStore((state) => state.toggleHistoryDrawer);
  const globalLoading = useUIStore((state) => state.globalLoading);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  
  return {
    dialogs: {
      token: {
        open: tokenDialogOpen,
        show: openTokenDialog,
        hide: closeTokenDialog,
      },
    },
    drawers: {
      history: {
        open: historyDrawerOpen,
        toggle: toggleHistoryDrawer,
      },
    },
    loading: {
      isLoading: globalLoading,
      show: showLoading,
      hide: hideLoading,
    },
  };
};
