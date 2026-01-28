import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useLanguage, useDarkMode } from '../stores/hooks';
import { Box, Container, Typography, Link as MuiLink, Grid, Divider } from "@mui/material";
import { FaGithub, FaLinkedin, FaCode } from "react-icons/fa";
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import packageJson from "../../package.json";
import "../App.css";

const Footer = () => {
  const { language } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const currentYear = new Date().getFullYear();
  const version = packageJson.version;
  
  const isPT = language === 'pt-BR';

  return (
    <Box
      component="footer"
      sx={{
        background: isDarkMode 
          ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
        py: 6,
        mt: 10,
        borderTop: isDarkMode 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid #e2e8f0',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Coluna 1: Sobre */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AITest Hub
            </Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', lineHeight: 1.8, maxWidth: 220 }}>
              {isPT ? 'Gerador inteligente de tarefas e testes com IA' : 'Intelligent AI-powered task and test generator'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
              <MuiLink 
                href="https://www.linkedin.com/in/caiojordan/" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: isDarkMode ? '#9ca3af' : '#6b7280', 
                  transition: '0.2s', 
                  '&:hover': { color: '#0077b5' } 
                }}
              >
                <FaLinkedin size={20} />
              </MuiLink>
              <MuiLink 
                href="https://github.com/Caio-Maia" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: isDarkMode ? '#9ca3af' : '#6b7280', 
                  transition: '0.2s', 
                  '&:hover': { color: isDarkMode ? '#fff' : '#1f2937' } 
                }}
              >
                <FaGithub size={20} />
              </MuiLink>
            </Box>
          </Grid>

          {/* Coluna 2: Links Rápidos */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: isDarkMode ? '#f3f4f6' : '#1f2937'
              }}
            >
              {isPT ? 'Links Rápidos' : 'Quick Links'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink
                component={RouterLink}
                to="/home"
                sx={{ 
                  color: isDarkMode ? '#d1d5db' : '#6b7280', 
                  textDecoration: 'none', 
                  transition: '0.2s', 
                  cursor: 'pointer', 
                  '&:hover': { color: '#3b82f6' } 
                }}
              >
                {isPT ? 'Início' : 'Home'}
              </MuiLink>
              <MuiLink
                component={RouterLink}
                to="/improve-task"
                sx={{ 
                  color: isDarkMode ? '#d1d5db' : '#6b7280', 
                  textDecoration: 'none', 
                  transition: '0.2s', 
                  cursor: 'pointer', 
                  '&:hover': { color: '#3b82f6' } 
                }}
              >
                {isPT ? 'Melhorar Tarefa' : 'Improve Task'}
              </MuiLink>
              <MuiLink
                component={RouterLink}
                to="/generate-tests"
                sx={{ 
                  color: isDarkMode ? '#d1d5db' : '#6b7280', 
                  textDecoration: 'none', 
                  transition: '0.2s', 
                  cursor: 'pointer', 
                  '&:hover': { color: '#3b82f6' } 
                }}
              >
                {isPT ? 'Gerar Testes' : 'Generate Tests'}
              </MuiLink>
              <MuiLink
                component={RouterLink}
                to="/generate-code"
                sx={{ 
                  color: isDarkMode ? '#d1d5db' : '#6b7280', 
                  textDecoration: 'none', 
                  transition: '0.2s', 
                  cursor: 'pointer', 
                  '&:hover': { color: '#3b82f6' } 
                }}
              >
                {isPT ? 'Gerar Código' : 'Generate Code'}
              </MuiLink>
            </Box>
          </Grid>

          {/* Coluna 3: Segurança */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: isDarkMode ? '#f3f4f6' : '#1f2937'
              }}
            >
              {isPT ? 'Segurança' : 'Security'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', fontSize: '0.85rem' }}>
                  {isPT ? 'Tokens locais' : 'Local tokens'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', fontSize: '0.85rem' }}>
                  {isPT ? 'Sem dados no servidor' : 'No server data'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityOffIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', fontSize: '0.85rem' }}>
                  {isPT ? 'Comunicação direta' : 'Direct communication'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Coluna 4: Versão */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: isDarkMode ? '#f3f4f6' : '#1f2937'
              }}
            >
              {isPT ? 'Informações' : 'Information'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  {isPT ? 'Versão' : 'Version'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                  v{version}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                  {isPT ? 'Desenvolvido por' : 'Developed by'}
                </Typography>
                <MuiLink 
                  href="https://github.com/Caio-Maia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    display: 'block', 
                    color: '#3b82f6', 
                    textDecoration: 'none', 
                    fontWeight: 600, 
                    transition: '0.2s', 
                    '&:hover': { color: '#2563eb' } 
                  }}
                >
                  Caio Maia
                </MuiLink>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0', my: 3 }} />

        {/* Footer Bottom */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#6b7280', mb: 1 }}>
            © {currentYear} AITest Hub. {isPT ? 'Todos os direitos reservados' : 'All rights reserved'}.
          </Typography>
          <Typography variant="caption" sx={{ color: isDarkMode ? '#6b7280' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <FaCode size={12} /> {isPT ? 'Feito com' : 'Made with'} ❤️ {isPT ? 'por' : 'by'} Caio Maia
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;