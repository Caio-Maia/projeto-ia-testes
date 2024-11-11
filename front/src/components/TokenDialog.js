import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogTitle, DialogContent, TextField, Button, Box } from '@mui/material';

function TokenDialog({open, onClose, permitClose}) {

    const [chatgptToken, setChatgptToken] = useState('');
    const [geminiToken, setGeminiToken] = useState('');
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    useEffect(() => {
        // Carregar os valores do localStorage quando o diálogo for aberto
        if (open) {
            const storedChatgptToken = localStorage.getItem('chatgptToken') || '';
            const storedGeminiToken = localStorage.getItem('geminiToken') || '';
            setChatgptToken(storedChatgptToken);
            setGeminiToken(storedGeminiToken);
        }
    }, [open]);

    useEffect(() => {
        // Verificar se pelo menos um dos campos foi preenchido para habilitar o botão
        setIsSubmitDisabled(!chatgptToken && !geminiToken);
    }, [chatgptToken, geminiToken]);

    const handleSubmit = () => {
        // Salvar os tokens no localStorage
        if (chatgptToken) {
            localStorage.setItem('chatgptToken', chatgptToken);
        }
        if (geminiToken) {
            localStorage.setItem('geminiToken', geminiToken);
        }
        // Fechar o diálogo
        onClose(false);
    };

    const handleClose = (e) => {
        if (!permitClose) {
            e.preventDefault(); // Prevenir o fechamento se não permitido
        } else {
            onClose(false); // Permitir fechamento
        }
    };

    return (
        <Dialog 
        open={open}
        onClose={handleClose} // Prevenir o fechamento
        disableEscapeKeyDown={!permitClose} // Bloquear fechamento com "Esc"
        PaperProps={{ onClick: (e) => e.stopPropagation() }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
            <DialogTitle>Insira seus tokens</DialogTitle>
            { permitClose &&(
            <Button onClick={handleClose} sx={{
                color: 'grey',
                minWidth: '36px',
                width: '36px',
                height: '36px',
                borderRadius: '50%', // Tornar o botão redondo
                border: '1px', // Borda para destacar
                padding: '0', // Remover o espaçamento interno
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            x
            </Button>)}
        </Box>
        <DialogContent>
            <TextField
            label="Token ChatGPT"
            fullWidth
            value={chatgptToken}
            onChange={(e) => setChatgptToken(e.target.value)}
            margin="dense"
            />
            <TextField
            label="Token Gemini"
            fullWidth
            value={geminiToken}
            onChange={(e) => setGeminiToken(e.target.value)}
            margin="dense"
            />
        </DialogContent>
        <DialogActions>
            <Button 
            onClick={handleSubmit} 
            disabled={isSubmitDisabled} 
            variant="contained" 
            color="primary"
            >
            Enviar
            </Button>
        </DialogActions>
        </Dialog>
    );
}

export default TokenDialog;