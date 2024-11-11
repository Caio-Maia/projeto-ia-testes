import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Grid2';

function HomePage() {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {/* Cabeçalho */}
      <h1 style={{ marginBottom: '10px' }}>Bem-vindo ao Gerador de Tarefas e Casos de Teste</h1>

      {/* Container principal com duas colunas */}
      <Grid2 
        container 
        spacing={2} 
        justifyContent="center" 
        alignItems="center"
        style={{ marginTop: '50px' }}
      >
        {/* Coluna da Imagem (esquerda) */}
        <Grid2 item xs={12} md={6}>
          <img 
            src='/undraw.svg'  // Substitua pelo caminho correto da sua imagem
            alt="Imagem ilustrativa"
            style={{ width: '100%', maxWidth: '400px', height: 'auto' }} // Tamanho da imagem ajustável
          />
        </Grid2>

        {/* Coluna das opções (direita) */}
        <Grid2 item xs={12} md={6}>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>Escolha uma das opções abaixo:</p>
          
          {/* Botões em forma de lista, com largura fixa */}
          <Grid2 container direction="column" spacing={2} alignItems="center">
            <Grid2 item>
              <Link to="/improve-task">
                <Button 
                  variant="contained" 
                  size="large" 
                  style={{ width: '250px' }} // Largura padrão para os botões
                >
                  Melhorar Tarefa
                </Button>
              </Link>
            </Grid2>
            <Grid2 item>
              <Link to="/generate-tests">
                <Button 
                  variant="contained" 
                  size="large" 
                  style={{ width: '250px' }} // Mesma largura do outro botão
                >
                  Gerar Casos de Teste
                </Button>
              </Link>
            </Grid2>
            <Grid2 item>
              <Link to="/adjust-prompts">
                <Button 
                  variant="contained" 
                  color='warning'
                  size="large" 
                  style={{ width: '250px' }} // Mesma largura do outro botão
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
