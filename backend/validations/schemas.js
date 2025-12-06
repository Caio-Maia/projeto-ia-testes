/**
 * Validation Schemas with Joi
 * 
 * Define schemas de validação para todas as rotas da API.
 * Centraliza a lógica de validação e facilita manutenção.
 */

const Joi = require('joi');

// ============================================
// CONSTANTES DE VALIDAÇÃO
// ============================================

const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'];
const SUPPORTED_MODELS = [
  // OpenAI
  'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo',
  // Legacy/test models
  'gpt-5-nano',
  // Gemini
  'gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash',
  // Future: Claude
  'claude-sonnet-4', 'claude-opus-4', 'claude-3-5-haiku',
];

const FEEDBACK_TYPES = ['positive', 'negative', 'neutral'];
const FEATURES = ['improve-task', 'generate-tests', 'generate-code', 'risk-analysis', 'coverage'];

// ============================================
// SCHEMAS BASE (Reutilizáveis)
// ============================================

const taskSchema = Joi.string()
  .min(10)
  .max(50000)
  .required()
  .messages({
    'string.min': 'A descrição da tarefa deve ter pelo menos 10 caracteres',
    'string.max': 'A descrição da tarefa deve ter no máximo 50000 caracteres',
    'any.required': 'A descrição da tarefa é obrigatória',
  });

const modelSchema = Joi.string()
  .valid(...SUPPORTED_MODELS)
  .default('gpt-4o-mini')
  .messages({
    'any.only': `Modelo inválido. Modelos suportados: ${SUPPORTED_MODELS.join(', ')}`,
  });

const languageSchema = Joi.string()
  .valid(...SUPPORTED_LANGUAGES)
  .default('pt-BR')
  .messages({
    'any.only': `Idioma inválido. Idiomas suportados: ${SUPPORTED_LANGUAGES.join(', ')}`,
  });

// ============================================
// SCHEMAS POR FUNCIONALIDADE
// ============================================

/**
 * Schema para melhorar tarefa (ChatGPT/Gemini)
 */
const improveTaskSchema = Joi.object({
  task: taskSchema,
  data: Joi.string().min(10).max(50000), // Alternativa a 'task'
  model: modelSchema,
  language: languageSchema,
}).or('task', 'data').messages({
  'object.missing': 'É necessário fornecer "task" ou "data"',
});

/**
 * Schema para gerar casos de teste
 */
const generateTestsSchema = Joi.object({
  task: taskSchema,
  data: Joi.string().min(10).max(50000),
  model: modelSchema,
  language: languageSchema,
}).or('task', 'data');

/**
 * Schema para gerar código de teste
 */
const generateTestCodeSchema = Joi.object({
  task: taskSchema,
  data: Joi.string().min(10).max(50000),
  model: modelSchema,
  language: languageSchema,
  framework: Joi.string().max(50).default('jest'),
  programmingLanguage: Joi.string().max(50).default('javascript'),
}).or('task', 'data');

/**
 * Schema para análise de riscos
 */
const analyzeRisksSchema = Joi.object({
  task: taskSchema,
  data: Joi.string().min(10).max(50000),
  model: modelSchema,
  language: languageSchema,
}).or('task', 'data');

/**
 * Schema para feedback
 */
const feedbackSchema = Joi.object({
  type: Joi.string()
    .valid(...FEEDBACK_TYPES)
    .required()
    .messages({
      'any.only': `Tipo inválido. Tipos válidos: ${FEEDBACK_TYPES.join(', ')}`,
      'any.required': 'O tipo de feedback é obrigatório',
    }),
  feature: Joi.string()
    .valid(...FEATURES)
    .required()
    .messages({
      'any.only': `Feature inválida. Features válidas: ${FEATURES.join(', ')}`,
      'any.required': 'A feature é obrigatória',
    }),
  model: modelSchema,
  comment: Joi.string().max(2000).allow('').messages({
    'string.max': 'O comentário deve ter no máximo 2000 caracteres',
  }),
  rating: Joi.number().min(1).max(5).messages({
    'number.min': 'A avaliação deve ser no mínimo 1',
    'number.max': 'A avaliação deve ser no máximo 5',
  }),
  originalContent: Joi.string().max(100000),
  generatedContent: Joi.string().max(100000),
});

/**
 * Schema para regenerar conteúdo
 */
const regenerateContentSchema = Joi.object({
  feature: Joi.string()
    .valid(...FEATURES)
    .required(),
  model: modelSchema,
  originalContent: Joi.string().min(10).max(100000).required(),
  feedback: Joi.string().max(2000),
  language: languageSchema,
});

/**
 * Schema para JIRA
 */
const jiraTaskSchema = Joi.object({
  taskId: Joi.string().required().messages({
    'any.required': 'O ID da tarefa JIRA é obrigatório',
  }),
  baseUrl: Joi.string().uri(),
  email: Joi.string().email(),
  token: Joi.string(),
});

/**
 * Schema para atualizar JIRA
 */
const jiraUpdateSchema = Joi.object({
  taskId: Joi.string().required(),
  content: Joi.string().min(1).required(),
  baseUrl: Joi.string().uri(),
  email: Joi.string().email(),
  token: Joi.string(),
});

/**
 * Schema para arquivo
 */
const fileSchema = Joi.object({
  content: Joi.string().required(),
});

/**
 * Schema para conversação ChatGPT
 */
const conversationSchema = Joi.object({
  systemPrompt: Joi.string().max(10000),
  model: modelSchema,
});

/**
 * Schema para mensagem de conversação
 */
const conversationMessageSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
  message: Joi.string().min(1).max(50000).required(),
});

/**
 * Schema para regenerar com feedback
 */
const regenerateWithFeedbackSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
  feedback: Joi.string().min(1).max(2000).required(),
});

/**
 * Schema para análise de cobertura
 */
const analyzeCoverageSchema = Joi.object({
  requirements: Joi.array().items(Joi.string()).min(1).required(),
  testCases: Joi.array().items(Joi.string()).min(1).required(),
  model: modelSchema,
  language: languageSchema,
});

/**
 * Schema para extrair requisitos
 */
const extractRequirementsSchema = Joi.object({
  content: Joi.string().min(10).max(100000).required(),
  model: modelSchema,
  language: languageSchema,
});

/**
 * Schema para parse de test cases
 */
const parseTestCasesSchema = Joi.object({
  content: Joi.string().min(10).max(100000).required(),
  format: Joi.string().valid('gherkin', 'markdown', 'text').default('text'),
});

// ============================================
// EXPORTAÇÕES
// ============================================

module.exports = {
  // Schemas
  improveTaskSchema,
  generateTestsSchema,
  generateTestCodeSchema,
  analyzeRisksSchema,
  feedbackSchema,
  regenerateContentSchema,
  jiraTaskSchema,
  jiraUpdateSchema,
  fileSchema,
  conversationSchema,
  conversationMessageSchema,
  regenerateWithFeedbackSchema,
  analyzeCoverageSchema,
  extractRequirementsSchema,
  parseTestCasesSchema,
  
  // Constantes (úteis para documentação/frontend)
  SUPPORTED_LANGUAGES,
  SUPPORTED_MODELS,
  FEEDBACK_TYPES,
  FEATURES,
};
