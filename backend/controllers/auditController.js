/**
 * Audit Log Controller
 * 
 * Endpoints para consulta e gestão de logs de auditoria.
 * 
 * @module controllers/auditController
 */

const AuditLog = require('../models/auditLogModel');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * GET /api/audit/logs
 * Lista logs de auditoria com filtros e paginação
 */
const getLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    action,
    resource,
    success,
    startDate,
    endDate,
    ip
  } = req.query;
  
  const where = {};
  
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (success !== undefined) where.success = success === 'true';
  if (ip) where.ip = ip;
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset
  });
  
  res.json({
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    }
  });
});

/**
 * GET /api/audit/stats
 * Estatísticas de auditoria
 */
const getStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const options = {};
  if (startDate) options.startDate = new Date(startDate);
  if (endDate) options.endDate = new Date(endDate);
  
  const stats = await AuditLog.getStats(options);
  
  // Adiciona estatísticas de tempo
  const avgDuration = await AuditLog.findOne({
    attributes: [
      [AuditLog.sequelize.fn('AVG', AuditLog.sequelize.col('duration')), 'avgDuration']
    ],
    where: options.startDate ? { createdAt: { [Op.gte]: options.startDate } } : {},
    raw: true
  });
  
  res.json({
    ...stats,
    avgDuration: Math.round(avgDuration?.avgDuration || 0)
  });
});

/**
 * GET /api/audit/stats/hourly
 * Estatísticas por hora (últimas 24h)
 */
const getHourlyStats = asyncHandler(async (req, res) => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const logs = await AuditLog.findAll({
    where: {
      createdAt: { [Op.gte]: last24h }
    },
    attributes: ['createdAt', 'action', 'success'],
    raw: true
  });
  
  // Agrupa por hora
  const hourlyData = {};
  for (let i = 0; i < 24; i++) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i, 0, 0, 0);
    const key = hour.toISOString().slice(0, 13);
    hourlyData[key] = { total: 0, success: 0, failed: 0 };
  }
  
  logs.forEach(log => {
    const key = log.createdAt.toISOString().slice(0, 13);
    if (hourlyData[key]) {
      hourlyData[key].total++;
      if (log.success) {
        hourlyData[key].success++;
      } else {
        hourlyData[key].failed++;
      }
    }
  });
  
  res.json({
    data: Object.entries(hourlyData)
      .map(([hour, stats]) => ({ hour, ...stats }))
      .reverse()
  });
});

/**
 * GET /api/audit/logs/:id
 * Detalhes de um log específico
 */
const getLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const log = await AuditLog.findByPk(id);
  
  if (!log) {
    return res.status(404).json({ error: 'Log not found' });
  }
  
  res.json(log);
});

/**
 * DELETE /api/audit/logs
 * Limpa logs antigos (manutenção)
 */
const clearOldLogs = asyncHandler(async (req, res) => {
  const { olderThanDays = 30 } = req.query;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
  
  const deleted = await AuditLog.destroy({
    where: {
      createdAt: { [Op.lt]: cutoffDate }
    }
  });
  
  logger.info({
    msg: 'Old audit logs cleared',
    deletedCount: deleted,
    olderThanDays: parseInt(olderThanDays)
  });
  
  res.json({
    message: `Deleted ${deleted} logs older than ${olderThanDays} days`,
    deletedCount: deleted
  });
});

/**
 * GET /api/audit/actions
 * Lista ações disponíveis para filtro
 */
const getActions = asyncHandler(async (req, res) => {
  const actions = await AuditLog.findAll({
    attributes: [[AuditLog.sequelize.fn('DISTINCT', AuditLog.sequelize.col('action')), 'action']],
    raw: true
  });
  
  res.json({
    actions: actions.map(a => a.action).filter(Boolean)
  });
});

/**
 * GET /api/audit/resources
 * Lista recursos disponíveis para filtro
 */
const getResources = asyncHandler(async (req, res) => {
  const resources = await AuditLog.findAll({
    attributes: [[AuditLog.sequelize.fn('DISTINCT', AuditLog.sequelize.col('resource')), 'resource']],
    raw: true
  });
  
  res.json({
    resources: resources.map(r => r.resource).filter(Boolean)
  });
});

/**
 * GET /api/audit/errors
 * Lista últimos erros
 */
const getRecentErrors = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  const errors = await AuditLog.findAll({
    where: { success: false },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit)
  });
  
  res.json({ data: errors });
});

module.exports = {
  getLogs,
  getStats,
  getHourlyStats,
  getLogById,
  clearOldLogs,
  getActions,
  getResources,
  getRecentErrors
};
