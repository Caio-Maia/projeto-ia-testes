import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, useTheme, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLanguage, useDarkMode } from '../stores/hooks';
import { FaArrowRight, FaSun, FaMoon } from 'react-icons/fa';

// Icons
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import StorageIcon from '@mui/icons-material/Storage';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ShieldIcon from '@mui/icons-material/Shield';
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RefreshIcon from '@mui/icons-material/Refresh';

const LandingPage = ({ onOpenTokenDialog }) => {
  const { t, language, changeLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <AutoFixHighIcon sx={{ fontSize: 40 }} />,
      title: t('landing.features.improveTask'),
      description: t('landing.features.improveTaskDesc'),
      color: '#3b82f6',
    },
    {
      icon: <BugReportIcon sx={{ fontSize: 40 }} />,
      title: t('landing.features.generateTests'),
      description: t('landing.features.generateTestsDesc'),
      color: '#22c55e',
    },
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: t('landing.features.generateCode'),
      description: t('landing.features.generateCodeDesc'),
      color: '#f59e0b',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: t('landing.features.riskAnalysis'),
      description: t('landing.features.riskAnalysisDesc'),
      color: '#ef4444',
    },
    {
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      title: t('landing.features.dashboard'),
      description: t('landing.features.dashboardDesc'),
      color: '#8b5cf6',
    },
    {
      icon: <RefreshIcon sx={{ fontSize: 40 }} />,
      title: t('landing.features.feedbackRegenerate'),
      description: t('landing.features.feedbackRegenerateDesc'),
      color: '#06b6d4',
    },
  ];

  const steps = [
    {
      number: '1',
      title: t('landing.howItWorks.step1Title'),
      description: t('landing.howItWorks.step1Desc'),
    },
    {
      number: '2',
      title: t('landing.howItWorks.step2Title'),
      description: t('landing.howItWorks.step2Desc'),
    },
    {
      number: '3',
      title: t('landing.howItWorks.step3Title'),
      description: t('landing.howItWorks.step3Desc'),
    },
  ];

  const privacyFeatures = [
    {
      icon: <StorageIcon sx={{ fontSize: 48 }} />,
      title: t('landing.privacy.localStorage.title'),
      description: t('landing.privacy.localStorage.desc'),
    },
    {
      icon: <VpnKeyIcon sx={{ fontSize: 48 }} />,
      title: t('landing.privacy.yourKeys.title'),
      description: t('landing.privacy.yourKeys.desc'),
    },
    {
      icon: <VisibilityOffIcon sx={{ fontSize: 48 }} />,
      title: t('landing.privacy.zeroAccess.title'),
      description: t('landing.privacy.zeroAccess.desc'),
    },
  ];

  const handleGetStarted = () => {
    const chatgptToken = localStorage.getItem('chatgptToken');
    const geminiToken = localStorage.getItem('geminiToken');
    
    if (!chatgptToken && !geminiToken) {
      onOpenTokenDialog(true);
    } else {
      navigate('/home');
    }
  };

  return (
    <Box sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#ffffff', minHeight: '100vh' }}>
      {/* Hero Section with Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
          color: 'white',
          pt: { xs: 4, md: 6 },
          pb: { xs: 8, md: 12 },
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
          {/* Language Selector and Dark Mode Toggle inside Hero */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Dark Mode Toggle */}
              <IconButton
                onClick={toggleDarkMode}
                sx={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    transform: 'scale(1.05)',
                  },
                }}
                title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </IconButton>

              <Button
                onClick={() => changeLanguage('pt-BR')}
                sx={{
                  minWidth: 'auto',
                  p: 1,
                  borderRadius: '8px',
                  border: language === 'pt-BR' 
                    ? '2px solid rgba(255,255,255,0.9)' 
                    : '2px solid transparent',
                  opacity: language === 'pt-BR' ? 1 : 0.7,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    opacity: 1,
                    transform: 'scale(1.05)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
                title="Português (Brasil)"
              >
                <Box component="span" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>🇧🇷</Box>
              </Button>
              
              <Button
                onClick={() => changeLanguage('en-US')}
                sx={{
                  minWidth: 'auto',
                  p: 1,
                  borderRadius: '8px',
                  border: language === 'en-US' 
                    ? '2px solid rgba(255,255,255,0.9)' 
                    : '2px solid transparent',
                  opacity: language === 'en-US' ? 1 : 0.7,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    opacity: 1,
                    transform: 'scale(1.05)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
                title="English (US)"
              >
                <Box component="span" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>🇺🇸</Box>
              </Button>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
              <RocketLaunchIcon sx={{ fontSize: { xs: 48, md: 64 } }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  px: 2, 
                  py: 0.75,
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                IA-Powered QA Automation
              </Typography>
            </Box>
            
            <Typography 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2.25rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 3,
                letterSpacing: '-0.02em',
              }}
            >
              {t('landing.hero.title')}
            </Typography>
            
            <Typography 
              sx={{ 
                fontSize: { xs: '1.1rem', md: '1.35rem' },
                opacity: 0.95,
                lineHeight: 1.8,
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              {t('landing.hero.subtitle')}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleGetStarted}
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
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  '&:hover': {
                    background: '#f3f4f6',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {t('landing.hero.cta')} <FaArrowRight size={14} />
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    borderColor: '#ffffff',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {t('landing.hero.learnMore')}
              </Button>
            </Box>

            {/* Privacy Badge */}
            <Box 
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 1,
                py: 1.5,
                px: 3,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '30px',
              }}
            >
              <ShieldIcon sx={{ color: '#86efac', fontSize: 22 }} />
              <Typography sx={{ color: '#86efac', fontWeight: 600, fontSize: '0.9rem' }}>
                {t('landing.privacy.badge')}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Privacy & Security Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 10 }, 
          px: 2, 
          backgroundColor: isDarkMode ? '#0d2818' : '#ecfdf5',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <LockIcon sx={{ fontSize: 36, color: theme.palette.success.main }} />
              <Typography 
                variant="h4"
                sx={{ 
                  fontWeight: 700,
                  color: isDarkMode ? '#86efac' : '#166534',
                }}
              >
                {t('landing.privacy.title')}
              </Typography>
            </Box>
            <Typography sx={{ color: isDarkMode ? '#6ee7b7' : '#15803d', fontSize: '1.1rem', maxWidth: '600px', mx: 'auto' }}>
              {t('landing.privacy.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {privacyFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    p: 4,
                    height: '100%',
                    backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#d1fae5'}`,
                    borderRadius: '12px',
                    boxShadow: isDarkMode 
                      ? '0 4px 12px rgba(0,0,0,0.3)' 
                      : '0 4px 12px rgba(16,185,129,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDarkMode 
                        ? '0 8px 24px rgba(0,0,0,0.4)' 
                        : '0 8px 24px rgba(16,185,129,0.15)',
                    },
                  }}
                >
                  <Box sx={{ color: theme.palette.success.main, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1.5,
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box 
            sx={{ 
              mt: 5, 
              p: 3, 
              textAlign: 'center',
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '12px',
              border: `1px dashed ${isDarkMode ? '#10b981' : '#6ee7b7'}`,
            }}
          >
            <Typography sx={{ color: isDarkMode ? '#6ee7b7' : '#166534', fontWeight: 500 }}>
              {t('landing.privacy.trustStatement')}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Educational Mode Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 8 }, 
          px: 2, 
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e3a5f 0%, #0f1419 100%)' 
            : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: isDarkMode ? '#f3f4f6' : '#1e40af',
                  }}
                >
                  {t('landing.educational.title')}
                </Typography>
              </Box>
              <Typography 
                sx={{ 
                  fontSize: '1.15rem', 
                  color: isDarkMode ? '#d1d5db' : '#374151', 
                  mb: 3,
                  lineHeight: 1.8,
                }}
              >
                {t('landing.educational.description')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { icon: <LightbulbIcon />, text: t('landing.educational.benefit1') },
                  { icon: <CheckCircleIcon />, text: t('landing.educational.benefit2') },
                  { icon: <AutoFixHighIcon />, text: t('landing.educational.benefit3') },
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: '#f59e0b' }}>{item.icon}</Box>
                    <Typography sx={{ color: isDarkMode ? '#e5e7eb' : '#374151', fontWeight: 500 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  p: 3, 
                  borderRadius: '16px', 
                  backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                  border: `2px solid ${isDarkMode ? '#f59e0b' : '#fbbf24'}`,
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
                }}
              >
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: '#ef4444' 
                  }} />
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: '#f59e0b' 
                  }} />
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: '#22c55e' 
                  }} />
                  <Typography sx={{ ml: 2, color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                    {t('landing.educational.exampleTitle')}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: isDarkMode ? '#0f1419' : '#f9fafb', 
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  color: isDarkMode ? '#d1d5db' : '#374151',
                }}>
                  <Typography sx={{ color: '#f59e0b', fontWeight: 600, mb: 1, fontFamily: 'inherit' }}>
                    📚 {t('landing.educational.whyLabel')}
                  </Typography>
                  <Typography sx={{ fontFamily: 'inherit', lineHeight: 1.6, fontSize: '0.85rem' }}>
                    {t('landing.educational.exampleText')}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box 
        id="features" 
        sx={{ 
          py: { xs: 6, md: 10 }, 
          px: 2, 
          backgroundColor: isDarkMode ? '#0f1419' : '#f9fafb',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: isDarkMode ? '#f3f4f6' : '#1f2937',
              }}
            >
              {t('landing.features.title')}
            </Typography>
            <Typography sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '1.1rem' }}>
              {t('landing.features.subtitle')}
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card 
                  sx={{ 
                    p: 4,
                    height: '100%',
                    backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      borderColor: feature.color,
                    },
                  }}
                >
                  <Box sx={{ color: feature.color, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1.5,
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 10 }, 
          px: 2, 
          backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: isDarkMode ? '#f3f4f6' : '#1f2937',
              }}
            >
              {t('landing.howItWorks.title')}
            </Typography>
            <Typography sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '1.1rem' }}>
              {t('landing.howItWorks.subtitle')}
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {steps.map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {step.number}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1.5,
                      color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280', lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 10 }, 
          px: 2, 
          backgroundColor: isDarkMode ? '#0f1419' : '#f9fafb',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: isDarkMode ? '#f3f4f6' : '#1f2937',
              }}
            >
              {t('landing.benefits.title')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              t('landing.benefits.benefit1'),
              t('landing.benefits.benefit2'),
              t('landing.benefits.benefit3'),
              t('landing.benefits.benefit4'),
            ].map((benefit, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 3,
                  backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                <Typography sx={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', fontWeight: 500 }}>
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          px: 2, 
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1e40af 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h4"
              sx={{ 
                fontWeight: 700,
                color: '#ffffff',
                mb: 2,
              }}
            >
              {t('landing.cta.title')}
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                mb: 4,
              }}
            >
              {t('landing.cta.subtitle')}
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleGetStarted}
              sx={{
                background: '#ffffff',
                color: '#3b82f6',
                fontWeight: 700,
                textTransform: 'none',
                px: 5,
                py: 1.5,
                borderRadius: '8px',
                fontSize: '1.1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                '&:hover': {
                  background: '#f3f4f6',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {t('landing.cta.button')} <FaArrowRight size={14} />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          py: 4, 
          px: 2, 
          backgroundColor: isDarkMode ? '#0f1419' : '#ffffff',
          borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ color: isDarkMode ? '#6b7280' : '#9ca3af', fontSize: '0.875rem' }}>
          {t('landing.footer.copyright')}
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
