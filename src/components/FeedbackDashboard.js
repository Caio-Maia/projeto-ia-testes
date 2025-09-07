import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid, CircularProgress, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

function FeedbackDashboard() {
  const [stats, setStats] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const fetchFeedbackData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      
      const [statsResponse, recentResponse] = await Promise.all([
        axios.get(`${backendUrl}/api/feedback/stats`),
        axios.get(`${backendUrl}/api/feedback/recent`)
      ]);
      
      setStats(statsResponse.data);
      setRecentFeedback(recentResponse.data);
    } catch (err) {
      setError('Erro ao carregar dados de feedback');
      console.error('Erro ao carregar dados de feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to prepare data for pie charts
  const preparePieData = (typeStats) => {
    if (!typeStats) return [];
    
    const positiveCount = typeStats.ratings.find(r => r.rating === 'positive')?.count || 0;
    const negativeCount = typeStats.ratings.find(r => r.rating === 'negative')?.count || 0;
    
    return [
      { id: 0, value: positiveCount, label: 'Positivo', color: '#4caf50' },
      { id: 1, value: negativeCount, label: 'Negativo', color: '#f44336' }
    ];
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Feedback
      </Typography>
      
      <Grid container spacing={3}>
        {/* Pie charts for each type of generation */}
        {stats.map((typeStat) => {
          const pieData = preparePieData(typeStat);
          const total = typeStat.total || 0;
          const positiveCount = typeStat.ratings.find(r => r.rating === 'positive')?.count || 0;
          const positivePercentage = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
          
          let typeLabel = '';
          switch (typeStat._id) {
            case 'task':
              typeLabel = 'Tarefas';
              break;
            case 'testcase':
              typeLabel = 'Casos de Teste';
              break;
            case 'code':
              typeLabel = 'Código de Teste';
              break;
            case 'risk':
              typeLabel = 'Análise de Riscos';
              break;
            default:
              typeLabel = typeStat._id;
          }
          
          return (
            <Grid item xs={12} md={6} lg={3} key={typeStat._id}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {typeLabel}
                </Typography>
                
                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                  {total > 0 ? (
                    <>
                      <PieChart
                        series={[{ data: pieData, innerRadius: 30, paddingAngle: 2, cornerRadius: 4 }]}
                        width={200}
                        height={150}
                      />
                      <Typography variant="body1" fontWeight="bold" mt={1}>
                        {positivePercentage}% de aprovação
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: {total} feedbacks
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      Nenhum feedback recebido
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Comentários Recentes
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        {recentFeedback.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Avaliação</TableCell>
                  <TableCell>Comentário</TableCell>
                  <TableCell>Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentFeedback.map((feedback) => (
                  <TableRow key={feedback._id}>
                    <TableCell>
                      {feedback.type === 'task' && 'Tarefa'}
                      {feedback.type === 'testcase' && 'Caso de Teste'}
                      {feedback.type === 'code' && 'Código de Teste'}
                      {feedback.type === 'risk' && 'Análise de Riscos'}
                    </TableCell>
                    <TableCell>
                      {feedback.rating === 'positive' ? (
                        <Typography color="success.main">Positivo</Typography>
                      ) : (
                        <Typography color="error.main">Negativo</Typography>
                      )}
                    </TableCell>
                    <TableCell>{feedback.comment}</TableCell>
                    <TableCell>{formatDate(feedback.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Nenhum comentário recente
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default FeedbackDashboard;