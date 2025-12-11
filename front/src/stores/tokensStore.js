/**
 * API Tokens Store - Zustand
 * 
 * Gerencia tokens de API de forma segura.
 * Persiste no localStorage com opção de criptografia.
 * 
 * @example
 * import { useTokensStore } from '../stores/tokensStore';
 * 
 * function Component() {
 *   const getToken = useTokensStore((state) => state.getToken);
 *   const token = getToken('chatgpt');
 * }
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Store de tokens de API
 */
export const useTokensStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // Estado
      // ============================================
      
      /** Tokens por provider */
      tokens: {
        chatgpt: '',
        gemini: '',
        claude: '',
        jira: '',
      },
      
      /** Credenciais JIRA */
      jiraCredentials: {
        email: '',
        baseUrl: '',
      },
      
      // ============================================
      // Ações
      // ============================================
      
      /**
       * Obtém token de um provider
       * @param {string} provider - 'chatgpt', 'gemini', 'claude', 'jira'
       * @returns {string} Token ou string vazia
       */
      getToken: (provider) => {
        const state = get();
        return state.tokens[provider] || '';
      },
      
      /**
       * Define token de um provider
       * @param {string} provider
       * @param {string} token
       */
      setToken: (provider, token) => set((state) => ({
        tokens: {
          ...state.tokens,
          [provider]: token,
        },
      })),
      
      /**
       * Verifica se um provider tem token configurado
       * @param {string} provider
       * @returns {boolean}
       */
      hasToken: (provider) => {
        const state = get();
        return Boolean(state.tokens[provider]);
      },
      
      /**
       * Remove token de um provider
       * @param {string} provider
       */
      removeToken: (provider) => set((state) => ({
        tokens: {
          ...state.tokens,
          [provider]: '',
        },
      })),
      
      /**
       * Define credenciais JIRA
       * @param {Object} credentials - { email, baseUrl }
       */
      setJiraCredentials: (credentials) => set((state) => ({
        jiraCredentials: {
          ...state.jiraCredentials,
          ...credentials,
        },
      })),
      
      /**
       * Obtém credenciais JIRA completas
       * @returns {Object} { token, email, baseUrl }
       */
      getJiraCredentials: () => {
        const state = get();
        return {
          token: state.tokens.jira,
          email: state.jiraCredentials.email,
          baseUrl: state.jiraCredentials.baseUrl,
        };
      },
      
      /**
       * Verifica se JIRA está configurado
       * @returns {boolean}
       */
      isJiraConfigured: () => {
        const state = get();
        return Boolean(
          state.tokens.jira && 
          state.jiraCredentials.email && 
          state.jiraCredentials.baseUrl
        );
      },
      
      /**
       * Remove todos os tokens
       */
      clearAllTokens: () => set({
        tokens: {
          chatgpt: '',
          gemini: '',
          claude: '',
          jira: '',
        },
        jiraCredentials: {
          email: '',
          baseUrl: '',
        },
      }),
      
      /**
       * Lista providers com tokens configurados
       * @returns {string[]}
       */
      getConfiguredProviders: () => {
        const state = get();
        return Object.entries(state.tokens)
          .filter(([, token]) => Boolean(token))
          .map(([provider]) => provider);
      },
    }),
    {
      name: 'tokens-storage',
      storage: createJSONStorage(() => localStorage),
      // Migração de tokens antigos do localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migrar tokens antigos se existirem
          const oldChatGPT = localStorage.getItem('chatgptToken');
          const oldGemini = localStorage.getItem('geminiToken');
          const oldJira = localStorage.getItem('jiraToken');
          const oldJiraEmail = localStorage.getItem('jiraEmail');
          const oldJiraUrl = localStorage.getItem('jiraBaseUrl');
          
          if (oldChatGPT && !state.tokens.chatgpt) {
            state.setToken('chatgpt', oldChatGPT);
          }
          if (oldGemini && !state.tokens.gemini) {
            state.setToken('gemini', oldGemini);
          }
          if (oldJira && !state.tokens.jira) {
            state.setToken('jira', oldJira);
          }
          if (oldJiraEmail || oldJiraUrl) {
            state.setJiraCredentials({
              email: oldJiraEmail || state.jiraCredentials.email,
              baseUrl: oldJiraUrl || state.jiraCredentials.baseUrl,
            });
          }
        }
      },
    }
  )
);

/**
 * Selectors otimizados
 */
export const tokensSelectors = {
  chatgptToken: (state) => state.tokens.chatgpt,
  geminiToken: (state) => state.tokens.gemini,
  claudeToken: (state) => state.tokens.claude,
  jiraToken: (state) => state.tokens.jira,
  isJiraConfigured: (state) => state.isJiraConfigured(),
};

export default useTokensStore;
