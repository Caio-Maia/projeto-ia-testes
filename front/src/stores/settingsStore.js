/**
 * Settings Store - Zustand
 * 
 * Gerencia configurações globais da aplicação.
 * Substitui contextos que causavam re-renders desnecessários.
 * 
 * @example
 * import { useSettingsStore } from '../stores/settingsStore';
 * 
 * function Component() {
 *   const selectedModel = useSettingsStore((state) => state.selectedModel);
 *   const setModel = useSettingsStore((state) => state.setModel);
 * }
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Store de configurações
 * Persiste automaticamente no localStorage
 */
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // Estado
      // ============================================
      
      /** Modelo de IA selecionado */
      selectedModel: null,
      
      /** Modo educacional ativo */
      educationMode: false,
      
      /** Idioma selecionado */
      language: 'pt-BR',
      
      /** Tema escuro ativo */
      darkMode: false,
      
      /** Streaming habilitado */
      streamingEnabled: true,
      
      // ============================================
      // Ações
      // ============================================
      
      /**
       * Define o modelo de IA selecionado
       * @param {Object} model - { apiName, version, label }
       */
      setModel: (model) => set({ selectedModel: model }),
      
      /**
       * Alterna modo educacional
       */
      toggleEducationMode: () => set((state) => ({ 
        educationMode: !state.educationMode 
      })),
      
      /**
       * Define modo educacional
       * @param {boolean} enabled
       */
      setEducationMode: (enabled) => set({ educationMode: enabled }),
      
      /**
       * Define idioma
       * @param {string} lang - 'pt-BR' ou 'en-US'
       */
      setLanguage: (lang) => set({ language: lang }),
      
      /**
       * Alterna tema escuro
       */
      toggleDarkMode: () => set((state) => ({ 
        darkMode: !state.darkMode 
      })),
      
      /**
       * Define tema escuro
       * @param {boolean} enabled
       */
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      
      /**
       * Alterna streaming
       */
      toggleStreaming: () => set((state) => ({ 
        streamingEnabled: !state.streamingEnabled 
      })),
      
      /**
       * Define streaming
       * @param {boolean} enabled
       */
      setStreaming: (enabled) => set({ streamingEnabled: enabled }),
      
      /**
       * Reseta todas as configurações para padrão
       */
      resetSettings: () => set({
        selectedModel: null,
        educationMode: false,
        language: 'pt-BR',
        darkMode: false,
        streamingEnabled: true,
      }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      // Não persistir selectedModel pois pode mudar entre sessões
      partialize: (state) => ({
        educationMode: state.educationMode,
        language: state.language,
        darkMode: state.darkMode,
        streamingEnabled: state.streamingEnabled,
      }),
    }
  )
);

/**
 * Selectors otimizados para evitar re-renders
 * Use esses selectors para melhor performance
 */
export const settingsSelectors = {
  selectedModel: (state) => state.selectedModel,
  educationMode: (state) => state.educationMode,
  language: (state) => state.language,
  darkMode: (state) => state.darkMode,
  streamingEnabled: (state) => state.streamingEnabled,
};

export default useSettingsStore;
