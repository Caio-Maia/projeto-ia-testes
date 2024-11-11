import axios from 'axios';

export const getPrompt = async (fileName) => {
    try {
        const response = await axios.get(`http://localhost:5000/api/files/${fileName}`);
        return response.data.prompt;
    } catch (error) {
        console.error('Erro ao buscar o prompt do backend:', error);
        return '';
    }
};