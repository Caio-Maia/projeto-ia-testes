const axios = require('axios');
const AIModel = require('./aiModel');

class GeminiModel extends AIModel {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.5-flash-lite';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async _makeRequest(prompt) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );

      if (!response.data.candidates || 
          !response.data.candidates[0] || 
          !response.data.candidates[0].content || 
          !response.data.candidates[0].content.parts[0].text) {
        throw new Error('Invalid response from Gemini API');
      }

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Error making request to Gemini API: ${error.message}`);
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
    const prompt = `Você é um especialista em Qualidade de Software e Análise de Cobertura de Testes.

Analise a cobertura de testes do seguinte projeto:

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

RETORNE APENAS um JSON válido (sem markdown, sem texto adicional) com esta estrutura:
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
      const response = await axios.post(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        }
      );

      if (!response.data.candidates || 
          !response.data.candidates[0] || 
          !response.data.candidates[0].content || 
          !response.data.candidates[0].content.parts[0].text) {
        throw new Error('Invalid response from Gemini API');
      }

      const content = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('Gemini Coverage Analysis error:', error);
      throw new Error(`Error analyzing coverage with Gemini: ${error.message}`);
    }
  }
}

module.exports = GeminiModel;