/**
 * Converte Markdown simples (parágrafos e listas) para Atlassian Document Format (ADF)
 * Suporta: parágrafos, listas não ordenadas, listas ordenadas
 */
function markdownToAdf(markdown) {
    const lines = markdown.split('\n');
    const content = [];
    let currentList = null;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            // Lista não ordenada
            if (!currentList || currentList.type !== 'bulletList') {
                if (currentList) content.push(currentList);
                currentList = {
                    type: 'bulletList',
                    content: []
                };
            }
            currentList.content.push({
                type: 'listItem',
                content: [{
                    type: 'paragraph',
                    content: [{
                        type: 'text',
                        text: trimmed.replace(/^[-*] /, '')
                    }]
                }]
            });
        } else if (/^\d+\.\s/.test(trimmed)) {
            // Lista ordenada
            if (!currentList || currentList.type !== 'orderedList') {
                if (currentList) content.push(currentList);
                currentList = {
                    type: 'orderedList',
                    content: []
                };
            }
            currentList.content.push({
                type: 'listItem',
                content: [{
                    type: 'paragraph',
                    content: [{
                        type: 'text',
                        text: trimmed.replace(/^\d+\.\s/, '')
                    }]
                }]
            });
        } else if (trimmed.length > 0) {
            // Parágrafo
            if (currentList) {
                content.push(currentList);
                currentList = null;
            }
            content.push({
                type: 'paragraph',
                content: [{
                    type: 'text',
                    text: trimmed
                }]
            });
        } else {
            // Linha em branco: fecha lista se aberta
            if (currentList) {
                content.push(currentList);
                currentList = null;
            }
        }
    });

    if (currentList) content.push(currentList);

    return {
        version: 1,
        type: 'doc',
        content
    };
}

module.exports = { markdownToAdf };