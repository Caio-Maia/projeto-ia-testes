const saveGenerationToLocalStorage = (generation, type, model) => {
    const storageKey = type === 'task' ? 'taskGenerations' : 'testGenerations';
    const existingGenerations = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    const newGeneration = {
        id: existingGenerations.length + 1,
        type: type === 'task' ? 'Tarefa ' : 'Caso de Teste',
        model: model,
        generation,
        date: new Date().toLocaleString(),
    };

    existingGenerations.push(newGeneration);
    localStorage.setItem(storageKey, JSON.stringify(existingGenerations));
};

module.exports = { saveGenerationToLocalStorage };