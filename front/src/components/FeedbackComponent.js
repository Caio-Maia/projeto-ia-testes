import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, Snackbar, Alert, IconButton, Paper, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import axios from 'axios';
import { AI_MODELS } from '../utils/aiModels';

function FeedbackComponent({ generationId, type, originalContent, onRegenerateContent }) {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');

  const handleRating = (selectedRating) => {
    setRating(selectedRating);
    setShowCommentField(true);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create initial conversation history
      const conversationHistory = originalContent ? [
        {
          role: 'assistant',
          content: originalContent
        }
      ] : [];
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${backendUrl}/api/feedback`, {
        generationId,
        type,
        rating,
        comment,
        originalContent,
        conversationHistory
      });
      
      const feedbackResponse = response.data.feedback;
      // Accept both ._id (Mongo-like), or .id (Sequelize)
      const fId = feedbackResponse ? (feedbackResponse._id || feedbackResponse.id) : null;
      setFeedbackId(fId);
      setFeedbackSubmitted(true);
      // If it's negative feedback with a comment, show regenerate dialog
      if (rating === 'negative' && comment.trim() !== '' && fId) {
        setRegenerateDialogOpen(true);
      } else {
        setTimeout(() => {
          setFeedbackSubmitted(false);
        }, 3000);
      }
      // Reset the form
      setRating(null);
      setComment('');
      setShowCommentField(false);
    } catch (err) {
      setError('Erro ao enviar feedback');
      console.error('Erro ao enviar feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateContent = async () => {
    if (!feedbackId || !selectedModel) {
      console.log('Modelo:', selectedModel);
      console.log('Feedback ID:', feedbackId);
      setError('Selecione um modelo para regenerar o conteúdo');
      return;
    }
    
    setIsRegenerating(true);
    setError(null);
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      // Busca o modelo selecionado no array central para pegar o .apiName
      const modelDef = AI_MODELS.find(m => m.version === selectedModel);
      const token = localStorage.getItem(modelDef ? modelDef.apiName + 'Token' : '');
      
      if (!token) {
        setError('Token não encontrado para o modelo selecionado');
        setIsRegenerating(false);
        return;
      }
      
      const response = await axios.post(
        `${backendUrl}/api/feedback/regenerate?token=${token}`,
        {
          feedbackId,
          model: selectedModel
        }
      );
      
      // Close dialog
      setRegenerateDialogOpen(false);
      
      // Call the parent component's callback with the regenerated content
      if (onRegenerateContent) {
        onRegenerateContent(response.data.data);
      }
      
    } catch (err) {
      setError('Erro ao regenerar conteúdo');
      console.error('Erro ao regenerar conteúdo:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCloseRegenerateDialog = () => {
    setRegenerateDialogOpen(false);
    setFeedbackSubmitted(false);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    // Ajuda a depurar se o valor está vindo
    console.log('Modelo selecionado para regenerar:', model);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        O que você achou desta resposta?
      </Typography>
      
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <IconButton 
          color={rating === 'positive' ? 'primary' : 'default'}
          onClick={() => handleRating('positive')}
          size="large"
        >
          <ThumbUpIcon fontSize="large" />
        </IconButton>
        
        <IconButton 
          color={rating === 'negative' ? 'error' : 'default'}
          onClick={() => handleRating('negative')}
          size="large"
        >
          <ThumbDownIcon fontSize="large" />
        </IconButton>
      </Box>
      
      {showCommentField && (
        <Box mb={2}>
          <TextField
            label={rating === 'positive' ? "Comentário (opcional)" : "Descreva o que deve ser ajustado"}
            multiline
            rows={2}
            value={comment}
            onChange={handleCommentChange}
            variant="outlined"
            fullWidth
            placeholder={rating === 'positive' ? "Diga-nos o que você gostou..." : "Descreva como o texto deve ser ajustado..."}
          />
          
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Enviar Feedback'}
            </Button>
          </Box>
        </Box>
      )}
      
      <Snackbar
        open={feedbackSubmitted && !regenerateDialogOpen}
        autoHideDuration={3000}
        onClose={() => setFeedbackSubmitted(false)}
      >
        <Alert severity="success">Feedback enviado com sucesso!</Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* Dialog for regenerating content */}
      <Dialog open={regenerateDialogOpen} onClose={handleCloseRegenerateDialog}>
        <DialogTitle>Regenerar conteúdo com base no feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Deseja regenerar o conteúdo com base no seu feedback?
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Seu feedback: {comment}
          </Typography>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Selecione o modelo para regenerar:
            </Typography>
            <Box display="flex" flexDirection="column" gap={1} mt={1}>
              {AI_MODELS.map((modelOption) => (
                <Button
                  key={modelOption.version}
                  variant={selectedModel === modelOption.version ? 'contained' : 'outlined'}
                  onClick={() => handleModelChange(modelOption.version)}
                  sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  {modelOption.label}
                </Button>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRegenerateDialog}>Cancelar</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRegenerateContent}
            disabled={isRegenerating || !selectedModel || selectedModel === ''}
          >
            {isRegenerating ? <CircularProgress size={24} /> : 'Regenerar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default FeedbackComponent;