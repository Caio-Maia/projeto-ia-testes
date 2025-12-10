/**
 * Custom Hooks - Índice de Exportação
 * 
 * Este arquivo centraliza a exportação de todos os custom hooks do projeto.
 * 
 * @example
 * // Importação individual
 * import { useAI, useJira, useGenerationHistory } from '../hooks';
 * 
 * // Ou importação direta do arquivo
 * import { useImproveTask } from '../hooks/useAI';
 */

// ============================================
// HOOKS DE IA
// ============================================

export { 
  useAI, 
  useImproveTask, 
  useGenerateTests, 
  useGenerateTestCode,
  useAnalyzeRisks 
} from './useAI';

// ============================================
// HOOKS DE INTEGRAÇÃO
// ============================================

export { useJira } from './useJira';

// ============================================
// HOOKS DE HISTÓRICO
// ============================================

export { useGenerationHistory } from './useGenerationHistory';

// ============================================
// HOOKS DE PROMPT
// ============================================

export { usePrompt } from './usePrompt';

// ============================================
// HOOKS DE STORAGE
// ============================================

export { 
  useLocalStorage, 
  useEducationMode, 
  useApiToken 
} from './useLocalStorage';

// ============================================
// REACT QUERY MUTATIONS
// ============================================

export {
  useImproveTaskMutation,
  useGenerateTestsMutation,
  useGenerateTestCodeMutation,
  useAnalyzeRisksMutation,
  useImproveTaskWithState
} from './useAIMutations';
