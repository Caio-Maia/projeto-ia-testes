import axios from 'axios';
import translations from '../locales/translations';

export const getPromptByLanguage = async (fileName, language = 'pt-BR') => {
    try {
        // Primeiro, tenta buscar do backend
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        const response = await axios.get(`${backendUrl}/api/files/${fileName}?language=${language}`);
        return response.data.prompt || response.data.content;
    } catch (error) {
        console.warn('Erro ao buscar o prompt do backend, usando tradução local:', error);
        
        // Se falhar, tenta usar a tradução local
        const promptKey = `prompts.${fileName}`;
        const keys = promptKey.split('.');
        let value = translations[language];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return ''; // Retornar vazio se não encontrar
            }
        }
        
        return value || '';
    }
};

export const getPrompt = async (fileName) => {
    // Manter compatibilidade com a função antiga
    return getPromptByLanguage(fileName, 'pt-BR');
};
