import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Grid2,
  Alert, Snackbar, CircularProgress
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import FeedbackComponent from './FeedbackComponent';

function RiskAnalysisPage() {
  const [feature, setFeature] = useState('');
  const [model, setModel] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  
  const isButtonDisabled = feature === '' || model === '';

  const modelOptions = [
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'gemini', label: 'Gemini' }
  ];

  const handleFeatureChange = (event) => {
    setFeature(event.target.value);
  };

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    setError(null);
    e.preventDefault();
    
    let token;
    if (model === 'gemini') {
      token = localStorage.getItem('geminiToken');
    } else if (model === 'chatgpt') {
      token = localStorage.getItem('chatgptToken');
    } else {
      setError('Sem token para realizar requisição');
      setIsLoading(false);
      return;
    }
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${backendUrl}/api/analyze-risks?token=${token}`,
        {
          feature,
          model
        }
      );
      
      const resultData = model === 'gemini' ? response.data.data : response.data;
      setResult(resultData);
      
      // Save to local storage and get the ID
      const id = saveGenerationToLocalStorage(resultData, 'risk', model, `Risk Analysis: ${feature.substring(0, 50)}...`);
      setGenerationId(id);
    } catch (error) {
      setError('Erro ao analisar riscos');
      console.error('Erro ao analisar riscos:', error);
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
            Análise de Riscos de Implementação
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
          >
            {modelOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          required
          label="Descrição da Feature"
          multiline
          rows={8}
          value={feature}
          onChange={handleFeatureChange}
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          placeholder="Descreva a feature que você deseja analisar os riscos de implementação..."
        />

        <Box textAlign="center">
          <Button
            variant="contained"
            color="primary"
            disabled={isButtonDisabled || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Analisar Riscos'}
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
                type="risk" 
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

export default RiskAnalysisPage;