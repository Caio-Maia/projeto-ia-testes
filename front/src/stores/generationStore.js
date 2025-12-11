/**
 * Generation Store - Zustand
 * 
 * Gerencia histórico de gerações de IA.
 * Substitui saveGenerationLocalStorage e generationHistory utils.
 * 
 * @example
 * import { useGenerationStore } from '../stores/generationStore';
 * 
 * function Component() {
 *   const addGeneration = useGenerationStore((state) => state.addGeneration);
 *   addGeneration('tests', { input, output });
 * }
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Limite de itens por tipo */
const MAX_ITEMS_PER_TYPE = 50;

/** Tipos de geração */
export const GENERATION_TYPES = {
  TASK: 'task',
  TESTS: 'tests',
  CODE: 'code',
  RISKS: 'risks',
  COVERAGE: 'coverage',
};

/**
 * Store de gerações (persistido em localStorage)
 */
export const useGenerationStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // Estado
      // ============================================
      
      /** Histórico por tipo */
      history: {
        [GENERATION_TYPES.TASK]: [],
        [GENERATION_TYPES.TESTS]: [],
        [GENERATION_TYPES.CODE]: [],
        [GENERATION_TYPES.RISKS]: [],
        [GENERATION_TYPES.COVERAGE]: [],
      },
      
      /** Geração atual (em andamento) */
      current: {
        type: null,
        input: null,
        output: null,
        isLoading: false,
        error: null,
        startedAt: null,
      },
      
      // ============================================
      // Current Generation
      // ============================================
      
      /**
       * Inicia uma geração
       * @param {string} type - Tipo da geração
       * @param {Object} input - Dados de entrada
       */
      startGeneration: (type, input) => set({
        current: {
          type,
          input,
          output: null,
          isLoading: true,
          error: null,
          startedAt: Date.now(),
        },
      }),
      
      /**
       * Atualiza output durante streaming
       * @param {string} chunk - Chunk de texto
       */
      appendOutput: (chunk) => set((state) => ({
        current: {
          ...state.current,
          output: (state.current.output || '') + chunk,
        },
      })),
      
      /**
       * Completa geração com sucesso
       * @param {string} output - Resultado final
       * @param {boolean} save - Se deve salvar no histórico
       */
      completeGeneration: (output, save = true) => {
        const { current } = get();
        const completedGeneration = {
          ...current,
          output,
          isLoading: false,
          completedAt: Date.now(),
          duration: Date.now() - (current.startedAt || Date.now()),
        };
        
        set({ current: { ...completedGeneration } });
        
        // Salva no histórico
        if (save && current.type) {
          get().addToHistory(current.type, {
            input: current.input,
            output,
            duration: completedGeneration.duration,
          });
        }
      },
      
      /**
       * Marca erro na geração
       * @param {Object} error - Erro ocorrido
       */
      setGenerationError: (error) => set((state) => ({
        current: {
          ...state.current,
          isLoading: false,
          error,
        },
      })),
      
      /**
       * Reseta geração atual
       */
      resetCurrent: () => set({
        current: {
          type: null,
          input: null,
          output: null,
          isLoading: false,
          error: null,
          startedAt: null,
        },
      }),
      
      // ============================================
      // History Management
      // ============================================
      
      /**
       * Adiciona item ao histórico
       * @param {string} type - Tipo da geração
       * @param {Object} item - { input, output, duration? }
       */
      addToHistory: (type, item) => {
        const id = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newItem = {
          id,
          ...item,
          createdAt: Date.now(),
        };
        
        set((state) => {
          const typeHistory = state.history[type] || [];
          const updatedHistory = [newItem, ...typeHistory].slice(0, MAX_ITEMS_PER_TYPE);
          
          return {
            history: {
              ...state.history,
              [type]: updatedHistory,
            },
          };
        });
        
        return id;
      },
      
      /**
       * Obtém histórico por tipo
       * @param {string} type
       * @returns {Array}
       */
      getHistory: (type) => {
        const { history } = get();
        return history[type] || [];
      },
      
      /**
       * Obtém item específico
       * @param {string} type
       * @param {string} id
       * @returns {Object|null}
       */
      getHistoryItem: (type, id) => {
        const typeHistory = get().history[type] || [];
        return typeHistory.find((item) => item.id === id) || null;
      },
      
      /**
       * Remove item do histórico
       * @param {string} type
       * @param {string} id
       */
      removeFromHistory: (type, id) => set((state) => ({
        history: {
          ...state.history,
          [type]: (state.history[type] || []).filter((item) => item.id !== id),
        },
      })),
      
      /**
       * Limpa histórico de um tipo
       * @param {string} type
       */
      clearHistory: (type) => set((state) => ({
        history: {
          ...state.history,
          [type]: [],
        },
      })),
      
      /**
       * Limpa todo o histórico
       */
      clearAllHistory: () => set({
        history: {
          [GENERATION_TYPES.TASK]: [],
          [GENERATION_TYPES.TESTS]: [],
          [GENERATION_TYPES.CODE]: [],
          [GENERATION_TYPES.RISKS]: [],
          [GENERATION_TYPES.COVERAGE]: [],
        },
      }),
      
      /**
       * Obtém estatísticas do histórico
       * @returns {Object}
       */
      getStats: () => {
        const { history } = get();
        const stats = {};
        let totalCount = 0;
        
        Object.keys(history).forEach((type) => {
          const typeHistory = history[type] || [];
          stats[type] = {
            count: typeHistory.length,
            lastGenerated: typeHistory.length > 0 ? typeHistory[0].createdAt : null,
          };
          totalCount += typeHistory.length;
        });
        
        return {
          ...stats,
          total: totalCount,
        };
      },
      
      /**
       * Exporta histórico como JSON
       * @returns {string}
       */
      exportHistory: () => {
        const { history } = get();
        return JSON.stringify(history, null, 2);
      },
      
      /**
       * Importa histórico de JSON
       * @param {string} jsonString
       */
      importHistory: (jsonString) => {
        try {
          const imported = JSON.parse(jsonString);
          set((state) => ({
            history: {
              ...state.history,
              ...imported,
            },
          }));
          return true;
        } catch (error) {
          console.error('Erro ao importar histórico:', error);
          return false;
        }
      },
    }),
    {
      name: 'generation-history',
      partialize: (state) => ({ history: state.history }), // Só persiste o histórico
    }
  )
);

/**
 * Selectors otimizados
 */
export const generationSelectors = {
  isLoading: (state) => state.current.isLoading,
  currentOutput: (state) => state.current.output,
  currentError: (state) => state.current.error,
  taskHistory: (state) => state.history[GENERATION_TYPES.TASK],
  testsHistory: (state) => state.history[GENERATION_TYPES.TESTS],
  codeHistory: (state) => state.history[GENERATION_TYPES.CODE],
  risksHistory: (state) => state.history[GENERATION_TYPES.RISKS],
};

export default useGenerationStore;
