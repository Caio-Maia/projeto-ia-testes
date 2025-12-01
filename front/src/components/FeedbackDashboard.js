import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, CircularProgress, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent,
  Grid, Chip, Rating
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useLanguage } from '../contexts/LanguageContext';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';

function FeedbackDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbackData();
    // eslint-disable-next-line
  }, []);

  const fetchFeedbackData = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const [statsRes, recentRes] = await Promise.all([
        axios.get(`${backendUrl}/api/feedback/stats`),
        axios.get(`${backendUrl}/api/feedback/recent`)
      ]);
      setStats(statsRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      setError(t('feedbackDashboard.errorLoading'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f3f7 100%)', py: 4 }}>
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
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 24px rgba(59, 130, 246, 0.15)',
                        transform: 'translateY(-4px)',
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <AssignmentIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
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
                          <Typography variant="body2" color="textSecondary">
                            aprovação
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                          Total: <strong>{total}</strong> {t('feedbackDashboard.feedbacksReceived')}
                        </Typography>
                      </>
                    ) : (
                      <Box py={3} textAlign="center">
                        <Typography variant="body2" color="textSecondary">
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
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          {/* Section Header */}
          <Box 
            sx={{ 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #f1f5f9 100%)',
              p: 3,
              borderBottom: '2px solid #e2e8f0',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ThumbUpIcon sx={{ color: '#3b82f6' }} />
              {t('feedbackDashboard.recentComments')}
            </Typography>
          </Box>

          {/* Table Content */}
          {recent.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#f8f9fa', borderBottom: '2px solid #e2e8f0' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                      Tipo
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                      Avaliação
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                      Comentário
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                      Data
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent.map((f, i) => (
                    <TableRow 
                      key={f._id || i} 
                      sx={{ 
                        background: i % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.2s ease',
                        '&:hover': {
                          background: '#f0f4f8',
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
                            borderColor: '#cbd5e1',
                            color: '#475569'
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
                            color: f.comment ? '#475569' : '#cbd5e1',
                            fontStyle: f.comment ? 'normal' : 'italic',
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {f.comment || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {formatDate(f.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box py={6} textAlign="center">
              <AssignmentIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>
                {t('feedbackDashboard.noComments')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Os feedbacks aparecerão aqui quando começarem a chegar
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default FeedbackDashboard;
