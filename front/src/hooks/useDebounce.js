/**
 * useDebounce Hook
 * 
 * Hook para debounce de valores e callbacks.
 * Usa a biblioteca use-debounce internamente.
 * 
 * @example
 * // Debounce de valor
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebouncedValue(searchTerm, 300);
 * 
 * // Debounce de callback
 * const handleSearch = useDebouncedCallback((value) => {
 *   api.search(value);
 * }, 300);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback as useDebounceLib } from 'use-debounce';

/**
 * Hook para debounce de um valor
 * @param {any} value - Valor a ser "debounced"
 * @param {number} delay - Delay em ms (padrão: 300ms)
 * @returns {any} Valor com debounce aplicado
 */
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para debounce de callback
 * Re-exporta useDebouncedCallback da use-debounce
 * @param {Function} callback - Função a ser "debounced"
 * @param {number} delay - Delay em ms
 * @param {Object} options - Opções adicionais
 * @returns {Function} Callback com debounce
 */
export const useDebouncedCallback = useDebounceLib;

/**
 * Hook para debounce de input controlado
 * Retorna valor imediato e valor com debounce
 * @param {string} initialValue - Valor inicial
 * @param {number} delay - Delay em ms
 * @returns {Object} { value, debouncedValue, setValue, setValueImmediate }
 */
export const useDebouncedInput = (initialValue = '', delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(value, delay);

  const setValueImmediate = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  return {
    value,
    debouncedValue,
    setValue: setValueImmediate,
    setValueImmediate,
  };
};

/**
 * Hook para throttle de callback
 * Limita a frequência de execução
 * @param {Function} callback - Função a ser "throttled"
 * @param {number} delay - Intervalo mínimo em ms
 * @returns {Function} Callback com throttle
 */
export const useThrottledCallback = (callback, delay = 300) => {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastRan = now - lastRan.current;

    if (timeSinceLastRan >= delay) {
      callback(...args);
      lastRan.current = now;
    } else {
      // Schedule for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRan.current = Date.now();
      }, delay - timeSinceLastRan);
    }
  }, [callback, delay]);
};

export default useDebouncedValue;
