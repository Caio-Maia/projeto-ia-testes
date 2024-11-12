import axios from 'axios';

export const getPrompt = async (fileName) => {
    try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        const response = await axios.get(`${backendUrl}/api/files/${fileName}`);
        return response.data.prompt;
    } catch (error) {
        console.error('Erro ao buscar o prompt do backend:', error);
        return '';
    }
};