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

function RiskAnalysisPage() {
  const [feature, setFeature] = useState('');
  const [model, setModel] = useState('');
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
  
  const isButtonDisabled = feature === '' || model === '';
  const modelOptions = AI_MODELS;

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
      let educationalPrompt = '';
      if (educationMode) {
        educationalPrompt += `\n\n---\nModo Educacional Ativo:\n- Explique passo a passo como os riscos foram identificados e classificados.\n- Dê explicações teóricas sobre análise e mitigação de riscos em desenvolvimento/testes.\n- Destaque boas práticas, conceitos de qualidade, tipos de riscos (negócio, técnico, funcional etc).\n- Indique temas para estudo: análise de risco, prevenção de bugs, cobertura de testes, modelagem de ameaças.\n`;
      }
      const response = await axios.post(
        `${backendUrl}/api/analyze-risks?token=${token}`,
        {
          feature,
          model,
          educationMode,
          promptSupplement: educationMode ? educationalPrompt : undefined
        }
      );
      
      const resultData = model === 'gemini' ? response.data.data : response.data;
      setResult(resultData);
      if (generationId) {
        addVersion(generationId, resultData, { type: 'risk', model });
      }
      // Save to local storage and get the ID
      const id = saveGenerationToLocalStorage(resultData, 'risk', model, `Risk Analysis: ${feature.substring(0, 50)}...`);
      setGenerationId(id);
      setVersions(getVersions(id));
    } catch (error) {
      setError('Erro ao analisar riscos');
      console.error('Erro ao analisar riscos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratedContent = (regeneratedContent) => {
    if (generationId && result) {
      addVersion(generationId, result, { type: 'risk', model });
    }
    setResult(regeneratedContent);
    if (generationId) setVersions(getVersions(generationId));
  };
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
      <Grid size={{xs:10, md:6, lg:4}} style={{ minWidth: '1000px' }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Análise de Riscos de Implementação
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
                type="risk" 
                originalContent={result}
                onRegenerateContent={handleRegeneratedContent}
              />
            </Box>
          )}

          <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md">
            <DialogTitle>Versões anteriores desta análise</DialogTitle>
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

export default RiskAnalysisPage;