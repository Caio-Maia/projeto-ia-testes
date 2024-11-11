const fs = require('fs');
const path = require('path');

// Função para ler o conteúdo de um arquivo
const getFileContent = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, `../models/${filename}.md`);

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    // Lê o conteúdo do arquivo
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao ler o arquivo', error: err });
        }
        res.status(200).json({ content: data });
    });
};

// Função para atualizar o conteúdo de um arquivo
const updateFileContent = (req, res) => {
    const { filename } = req.params;
    const { content } = req.body;  // O conteúdo que será escrito no arquivo
    const filePath = path.join(__dirname, `../models/${filename}.md`);

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    // Escreve o conteúdo no arquivo
    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao atualizar o arquivo', error: err });
        }
        res.status(200).json({ message: 'Arquivo atualizado com sucesso' });
    });
};

module.exports = { getFileContent, updateFileContent };