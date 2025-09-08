import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Typography, useMediaQuery, useTheme } from '@mui/material';

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      <Grid 
        container 
        spacing={{ xs: 2, sm: 3, md: 4 }} 
        justifyContent="center" 
        alignItems="center"
        sx={{ mt: { xs: 2, sm: 4, md: 6 } }}
      >
        {/* Coluna da Imagem (esquerda) */}
        <Grid size={{xs:12, md:6}} className="flex-center">
          <img 
            src='/undraw.svg'
            alt="Imagem ilustrativa"
            className="img-responsive"
            style={{ 
              maxWidth: isMobile ? '280px' : '400px',
              marginBottom: isMobile ? '20px' : '0'
            }}
          />
        </Grid>

        {/* Coluna das opções (direita) */}
        <Grid size={{xs:12, md:6}}>
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
          <Grid 
            container 
            direction="column" 
            spacing={{ xs: 1, sm: 2 }} 
            alignItems="center"
          >
            <Grid sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
              <Link to="/improve-task" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"} 
                  fullWidth
                >
                  Melhorar Tarefa
                </Button>
              </Link>
            </Grid>
            <Grid sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
              <Link to="/generate-tests" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"} 
                  fullWidth
                >
                  Gerar Casos de Teste
                </Button>
              </Link>
            </Grid>
            <Grid sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
              <Link to="/generate-code" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <Button 
                  variant="contained" 
                  size={isMobile ? "medium" : "large"} 
                  fullWidth
                >
                  Gerar Código de Teste
                </Button>
              </Link>
            </Grid>
            <Grid sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
              <Link to="/analyze-risks" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <Button 
                  variant="contained" 
                  color="error"
                  size={isMobile ? "medium" : "large"} 
                  fullWidth
                >
                  Análise de Riscos
                </Button>
              </Link>
            </Grid>
            <Grid sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
              <Link to="/feedback-dashboard" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                <Button 
                  variant="contained" 
                  color="success"
                  size={isMobile ? "medium" : "large"} 
                  fullWidth
                >
                  Dashboard de Feedback
                </Button>
              </Link>
            </Grid>
            <Grid sx={{ width: '100%', maxWidth: { xs: '100%', sm: '280px' } }}>
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
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default HomePage;
