import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Grid,
  Alert, Snackbar, CircularProgress
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import FeedbackComponent from './FeedbackComponent';
import { AI_MODELS } from '../utils/aiModels';
import { addVersion, getVersions, restoreVersion } from '../utils/generationHistory';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function CodeGenerationPage() {
  const [testCases, setTestCases] = useState('');
  const [framework, setFramework] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [model, setModel] = useState({ apiName: '', version: '' });
  const [result, setResult] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  const [educationMode] = React.useState(() => {
    const saved = localStorage.getItem('educationMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const isButtonDisabled = testCases === '' || framework === '' || model.apiName === '';
  const options = AI_MODELS;

  const frameworkOptions = [
    'Jest',
    'Mocha',
    'Cypress',
    'Playwright',
    'Selenium',
    'TestCafe',
    'WebdriverIO',
    'Puppeteer'
  ];

  const languageOptions = [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#'
  ];

  const handleTestCasesChange = (event) => {
    setTestCases(event.target.value);
  };

  const handleFrameworkChange = (event) => {
    setFramework(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleModelChange = (event) => {
    const { apiName, version } = event.target.value;
    setModel({ apiName, version });
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    setError(null);
    e.preventDefault();
    
    let token;
    if (model.apiName === 'gemini') {
      token = localStorage.getItem('geminiToken');
    } else if (model.apiName === 'chatgpt') {
      token = localStorage.getItem('chatgptToken');
    } else {
      setError('Sem token para realizar requisição');
      setIsLoading(false);
      return;
    }
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      // PROMPT EDUCACIONAL
      let educationalPrompt = '';
      if (educationMode) {
        educationalPrompt += `\n\n---\nModo Educacional Ativo:\n- Explique passo a passo como construiu o código de teste.\n- Adicione comentários didáticos no código mostrando a lógica de cada etapa, função e verificação.\n- Destaque boas práticas e conceitos fundamentais (ex: DRY, modularidade, clareza, validação de cenário positivo/negativo).\n- Ao final, sugira tópicos para estudo: cobertura de testes, valores-limite, BDD, frameworks de teste, etc.\n`;
      }
      const response = await axios.post(
        `${backendUrl}/api/${model.apiName}/generate-test-code?token=${token}`,
        {
          testCases,
          framework,
          language,
          model: model.version,
          educationMode,
          promptSupplement: educationMode ? educationalPrompt : undefined
        }
      );
      
      const resultData = model.apiName === 'gemini' ? response.data.data : response.data;
      setResult(resultData);
      // Save as first version if not present yet
      if (generationId) {
        addVersion(generationId, resultData, { framework, language, type: 'code', model: model.version });
      }
      // Save to local storage and get the ID
      const id = saveGenerationToLocalStorage(resultData, 'code', model.version, `${framework} tests in ${language}`);
      setGenerationId(id);
      // update versions
      setVersions(getVersions(id));
    } catch (error) {
      setError('Erro ao gerar código de teste');
      console.error('Erro ao gerar código de teste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler do callback de uma nova geração vinda do FeedbackComponent (regeneração)
  const handleRegeneratedContent = (regeneratedContent) => {
    // Salva versão anterior
    if (generationId && result)  {
      addVersion(generationId, result, { type: 'code', model: model.version });
    }
    setResult(regeneratedContent);
    if (generationId) setVersions(getVersions(generationId));
  };

  // Handler para abrir/fechar modal
  const openVersionsModal = () => {
    if (generationId) setVersions(getVersions(generationId));
    setShowHistory(true);
  };

  const closeVersionsModal = () => setShowHistory(false);

  const handleRestore = idx => {
    if (!generationId) return;
    const v = restoreVersion(generationId, idx);
    if (v && v.content) setResult(v.content);
    setShowHistory(false);
  };

  return (
    <Grid
      container
      spacing={3}
      direction="column"
      alignItems="center"
      justifyContent="center"
      padding={10}
      style={{ minHeight: '81vh' }}
    >
      <Grid size={{ xs:10, md:6, lg:4 }} style={{ minWidth: '1000px' }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Gerar Código de Teste
          </Typography>
        </Box>
        {generationId && getVersions(generationId).length > 0 && (
            <Box my={2} display="flex" justifyContent="center">
                <Button variant="outlined" color="secondary" onClick={openVersionsModal}>
                  Ver versões anteriores
                </Button>
            </Box>
        )}

        <FormControl required fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="model-select-label">Selecione o Modelo</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={model}
            onChange={handleModelChange}
            label="Selecione o Modelo"
            renderValue={(selected) =>
              selected.apiName ? `${selected.apiName} (${selected.version})` : ''
            }
          >
            {options.map((option) => (
              <MenuItem key={option.apiName} value={option}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl required fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="framework-select-label">Framework de Teste</InputLabel>
          <Select
            labelId="framework-select-label"
            id="framework-select"
            value={framework}
            onChange={handleFrameworkChange}
            label="Framework de Teste"
          >
            {frameworkOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="language-select-label">Linguagem</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            label="Linguagem"
          >
            {languageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          required
          label="Casos de Teste"
          multiline
          rows={8}
          value={testCases}
          onChange={handleTestCasesChange}
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          placeholder="Cole aqui seus casos de teste gerados anteriormente..."
        />

        <Box textAlign="center">
          <Button
            variant="contained"
            color="primary"
            disabled={isButtonDisabled || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Gerar Código'}
          </Button>
        </Box>
      </Grid>
      
      <div hidden={!isLoading}>
        <CircularProgress />
      </div>
      
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-22%)',
          width: '100%',
          maxWidth: 600,
          px: 2,
        }}
      >
        {error && (
          <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
            <Alert severity="error">{error}</Alert>
          </Snackbar>
        )}
      </Box>
      
      {result && (
        <Box
          sx={{
            width: '100%',
            maxWidth: '1000px',
            marginTop: 4,
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            overflowX: 'auto'
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          
          {/* Feedback component */}
          {generationId && (
            <Box mt={3}>
              <FeedbackComponent 
                generationId={generationId} 
                type="code" 
                originalContent={result}
                onRegenerateContent={handleRegeneratedContent}
              />
            </Box>
          )}

          <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md">
            <DialogTitle>Versões anteriores deste código</DialogTitle>
            <DialogContent>
              {versions.length === 0 && <Typography>Nenhuma versão salva.</Typography>}
              {versions.map((v, idx) => (
                <Box key={idx} mb={3} p={2} sx={{ border: '1px solid #eee', borderRadius: 2, background: '#f9f9f9' }}>
                  <Typography variant="caption">{v.date && (new Date(v.date)).toLocaleString()}</Typography>
                  <Box mt={1} mb={1}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{v.content || ''}</ReactMarkdown>
                  </Box>
                  <Button variant="outlined" size="small" onClick={() => handleRestore(idx)}>Restaurar esta versão</Button>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeVersionsModal} color="primary">Fechar</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Grid>
  );
}

export default CodeGenerationPage;