import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { 
  Typography, 
  useMediaQuery, 
  useTheme, 
  Box, 
  Card,
  Divider,
  Container
} from '@mui/material';
import {
  FaTasks,
  FaClipboardList,
  FaCode,
  FaExclamationTriangle,
  FaChartBar,
  FaCog,
  FaRobot,
  FaLightbulb,
  FaCheckCircle
} from 'react-icons/fa';

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const features = [
    {
      icon: FaTasks,
      title: 'Melhorar Tarefa',
      description: 'Refine e melhore suas tarefas com sugestões inteligentes de IA',
      path: '/improve-task',
      color: '#406cfa'
    },
    {
      icon: FaClipboardList,
      title: 'Gerar Casos de Teste',
      description: 'Crie casos de teste abrangentes automaticamente',
      path: '/generate-tests',
      color: '#388e3c'
    },
    {
      icon: FaCode,
      title: 'Gerar Código de Teste',
      description: 'Gere código de teste pronto para usar em seus projetos',
      path: '/generate-code',
      color: '#fbc02d'
    },
    {
      icon: FaExclamationTriangle,
      title: 'Análise de Riscos',
      description: 'Identifique e analise riscos potenciais em suas tarefas',
      path: '/analyze-risks',
      color: '#d84315'
    },
    {
      icon: FaChartBar,
      title: 'Dashboard de Feedback',
      description: 'Visualize métricas e feedback de suas gerações',
      path: '/feedback-dashboard',
      color: '#1976d2'
    },
    {
      icon: FaCog,
      title: 'Ajustar Prompts',
      description: 'Customize os prompts para melhor atender suas necessidades',
      path: '/adjust-prompts',
      color: '#f57c00'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Insira sua Tarefa',
      description: 'Descreva a tarefa ou funcionalidade que deseja testar',
      icon: FaLightbulb
    },
    {
      step: 2,
      title: 'Escolha a IA',
      description: 'Selecione entre ChatGPT, Gemini ou outro modelo disponível',
      icon: FaRobot
    },
    {
      step: 3,
      title: 'Gere Resultados',
      description: 'A IA processará e gerará casos de teste, código e análises',
      icon: FaCheckCircle
    }
  ];

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #406cfa 0%, #6eafd8 100%)',
          color: 'white',
          py: { xs: 4, sm: 6, md: 8 },
          mb: { xs: 3, sm: 4, md: 6 },
          borderRadius: { xs: 0, sm: 2 },
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(64, 108, 250, 0.2)'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant={isMobile ? 'h4' : 'h3'} 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              letterSpacing: '0.5px'
            }}
          >
            🚀 Gerador Inteligente de Tarefas e Testes
          </Typography>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            sx={{ 
              mb: 3,
              opacity: 0.95,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Potencialize seus testes com IA. Gere casos de teste, código e análises de risco automaticamente.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/improve-task" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                size={isMobile ? "medium" : "large"}
                sx={{
                  background: 'white',
                  color: '#406cfa',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: '#f0f0f0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Começar Agora
              </Button>
            </Link>
            <Link to="/feedback-dashboard" style={{ textDecoration: 'none' }}>
              <Button 
                variant="outlined" 
                size={isMobile ? "medium" : "large"}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Ver Dashboard
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Como Funciona */}
        <Box sx={{ mb: { xs: 6, sm: 8, md: 10 } }}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center',
              color: '#232b33'
            }}
          >
            ⚡ Como Funciona
          </Typography>
          
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
                      transition: 'all 0.3s ease',
                      border: '2px solid transparent',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(64, 108, 250, 0.15)',
                        borderColor: '#406cfa',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #406cfa 0%, #6eafd8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        color: 'white',
                        fontSize: '28px'
                      }}
                    >
                      <Icon />
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ fontWeight: 'bold', mb: 1, color: '#232b33' }}
                    >
                      Passo {item.step}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ fontWeight: 600, mb: 1, color: '#406cfa' }}
                    >
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: '#666', lineHeight: 1.6 }}
                    >
                      {item.description}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider sx={{ my: { xs: 4, sm: 6, md: 4 } }} />

        {/* Funcionalidades */}
        <Box sx={{ mb: { xs: 61, sm: 8, md: 13 } }}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              textAlign: 'center',
              color: '#232b33'
            }}
          >
            🎯 Funcionalidades Principais
          </Typography>
          
          <Grid container spacing={{ xs: 2, sm: 3, md: 8 }} justifyContent="center">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Link to={feature.path} style={{ textDecoration: 'none' }}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        p: 3,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        border: `2px solid ${feature.color}20`,
                        '&:hover': {
                          boxShadow: `0 12px 32px ${feature.color}30`,
                          transform: 'translateY(-8px)',
                          borderColor: feature.color
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '12px',
                          background: `${feature.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          color: feature.color,
                          fontSize: '24px'
                        }}
                      >
                        <Icon />
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1, 
                          color: '#232b33',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666', 
                          lineHeight: 1.6,
                          flexGrow: 1
                        }}
                      >
                        {feature.description}
                      </Typography>
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: `1px solid ${feature.color}30`,
                          color: feature.color,
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        Explorar →
                      </Box>
                    </Card>
                  </Link>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Benefícios */}
        <Box sx={{ mb: { xs: 6, sm: 8, md: 10 } }}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center',
              color: '#232b33'
            }}
          >
            ✨ Por que usar nosso app?
          </Typography>
          
          <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
            {[
              { title: 'Economia de Tempo', desc: 'Gere testes em segundos, não em horas' },
              { title: 'Qualidade Garantida', desc: 'Testes abrangentes e bem estruturados' },
              { title: 'IA Inteligente', desc: 'Powered by ChatGPT e Gemini' },
              { title: 'Histórico Completo', desc: 'Acesse todas as suas gerações anteriores' },
              { title: 'Análise de Riscos', desc: 'Identifique problemas antes que ocorram' },
              { title: 'Customizável', desc: 'Ajuste prompts conforme sua necessidade' }
            ].map((benefit, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: '#f9fbfc',
                    border: '1px solid #e0e7ff',
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: '#f0f4ff',
                      borderColor: '#406cfa',
                      boxShadow: '0 4px 12px rgba(64, 108, 250, 0.1)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #406cfa 0%, #6eafd8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}
                  >
                    ✓
                  </Box>
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ fontWeight: 'bold', color: '#232b33', mb: 0.5 }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: '#666' }}
                    >
                      {benefit.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Final */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #406cfa 0%, #6eafd8 100%)',
            borderRadius: 3,
            p: { xs: 3, sm: 4, md: 5 },
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 8px 32px rgba(64, 108, 250, 0.2)'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Pronto para começar?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ mb: 3, opacity: 0.95 }}
          >
            Escolha uma funcionalidade abaixo e comece a gerar testes inteligentes agora mesmo!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/improve-task" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                size={isMobile ? "medium" : "large"}
                sx={{
                  background: 'white',
                  color: '#406cfa',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: '#f0f0f0',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Melhorar Tarefa
              </Button>
            </Link>
            <Link to="/generate-tests" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                size={isMobile ? "medium" : "large"}
                sx={{
                  background: 'white',
                  color: '#406cfa',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: '#f0f0f0',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Gerar Testes
              </Button>
            </Link>
            <Link to="/generate-code" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                size={isMobile ? "medium" : "large"}
                sx={{
                  background: 'white',
                  color: '#406cfa',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: '#f0f0f0',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Gerar Código
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;
