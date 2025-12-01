import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPromptByLanguage } from '../utils/getPromptByLanguage';

export const usePrompt = (fileName) => {
  const { language } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        setLoading(true);
        const promptContent = await getPromptByLanguage(fileName, language);
        setPrompt(promptContent);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar prompt:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [fileName, language]);

  return { prompt, loading, error };
};
