import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { Box, Container, Typography, Link as MuiLink, Grid, Divider } from "@mui/material";
import { FaGithub, FaLinkedin, FaCode } from "react-icons/fa";
import packageJson from "../../package.json";
import "../App.css";

const Footer = () => {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const version = packageJson.version;
  
  const isPT = language === 'pt-BR';

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: '#f3f4f6',
        py: 6,
        mt: 10,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Coluna 1: Sobre */}
          <Grid item xs={12} sm={6} md={3}>
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
              Task & Test Generator
            </Typography>
            <Typography variant="body2" sx={{ color: '#d1d5db', lineHeight: 1.8 }}>
              {isPT ? 'Gerador inteligente de tarefas e testes com IA' : 'Intelligent AI-powered task and test generator'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
              <MuiLink 
                href="https://github.com/Caio-Maia/projeto-ia-testes" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ color: '#9ca3af', transition: '0.2s', '&:hover': { color: '#3b82f6' } }}
              >
                <FaGithub size={20} />
              </MuiLink>
              <MuiLink 
                href="https://www.linkedin.com/in/caiojordan/" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ color: '#9ca3af', transition: '0.2s', '&:hover': { color: '#3b82f6' } }}
              >
                <FaLinkedin size={20} />
              </MuiLink>
            </Box>
          </Grid>

          {/* Coluna 2: Links Rápidos */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: '#f3f4f6'
              }}
            >
              {isPT ? 'Links Rápidos' : 'Quick Links'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <RouterLink to="/" style={{ textDecoration: 'none' }}>
                <MuiLink
                  sx={{ color: '#d1d5db', textDecoration: 'none', transition: '0.2s', cursor: 'pointer', '&:hover': { color: '#3b82f6' } }}
                >
                  {isPT ? 'Início' : 'Home'}
                </MuiLink>
              </RouterLink>
              <RouterLink to="/feedback-dashboard" style={{ textDecoration: 'none' }}>
                <MuiLink
                  sx={{ color: '#d1d5db', textDecoration: 'none', transition: '0.2s', cursor: 'pointer', '&:hover': { color: '#3b82f6' } }}
                >
                  Dashboard
                </MuiLink>
              </RouterLink>
              <RouterLink to="/documentation" style={{ textDecoration: 'none' }}>
                <MuiLink
                  sx={{ color: '#d1d5db', textDecoration: 'none', transition: '0.2s', cursor: 'pointer', '&:hover': { color: '#3b82f6' } }}
                >
                  {isPT ? 'Documentação' : 'Documentation'}
                </MuiLink>
              </RouterLink>
            </Box>
          </Grid>

          {/* Coluna 4: Versão */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: '#f3f4f6'
              }}
            >
              {isPT ? 'Informações' : 'Information'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  {isPT ? 'Versão' : 'Version'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                  v{version}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  {isPT ? 'Desenvolvido por' : 'Developed by'}
                </Typography>
                <MuiLink 
                  href="https://github.com/Caio-Maia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ display: 'block', color: '#3b82f6', textDecoration: 'none', fontWeight: 600, transition: '0.2s', '&:hover': { color: '#2563eb' } }}
                >
                  Caio Maia
                </MuiLink>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

        {/* Footer Bottom */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
            © {currentYear} Task & Test Generator. {isPT ? 'Todos os direitos reservados' : 'All rights reserved'}.
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <FaCode size={12} /> {isPT ? 'Feito com' : 'Made with'} ❤️ {isPT ? 'por' : 'by'} Caio Maia
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;