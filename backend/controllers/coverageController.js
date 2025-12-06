const axios = require('axios');

// Helpers para chamadas de API
const callOpenAI = async (model, messages) => {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model,
    messages,
    response_format: { type: 'json_object' }
  }, {
    headers: { Authorization: `Bearer ${process.env.CHATGPT_API_KEY}` }
  });
  return JSON.parse(response.data.choices[0].message.content);
};

const callGemini = async (model, prompt, token) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${token}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    }
  );
  if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Resposta inválida do Gemini');
  }
  return JSON.parse(response.data.candidates[0].content.parts[0].text);
};

const getModelVersion = (model, defaultChatGPT = 'gpt-4o-mini', defaultGemini = 'gemini-2.5-flash-lite') => {
  if (model === 'chatgpt') return { type: 'chatgpt', version: defaultChatGPT };
  if (model?.startsWith('gpt-')) return { type: 'chatgpt', version: model };
  if (model === 'gemini') return { type: 'gemini', version: defaultGemini };
  if (model?.startsWith('gemini-')) return { type: 'gemini', version: model };
  return null;
};

const handleApiError = (error, res, defaultMessage) => {
  console.error(defaultMessage + ':', error);
  if (error.response?.status === 401) return res.status(401).json({ error: 'API key inválida ou expirada' });
  if (error.response?.status === 429) return res.status(429).json({ error: 'Limite de requisições excedido. Tente novamente mais tarde.' });
  if (error instanceof SyntaxError) return res.status(500).json({ error: 'Erro ao processar resposta da IA. JSON inválido.' });
  res.status(500).json({ error: defaultMessage, details: error.message });
};

/**
 * Analyze test coverage using AI
 */
const analyzeCoverage = async (req, res) => {
  const { requirements, testCases, model } = req.body;
  const token = req.query.token;

  // Validation
  if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
    return res.status(400).json({ 
      error: 'Requirements array is required and must not be empty' 
    });
  }

  if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({ 
      error: 'Test cases array is required and must not be empty' 
    });
  }

  const systemPrompt = `Você é um especialista em Qualidade de Software e Análise de Cobertura de Testes.
Sua função é:
1. Analisar requisitos versus casos de teste
2. Calcular percentuais de cobertura por requisito
3. Identificar gaps (requisitos sem testes)
4. Gerar recomendações acionáveis e priorizadas
5. Sugerir novos testes para melhorar cobertura

IMPORTANTE: Retorne APENAS um JSON válido, sem texto adicional, sem markdown code blocks.`;

  const analysisPrompt = `Analise a cobertura de testes do seguinte projeto:

REQUISITOS:
${JSON.stringify(requirements, null, 2)}

CASOS DE TESTE:
${JSON.stringify(testCases, null, 2)}

INSTRUÇÕES:
1. Para cada requisito, identifique os casos de teste associados (por palavras-chave, contexto, IDs)
2. Calcule o percentual de cobertura por requisito (0-100%)
3. Identifique requisitos sem testes (cobertura 0%)
4. Identifique requisitos com cobertura parcial (<80%)
5. Gere recomendações priorizadas por severidade (high/medium/low)
6. Sugira 2-3 novos testes para cada requisito não coberto ou com baixa cobertura
7. Use cores para heatmap: #4ade80 (>=80%), #fbbf24 (50-79%), #f97316 (20-49%), #ef4444 (<20%)

RETORNE um JSON com esta estrutura exata:
{
  "analysis": {
    "totalRequirements": number,
    "coveredRequirements": number,
    "notCoveredRequirements": number,
    "coveragePercentage": number,
    "totalTests": number,
    "passedTests": number,
    "failedTests": number,
    "pendingTests": number,
    "testSuccessRate": number
  },
  "traceabilityMatrix": [
    {
      "requirementId": "string",
      "requirementTitle": "string",
      "priority": "high|medium|low",
      "associatedTestCases": ["TC-001"],
      "testCount": number,
      "passedCount": number,
      "coveragePercentage": number,
      "coverage_status": "FULLY_COVERED|PARTIALLY_COVERED|NOT_COVERED"
    }
  ],
  "recommendations": [
    {
      "id": "REC-001",
      "type": "missing_tests|low_coverage|failing_tests|test_quality",
      "severity": "high|medium|low",
      "requirement_id": "string",
      "message": "string",
      "suggested_tests": ["string"],
      "priority_to_implement": "immediate|high|medium|low"
    }
  ],
  "coverageHeatmap": [
    { "requirementId": "string", "coverage": number, "color": "#hex" }
  ],
  "testMetrics": {
    "averageCoverage": number,
    "medianCoverage": number,
    "requirementsWithFullCoverage": number,
    "requirementsWithPartialCoverage": number,
    "requirementsWithNoCoverage": number
  }
}`;

  try {
    const modelInfo = getModelVersion(model);
    if (!modelInfo) {
      return res.status(400).json({ 
        error: 'Invalid model specified. Use "chatgpt", "gemini", or specific model version.' 
      });
    }

    let coverageAnalysis;
    const addMetadata = (analysis, modelVersion) => ({
      ...analysis,
      report_metadata: {
        generated_at: new Date().toISOString(),
        analysis_model: modelVersion,
        analysis_version: '1.0',
        source_requirements_count: requirements.length,
        source_tests_count: testCases.length
      }
    });

    if (modelInfo.type === 'chatgpt') {
      coverageAnalysis = await callOpenAI(modelInfo.version, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ]);
      res.json(addMetadata(coverageAnalysis, modelInfo.version));

    } else {
      if (!token) return res.status(401).json({ error: 'Token não fornecido para Gemini' });
      coverageAnalysis = await callGemini(modelInfo.version, `${systemPrompt}\n\n${analysisPrompt}`, token);
      res.json({ data: addMetadata(coverageAnalysis, modelInfo.version) });
    }

  } catch (error) {
    handleApiError(error, res, 'Erro ao analisar cobertura de testes');
  }
};


/**
 * Extract requirements from a task description using AI
 */
const extractRequirements = async (req, res) => {
  const { taskDescription, model } = req.body;
  const token = req.query.token;

  if (!taskDescription) {
    return res.status(400).json({ error: 'Task description is required' });
  }

  const prompt = `Extraia os requisitos funcionais da seguinte descrição de tarefa.
Para cada requisito, identifique:
- ID único (REQ-001, REQ-002, etc.)
- Título curto
- Descrição detalhada
- Prioridade (high, medium, low) baseado na importância para o usuário

TAREFA:
${taskDescription}

RETORNE um JSON com esta estrutura:
{
  "requirements": [
    {
      "id": "REQ-001",
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "acceptanceCriteria": ["string"]
    }
  ]
}`;

  try {
    const modelInfo = getModelVersion(model);
    if (!modelInfo) return res.status(400).json({ error: 'Invalid model specified' });

    if (modelInfo.type === 'chatgpt') {
      const result = await callOpenAI(modelInfo.version, [{ role: 'user', content: prompt }]);
      res.json(result);
    } else {
      if (!token) return res.status(401).json({ error: 'Token não fornecido para Gemini' });
      const result = await callGemini(modelInfo.version, prompt, token);
      res.json({ data: result });
    }
  } catch (error) {
    handleApiError(error, res, 'Erro ao extrair requisitos');
  }
};

/**
 * Parse test cases from markdown/text format to structured array
 */
const parseTestCases = async (req, res) => {
  const { testCasesText, model } = req.body;
  const token = req.query.token;

  if (!testCasesText) {
    return res.status(400).json({ error: 'Test cases text is required' });
  }

  const prompt = `Converta os seguintes casos de teste de texto/markdown para um formato JSON estruturado.
Para cada caso de teste, extraia:
- ID (TC-001, etc.)
- Título
- Passos (array de strings)
- Dados de teste
- Resultado esperado
- Status (passed, failed, pending) - use "pending" se não especificado

CASOS DE TESTE:
${testCasesText}

RETORNE um JSON com esta estrutura:
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "string",
      "steps": ["string"],
      "testData": "string",
      "expectedResult": "string",
      "status": "passed|failed|pending"
    }
  ]
}`;

  try {
    const modelInfo = getModelVersion(model);
    if (!modelInfo) return res.status(400).json({ error: 'Invalid model specified' });

    if (modelInfo.type === 'chatgpt') {
      const result = await callOpenAI(modelInfo.version, [{ role: 'user', content: prompt }]);
      res.json(result);
    } else {
      if (!token) return res.status(401).json({ error: 'Token não fornecido para Gemini' });
      const result = await callGemini(modelInfo.version, prompt, token);
      res.json({ data: result });
    }
  } catch (error) {
    handleApiError(error, res, 'Erro ao processar casos de teste');
  }
};

module.exports = { analyzeCoverage, extractRequirements, parseTestCases };
