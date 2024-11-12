import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, MenuItem, FormControl, InputLabel, Select, Grid2,  Alert, Snackbar, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { saveGenerationToLocalStorage } from '../utils/saveGenerationLocalStorage';

function ImproveTaskPage() {
  const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState({ apiName: '', version: '' });
    const [error, setError] = useState(null);
    const [result, setResult] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const isButtonDisabled = taskDescription === '' || model === '';

    const options = [
      { label: 'ChatGPT', apiName: 'chatgpt', version: 'chatgpt-4' },
      { label: 'Gemini 1.5 Flash', apiName: 'gemini', version: 'gemini-1.5-flash' },
    ];

    useEffect(() => {
        const localPromptContent = localStorage.getItem('taskModelPrompt');
        if (!localPromptContent) {
            fetchPromptFromBackend('taskModel');
        } else {
            setPrompt(localPromptContent);
        }
    }, []);

    const fetchPromptFromBackend = async (fileName) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/files/${fileName}`);
            const promptContent = response.data.content;
            setPrompt(promptContent);
            localStorage.setItem('taskModelPrompt', promptContent);
        } catch (error) {
            console.error('Erro ao buscar o conteúdo do arquivo:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
      setIsLoading(true);
      setError(null);
      e.preventDefault();
      let token = localStorage.getItem(`${model.apiName}Token`);;
      if(!token) {
        setError(true);
        console.error('Sem token para realizar requisição');
        return;
      }
      try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const response = await axios.post(`${backendUrl}/api/${model.apiName}/improve-task?token=${token}`, { model: model.version, data: `${prompt} \n\n Aqui está uma história de usuário:\n\n "${taskDescription}"`});
        setResult(response.data.data);
        saveGenerationToLocalStorage(response.data.data, 'task', model.version);
        console.log(result)
      } catch (error) {
        setError(error);
        console.error('Erro ao melhorar a tarefa:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleModelChange = (event) => {
      const { apiName, version } = event.target.value;
      setModel({ apiName, version });
    };

    const handleTaskDescriptionChange = (event) => {
      setTaskDescription(event.target.value);
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
      <Grid2 item xs={10} md={6} lg={4} style={{minWidth: '1000px'}}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Melhore sua História de Usuário
          </Typography>
        </Box>

        <FormControl required='true' fullWidth variant="outlined" sx={{ mb: 3 }}>
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

        <TextField required='true'
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
        
      </Grid2>  
      <div  hidden={!isLoading}>
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
          <Alert severity="error">Erro ao tentar melhorar a tarefa!</Alert>
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
          }}
        >
          <ReactMarkdown>{result}</ReactMarkdown>
        </Box>
      )}
    </Grid2>
  );
}

export default ImproveTaskPage;
