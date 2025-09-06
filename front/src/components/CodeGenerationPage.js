import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Grid2,
  Alert, Snackbar, CircularProgress, FormControlLabel, Switch
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import FeedbackComponent from './FeedbackComponent';

function CodeGenerationPage() {
  const [testCases, setTestCases] = useState('');
  const [framework, setFramework] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [model, setModel] = useState({ apiName: '', version: '' });
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  
  const isButtonDisabled = testCases === '' || framework === '' || model.apiName === '';

  const options = [
    { label: 'ChatGPT', apiName: 'chatgpt', version: 'chatgpt-4' },
    { label: 'Gemini 1.5 Flash', apiName: 'gemini', version: 'gemini-1.5-flash-latest' },
    { label: 'Gemini 2.0 Flash', apiName: 'gemini', version: 'gemini-2.0-flash' },
  ];

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
      const response = await axios.post(
        `${backendUrl}/api/${model.apiName}/generate-test-code?token=${token}`,
        {
          testCases,
          framework,
          language,
          model: model.version
        }
      );
      
      const resultData = model.apiName === 'gemini' ? response.data.data : response.data;
      setResult(resultData);
      
      // Save to local storage and get the ID
      const id = saveGenerationToLocalStorage(resultData, 'code', model.version, `${framework} tests in ${language}`);
      setGenerationId(id);
    } catch (error) {
      setError('Erro ao gerar código de teste');
      console.error('Erro ao gerar código de teste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid2
      container
      spacing={3}
      direction="column"
      alignItems="center"
      justifyContent="center"
      padding={10}
      style={{ minHeight: '81vh' }}
    >
      <Grid2 item xs={10} md={6} lg={4} style={{ minWidth: '1000px' }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Gerar Código de Teste
          </Typography>
        </Box>

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
      </Grid2>
      
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
                onRegenerateContent={(regeneratedContent) => setResult(regeneratedContent)}
              />
            </Box>
          )}
        </Box>
      )}
    </Grid2>
  );
}

export default CodeGenerationPage;