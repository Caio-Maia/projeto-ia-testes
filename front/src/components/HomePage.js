import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Grid2';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <div className="responsive-container text-center spacing-md">
      {/* Cabeçalho */}
      <Typography 
        variant={isMobile ? 'h5' : 'h4'} 
        component="h1" 
        className="heading-responsive"
        sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 'bold' }}
      >
        Bem-vindo ao Gerador de Tarefas e Casos de Teste
      </Typography>

      {/* Container principal com duas colunas */}
      <Grid2 
        container 
        spacing={{ xs: 2, sm: 3, md: 4 }} 
        justifyContent="center" 
        alignItems="center"
        sx={{ mt: { xs: 2, sm: 4, md: 6 } }}
      >
        {/* Coluna da Imagem (esquerda) */}
        <Grid2 item xs={12} md={6} className="flex-center">
          <img 
            src='/undraw.svg'
            alt="Imagem ilustrativa"
            className="img-responsive"
            style={{ 
              maxWidth: isMobile ? '280px' : '400px',
              marginBottom: isMobile ? '20px' : '0'
            }}
          />
        </Grid2>

        {/* Coluna das opções (direita) */}
        <Grid2 item xs={12} md={6}>
          <Typography 
            variant="h6" 
            component="p" 
            sx={{ 
              mb: { xs: 2, md: 3 },
              fontSize: { xs: '16px', sm: '18px' }
            }}
          >
            Escolha uma das opções abaixo:
          </Typography>
          
          {/* Botões em forma de lista, com largura responsiva */}
          <Grid2 
            container 
            direction="column" 
            spacing={{ xs: 1, sm: 2 }} 
            alignItems="center"
          >
            <Grid2 item sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
              <Link to="/improve-task" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"} 
                  fullWidth
                >
                  Melhorar Tarefa
                </Button>
              </Link>
            </Grid2>
            <Grid2 item sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
              <Link to="/generate-tests" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"} 
                  fullWidth
                >
                  Gerar Casos de Teste
                </Button>
              </Link>
            </Grid2>
            <Grid2 item sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
              <Link to="/adjust-prompts" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <Button 
                  variant="contained" 
                  color='warning'
                  size={isMobile ? "medium" : "large"} 
                  fullWidth
                >
                  Ajustar Prompts
                </Button>
              </Link>
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
    </div>
  );
}

export default HomePage;
