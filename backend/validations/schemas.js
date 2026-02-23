/**
 * Validation Schemas with Joi
 * 
 * Define schemas de validação para todas as rotas da API.
 * Centraliza a lógica de validação e facilita manutenção.
 */

const Joi = require('joi');
const aiModelsConfig = require('../config/aiModels');

// ============================================
// CONSTANTES DE VALIDAÇÃO
// ============================================

const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'];

// Extrai modelos suportados do config de AI
const SUPPORTED_MODELS = [
  // OpenAI/ChatGPT models (do config)
  ...aiModelsConfig.chatgpt.versions.map(v => v.id),
  // Gemini models (do config)
  ...aiModelsConfig.gemini.versions.map(v => v.id),
  // Claude (futuro - quando adicionado ao config, será automático)
  ...aiModelsConfig.claude.versions.map(v => v.id),
];

// Encontra o modelo default
const getDefaultModel = () => {
  const chatgptDefault = aiModelsConfig.chatgpt.versions.find(v => v.isDefault);
  return chatgptDefault?.id || 'gpt-5-nano';
};

const FEEDBACK_TYPES = ['task', 'testcase', 'code', 'risk'];
const FEEDBACK_RATINGS = ['positive', 'negative'];
const FEATURES = ['improve-task', 'generate-tests', 'generate-code', 'risk-analysis', 'coverage'];

// ============================================
// SCHEMAS BASE (Reutilizáveis)
// ============================================

// Task schema base (sem required - o required é controlado pelo .or())
const taskSchemaBase = Joi.string()
  .min(10)
  .max(50000)
  .messages({
    'string.min': 'A descrição da tarefa deve ter pelo menos 10 caracteres',
    'string.max': 'A descrição da tarefa deve ter no máximo 50000 caracteres',
    'any.required': 'A descrição da tarefa é obrigatória',
  });

// Data schema (alternativa a task)
const dataSchemaBase = Joi.string()
  .min(10)
  .max(50000)
  .messages({
    'string.min': 'O campo data deve ter pelo menos 10 caracteres',
    'string.max': 'O campo data deve ter no máximo 50000 caracteres',
  });

const modelSchema = Joi.string()
  .valid(...SUPPORTED_MODELS)
  .default(getDefaultModel())
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
  task: taskSchemaBase,
  data: dataSchemaBase,
  model: modelSchema,
  language: languageSchema,
  educationMode: Joi.boolean().default(false),
}).or('task', 'data').messages({
  'object.missing': 'É necessário fornecer "task" ou "data"',
});

/**
 * Schema para gerar casos de teste
 */
const generateTestsSchema = Joi.object({
  task: taskSchemaBase,
  data: dataSchemaBase,
  model: modelSchema,
  language: languageSchema,
  educationMode: Joi.boolean().default(false),
}).or('task', 'data').messages({
  'object.missing': 'É necessário fornecer "task" ou "data"',
});

/**
 * Schema para gerar código de teste
 */
const generateTestCodeSchema = Joi.object({
  task: taskSchemaBase,
  data: dataSchemaBase,
  model: modelSchema,
  language: languageSchema,
  framework: Joi.string().max(50).default('jest'),
  programmingLanguage: Joi.string().max(50).default('javascript'),
  educationMode: Joi.boolean().default(false),
}).or('task', 'data').messages({
  'object.missing': 'É necessário fornecer "task" ou "data"',
});

/**
 * Schema para análise de riscos
 */
const analyzeRisksSchema = Joi.object({
  task: taskSchemaBase,
  data: dataSchemaBase,
  model: modelSchema,
  language: languageSchema,
  educationMode: Joi.boolean().default(false),
}).or('task', 'data').messages({
  'object.missing': 'É necessário fornecer "task" ou "data"',
});

/**
 * Schema para feedback
 */
const feedbackSchema = Joi.object({
  generationId: Joi.string()
    .min(1)
    .required()
    .messages({
      'any.required': 'O ID da geração é obrigatório',
      'string.empty': 'O ID da geração é obrigatório',
    }),
  type: Joi.string()
    .valid(...FEEDBACK_TYPES)
    .required()
    .messages({
      'any.only': `Tipo inválido. Tipos válidos: ${FEEDBACK_TYPES.join(', ')}`,
      'any.required': 'O tipo de feedback é obrigatório',
    }),
  rating: Joi.string()
    .valid(...FEEDBACK_RATINGS)
    .required()
    .messages({
      'any.only': `Avaliação inválida. Avaliações válidas: ${FEEDBACK_RATINGS.join(', ')}`,
      'any.required': 'A avaliação é obrigatória',
    }),
  comment: Joi.string().max(2000).allow('').messages({
    'string.max': 'O comentário deve ter no máximo 2000 caracteres',
  }),
  originalContent: Joi.string().max(100000),
  conversationHistory: Joi.array()
    .items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant', 'system').required(),
        content: Joi.string().required(),
      })
    )
    .default([]),
});

/**
 * Schema para regenerar conteúdo
 */
const regenerateContentSchema = Joi.object({
  feedbackId: Joi.alternatives()
    .try(
      Joi.number().integer().positive(),
      Joi.string().min(1)
    )
    .required()
    .messages({
      'any.required': 'O ID do feedback é obrigatório',
    }),
  model: Joi.alternatives()
    .try(
      Joi.string().valid('chatgpt', 'gemini'),
      Joi.object({
        apiName: Joi.string().valid('chatgpt', 'gemini').required(),
        version: modelSchema,
      })
    )
    .required()
    .messages({
      'any.required': 'O modelo é obrigatório',
    }),
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
