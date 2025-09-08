
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Já existente
const getTaskJira = async (req, res) => {
    const { jiraTaskCode, jiraToken, jiraEmail, jiraBaseUrl } = req.body;

    if (!jiraToken || !jiraEmail || !jiraBaseUrl) {
        return res.status(400).json({ error: 'Missing Jira credentials' });
    }

    try {
        const response = await axios.get(
            `${jiraBaseUrl}/rest/api/3/issue/${jiraTaskCode}`,
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')}`,
                    'Accept': 'application/json'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar descrição no JIRA', details: error.message });
    }
};

// NOVO: Atualizar descrição do cartão JIRA
const updateTaskJira = async (req, res) => {
    const { jiraTaskCode, jiraToken, jiraEmail, jiraBaseUrl, newDescription } = req.body;

    if (!jiraToken || !jiraEmail || !jiraBaseUrl || !jiraTaskCode || !newDescription) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // O Jira Cloud API v3 espera o campo description em formato Atlassian Document Format (ADF)
        // Para simplicidade, vamos enviar como texto simples (plain text)
        const updatePayload = {
            fields: {
                description: {
                    type: "doc",
                    version: 1,
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    text: newDescription
                                }
                            ]
                        }
                    ]
                }
            }
        };

        const response = await axios.put(
            `${jiraBaseUrl}/rest/api/3/issue/${jiraTaskCode}`,
            updatePayload,
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );
        res.json({ success: true, message: 'Cartão JIRA atualizado com sucesso!' });
    } catch (error) {
        let details = error.message;
        if (error.response && error.response.data) {
            details = error.response.data;
        }
        res.status(500).json({ error: 'Erro ao atualizar cartão no JIRA', details });
    }
};

module.exports = {
    getTaskJira,
    updateTaskJira
};
