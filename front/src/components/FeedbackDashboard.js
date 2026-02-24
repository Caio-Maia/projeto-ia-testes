import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Chip,
  TextField,
  MenuItem,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Skeleton,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import TodayIcon from '@mui/icons-material/Today';
import PercentIcon from '@mui/icons-material/Percent';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { parseError, logError } from '../utils/errorHandler';
import {
  clearLocalFeedbacks,
  exportLocalFeedbacks,
} from '../services/feedbackStorageService';

const KPICard = ({ icon: Icon, title, value, subtitle, color, isDarkMode }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: 2.5,
      border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
      background: isDarkMode ? '#1a202c' : '#ffffff',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ color, fontSize: 28 }} />
        </Box>
        <Box flex={1}>
          <Typography
            variant="caption"
            sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDarkMode ? '#f3f4f6' : '#1e293b', lineHeight: 1.2 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: isDarkMode ? '#6b7280' : '#94a3b8' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const KPICardSkeleton = ({ isDarkMode }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: 2.5,
      border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
      background: isDarkMode ? '#1a202c' : '#ffffff',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Skeleton variant="rounded" width={52} height={52} />
        <Box flex={1}>
          <Skeleton variant="text" width={80} height={16} />
          <Skeleton variant="text" width={60} height={40} />
          <Skeleton variant="text" width={100} height={14} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const readLocalFeedbacks = () => {
  try {
    const data = JSON.parse(exportLocalFeedbacks() || '[]');
    if (!Array.isArray(data)) {
      return [];
    }

    return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
};

function FeedbackDashboard() {
  const { t, language } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [allFeedbacks, setAllFeedbacks] = useState([]);
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
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const typeMap = useMemo(() => ({
    task: t('feedbackDashboard.tasks'),
    testcase: t('feedbackDashboard.testCases'),
    code: t('feedbackDashboard.testCode'),
    risk: t('feedbackDashboard.riskAnalysis'),
  }), [t]);

  const kpis = useMemo(() => {
    const totalFeedbacks = allFeedbacks.length;
    const positiveFeedbacks = allFeedbacks.filter((f) => f.rating === 'positive').length;
    const approvalRate = totalFeedbacks > 0 ? Math.round((positiveFeedbacks / totalFeedbacks) * 100) : 0;

    const today = new Date().toDateString();
    const todayFeedbacks = allFeedbacks.filter((f) => new Date(f.createdAt).toDateString() === today).length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = allFeedbacks.filter((f) => new Date(f.createdAt) >= sevenDaysAgo);
    const avgPerDay = last7Days.length > 0 ? (last7Days.length / 7).toFixed(1) : 0;

    const feedbacksWithComments = allFeedbacks.filter((f) => f.comment && f.comment.trim() !== '').length;

    return { totalFeedbacks, approvalRate, todayFeedbacks, avgPerDay, feedbacksWithComments };
  }, [allFeedbacks]);

  const generateTrendData = useCallback((data) => {
    const locale = language === 'en' ? 'en-US' : 'pt-BR';
    const grouped = {};

    data.forEach((f) => {
      const date = new Date(f.createdAt).toLocaleDateString(locale, { day: '2-digit', month: 'short' });
      grouped[date] = (grouped[date] || 0) + 1;
    });

    const sortedDates = Object.keys(grouped).slice(-7);
    setTrendData(sortedDates.map((date) => ({ date, feedbacks: grouped[date] })));
  }, [language]);

  const fetchFeedbackData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const localData = readLocalFeedbacks();
      const recentWithComments = localData
        .filter((f) => f.comment && f.comment.trim() !== '')
        .slice(0, 50);

      setAllFeedbacks(localData);
      setRecent(recentWithComments);
      generateTrendData(localData);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.getTranslatedMessage(t) || t('feedbackDashboard.errorLoading'));
      logError('FeedbackDashboard local fetch', err);
    } finally {
      setLoading(false);
    }
  }, [t, generateTrendData]);

  useEffect(() => {
    fetchFeedbackData();
  }, [fetchFeedbackData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchFeedbackData, 30000);
      return () => clearInterval(interval);
    }

    return undefined;
  }, [autoRefresh, fetchFeedbackData]);

  const applyFilters = useCallback(() => {
    let filtered = recent;

    if (searchTerm) {
      filtered = filtered.filter((f) => (f.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || ''));
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((f) => f.type === filterType);
    }

    if (filterRating !== 'all') {
      filtered = filtered.filter((f) => f.rating === filterRating);
    }

    setFilteredRecent(filtered);
    setPage(1);
  }, [recent, searchTerm, filterType, filterRating]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const locale = language === 'en' ? 'en-US' : 'pt-BR';
    const date = new Date(dateString);
    return `${date.toLocaleDateString(locale)} ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
  };

  const exportToCSV = () => {
    const headers = [t('feedbackDashboard.type'), t('feedbackDashboard.rating'), t('feedbackDashboard.comment'), t('feedbackDashboard.date')];
    const rows = filteredRecent.map((f) => [
      typeMap[f.type] || f.type,
      f.rating === 'positive' ? t('feedbackDashboard.filterUseful') : t('feedbackDashboard.filterImprove'),
      f.comment || '-',
      formatDate(f.createdAt),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
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

  const paginatedRecent = filteredRecent.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredRecent.length / rowsPerPage);

  if (error) {
    return (
      <Box p={3} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2} minHeight="80vh">
        <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>{error}</Alert>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchFeedbackData}>
          {t('feedbackDashboard.tryAgain')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Box p={{ xs: 2, sm: 3, md: 6 }} maxWidth={1400} margin="0 auto">
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 3,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
            <TrendingUpIcon sx={{ fontSize: { xs: 28, md: 36 } }} />
            <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight={800}>
              {t('feedbackDashboard.title')}
            </Typography>
          </Box>
          <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ fontWeight: 400, opacity: 0.95 }}>
            {t('feedbackDashboard.subtitle')}
          </Typography>
        </Paper>

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
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
            {t('feedbackDashboard.localMode')}
          </Typography>
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
        </Paper>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            {loading ? (
              <KPICardSkeleton isDarkMode={isDarkMode} />
            ) : (
              <KPICard
                icon={EqualizerIcon}
                title={t('feedbackDashboard.totalFeedbacks')}
                value={kpis.totalFeedbacks}
                subtitle={`${t('feedbackDashboard.avgPerDay')}: ${kpis.avgPerDay}`}
                color="#3b82f6"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={6} md={3}>
            {loading ? (
              <KPICardSkeleton isDarkMode={isDarkMode} />
            ) : (
              <KPICard
                icon={PercentIcon}
                title={t('feedbackDashboard.approvalRate')}
                value={`${kpis.approvalRate}%`}
                subtitle={t('feedbackDashboard.approval')}
                color="#22c55e"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={6} md={3}>
            {loading ? (
              <KPICardSkeleton isDarkMode={isDarkMode} />
            ) : (
              <KPICard
                icon={TodayIcon}
                title={t('feedbackDashboard.todayFeedbacks')}
                value={kpis.todayFeedbacks}
                color="#f59e0b"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
          <Grid item xs={6} md={3}>
            {loading ? (
              <KPICardSkeleton isDarkMode={isDarkMode} />
            ) : (
              <KPICard
                icon={AssignmentIcon}
                title={t('feedbackDashboard.recentComments')}
                value={kpis.feedbacksWithComments}
                subtitle={t('feedbackDashboard.comment')}
                color="#8b5cf6"
                isDarkMode={isDarkMode}
              />
            )}
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2.5,
            border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
            background: isDarkMode ? '#1a202c' : '#ffffff',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#3b82f6' }} />
            {t('feedbackDashboard.trendTitle')}
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={250}>
              <CircularProgress />
            </Box>
          ) : trendData.length > 0 ? (
            <LineChart
              xAxis={[{
                scaleType: 'point',
                data: trendData.map((d) => d.date),
                tickLabelStyle: {
                  fill: isDarkMode ? '#9ca3af' : '#64748b',
                  fontSize: 11,
                },
              }]}
              series={[{
                data: trendData.map((d) => d.feedbacks),
                color: '#3b82f6',
                area: true,
              }]}
              width={isMobile ? 290 : isTablet ? 350 : 500}
              height={250}
              slotProps={{ legend: { hidden: true } }}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height={250}>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#6b7280' : '#94a3b8' }}>
                {t('feedbackDashboard.noFeedback')}
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
          }}
        >
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
                  label={t('feedbackDashboard.autoRefresh')}
                  sx={{ m: 0 }}
                />
                <Button size="small" startIcon={<RefreshIcon />} onClick={fetchFeedbackData} disabled={loading}>
                  {t('feedbackDashboard.refresh')}
                </Button>
                <Button size="small" startIcon={<FileDownloadIcon />} onClick={() => setExportOpen(true)} disabled={filteredRecent.length === 0}>
                  {t('feedbackDashboard.export')}
                </Button>
              </Box>
            </Box>
          </Box>

          <Box sx={{ p: 3, borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              placeholder={t('feedbackDashboard.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#d1d5db' : '#1e293b',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#4b5563' : '#cbd5e1',
                  },
                },
              }}
            />
            <TextField
              select
              label={t('feedbackDashboard.type')}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#d1d5db' : '#1e293b',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#4b5563' : '#cbd5e1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#9ca3af' : '#64748b',
                },
              }}
            >
              <MenuItem value="all">{t('feedbackDashboard.filterAll')}</MenuItem>
              <MenuItem value="task">{typeMap.task}</MenuItem>
              <MenuItem value="testcase">{typeMap.testcase}</MenuItem>
              <MenuItem value="code">{typeMap.code}</MenuItem>
              <MenuItem value="risk">{typeMap.risk}</MenuItem>
            </TextField>
            <TextField
              select
              label={t('feedbackDashboard.rating')}
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDarkMode ? '#d1d5db' : '#1e293b',
                  '& fieldset': {
                    borderColor: isDarkMode ? '#4b5563' : '#cbd5e1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? '#9ca3af' : '#64748b',
                },
              }}
            >
              <MenuItem value="all">{t('feedbackDashboard.filterAllRatings')}</MenuItem>
              <MenuItem value="positive">{t('feedbackDashboard.filterUseful')}</MenuItem>
              <MenuItem value="negative">{t('feedbackDashboard.filterImprove')}</MenuItem>
            </TextField>
            <Box display="flex" alignItems="center">
              <FilterAltIcon sx={{ mr: 1, color: isDarkMode ? '#9ca3af' : '#64748b' }} />
              <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b' }}>
                {filteredRecent.length} {filteredRecent.length !== 1 ? t('feedbackDashboard.resultsPlural') : t('feedbackDashboard.results')}
              </Typography>
            </Box>
          </Box>

          {filteredRecent.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: isDarkMode ? '#0f1419' : '#f8f9fa', borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e2e8f0'}` }}>
                      <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.9rem' }}>
                        {t('feedbackDashboard.type')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.9rem' }}>
                        {t('feedbackDashboard.rating')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.9rem' }}>
                        {t('feedbackDashboard.comment')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1e293b', fontSize: '0.9rem' }}>
                        {t('feedbackDashboard.date')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecent.map((f, i) => (
                      <TableRow
                        key={f._id || f.id || i}
                        sx={{
                          background: isDarkMode
                            ? (i % 2 === 0 ? '#1a202c' : '#0f1419')
                            : (i % 2 === 0 ? '#ffffff' : '#f8f9fa'),
                          borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                          '&:hover': {
                            background: isDarkMode ? '#232b33' : '#f0f4f8',
                          },
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
                              color: isDarkMode ? '#d1d5db' : '#475569',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {f.rating === 'positive' ? (
                              <>
                                <ThumbUpIcon sx={{ color: '#4ade80', fontSize: 18 }} />
                                <Typography sx={{ fontWeight: 600, color: '#22c55e' }}>
                                  {t('feedbackDashboard.filterUseful')}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <ThumbDownIcon sx={{ color: '#f87171', fontSize: 18 }} />
                                <Typography sx={{ fontWeight: 600, color: '#ef4444' }}>
                                  {t('feedbackDashboard.filterImprove')}
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
                              whiteSpace: 'nowrap',
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

              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}` }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: isDarkMode ? '#d1d5db' : '#1e293b',
                      borderColor: isDarkMode ? '#374151' : '#e2e8f0',
                    },
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
                  ? t('feedbackDashboard.noResultsFiltered')
                  : t('feedbackDashboard.feedbacksWillAppear')}
              </Typography>
            </Box>
          )}
        </Paper>

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

        <Dialog open={exportOpen} onClose={() => setExportOpen(false)}>
          <DialogTitle>{t('feedbackDashboard.exportTitle')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {t('feedbackDashboard.exportConfirm', {
                count: filteredRecent.length,
                plural: filteredRecent.length !== 1 ? t('feedbackDashboard.feedbackPlural') : t('feedbackDashboard.feedbackSingular'),
              })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={exportToCSV} variant="contained">{t('feedbackDashboard.export')}</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default FeedbackDashboard;