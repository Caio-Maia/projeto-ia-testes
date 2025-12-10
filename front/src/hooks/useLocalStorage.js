import { useState, useCallback, useEffect } from 'react';

/**
 * Custom Hook para gerenciar valores no localStorage
 * 
 * @param {string} key - Chave do localStorage
 * @param {*} initialValue - Valor inicial
 * @returns {Array} [value, setValue, removeValue]
 * 
 * @example
 * const [token, setToken, removeToken] = useLocalStorage('chatgptToken', '');
 * const [settings, setSettings] = useLocalStorage('appSettings', { theme: 'light' });
 */
export const useLocalStorage = (key, initialValue) => {
  // Função para obter valor inicial
  const getStoredValue = useCallback(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return initialValue;
      
      // Tenta fazer parse JSON, se falhar retorna string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error(`useLocalStorage: Error reading key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(getStoredValue);

  /**
   * Atualiza o valor no state e no localStorage
   */
  const setValue = useCallback((value) => {
    try {
      // Permite função para valor baseado no anterior
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Salva no localStorage
      if (valueToStore === undefined || valueToStore === null) {
        localStorage.removeItem(key);
      } else {
        const stringValue = typeof valueToStore === 'string' 
          ? valueToStore 
          : JSON.stringify(valueToStore);
        localStorage.setItem(key, stringValue);
      }
    } catch (error) {
      console.error(`useLocalStorage: Error setting key "${key}":`, error);
    }
  }, [key, storedValue]);

  /**
   * Remove o valor do localStorage
   */
  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`useLocalStorage: Error removing key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sincroniza com outras tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          setStoredValue(e.newValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook para gerenciar modo educacional
 */
export const useEducationMode = () => {
  const [educationMode, setEducationMode] = useLocalStorage('educationMode', false);
  
  const toggleEducationMode = useCallback(() => {
    setEducationMode(prev => !prev);
  }, [setEducationMode]);

  return { educationMode, setEducationMode, toggleEducationMode };
};

/**
 * Hook para gerenciar tokens de API
 */
export const useApiToken = (provider) => {
  const [token, setToken, removeToken] = useLocalStorage(`${provider}Token`, '');
  
  const hasToken = Boolean(token);

  return { token, setToken, removeToken, hasToken };
};

export default useLocalStorage;
