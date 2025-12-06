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
      `Generate ${language} test code using the ${framework} framework for the following test cases:\n\n${testCases}\n\nPlease provide complete, runnable test code with proper setup and teardown if needed.`;
    
    return this._makeRequest(prompt);
  }

  async analyzeRisks(feature, options = {}) {
    const prompt = options.prompt || 
      `Analyze the following feature and identify potential implementation risks, quality concerns, and possible bugs:\n\n${feature}\n\nProvide a detailed analysis with specific risks categorized by severity (High, Medium, Low) and include recommendations for mitigation.`;
    
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