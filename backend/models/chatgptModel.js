const axios = require('axios');
const AIModel = require('./aiModel');

class ChatGPTModel extends AIModel {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-5-nano';
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async _makeRequest(prompt) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('ChatGPT API error:', error);
      throw new Error(`Error making request to ChatGPT API: ${error.message}`);
    }
  }

  async improveTask(task, options = {}) {
    const prompt = options.prompt || task;
    return this._makeRequest(prompt);
  }

  async generateTests(task, options = {}) {
    const prompt = options.prompt || `Crie casos de teste para: ${task}`;
    return this._makeRequest(prompt);
  }

  async generateTestCode(testCases, framework, language = 'JavaScript', options = {}) {
    const prompt = options.prompt || 
      [
        `Gere código de testes automatizados em ${language} usando o framework ${framework}.`,
        'Retorne apenas código executável em blocos markdown.',
        'Inclua imports, setup e mocks mínimos quando necessário.',
        'Priorize testes independentes, legíveis e robustos.',
        '',
        'Casos de teste de entrada:',
        testCases,
      ].join('\n');
    
    return this._makeRequest(prompt);
  }

  async analyzeRisks(feature, options = {}) {
    const prompt = options.prompt || 
      [
        'Você é um especialista em Engenharia de Software, QA e Arquitetura.',
        'Analise os riscos de implementação da funcionalidade abaixo.',
        'Classifique por severidade (ALTO, MÉDIO, BAIXO), descreva impacto, probabilidade e mitigação.',
        'Inclua riscos técnicos, de negócio, segurança, performance, dados, integração, testes e observabilidade.',
        'No final, traga uma lista priorizada de ações práticas (quick wins e ações estruturais).',
        '',
        'Formato de saída (markdown):',
        '1) Resumo executivo',
        '2) Tabela de riscos (Risco | Severidade | Probabilidade | Impacto | Mitigação)',
        '3) Plano de ação priorizado',
        '',
        'Descrição da funcionalidade:',
        feature,
      ].join('\n');
    
    return this._makeRequest(prompt);
  }

  async analyzeCoverage(requirements, testCases, options = {}) {
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
1. Para cada requisito, identifique os casos de teste associados (por palavras-chave, contexto)
2. Calcule o percentual de cobertura por requisito
3. Identifique requisitos sem testes (cobertura 0%)
4. Identifique requisitos com cobertura parcial (<80%)
5. Gere recomendações priorizadas por severidade (high/medium/low)
6. Sugira 2-3 novos testes para cada requisito não coberto ou com baixa cobertura

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
      "requirement_id": "string (optional)",
      "message": "string",
      "suggested_tests": ["string"] (optional),
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
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: analysisPrompt }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );
      
      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('ChatGPT Coverage Analysis error:', error);
      throw new Error(`Error analyzing coverage with ChatGPT: ${error.message}`);
    }
  }
}

module.exports = ChatGPTModel;