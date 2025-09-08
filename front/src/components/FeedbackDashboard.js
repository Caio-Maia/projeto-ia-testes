import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, CircularProgress, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

function FeedbackDashboard() {
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
      setError('Erro ao carregar dados de feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = (t) => {
    if (!t) return [];
    const pos = t.ratings.find(r => r.rating === 'positive')?.count || 0;
    const neg = t.ratings.find(r => r.rating === 'negative')?.count || 0;
    return [
      { id: 0, value: pos, label: 'Positivo', color: '#4caf50' },
      { id: 1, value: neg, label: 'Negativo', color: '#f44336' }
    ];
  };

  const typeMap = {
    task: 'Tarefas',
    testcase: 'Casos de Teste',
    code: 'Código de Teste',
    risk: 'Análise de Riscos',
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
    <Box p={{xs: 1, sm: 3, md: 6}} maxWidth={900} margin="0 auto">
      {/* Título */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: '#f4f8fb' }}>
        <Typography variant="h4" fontWeight={700} mb={1} color="primary.main">
          Dashboard de Feedback
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Veja o desempenho dos recursos por feedback dos usuários e os comentários mais recentes.
        </Typography>
      </Paper>

      {/* Gráficos centralizados */}
      {stats.map((stat) => {
        const data = pieData(stat);
        const total = stat.total || 0;
        const pos = stat.ratings.find(r => r.rating === 'positive')?.count || 0;
        const posPerc = total > 0 ? Math.round((pos / total) * 100) : 0;
        const label = typeMap[stat._id] || stat._id;

        return (
          <Paper 
            key={stat._id}
            elevation={4} 
            sx={{ 
              p: 3, 
              mb: 5, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              border: '2px solid #e3f2fd' 
            }}
          >
            <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
              {label}
            </Typography>
            {total > 0 ? (
              <>
                <PieChart
                  series={[{ data, innerRadius: 35, paddingAngle: 3, cornerRadius: 7 }]} 
                  width={200} 
                  height={160} 
                  legend={{ hidden: true }}
                />
                <Typography variant="h6" fontWeight={700} sx={{ color: '#4caf50', mt: 1 }}>
                  {posPerc}% <span style={{fontWeight:400, color:'#111'}}>aprovam</span>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {total} feedbacks recebidos
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" mt={4}>Nenhum feedback recebido</Typography>
            )}
          </Paper>
        );
      })}

      {/* Divider e tabela */}
      <Box mb={2} mt={5}>
        <Divider textAlign="left">
          <Typography variant="h6" fontWeight={600} color="primary.main">Comentários Recentes</Typography>
        </Divider>
      </Box>

      <Paper elevation={2} sx={{ p: { xs: 1, sm: 3 }, background: 'white', boxShadow: '0 2px 12px #e3eaf2' }}>
        {recent.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#e3f2fd' }}>
                  <TableCell><b>Tipo</b></TableCell>
                  <TableCell><b>Avaliação</b></TableCell>
                  <TableCell><b>Comentário</b></TableCell>
                  <TableCell><b>Data</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.map((f, i) => (
                  <TableRow key={f._id || i} sx={{ background: i % 2 === 0 ? '#f7fbff' : 'white' }}>
                    <TableCell>{typeMap[f.type] || f.type}</TableCell>
                    <TableCell>
                      {f.rating === 'positive' ? (
                        <Box display="flex" alignItems="center">
                          <Box width={8} height={8} borderRadius={99} bgcolor="#4caf50" mr={1}></Box>
                          <Typography color="success.main" fontWeight={600}>Positivo</Typography>
                        </Box>
                      ) : (
                        <Box display="flex" alignItems="center">
                          <Box width={8} height={8} borderRadius={99} bgcolor="#f44336" mr={1}></Box>
                          <Typography color="error.main" fontWeight={600}>Negativo</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{f.comment || <i style={{color:'#999'}}>—</i>}</TableCell>
                    <TableCell>{formatDate(f.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            Nenhum comentário recente
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default FeedbackDashboard;
