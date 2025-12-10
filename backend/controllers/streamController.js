const { logger, aiRequest, aiResponse, aiError } = require('../utils/logger');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Controller para Streaming de respostas de IA via Server-Sent Events (SSE)
 * 
 * Benefícios:
 * - Usuário vê resposta sendo gerada em tempo real
 * - Menor tempo percebido de espera
 * - Melhor UX para respostas longas
 */

/**
 * Stream ChatGPT response via SSE
 */
const streamChatGPT = async (req, res) => {
  const { task, data, model = 'gpt-4o' } = req.body;
  const content = task || data;
  const token = req.query.token || process.env.CHATGPT_API_KEY;
  const feature = req.query.feature || 'stream';

  if (!token) {
    return res.status(401).json({ error: 'Token não configurado' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo não fornecido' });
  }

  // Configurar headers SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx
  res.flushHeaders();

  aiRequest(model, content.length, `${feature}-stream`);
  const startTime = Date.now();
  let fullContent = '';

  try {
    logger.info({ model, feature }, 'Starting ChatGPT stream');
    // Fazer request com stream
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content }],
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro na API OpenAI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Enviar evento de conclusão
        res.write(`data: ${JSON.stringify({ done: true, fullContent })}\n\n`);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            res.write(`data: ${JSON.stringify({ done: true, fullContent })}\n\n`);
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            
            if (content) {
              fullContent += content;
              res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
            }
          } catch (parseError) {
            // Ignorar linhas que não são JSON válido
          }
        }
      }
    }

    const durationMs = Date.now() - startTime;
    aiResponse(model, fullContent.length, durationMs, `${feature}-stream`);

  } catch (error) {
    aiError(model, error, `${feature}-stream`);
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
  } finally {
    res.end();
  }
};

/**
 * Stream Gemini response via SSE
 */
const streamGemini = async (req, res) => {
  const { task, data, model = 'gemini-1.5-flash' } = req.body;
  const content = task || data;
  const token = req.query.token || process.env.GEMINI_API_KEY;
  const feature = req.query.feature || 'stream';

  if (!token) {
    return res.status(401).json({ error: 'Token não configurado' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Conteúdo não fornecido' });
  }

  // Configurar headers SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  aiRequest(model, content.length, `${feature}-stream`);
  const startTime = Date.now();
  let fullContent = '';

  try {
    const url = `${GEMINI_API_URL}/${model}:streamGenerateContent?key=${token}&alt=sse`;
    
    logger.info({ model, feature }, 'Starting Gemini stream');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: content }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro na API Gemini');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        logger.info({ chunkCount, totalLength: fullContent.length }, 'Gemini stream completed');
        res.write(`data: ${JSON.stringify({ done: true, fullContent })}\n\n`);
        if (res.flush) res.flush();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            if (text) {
              chunkCount++;
              fullContent += text;
              logger.debug({ chunkCount, textLength: text.length }, 'Sending chunk');
              res.write(`data: ${JSON.stringify({ content: text, done: false })}\n\n`);
              // Flush para enviar imediatamente (importante para streaming)
              if (res.flush) res.flush();
            }
          } catch (parseError) {
            // Ignorar linhas que não são JSON válido
          }
        }
      }
    }

    const durationMs = Date.now() - startTime;
    aiResponse(model, fullContent.length, durationMs, `${feature}-stream`);

  } catch (error) {
    aiError(model, error, `${feature}-stream`);
    res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
  } finally {
    res.end();
  }
};

/**
 * Stream genérico que roteia para o provider correto
 */
const streamAI = async (req, res) => {
  const { provider } = req.params;
  
  switch (provider) {
    case 'chatgpt':
    case 'openai':
      return streamChatGPT(req, res);
    case 'gemini':
      return streamGemini(req, res);
    default:
      return res.status(400).json({ error: `Provider ${provider} não suporta streaming` });
  }
};

module.exports = {
  streamChatGPT,
  streamGemini,
  streamAI
};
