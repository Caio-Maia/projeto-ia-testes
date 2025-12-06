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
  FaCheckCircle,
  FaArrowRight,
  FaChartLine
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../contexts/DarkModeContext';

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  const { isDarkMode } = useDarkMode();
  
  const features = [
    {
      icon: FaTasks,
      titleKey: 'improveTask',
      descKey: 'improveTaskDesc',
      path: '/improve-task',
      color: '#3b82f6',
      emoji: '📝'
    },
    {
      icon: FaClipboardList,
      titleKey: 'generateTests',
      descKey: 'generateTestsDesc',
      path: '/generate-tests',
      color: '#22c55e',
      emoji: '✅'
    },
    {
      icon: FaCode,
      titleKey: 'generateCode',
      descKey: 'generateCodeDesc',
      path: '/generate-code',
      color: '#fbc02d',
      emoji: '💻'
    },
    {
      icon: FaExclamationTriangle,
      titleKey: 'analyzeRisks',
      descKey: 'analyzeRisksDesc',
      path: '/analyze-risks',
      color: '#d84315',
      emoji: '⚠️'
    },
    {
      icon: FaChartLine,
      titleKey: 'testCoverage',
      descKey: 'testCoverageDesc',
      path: '/test-coverage',
      color: '#10b981',
      emoji: '📊'
    },
    {
      icon: FaChartBar,
      titleKey: 'feedbackDashboard',
      descKey: 'feedbackDashboardDesc',
      path: '/feedback-dashboard',
      color: '#3b82f6',
      emoji: '📈'
    },
    {
      icon: FaCog,
      titleKey: 'adjustPrompts',
      descKey: 'adjustPromptsDesc',
      path: '/adjust-prompts',
      color: '#f57c00',
      emoji: '⚙️'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      icon: FaLightbulb,
      titleKey: 'step1Title',
      descKey: 'step1Desc'
    },
    {
      step: 2,
      icon: FaRobot,
      titleKey: 'step2Title',
      descKey: 'step2Desc'
    },
    {
      step: 3,
      icon: FaCheckCircle,
      titleKey: 'step3Title',
      descKey: 'step3Desc'
    }
  ];

  const stats = [
    { label: 'Modelos IA', value: '2', icon: '🤖' },
    { label: 'Frameworks', value: '5+', icon: '⚙️' },
    { label: 'Integrações', value: '1', icon: '🔗' },
    { label: 'Idiomas', value: '2', icon: '🌍' }
  ];

  return (
    <Box sx={{ width: '100%', pb: 4, background: isDarkMode ? '#0f1419' : '#ffffff' }}>
      {/* Hero Section - Melhorada */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
          color: 'white',
          py: { xs: 6, sm: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: { xs: 2, md: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ fontSize: '2rem' }}></Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      px: 2, 
                      py: 0.75,
                      borderRadius: '20px',
                      fontWeight: 600
                    }}
                  >
                    IA-Powered QA Automation
                  </Typography>
                </Box>
                <Typography 
                  variant={isMobile ? 'h4' : 'h3'} 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    letterSpacing: '0.5px',
                    lineHeight: 1.2
                  }}
                >
                  {t('home.title')}
                </Typography>
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'} 
                  sx={{ 
                    mb: 4,
                    opacity: 0.95,
                    lineHeight: 1.8,
                    maxWidth: '100%'
                  }}
                >
                  {t('home.subtitle')}
                </Typography>
                
                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {stats.map((stat, idx) => (
                    <Grid item xs={6} sm={3} key={idx}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#ffffff' }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, color: '#ffffff' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Link to="/improve-task" style={{ textDecoration: 'none' }}>
                    <Button 
                      variant="contained" 
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        background: '#ffffff',
                        color: '#3b82f6',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        borderRadius: '8px',
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&:hover': {
                          background: '#f3f4f6',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
                        },
                        transition: '0.3s ease-in-out'
                      }}
                    >
                      {t('home.startButton')} <FaArrowRight size={14} />
                    </Button>
                  </Link>
                  <Link to="/feedback-dashboard" style={{ textDecoration: 'none' }}>
                    <Button 
                      variant="outlined" 
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        borderColor: '#ffffff',
                        color: '#ffffff',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        borderRadius: '8px',
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        '&:hover': {
                          background: 'rgba(255,255,255,0.15)',
                          borderColor: '#ffffff',
                          transform: 'translateY(-3px)'
                        },
                        transition: '0.3s ease-in-out'
                      }}
                    >
                      {t('home.dashboardButton')}
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Grid>
            
            {/* Illustration / Visual Element */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: '100%' }}>
              <Box
                sx={{
                  fontSize: '120px',
                  opacity: 0.15,
                  animation: 'float 3s ease-in-out infinite',
                  position: 'absolute',
                  right: '100px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(-50%)' },
                    '50%': { transform: 'translateY(calc(-50% + 20px))' }
                  }
                }}
              >
                🤖
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Divider sx={{ my: { xs: 4, sm: 6, md: 8 } }} />

        {/* Funcionalidades */}
        <Box sx={{ mb: { xs: 6, sm: 8, md: 13 } }}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              textAlign: 'center',
              color: isDarkMode ? '#f3f4f6' : '#232b33'
            }}
          >
            🎯 {t('home.mainFeatures')}
          </Typography>
          
          <Grid container spacing={{ xs: 2, sm: 3, md: 8 }} justifyContent="center">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
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
                        backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                        '&:hover': {
                          boxShadow: `0 12px 32px ${feature.color}30`,
                          transform: 'translateY(-8px)',
                          borderColor: feature.color,
                          backgroundColor: isDarkMode ? '#232b33' : '#ffffff'
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
                          color: isDarkMode ? '#f3f4f6' : '#1f2937',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        {t(`home.${feature.titleKey}`)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: isDarkMode ? '#d1d5db' : '#666', 
                          lineHeight: 1.6,
                          flexGrow: 1
                        }}
                      >
                        {t(`home.${feature.descKey}`)}
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
                        {t('home.explore')} →
                      </Box>
                    </Card>
                  </Link>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider sx={{ my: { xs: 4, sm: 6, md: 8 } }} />

        {/* Como Funciona */}
        <Box sx={{ mb: { xs: 6, sm: 8, md: 10 } }}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 700,
              mb: 1,
              textAlign: 'center',
              color: isDarkMode ? '#f3f4f6' : '#1f2937'
            }}
          >
            {t('home.howItWorksTitle')}
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              textAlign: 'center',
              color: isDarkMode ? '#d1d5db' : '#6b7280',
              mb: 4,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            {t('home.howItWorksDesc')}
          </Typography>
          
          <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: '1200px', mx: 'auto' }}>
            {howItWorks.map((item, index) => {
              return (
                <Grid item xs={12} sm={12} md={4} key={index} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      background: isDarkMode ? '#1a202c' : '#f9fafb',
                      transition: '0.3s ease-in-out',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
                        borderColor: '#3b82f6',
                        transform: 'translateY(-4px)',
                        backgroundColor: isDarkMode ? '#232b33' : '#f3f4f6'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '22px',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {item.step}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '1rem' }}>
                        {t(`home.${item.titleKey}`)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', lineHeight: 1.7, flexGrow: 1 }}>
                      {t(`home.${item.descKey}`)}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider sx={{ my: { xs: 4, sm: 6, md: 8 } }} />

        {/* Benefícios */}
        <Box sx={{ mb: { xs: 6, sm: 8, md: 10 } }}>
          <Typography 
            variant="h5" 
            component="h2"
            sx={{ 
              fontWeight: 700,
              mb: 1,
              textAlign: 'center',
              color: isDarkMode ? '#f3f4f6' : '#1f2937'
            }}
          >
            {t('home.whyUseApp')}
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              textAlign: 'center',
              color: isDarkMode ? '#d1d5db' : '#6b7280',
              mb: 4,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            {t('home.whyUseAppDesc')}
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {[
              { icon: '⚡', titleKey: 'timeSaving', descKey: 'timeSavingDesc' },
              { icon: '✅', titleKey: 'qualityGuaranteed', descKey: 'qualityGuaranteedDesc' },
              { icon: '🤖', titleKey: 'aiPowered', descKey: 'aiPoweredDesc' },
              { icon: '📚', titleKey: 'completeHistory', descKey: 'completeHistoryDesc' },
              { icon: '⚠️', titleKey: 'riskAnalysis', descKey: 'riskAnalysisDesc' },
              { icon: '🎯', titleKey: 'customizable', descKey: 'customizableDesc' },
              { icon: '🎓', titleKey: 'educationalMode', descKey: 'educationalModeDesc' },
              { icon: '🔗', titleKey: 'jiRAIntegration', descKey: 'jiRAIntegrationDesc' }
            ].map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '10px',
                    background: isDarkMode ? '#1a202c' : '#f9fafb',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    transition: '0.3s ease-in-out',
                    width: '100%',
                    '&:hover': {
                      background: isDarkMode ? '#232b33' : '#f3f4f6',
                      borderColor: '#3b82f6',
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.1)'}`
                    }
                  }}
                >
                  <Box sx={{ fontSize: '1.8rem', flexShrink: 0 }}>{benefit.icon}</Box>
                  <Box sx={{ width: '100%' }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937', mb: 0.5 }}
                    >
                      {t(`home.${benefit.titleKey}`)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', lineHeight: 1.5 }}
                    >
                      {t(`home.${benefit.descKey}`)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Final - Melhorada */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '16px',
            p: { xs: 4, sm: 5, md: 6 },
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h4" 
              sx={{ fontWeight: 700, mb: 2 }}
            >
              {t('home.readyToStart')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ mb: 4, opacity: 0.95, fontSize: '1.1rem' }}
            >
              {t('home.readyToStartDesc')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/improve-task" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    background: '#ffffff',
                    color: '#3b82f6',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      background: '#f3f4f6',
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
                    },
                    transition: '0.3s ease-in-out'
                  }}
                >
                  Melhorar Tarefa <FaArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/generate-tests" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    background: '#ffffff',
                    color: '#3b82f6',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      background: '#f3f4f6',
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
                    },
                    transition: '0.3s ease-in-out'
                  }}
                >
                  Gerar Testes <FaArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/generate-code" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    background: '#ffffff',
                    color: '#3b82f6',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      background: '#f3f4f6',
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
                    },
                    transition: '0.3s ease-in-out'
                  }}
                >
                  Gerar Código <FaArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/test-coverage" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"}
                  sx={{
                    background: '#ffffff',
                    color: '#3b82f6',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      background: '#f3f4f6',
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
                    },
                    transition: '0.3s ease-in-out'
                  }}
                >
                  Cobertura de Testes <FaArrowRight size={16} />
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;
