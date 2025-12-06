/**
 * Validation Middleware
 * 
 * Middleware para validar requisições usando schemas Joi.
 * Retorna erros formatados em caso de validação falha.
 */

const { validationError } = require('../utils/logger');

/**
 * Cria middleware de validação para um schema Joi
 * 
 * @param {Joi.Schema} schema - Schema Joi para validação
 * @param {Object} options - Opções de validação
 * @param {string} options.source - Fonte dos dados ('body', 'query', 'params')
 * @returns {Function} Express middleware
 * 
 * @example
 * const { improveTaskSchema } = require('../validations/schemas');
 * router.post('/improve-task', validate(improveTaskSchema), controller);
 */
const validate = (schema, options = {}) => {
  const { source = 'body' } = options;

  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Retorna todos os erros, não só o primeiro
      stripUnknown: true, // Remove campos não definidos no schema
      convert: true, // Converte tipos automaticamente
    });

    if (error) {
      // Formata erros para resposta
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      // Log da validação falha
      validationError(req.path, errors);

      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors,
      });
    }

    // Substitui dados originais pelos validados/convertidos
    req[source] = value;
    next();
  };
};

/**
 * Valida múltiplas fontes de dados
 * 
 * @param {Object} schemas - Objeto com schemas por fonte
 * @returns {Function} Express middleware
 * 
 * @example
 * validateMultiple({
 *   body: bodySchema,
 *   params: paramsSchema,
 *   query: querySchema,
 * })
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const allErrors = [];

    for (const [source, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          source,
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        }));
        allErrors.push(...errors);
      } else {
        req[source] = value;
      }
    }

    if (allErrors.length > 0) {
      validationError(req.path, allErrors);

      return res.status(400).json({
        error: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: allErrors,
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateMultiple,
};
