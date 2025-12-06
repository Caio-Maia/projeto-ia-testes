import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  FaBook,
  FaTerminal,
  FaArrowRight,
  FaDatabase,
  FaShieldAlt,
  FaCode,
  FaLink,
  FaClipboard,
} from 'react-icons/fa';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function DocumentationPage() {
  const { language } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const [tabValue, setTabValue] = useState(0);
  const isPT = language === 'pt-BR';

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const quickStartContent = isPT ? (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🚀 Guia de Início Rápido
      </Typography>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: isDarkMode ? '#1a202c' : '#f0f4f8' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          1. Instalação
        </Typography>
        <Box component="pre" sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto' }}>
          <code>{`# Clone o repositório
git clone https://github.com/Caio-Maia/projeto-ia-testes.git
cd projeto-ia-testes

# Instale dependências do Backend
cd backend
npm install

# Instale dependências do Frontend
cd ../front
npm install`}</code>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: isDarkMode ? '#1a202c' : '#f0f4f8' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          2. Configuração de Variáveis de Ambiente
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? '#d1d5db' : '#1f2937' }}>
          Crie um arquivo <code style={{ background: isDarkMode ? '#374151' : '#e0e0e0', padding: '2px 6px', borderRadius: 3, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>.env</code> na pasta backend:
        </Typography>
        <Box component="pre" sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto' }}>
          <code>{`OPENAI_API_KEY=sua_chave_aqui
GEMINI_API_KEY=sua_chave_aqui
PORT=5000`}</code>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: isDarkMode ? '#1a202c' : '#f0f4f8' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          3. Executar o Projeto
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? '#d1d5db' : '#1f2937' }}>
          Terminal 1 - Backend:
        </Typography>
        <Box component="pre" sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto', mb: 2 }}>
          <code>{`cd backend
npm start`}</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Terminal 2 - Frontend:
        </Typography>
        <Box component="pre" sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto' }}>
          <code>{`cd front
npm start`}</code>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, backgroundColor: isDarkMode ? '#1a2b1f' : '#e8f5e9' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: isDarkMode ? '#4caf50' : '#2e7d32' }}>
          ✅ Tudo Pronto!
        </Typography>
        <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#1f2937' }}>
          Acesse <strong>http://localhost:3000</strong> no seu navegador e comece a usar a aplicação.
        </Typography>
      </Paper>
    </Box>
  ) : (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🚀 Quick Start Guide
      </Typography>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f0f4f8' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          1. Installation
        </Typography>
        <Box component="pre" sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto' }}>
          <code>{`# Clone the repository
git clone https://github.com/Caio-Maia/projeto-ia-testes.git
cd projeto-ia-testes

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../front
npm install`}</code>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f0f4f8' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          2. Environment Variables Configuration
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Create a <code style={{ background: '#e0e0e0', padding: '2px 6px', borderRadius: 3 }}>.env</code> file in the backend folder:
        </Typography>
        <Box component="pre" sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto' }}>
          <code>{`OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
PORT=5000`}</code>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f0f4f8' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          3. Run the Project
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Terminal 1 - Backend:
        </Typography>
        <Box component="pre" sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto', mb: 2 }}>
          <code>{`cd backend
npm start`}</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Terminal 2 - Frontend:
        </Typography>
        <Box component="pre" sx={{ backgroundColor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1, overflow: 'auto' }}>
          <code>{`cd front
npm start`}</code>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, backgroundColor: '#e8f5e9' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#2e7d32' }}>
          ✅ All Set!
        </Typography>
        <Typography variant="body2">
          Access <strong>http://localhost:3000</strong> in your browser and start using the application.
        </Typography>
      </Paper>
    </Box>
  );

  const featureContent = isPT ? (
    <Box>
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ justifyContent: 'center', maxWidth: '1000px', mx: 'auto' }}>
        {[
          {
            title: '📝 Melhorar Tarefas',
            desc: 'Refine histórias de usuário com IA, gere critérios de aceitação e integre com JIRA',
            color: '#3b82f6'
          },
          {
            title: '🧪 Gerar Casos de Teste',
            desc: 'Crie casos de teste estruturados e abrangentes automaticamente',
            color: '#22c55e'
          },
          {
            title: '⚙️ Gerar Código',
            desc: 'Gere código de teste em múltiplas linguagens e frameworks',
            color: '#fbc02d'
          },
          {
            title: '⚠️ Análise de Riscos',
            desc: 'Identifique e analise riscos potenciais em suas funcionalidades',
            color: '#d84315'
          },
          {
            title: '📊 Dashboard de Feedback',
            desc: 'Visualize métricas e histórico de suas gerações',
            color: '#3b82f6'
          },
          {
            title: '🎓 Modo Educacional',
            desc: 'Aprenda conceitos de QA enquanto gera artefatos',
            color: '#f57c00'
          },
        ].map((feature, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex' }}>
            <Card
              sx={{
                width: '100%',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                p: 2.5,
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
                transition: '0.3s ease-in-out',
                border: `2px solid ${feature.color}20`,
                background: isDarkMode ? '#1a202c' : '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: feature.color,
                  borderRadius: '12px 12px 0 0',
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.3s ease-in-out'
                },
                '&:hover': {
                  boxShadow: `0 16px 32px ${feature.color}20`,
                  transform: 'translateY(-8px)',
                  borderColor: feature.color,
                  '&::before': {
                    transform: 'scaleX(1)'
                  }
                }
              }}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '0.95rem' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  {feature.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  ) : (
    <Box>
      <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ justifyContent: 'center', maxWidth: '1000px', mx: 'auto' }}>
        {[
          {
            title: '📝 Improve Tasks',
            desc: 'Refine user stories with AI, generate acceptance criteria and integrate with JIRA',
            color: '#3b82f6'
          },
          {
            title: '🧪 Generate Test Cases',
            desc: 'Create structured and comprehensive test cases automatically',
            color: '#22c55e'
          },
          {
            title: '⚙️ Generate Code',
            desc: 'Generate test code in multiple languages and frameworks',
            color: '#fbc02d'
          },
          {
            title: '⚠️ Risk Analysis',
            desc: 'Identify and analyze potential risks in your features',
            color: '#d84315'
          },
          {
            title: '📊 Feedback Dashboard',
            desc: 'View metrics and history of your generations',
            color: '#3b82f6'
          },
          {
            title: '🎓 Educational Mode',
            desc: 'Learn QA concepts while generating artifacts',
            color: '#f57c00'
          },
        ].map((feature, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex' }}>
            <Card
              sx={{
                width: '100%',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                p: 2.5,
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
                transition: '0.3s ease-in-out',
                border: `2px solid ${feature.color}20`,
                background: isDarkMode ? '#1a202c' : '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: feature.color,
                  borderRadius: '12px 12px 0 0',
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.3s ease-in-out'
                },
                '&:hover': {
                  boxShadow: `0 16px 32px ${feature.color}20`,
                  transform: 'translateY(-8px)',
                  borderColor: feature.color,
                  '&::before': {
                    transform: 'scaleX(1)'
                  }
                }
              }}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '0.95rem' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#6b7280', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  {feature.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const techStackContent = isPT ? (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🛠 Stack Tecnológico
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaCode size={20} /> Frontend
            </Typography>
            <List>
              {['React 18', 'Material-UI 7', 'React Router', 'Axios', 'React Markdown', 'React Icons'].map((tech, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <FaArrowRight size={14} color="#3b82f6" />
                  </ListItemIcon>
                  <ListItemText primary={tech} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaDatabase size={20} /> Backend
            </Typography>
            <List>
              {['Node.js / Express', 'SQLite + Sequelize', 'Axios', 'CORS', 'Morgan', 'dotenv'].map((tech, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <FaArrowRight size={14} color="#3b82f6" />
                  </ListItemIcon>
                  <ListItemText primary={tech} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
              <FaLink size={20} /> APIs Externas
            </Typography>
            <List>
              {[
                'OpenAI ChatGPT (GPT-3.5, GPT-4)',
                'Google Gemini Pro',
                'Atlassian JIRA API',
              ].map((tech, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <FaArrowRight size={14} color="#3b82f6" />
                  </ListItemIcon>
                  <ListItemText primary={tech} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  ) : (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        🛠 Tech Stack
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaCode size={20} /> Frontend
            </Typography>
            <List>
              {['React 18', 'Material-UI 7', 'React Router', 'Axios', 'React Markdown', 'React Icons'].map((tech, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <FaArrowRight size={14} color="#3b82f6" />
                  </ListItemIcon>
                  <ListItemText primary={tech} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaDatabase size={20} /> Backend
            </Typography>
            <List>
              {['Node.js / Express', 'SQLite + Sequelize', 'Axios', 'CORS', 'Morgan', 'dotenv'].map((tech, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <FaArrowRight size={14} color="#3b82f6" />
                  </ListItemIcon>
                  <ListItemText primary={tech} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaLink size={20} /> External APIs
            </Typography>
            <List>
              {[
                'OpenAI ChatGPT (GPT-3.5, GPT-4)',
                'Google Gemini Pro',
                'Atlassian JIRA API',
              ].map((tech, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <FaArrowRight size={14} color="#3b82f6" />
                  </ListItemIcon>
                  <ListItemText primary={tech} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const apiContent = isPT ? (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        📡 Endpoints Principais
      </Typography>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          Melhorar Tarefa
        </Typography>
        <Box sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <code style={{ color: '#d32f2f' }}>POST /api/improve-task</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Melhora uma história de usuário com sugestões de IA
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          Gerar Casos de Teste
        </Typography>
        <Box sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <code style={{ color: '#d32f2f' }}>POST /api/generate-tests</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Gera casos de teste estruturados a partir de uma tarefa
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          Gerar Código de Teste
        </Typography>
        <Box sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <code style={{ color: '#d32f2f' }}>POST /api/generate-test-code</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Gera código de teste em múltiplas linguagens
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          Análise de Riscos
        </Typography>
        <Box sx={{ backgroundColor: isDarkMode ? '#0f1419' : '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <code style={{ color: '#d32f2f' }}>POST /api/analyze-risks</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Analisa riscos potenciais em uma tarefa
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          JIRA
        </Typography>
        <List>
          {['POST /api/jira-task - Buscar tarefa', 'POST /api/jira-task/update - Atualizar tarefa'].map((endpoint, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>
                <FaLink size={14} color="#3b82f6" />
              </ListItemIcon>
              <ListItemText primary={endpoint} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  ) : (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        📡 Main Endpoints
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Improve Task
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <code style={{ color: '#d32f2f' }}>POST /api/improve-task</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Improves a user story with AI suggestions
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Generate Test Cases
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <code style={{ color: '#d32f2f' }}>POST /api/generate-tests</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Generates structured test cases from a task
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Generate Test Code
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <code style={{ color: '#d32f2f' }}>POST /api/generate-test-code</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Generates test code in multiple languages
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Risk Analysis
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
          <code style={{ color: '#d32f2f' }}>POST /api/analyze-risks</code>
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Analyzes potential risks in a task
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          JIRA
        </Typography>
        <List>
          {['POST /api/jira-task - Fetch task', 'POST /api/jira-task/update - Update task'].map((endpoint, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>
                <FaLink size={14} color="#3b82f6" />
              </ListItemIcon>
              <ListItemText primary={endpoint} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isPT ? '📚 Documentação' : '📚 Documentation'}
        </Typography>
        <Typography variant="body1" sx={{ color: isDarkMode ? '#d1d5db' : '#666', maxWidth: '600px', mx: 'auto' }}>
          {isPT
            ? 'Guia completo para começar a usar o IA-Testes e aproveitar todos os seus recursos'
            : 'Complete guide to get started with IA-Testes and make the most of its features'}
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 4, backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="documentation tabs"
          sx={{
            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e0e0e0'}`,
            '& .MuiTab-root': {
              color: isDarkMode ? '#d1d5db' : '#666',
              fontWeight: 600,
              fontSize: '0.95rem',
            },
            '& .Mui-selected': {
              color: isDarkMode ? '#3b82f6' : '#1976d2',
            },
          }}
        >
          <Tab label={isPT ? '🚀 Início Rápido' : '🚀 Quick Start'} id="tab-0" aria-controls="tabpanel-0" />
          <Tab label={isPT ? '✨ Recursos' : '✨ Features'} id="tab-1" aria-controls="tabpanel-1" />
          <Tab label={isPT ? '🛠 Tech Stack' : '🛠 Tech Stack'} id="tab-2" aria-controls="tabpanel-2" />
          <Tab label={isPT ? '📡 API' : '📡 API'} id="tab-3" aria-controls="tabpanel-3" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {quickStartContent}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {featureContent}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {techStackContent}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {apiContent}
        </TabPanel>
      </Paper>

      {/* Additional Resources */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
          {isPT ? '📖 Recursos Adicionais' : '📖 Additional Resources'}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <FaBook size={32} color="#3b82f6" style={{ marginBottom: 16 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                  {isPT ? 'README' : 'README'}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#666', mb: 2 }}>
                  {isPT ? 'Visão geral do projeto' : 'Project overview'}
                </Typography>
                <Box
                  component="a"
                  href="https://github.com/Caio-Maia/projeto-ia-testes"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                >
                  {isPT ? 'Acessar →' : 'Access →'}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <FaTerminal size={32} color="#3b82f6" style={{ marginBottom: 16 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                  SETUP
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#666', mb: 2 }}>
                  {isPT ? 'Instalação e configuração' : 'Installation & setup'}
                </Typography>
                <Box
                  component="a"
                  href="https://github.com/Caio-Maia/projeto-ia-testes/blob/main/docs/SETUP.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                >
                  {isPT ? 'Acessar →' : 'Access →'}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <FaClipboard size={32} color="#3b82f6" style={{ marginBottom: 16 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                  API
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#666', mb: 2 }}>
                  {isPT ? 'Referência de endpoints' : 'Endpoints reference'}
                </Typography>
                <Box
                  component="a"
                  href="https://github.com/Caio-Maia/projeto-ia-testes/blob/main/docs/API.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                >
                  {isPT ? 'Acessar →' : 'Access →'}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: isDarkMode ? '#1a202c' : '#ffffff' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <FaShieldAlt size={32} color="#3b82f6" style={{ marginBottom: 16 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                  {isPT ? 'Contribuir' : 'Contributing'}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#d1d5db' : '#666', mb: 2 }}>
                  {isPT ? 'Guia de contribuição' : 'Contribution guide'}
                </Typography>
                <Box
                  component="a"
                  href="https://github.com/Caio-Maia/projeto-ia-testes/blob/main/docs/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                >
                  {isPT ? 'Acessar →' : 'Access →'}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default DocumentationPage;
