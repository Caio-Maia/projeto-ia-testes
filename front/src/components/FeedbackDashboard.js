import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid, Chip, TextField, MenuItem, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, FormControlLabel, Tooltip
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useLanguage, useDarkMode } from '../stores/hooks';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { parseError, logError } from '../utils/errorHandler';
import { 
  getFeedbackStats, 
  getRecentFeedback, 
  getStorageMode, 
  setStorageMode, 
  canUserChooseStorage,
  clearLocalFeedbacks,
  exportLocalFeedbacks
} from '../services/feedbackStorageService';

function FeedbackDashboard() {
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const [stats, setStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [filteredRecent, setFilteredRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [storageMode, setStorageModeState] = useState(getStorageMode());
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const generateTrendData = (data) => {
    // Agrupar feedbacks por data
    const grouped = {};
    data.forEach(f => {
      const date = new Date(f.createdAt).toLocaleDateString('pt-BR');
      grouped[date] = (grouped[date] || 0) + 1;
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b)).slice(-7);
    setTrendData(sortedDates.map(date => ({
      date,
      feedbacks: grouped[date]
    })));
  };

  const fetchFeedbackData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, recentData] = await Promise.all([
        getFeedbackStats(),
        getRecentFeedback()
      ]);
      setStats(statsData);
      setRecent(recentData);
      generateTrendData(recentData);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message || t('feedbackDashboard.errorLoading'));
      logError('FeedbackDashboard fetch', err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchFeedbackData();
  }, [storageMode, fetchFeedbackData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchFeedbackData, 30000); // Refresh a cada 30s
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchFeedbackData]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [searchTerm, filterType, filterRating, recent]);

  const handleStorageModeChange = (event) => {
    const newMode = event.target.checked ? 'local' : 'backend';
    setStorageMode(newMode);
    setStorageModeState(newMode);
  };

  const handleClearLocalFeedbacks = () => {
    clearLocalFeedbacks();
    setClearDialogOpen(false);
    fetchFeedbackData();
  };

  const handleExportLocalFeedbacks = () => {
    const data = exportLocalFeedbacks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedbacks-local-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyFilters = useCallback(() => {
    let filtered = recent;

    if (searchTerm) {
      filtered = filtered.filter(f =>
        (f.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(f => f.type === filterType);
    }

    if (filterRating !== 'all') {
      filtered = filtered.filter(f => f.rating === filterRating);
    }

    setFilteredRecent(filtered);
    setPage(1);
  }, [recent, searchTerm, filterType, filterRating]);

  const pieData = (stat) => {
    if (!stat) return [];
    const pos = stat.ratings.find(r => r.rating === 'positive')?.count || 0;
    const neg = stat.ratings.find(r => r.rating === 'negative')?.count || 0;
    return [
      { id: 0, value: pos, label: t('feedbackDashboard.positive'), color: '#4caf50' },
      { id: 1, value: neg, label: t('feedbackDashboard.negative'), color: '#f44336' }
    ];
  };

  const typeMap = {
    task: t('feedbackDashboard.tasks'),
    testcase: t('feedbackDashboard.testCases'),
    code: t('feedbackDashboard.testCode'),
    risk: t('feedbackDashboard.riskAnalysis'),
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  };

  const exportToCSV = () => {
    const headers = ['Tipo', 'Avaliação', 'Comentário', 'Data'];
    const rows = filteredRecent.map(f => [
      typeMap[f.type] || f.type,
      f.rating === 'positive' ? 'Útil' : 'Melhorar',
      f.comment || '-',
      formatDate(f.createdAt)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const paginatedRecent = filteredRecent.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredRecent.length / rowsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
        <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>{error}</Alert>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchFeedbackData}>
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: isDarkMode ? '#0f1419' : 'linear-gradient(135deg, #f5f7fa 0%, #f0f3f7 100%)', py: 4 }}>
      <Box p={{xs: 2, sm: 3, md: 6}} maxWidth={1200} margin="0 auto">
        {/* Header Hero */}
        <Paper 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            p: 4, 
            mb: 5, 
            borderRadius: 3,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            <TrendingUpIcon sx={{ fontSize: 36 }} />
            <Typography variant="h3" fontWeight={800}>
              {t('feedbackDashboard.title')}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.95 }}>
            {t('feedbackDashboard.subtitle')}
          </Typography>
        </Paper>

        {/* Storage Mode Selector */}
        {canUserChooseStorage() && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
              background: isDarkMode ? '#1a202c' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title={storageMode === 'local' ? t('feedbackDashboard.localStorageTooltip') : t('feedbackDashboard.backendStorageTooltip')}>
                <Box display="flex" alignItems="center" gap={1}>
                  {storageMode === 'local' ? (
                    <StorageIcon sx={{ color: '#10b981' }} />
                  ) : (
                    <CloudIcon sx={{ color: '#3b82f6' }} />
                  )}
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                    {storageMode === 'local' ? t('feedbackDashboard.localMode') : t('feedbackDashboard.backendMode')}
                  </Typography>
                </Box>
              </Tooltip>
              <FormControlLabel
                control={
                  <Switch 
                    checked={storageMode === 'local'} 
                    onChange={handleStorageModeChange}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>
                    {t('feedbackDashboard.privateMode')}
                  </Typography>
                }
              />
            </Box>
            
            {storageMode === 'local' && (
              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportLocalFeedbacks}
                  sx={{ textTransform: 'none' }}
                >
                  {t('feedbackDashboard.exportLocal')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={() => setClearDialogOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  {t('feedbackDashboard.clearLocal')}
                </Button>
              </Box>
            )}
          </Paper>
        )}

        {/* Clear Local Feedbacks Dialog */}
        <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
          <DialogTitle>{t('feedbackDashboard.clearLocalTitle')}</DialogTitle>
          <DialogContent>
            <Typography>{t('feedbackDashboard.clearLocalConfirm')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleClearLocalFeedbacks} color="error" variant="contained">
              {t('feedbackDashboard.clearLocal')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stats Cards */}
        {stats.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 5 }}>
            {stats.map((stat) => {
              const data = pieData(stat);
              const total = stat.total || 0;
              const pos = stat.ratings.find(r => r.rating === 'positive')?.count || 0;
              const posPerc = total > 0 ? Math.round((pos / total) * 100) : 0;
              const label = typeMap[stat._id] || stat._id;

              return (
                <Grid item xs={12} sm={6} md={4} key={stat._id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2.5,
                      border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                      background: isDarkMode ? '#1a202c' : '#ffffff',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 24px rgba(59, 130, 246, 0.15)',
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <AssignmentIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
                        {label}
                      </Typography>
                    </Box>
                    
                    {total > 0 ? (
                      <>
                        <Box display="flex" justifyContent="center" mb={2}>
                          <PieChart
                            series={[{ data, innerRadius: 40, paddingAngle: 2, cornerRadius: 7 }]} 
                            width={200} 
                            height={140} 
                            legend={{ hidden: true }}
                          />
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <ThumbUpIcon sx={{ color: '#4ade80', fontSize: 20 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>
                            {posPerc}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                            aprovação
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: 500 }}>
                          Total: <strong>{total}</strong> {t('feedbackDashboard.feedbacksReceived')}
                        </Typography>
                      </>
                    ) : (
                      <Box py={3} textAlign="center">
                        <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                          {t('feedbackDashboard.noFeedback')}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Recent Feedback Section */}
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#1a202c' : '#ffffff'
          }}
        >
          {/* Section Header */}
          <Box 
            sx={{ 
              background: isDarkMode ? '#0f1419' : 'linear-gradient(135deg, #f5f7fa 0%, #f1f5f9 100%)',
              p: 3,
              borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThumbUpIcon sx={{ color: '#3b82f6' }} />
                {t('feedbackDashboard.recentComments')}
              </Typography>
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <FormControlLabel
                  control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
                  label="Auto-atualizar"
                  sx={{ m: 0 }}
                />
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={fetchFeedbackData}
                  disabled={loading}
                >
                  Atualizar
                </Button>
                <Button
                  size="small"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => setExportOpen(true)}
                  disabled={filteredRecent.length === 0}
                >
                  Exportar
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Trend Chart */}
          {trendData.length > 0 && (
            <>
              <Box sx={{ p: 3, borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: isDarkMode ? '#d1d5db' : '#1e293b' }}>
                  Tendência (últimos 7 dias)
                </Typography>
                <LineChart
                  xAxis={[{ 
                    scaleType: 'point',
                    data: trendData.map(d => d.date)
                  }]}
                  series={[{
                    data: trendData.map(d => d.feedbacks),
                    color: '#3b82f6'
                  }]}
                  width={500}
                  height={200}
                  slotProps={{ legend: { hidden: true } }}
                  sx={{
                    '& .MuiChartsAxis-bottom': {
                      '& text': {
                        fill: isDarkMode ? '#9ca3af' : '#64748b'
                      }
                    },
                    '& .MuiChartsAxis-left': {
                      '& text': {
                        fill: isDarkMode ? '#9ca3af' : '#64748b'
                      }
                    }
                  }}
                />
              </Box>
            </>
          )}

          {/* Filters */}
          <Box sx={{ p: 3, borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              placeholder="Buscar comentários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#d1d5db' : '#1e293b',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#4b5563' : '#cbd5e1'
                  }
                }
              }}
            />
            <TextField
              select
              label="Tipo"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#d1d5db' : '#1e293b',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#4b5563' : '#cbd5e1'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#9ca3af' : '#64748b'
                }
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="task">Tarefas</MenuItem>
              <MenuItem value="testcase">Casos de Teste</MenuItem>
              <MenuItem value="code">Código de Teste</MenuItem>
              <MenuItem value="risk">Análise de Riscos</MenuItem>
            </TextField>
            <TextField
              select
              label="Avaliação"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#d1d5db' : '#1e293b',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#4b5563' : '#cbd5e1'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#9ca3af' : '#64748b'
                }
              }}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="positive">Útil</MenuItem>
              <MenuItem value="negative">Melhorar</MenuItem>
            </TextField>
            <Box display="flex" alignItems="center">
              <FilterAltIcon sx={{ mr: 1, color: isDarkMode ? '#9ca3af' : '#64748b' }} />
              <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                {filteredRecent.length} resultado{filteredRecent.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>

          {/* Table Content */}
          {filteredRecent.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: isDarkMode ? '#0f1419' : '#f8f9fa', borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}` }}>
                      <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.9rem' }}>
                        Tipo
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.9rem' }}>
                        Avaliação
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.9rem' }}>
                        Comentário
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.9rem' }}>
                        Data
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecent.map((f, i) => (
                      <TableRow 
                        key={f._id || i} 
                        sx={{ 
                          background: isDarkMode 
                            ? (i % 2 === 0 ? '#1a202c' : '#0f1419')
                            : (i % 2 === 0 ? '#ffffff' : '#f8f9fa'),
                          borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                          transition: 'background 0.2s ease',
                          '&:hover': {
                            background: isDarkMode ? '#232b33' : '#f0f4f8',
                          }
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={typeMap[f.type] || f.type}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontWeight: 600, 
                              borderColor: isDarkMode ? '#4b5563' : '#cbd5e1',
                              color: isDarkMode ? '#d1d5db' : '#475569'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {f.rating === 'positive' ? (
                              <>
                                <ThumbUpIcon sx={{ color: '#4ade80', fontSize: 18 }} />
                                <Typography sx={{ fontWeight: 600, color: '#22c55e' }}>
                                  Útil
                                </Typography>
                              </>
                            ) : (
                              <>
                                <ThumbDownIcon sx={{ color: '#f87171', fontSize: 18 }} />
                                <Typography sx={{ fontWeight: 600, color: '#ef4444' }}>
                                  Melhorar
                                </Typography>
                              </>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: f.comment 
                                ? (isDarkMode ? '#d1d5db' : '#475569')
                                : (isDarkMode ? '#4b5563' : '#cbd5e1'),
                              fontStyle: f.comment ? 'normal' : 'italic',
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={f.comment}
                          >
                            {f.comment || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.85rem' }}>
                            {formatDate(f.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}` }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: isDarkMode ? '#d1d5db' : '#1e293b',
                      borderColor: isDarkMode ? '#374151' : '#e2e8f0'
                    }
                  }}
                />
              </Box>
            </>
          ) : (
            <Box py={6} textAlign="center">
              <AssignmentIcon sx={{ fontSize: 48, color: isDarkMode ? '#4b5563' : '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                {t('feedbackDashboard.noComments')}
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#6b7280' : '#64748b' }}>
                {searchTerm || filterType !== 'all' || filterRating !== 'all'
                  ? 'Nenhum resultado encontrado com os filtros aplicados'
                  : 'Os feedbacks aparecerão aqui quando começarem a chegar'}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Export Dialog */}
        <Dialog open={exportOpen} onClose={() => setExportOpen(false)}>
          <DialogTitle>Exportar Feedbacks</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Você deseja exportar {filteredRecent.length} feedback{filteredRecent.length !== 1 ? 's' : ''} em formato CSV?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportOpen(false)}>Cancelar</Button>
            <Button onClick={exportToCSV} variant="contained">Exportar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default FeedbackDashboard;
