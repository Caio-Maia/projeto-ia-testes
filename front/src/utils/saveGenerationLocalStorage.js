const saveGenerationToLocalStorage = (generation, type, model, description = '') => {
    let storageKey;
    let typeLabel;
    
    switch (type) {
        case 'task':
            storageKey = 'taskGenerations';
            typeLabel = 'Tarefa';
            break;
        case 'testcase':
            storageKey = 'testGenerations';
            typeLabel = 'Caso de Teste';
            break;
        case 'code':
            storageKey = 'codeGenerations';
            typeLabel = 'Código de Teste';
            break;
        case 'risk':
            storageKey = 'riskGenerations';
            typeLabel = 'Análise de Riscos';
            break;
        default:
            storageKey = 'otherGenerations';
            typeLabel = 'Outro';
    }
    
    const existingGenerations = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    const generationId = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newGeneration = {
        id: existingGenerations.length + 1,
        generationId,
        type: typeLabel,
        model,
        generation,
        description,
        date: new Date().toLocaleString(),
    };

    existingGenerations.push(newGeneration);
    localStorage.setItem(storageKey, JSON.stringify(existingGenerations));
    
    // Return the generationId for use with the feedback system
    return generationId;
};

module.exports = { saveGenerationToLocalStorage };