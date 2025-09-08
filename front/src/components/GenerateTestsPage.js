import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Grid,  Alert, Snackbar, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';
import FeedbackComponent from './FeedbackComponent';
import { addVersion, getVersions, restoreVersion } from '../utils/generationHistory';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { AI_MODELS } from '../utils/aiModels';

function GenerateTestsPage() {
  const [prompt, setPrompt] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [model, setModel] = useState({ apiName: '', version: '' });
  const [result, setResult] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationId, setGenerationId] = useState(null);
  
  // Education mode state (read from localStorage)
  const [educationMode] = useState(() => {
    const savedMode = localStorage.getItem('educationMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  const isButtonDisabled = taskDescription === '' || model === '';
  const options = AI_MODELS;

  useEffect(() => {
    const localPromptContent = localStorage.getItem('testCasesModelPrompt');
    if (!localPromptContent) {
        fetchPromptFromBackend('testCasesModel');
    } else {
        setPrompt(localPromptContent);
    }
  }, []);

  const fetchPromptFromBackend = async (fileName) => {
    setIsLoading(true);
    try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        const response = await axios.get(`${backendUrl}/api/files/${fileName}`);
        const promptContent = response.data.content;
        setPrompt(promptContent);
        localStorage.setItem('testCasesModelPrompt', promptContent);
    } catch (error) {
        console.error('Erro ao buscar o conteúdo do arquivo:', error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleTaskDescriptionChange = (event) => {
    setTaskDescription(event.target.value);
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
    if(model.apiName === 'gemini') {
      token = localStorage.getItem('geminiToken');
    } else if(model.apiName === 'chatgpt') {
      token = localStorage.getItem('chatgptToken');
    } else {
      setError(true);
      console.error('Sem token para realizar requisição');
      return;
    }
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      
      // Add education mode instruction if enabled
      let promptText = `${prompt} \n\n Aqui está uma história de usuário:\n\n "${taskDescription}"`;
      if (educationMode) {
        promptText += '\n\nPor favor, explique seu raciocínio durante a criação dos casos de teste, incluindo como você identificou os cenários importantes e como eles se relacionam com os requisitos.';
      }
      
      let educationalPrompt = '';
      if (educationMode) {
        educationalPrompt += `\n\n---\nModo Educacional Ativo:\n- Explique para cada caso de teste gerado o porquê da sua existência e importância.\n- Dê dicas teóricas e boas práticas de QA.\n- Destaque conceitos como valor-limite, equivalência, teste positivo/negativo, BDD.\n- Indique sugestões de estudos/leituras ao final sobre testes e critérios de aceitação.\n`;
      }
      const response = await axios.post(`${backendUrl}/api/${model.apiName}/generate-tests?token=${token}`, {
        model: model.version,
        data: promptText + (educationMode ? educationalPrompt : ''),
        educationMode,
        promptSupplement: educationMode ? educationalPrompt : undefined
      });
      
      setResult(response.data.data);
      if (generationId) {
        addVersion(generationId, response.data.data, { type: 'testcase', model: model.version });
      }
      const id = saveGenerationToLocalStorage(response.data.data, 'testcase', model.version);
      setGenerationId(id);
      setVersions(getVersions(id));
    } catch (error) {
      setError(error);
      console.error('Erro ao gerar casos de teste: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratedContent = (regeneratedContent) => {
    if (generationId && result) {
      addVersion(generationId, result, { type: 'testcase', model: model.version });
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
      <Grid size={{xs:10, md:6, lg:4}} style={{minWidth: '1000px'}}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Gerar Casos de Teste
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
          <InputLabel id="model-select-label">Select Model</InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={model}
            onChange={handleModelChange}
            label="Select Model"
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

        <TextField required
          label="Task Description"
          multiline
          rows={6}
          value={taskDescription}
          onChange={handleTaskDescriptionChange}
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
        />

        <Box textAlign="center">
          <Button variant="contained" color="primary" disabled={isButtonDisabled || isLoading} onClick={handleSubmit}>
            Submit
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
          >{error && (
        <Snackbar open={error} autoHideDuration={4}>
          <Alert severity="error">Erro ao tentar gerar casos de teste!</Alert>
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
                type="testcase" 
                originalContent={result}
                onRegenerateContent={handleRegeneratedContent}
              />
            </Box>
          )}

          <Dialog open={showHistory} onClose={closeVersionsModal} fullWidth maxWidth="md">
            <DialogTitle>Versões anteriores deste caso de teste</DialogTitle>
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

export default GenerateTestsPage;