const normalizeGenerationType = (type) => {
    const typeStr = String(type || '').toLowerCase().trim();

    if (
        typeStr === 'task' ||
        typeStr === 'tarefa' ||
        typeStr === 'tasks' ||
        typeStr === 'improve-task'
    ) {
        return { storageKey: 'taskGenerations', typeLabel: 'task', typePrefix: 'task' };
    }

    if (
        typeStr === 'test' ||
        typeStr === 'teste' ||
        typeStr === 'tests' ||
        typeStr === 'testcase' ||
        typeStr === 'test-case' ||
        typeStr === 'generate-tests'
    ) {
        return { storageKey: 'testGenerations', typeLabel: 'testCase', typePrefix: 'test' };
    }

    if (
        typeStr === 'code' ||
        typeStr === 'codigo' ||
        typeStr === 'código' ||
        typeStr === 'generate-code' ||
        typeStr === 'generate-test-code'
    ) {
        return { storageKey: 'codeGenerations', typeLabel: 'testCode', typePrefix: 'code' };
    }

    if (
        typeStr === 'risk' ||
        typeStr === 'risco' ||
        typeStr === 'risks' ||
        typeStr === 'risk-analysis' ||
        typeStr === 'analyze-risks'
    ) {
        return { storageKey: 'riskGenerations', typeLabel: 'riskAnalysis', typePrefix: 'risk' };
    }

    return { storageKey: 'otherGenerations', typeLabel: 'other', typePrefix: 'other' };
};

const saveGenerationToLocalStorage = (generation, type, model, description = '') => {
    const { storageKey, typeLabel, typePrefix } = normalizeGenerationType(type);
    
    const existingGenerations = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    const generationId = `${typePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newGeneration = {
        id: existingGenerations.length + 1,
        generationId,
        type: typeLabel,
        model,
        generation,
        description,
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleString(),
    };

    existingGenerations.push(newGeneration);
    localStorage.setItem(storageKey, JSON.stringify(existingGenerations));
    
    // Return the generationId for use with the feedback system
    return generationId;
};

module.exports = { saveGenerationToLocalStorage };