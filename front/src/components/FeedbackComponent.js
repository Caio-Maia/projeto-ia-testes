import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, TextField, Snackbar, Alert, Paper, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Divider
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import ModelSelector from './ModelSelector';

function FeedbackComponent({ generationId, type, originalContent, onRegenerateContent }) {
  const feedbackRef = useRef(null); // Ref para scroll
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackId, setFeedbackId] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState({ apiName: '', version: '' });
  const [feedbackComment, setFeedbackComment] = useState(''); // Armazena o comentário para o dialog

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
      
      // Se for feedback negativo com comentário, armazena o comentário para o dialog
      if (rating === 'negative' && comment.trim() !== '' && fId) {
        setFeedbackComment(comment); // Guarda o comentário ANTES de resetar
        setRegenerateDialogOpen(true);
      } else {
        setTimeout(() => {
          setFeedbackSubmitted(false);
        }, 3000);
        // Reset the form após sucesso
        setRating(null);
        setComment('');
        setShowCommentField(false);
      }
    } catch (err) {
      setError('Erro ao enviar feedback');
      console.error('Erro ao enviar feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateContent = async () => {
    if (!feedbackId || !selectedModel.apiName) {
      console.log('Modelo:', selectedModel);
      console.log('Feedback ID:', feedbackId);
      setError('Selecione um modelo para regenerar o conteúdo');
      return;
    }
    
    setIsRegenerating(true);
    setError(null);
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem(selectedModel.apiName + 'Token');
      
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
      
      // Reset do estado de feedback
      setRating(null);
      setComment('');
      setShowCommentField(false);
      setFeedbackComment('');
      setSelectedModel({ apiName: '', version: '' });
      setFeedbackSubmitted(false);
      
      // Call the parent component's callback with the regenerated content
      if (onRegenerateContent) {
        onRegenerateContent(response.data.data);
      }
      
      // Scroll para o topo do card de feedback após regeneração
      setTimeout(() => {
        if (feedbackRef.current) {
          feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Aguarda um pouco para o conteúdo ser atualizado
      
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
    // Reset do comentário guardado
    setFeedbackComment('');
    // Reset do modelo selecionado
    setSelectedModel({ apiName: '', version: '' });
    // Reset do formulário de feedback
    setRating(null);
    setComment('');
    setShowCommentField(false);
  };

  const handleModelChange = (event) => {
    const selectedModel = event.target.value;
    setSelectedModel(selectedModel);
    console.log('Modelo selecionado para regenerar:', selectedModel);
  };

  return (
    <Paper 
      ref={feedbackRef}
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #f1f5f9 100%)',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <FeedbackIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
          O que você achou desta resposta?
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />
      
      {/* Rating Buttons */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Box
          onClick={() => handleRating('positive')}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            p: 2,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: rating === 'positive' ? '#dcfce7' : '#f8f9fa',
            border: rating === 'positive' ? '2px solid #4ade80' : '2px solid #e2e8f0',
            '&:hover': {
              borderColor: '#4ade80',
              background: '#f0fdf4',
              transform: 'translateY(-2px)',
            }
          }}
        >
          <ThumbUpIcon sx={{ fontSize: 32, color: rating === 'positive' ? '#22c55e' : '#94a3b8' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: rating === 'positive' ? '#22c55e' : '#64748b' }}>
            Útil
          </Typography>
        </Box>
        
        <Box
          onClick={() => handleRating('negative')}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            p: 2,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: rating === 'negative' ? '#fee2e2' : '#f8f9fa',
            border: rating === 'negative' ? '2px solid #f87171' : '2px solid #e2e8f0',
            '&:hover': {
              borderColor: '#f87171',
              background: '#fef2f2',
              transform: 'translateY(-2px)',
            }
          }}
        >
          <ThumbDownIcon sx={{ fontSize: 32, color: rating === 'negative' ? '#ef4444' : '#94a3b8' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: rating === 'negative' ? '#ef4444' : '#64748b' }}>
            Melhorar
          </Typography>
        </Box>
      </Box>
      
      {/* Comment Section */}
      {showCommentField && (
        <Card sx={{ mb: 2, border: '1px solid #e2e8f0' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1e293b' }}>
              {rating === 'positive' ? '💡 Conte-nos mais' : '⚠️ O que pode ser melhorado?'}
            </Typography>
            <TextField
              label={rating === 'positive' ? "Comentário (opcional)" : "Descreva o que deve ser ajustado"}
              multiline
              rows={3}
              value={comment}
              onChange={handleCommentChange}
              variant="outlined"
              fullWidth
              placeholder={rating === 'positive' ? "Diga-nos o que você gostou..." : "Descreva como o texto deve ser ajustado..."}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  }
                }
              }}
            />
            
            <Box mt={2.5} display="flex" justifyContent="flex-end" gap={1.5}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={isSubmitting ? undefined : <CheckCircleIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  }
                }}
              >
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Enviar Feedback'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
      
      <Snackbar
        open={feedbackSubmitted && !regenerateDialogOpen}
        autoHideDuration={3000}
        onClose={() => setFeedbackSubmitted(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          ✓ Feedback enviado com sucesso!
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Dialog for regenerating content */}
      <Dialog 
        open={regenerateDialogOpen} 
        onClose={handleCloseRegenerateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
          color: '#ffffff',
          fontWeight: 700,
          pb: 2
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <RefreshIcon />
            Regenerar Conteúdo
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
            Deseja regenerar o conteúdo com base no seu feedback?
          </Typography>
          <Paper sx={{ p: 2, bgcolor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontWeight: 600 }}>
              Seu feedback:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#78350f' }}>
              "{feedbackComment}"
            </Typography>
          </Paper>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1e293b' }}>
            Selecione o modelo para regenerar:
          </Typography>
          <ModelSelector
            value={selectedModel}
            onChange={handleModelChange}
            label="Selecione o modelo para regenerar"
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={handleCloseRegenerateDialog}
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              textTransform: 'none',
              color: '#64748b',
              borderColor: '#cbd5e1',
              '&:hover': {
                borderColor: '#94a3b8',
                backgroundColor: '#f1f5f9',
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRegenerateContent}
            disabled={isRegenerating || !selectedModel.apiName}
            startIcon={isRegenerating ? undefined : <RefreshIcon />}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
              }
            }}
          >
            {isRegenerating ? <CircularProgress size={20} color="inherit" /> : 'Regenerar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default FeedbackComponent;