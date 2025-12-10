import { useState, useCallback } from 'react';
import axios from 'axios';
import { parseError, logError } from '../utils/errorHandler';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

/**
 * Custom Hook para integração com JIRA
 * 
 * Abstrai a lógica de:
 * - Buscar tarefas do JIRA
 * - Atualizar tarefas no JIRA
 * - Gerenciamento de credenciais
 * 
 * @returns {Object} { task, loading, error, fetchTask, updateTask, isConfigured }
 * 
 * @example
 * const { task, loading, error, fetchTask, updateTask, isConfigured } = useJira();
 * 
 * if (!isConfigured) {
 *   // Mostrar aviso para configurar JIRA
 * }
 * 
 * const jiraTask = await fetchTask('PROJ-123');
 * await updateTask('PROJ-123', 'Novo conteúdo da descrição');
 */
export const useJira = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Verifica se o JIRA está configurado
   */
  const isConfigured = useCallback(() => {
    const token = localStorage.getItem('jiraToken');
    const email = localStorage.getItem('jiraEmail');
    const baseUrl = localStorage.getItem('jiraBaseUrl');
    return !!(token && email && baseUrl);
  }, []);

  /**
   * Obtém as credenciais do JIRA do localStorage
   */
  const getCredentials = useCallback(() => {
    return {
      jiraToken: localStorage.getItem('jiraToken'),
      jiraEmail: localStorage.getItem('jiraEmail'),
      jiraBaseUrl: localStorage.getItem('jiraBaseUrl')
    };
  }, []);

  /**
   * Busca uma tarefa do JIRA
   * @param {string} taskCode - Código da tarefa (ex: 'PROJ-123')
   * @returns {Object|null} Dados da tarefa ou null em caso de erro
   */
  const fetchTask = useCallback(async (taskCode) => {
    if (!taskCode) {
      setError('Código da tarefa não informado');
      return null;
    }

    if (!isConfigured()) {
      setError('JIRA não configurado. Verifique suas credenciais.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const credentials = getCredentials();
      
      const response = await axios.post(`${BACKEND_URL}/api/jira-task`, {
        jiraTaskCode: taskCode,
        ...credentials
      });

      const fields = response.data.fields;
      
      // Extrai descrição de diferentes formatos
      let description = '';
      if (fields.description) {
        if (typeof fields.description === 'string') {
          description = fields.description;
        } else if (fields.description.content?.[0]?.content?.[0]?.text) {
          description = fields.description.content[0].content[0].text;
        }
      }

      const taskData = {
        key: response.data.key,
        summary: fields.summary,
        description,
        fullDescription: `Titulo: ${fields.summary}\n\nDescrição: ${description}`,
        status: fields.status?.name,
        priority: fields.priority?.name,
        assignee: fields.assignee?.displayName,
        raw: response.data
      };

      setTask(taskData);
      return taskData;
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      logError('useJira fetchTask', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isConfigured, getCredentials]);

  /**
   * Atualiza uma tarefa no JIRA
   * @param {string} taskCode - Código da tarefa
   * @param {string} content - Novo conteúdo
   * @returns {boolean} Sucesso da operação
   */
  const updateTask = useCallback(async (taskCode, content) => {
    if (!taskCode || !content) {
      setError('Código da tarefa e conteúdo são obrigatórios');
      return false;
    }

    if (!isConfigured()) {
      setError('JIRA não configurado. Verifique suas credenciais.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const credentials = getCredentials();

      await axios.post(`${BACKEND_URL}/api/jira-task/update`, {
        taskId: taskCode,
        content,
        ...credentials
      });

      return true;
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      logError('useJira updateTask', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isConfigured, getCredentials]);

  /**
   * Reseta o estado do hook
   */
  const reset = useCallback(() => {
    setTask(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    task,
    loading,
    error,
    fetchTask,
    updateTask,
    isConfigured: isConfigured(),
    reset,
    setError
  };
};

export default useJira;
