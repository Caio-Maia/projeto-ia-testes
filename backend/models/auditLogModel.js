/**
 * AuditLog Model
 * 
 * Registra todas as operações realizadas no sistema para fins de
 * auditoria, análise e debugging.
 * 
 * @module models/auditLogModel
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Ação realizada
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [[
        // Operações de IA
        'IMPROVE_TASK',
        'GENERATE_TESTS',
        'GENERATE_CODE',
        'ANALYZE_RISKS',
        'ANALYZE_COVERAGE',
        'STREAM_START',
        'STREAM_COMPLETE',
        'STREAM_ERROR',
        
        // Integrações
        'JIRA_FETCH',
        'JIRA_UPDATE',
        
        // Feedback
        'FEEDBACK_CREATE',
        'FEEDBACK_UPDATE',
        
        // Jobs/Queue
        'JOB_CREATE',
        'JOB_COMPLETE',
        'JOB_FAIL',
        
        // Sistema
        'API_ERROR',
        'RATE_LIMIT_HIT',
        'VALIDATION_ERROR'
      ]]
    }
  },
  
  // Recurso acessado
  resource: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['ai', 'jira', 'feedback', 'job', 'stream', 'system']]
    }
  },
  
  // Método HTTP
  method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Rota acessada
  path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Status da resposta HTTP
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // Detalhes da operação (JSON)
  details: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  
  // IP do cliente
  ip: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // User Agent
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Duração da operação em ms
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // Se a operação foi bem sucedida
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Mensagem de erro (se houver)
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['action'] },
    { fields: ['resource'] },
    { fields: ['createdAt'] },
    { fields: ['success'] },
    { fields: ['ip'] }
  ]
});

/**
 * Métodos estáticos para logging
 */

// Log de operação de IA
AuditLog.logAI = async function(action, details, req, options = {}) {
  return this.create({
    action,
    resource: 'ai',
    method: req?.method,
    path: req?.originalUrl,
    statusCode: options.statusCode,
    details: {
      model: details.model,
      feature: details.feature,
      promptLength: details.promptLength,
      responseLength: details.responseLength,
      ...details
    },
    ip: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.('User-Agent'),
    duration: options.duration,
    success: options.success !== false,
    errorMessage: options.errorMessage
  });
};

// Log de integração JIRA
AuditLog.logJira = async function(action, details, req, options = {}) {
  return this.create({
    action,
    resource: 'jira',
    method: req?.method,
    path: req?.originalUrl,
    statusCode: options.statusCode,
    details: {
      taskCode: details.taskCode,
      ...details
    },
    ip: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.('User-Agent'),
    duration: options.duration,
    success: options.success !== false,
    errorMessage: options.errorMessage
  });
};

// Log de feedback
AuditLog.logFeedback = async function(action, details, req, options = {}) {
  return this.create({
    action,
    resource: 'feedback',
    method: req?.method,
    path: req?.originalUrl,
    statusCode: options.statusCode,
    details: {
      feedbackId: details.feedbackId,
      type: details.type,
      rating: details.rating,
      ...details
    },
    ip: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.('User-Agent'),
    duration: options.duration,
    success: options.success !== false,
    errorMessage: options.errorMessage
  });
};

// Log de erro
AuditLog.logError = async function(action, error, req, options = {}) {
  return this.create({
    action,
    resource: options.resource || 'system',
    method: req?.method,
    path: req?.originalUrl,
    statusCode: options.statusCode || 500,
    details: {
      errorCode: error.code,
      errorName: error.name,
      ...options.details
    },
    ip: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get?.('User-Agent'),
    duration: options.duration,
    success: false,
    errorMessage: error.message
  });
};

// Obter estatísticas
AuditLog.getStats = async function(options = {}) {
  const { Op } = require('sequelize');
  const where = {};
  
  if (options.startDate) {
    where.createdAt = { [Op.gte]: options.startDate };
  }
  if (options.endDate) {
    where.createdAt = { ...where.createdAt, [Op.lte]: options.endDate };
  }
  
  const [totalOps, successOps, byAction, byResource] = await Promise.all([
    this.count({ where }),
    this.count({ where: { ...where, success: true } }),
    this.findAll({
      where,
      attributes: ['action', [sequelize.fn('COUNT', '*'), 'count']],
      group: ['action'],
      raw: true
    }),
    this.findAll({
      where,
      attributes: ['resource', [sequelize.fn('COUNT', '*'), 'count']],
      group: ['resource'],
      raw: true
    })
  ]);
  
  return {
    total: totalOps,
    successful: successOps,
    failed: totalOps - successOps,
    successRate: totalOps > 0 ? ((successOps / totalOps) * 100).toFixed(2) + '%' : '0%',
    byAction: byAction.reduce((acc, { action, count }) => ({ ...acc, [action]: count }), {}),
    byResource: byResource.reduce((acc, { resource, count }) => ({ ...acc, [resource]: count }), {})
  };
};

module.exports = AuditLog;
