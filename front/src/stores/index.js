/**
 * Stores Index
 * 
 * Exporta todas as stores do Zustand para facilitar importação.
 * 
 * @example
 * import { useSettingsStore, useTokensStore, useUIStore } from '../stores';
 * import { useDarkMode, useLanguage } from '../stores';
 */

// Stores
export { useSettingsStore, settingsSelectors } from './settingsStore';
export { useTokensStore, tokensSelectors } from './tokensStore';
export { useUIStore, uiSelectors } from './uiStore';
export { 
  useGenerationStore, 
  generationSelectors,
  GENERATION_TYPES 
} from './generationStore';

// Compatibility Hooks (mesma interface dos contextos antigos)
export {
  useDarkMode,
  useLanguage,
  useEducationMode,
  useTokens,
  useNotifications,
  useGeneration,
  useUI,
} from './hooks';

/**
 * Reset all stores (útil para logout ou reset completo)
 */
export const resetAllStores = () => {
  const { useSettingsStore } = require('./settingsStore');
  const { useTokensStore } = require('./tokensStore');
  const { useUIStore } = require('./uiStore');
  const { useGenerationStore } = require('./generationStore');
  
  // Reset settings to defaults
  useSettingsStore.setState({
    theme: 'system',
    language: 'pt-BR',
    educationMode: false,
    defaultModel: { apiName: 'chatgpt', version: 'gpt-4o' },
    preferStreaming: true,
  });
  
  // Clear tokens
  useTokensStore.getState().clearAllTokens();
  
  // Reset UI
  useUIStore.setState({
    tokenDialogOpen: false,
    tokenDialogProvider: null,
    historyDrawerOpen: false,
    notifications: [],
    globalLoading: false,
    loadingMessage: '',
    sidebarExpanded: true,
    activePage: 'home',
  });
  
  // Clear generation history
  useGenerationStore.getState().clearAllHistory();
  useGenerationStore.getState().resetCurrent();
};
