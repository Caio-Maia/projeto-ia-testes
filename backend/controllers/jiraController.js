const axios = require('axios');

// Helper para criar header de autenticação Jira
const getJiraAuth = (email, token) => ({
    'Authorization': `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
    'Accept': 'application/json'
});

const getTaskJira = async (req, res) => {
    const { jiraTaskCode, jiraToken, jiraEmail, jiraBaseUrl } = req.body;

    if (!jiraToken || !jiraEmail || !jiraBaseUrl) {
        return res.status(400).json({ error: 'Missing Jira credentials' });
    }

    try {
        const response = await axios.get(
            `${jiraBaseUrl}/rest/api/3/issue/${jiraTaskCode}`,
            { headers: getJiraAuth(jiraEmail, jiraToken) }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar descrição no JIRA', details: error.message });
    }
};

const updateTaskJira = async (req, res) => {
    const { jiraTaskCode, jiraToken, jiraEmail, jiraBaseUrl, newDescription } = req.body;

    if (!jiraToken || !jiraEmail || !jiraBaseUrl || !jiraTaskCode || !newDescription) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const updatePayload = {
            fields: {
                description: {
                    type: "doc",
                    version: 1,
                    content: [{
                        type: "paragraph",
                        content: [{ type: "text", text: newDescription }]
                    }]
                }
            }
        };

        await axios.put(
            `${jiraBaseUrl}/rest/api/3/issue/${jiraTaskCode}`,
            updatePayload,
            { headers: { ...getJiraAuth(jiraEmail, jiraToken), 'Content-Type': 'application/json' } }
        );
        res.json({ success: true, message: 'Cartão JIRA atualizado com sucesso!' });
    } catch (error) {
        const details = error.response?.data || error.message;
        res.status(500).json({ error: 'Erro ao atualizar cartão no JIRA', details });
    }
};

module.exports = { getTaskJira, updateTaskJira };
