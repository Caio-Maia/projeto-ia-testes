import { useState, useCallback, useEffect } from 'react';
import { addVersion, getVersions, clearVersions, restoreVersion } from '../utils/generationHistory';
import { saveGenerationToLocalStorage, getGenerationHistory } from '../utils/saveGenerationLocalStorage';

/**
 * Custom Hook para gerenciar histórico de gerações
 * 
 * Abstrai a lógica de:
 * - Salvar novas gerações
 * - Listar versões anteriores
 * - Restaurar versões
 * - Gerenciar histórico geral
 * 
 * @param {string} featureType - Tipo da feature ('task', 'tests', 'code', 'risks')
 * @returns {Object}
 * 
 * @example
 * const { 
 *   versions, 
 *   saveGeneration, 
 *   addNewVersion, 
 *   restoreToVersion,
 *   generationId 
 * } = useGenerationHistory('task');
 * 
 * // Salvar uma nova geração
 * const id = saveGeneration(result, 'Descrição da tarefa', { model: 'gpt-4o' });
 * 
 * // Adicionar uma nova versão (regeneração)
 * addNewVersion(result, { type: 'regenerated' });
 * 
 * // Restaurar uma versão anterior
 * const oldContent = restoreToVersion(0);
 */
export const useGenerationHistory = (featureType) => {
  const [generationId, setGenerationId] = useState(null);
  const [versions, setVersions] = useState([]);
  const [history, setHistory] = useState([]);

  /**
   * Carrega as versões quando o generationId muda
   */
  useEffect(() => {
    if (generationId) {
      const loadedVersions = getVersions(generationId);
      setVersions(loadedVersions);
    }
  }, [generationId]);

  /**
   * Salva uma nova geração e retorna o ID
   * @param {string} content - Conteúdo gerado
   * @param {string} taskInfo - Informação sobre a tarefa
   * @param {Object} meta - Metadados adicionais
   * @returns {string} ID da geração
   */
  const saveGeneration = useCallback((content, taskInfo, meta = {}) => {
    const id = saveGenerationToLocalStorage(content, featureType, taskInfo, meta);
    setGenerationId(id);
    return id;
  }, [featureType]);

  /**
   * Adiciona uma nova versão ao histórico de uma geração existente
   * @param {string} content - Novo conteúdo
   * @param {Object} meta - Metadados (model, type, etc)
   */
  const addNewVersion = useCallback((content, meta = {}) => {
    if (generationId) {
      addVersion(generationId, content, { type: featureType, ...meta });
      setVersions(getVersions(generationId));
    }
  }, [generationId, featureType]);

  /**
   * Restaura uma versão específica
   * @param {number} index - Índice da versão
   * @returns {Object|null} Versão restaurada
   */
  const restoreToVersion = useCallback((index) => {
    if (generationId) {
      const version = restoreVersion(generationId, index);
      return version;
    }
    return null;
  }, [generationId]);

  /**
   * Limpa todas as versões de uma geração
   */
  const clearHistory = useCallback(() => {
    if (generationId) {
      clearVersions(generationId);
      setVersions([]);
    }
  }, [generationId]);

  /**
   * Carrega o histórico geral de gerações
   */
  const loadGeneralHistory = useCallback(() => {
    const allHistory = getGenerationHistory();
    // Filtra por tipo se especificado
    const filtered = featureType 
      ? allHistory.filter(h => h.type === featureType)
      : allHistory;
    setHistory(filtered);
    return filtered;
  }, [featureType]);

  /**
   * Define o ID da geração atual (para edição/visualização)
   */
  const setCurrentGeneration = useCallback((id) => {
    setGenerationId(id);
    if (id) {
      setVersions(getVersions(id));
    } else {
      setVersions([]);
    }
  }, []);

  /**
   * Reseta o estado do hook
   */
  const reset = useCallback(() => {
    setGenerationId(null);
    setVersions([]);
  }, []);

  return {
    generationId,
    versions,
    history,
    saveGeneration,
    addNewVersion,
    restoreToVersion,
    clearHistory,
    loadGeneralHistory,
    setCurrentGeneration,
    reset,
    hasVersions: versions.length > 0
  };
};

export default useGenerationHistory;
