# Backend API (AITest Hub)

Backend em Node.js + Express responsável por orquestrar chamadas de IA, validação de payloads, streaming, feedback, integração JIRA e análise de cobertura.

## Stack

- Express 5
- Joi (validação)
- Sequelize + SQLite
- Pino (logs)
- BullMQ + Redis (opcional)
- ioredis (cache opcional)

## Execução

```bash
npm install
npm start
```

Servidor padrão: `http://localhost:5000`

## Variáveis de Ambiente

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

CHATGPT_API_KEY=
GEMINI_API_KEY=

# Redis opcional (filas/cache)
REDIS_ENABLED=false
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=

# Ajustes opcionais
COMPRESSION_LEVEL=6
LOG_LEVEL=info
```

## Estrutura

```text
backend/
├── api/
│   ├── index.js      # bootstrap (security, middleware, /health)
│   └── routes.js     # mapa de rotas /api
├── controllers/
├── validations/
├── services/
├── models/
├── config/
└── data/
```

## Endpoints principais

### Infra
- `GET /health`
- `GET /api/csrf-token`
- `GET /api/rate-limit-status`
- `POST /api/csp-report`

### IA (sync)
- `POST /api/chatgpt/improve-task`
- `POST /api/chatgpt/generate-tests`
- `POST /api/chatgpt/generate-test-code`
- `POST /api/gemini/improve-task`
- `POST /api/gemini/generate-tests`
- `POST /api/gemini/generate-test-code`
- `POST /api/analyze-risks`

### IA (stream)
- `POST /api/stream/chatgpt`
- `POST /api/stream/gemini`
- `POST /api/stream/:provider`

### Cobertura
- `POST /api/analyze-coverage`
- `POST /api/analyze-coverage/async`
- `POST /api/chatgpt/analyze-coverage`
- `POST /api/chatgpt/analyze-coverage/async`
- `POST /api/gemini/analyze-coverage`
- `POST /api/gemini/analyze-coverage/async`
- `POST /api/extract-requirements`
- `POST /api/parse-test-cases`

### Feedback
- `POST /api/feedback`
- `POST /api/feedback/regenerate`
- `GET /api/feedback/stats`
- `GET /api/feedback/recent`

### Conversas
- `POST /api/chatgpt-conversation`
- `POST /api/chatgpt-conversation/message`
- `POST /api/chatgpt-conversation/regenerate`
- `GET /api/chatgpt-conversation/:conversationId`

### JIRA / Arquivos
- `POST /api/jira-task`
- `POST /api/jira-task/update`
- `GET /api/files/:filename`
- `PUT /api/files/:filename`

### Jobs, Audit e Cache
- `GET /api/jobs/*`
- `DELETE /api/jobs/:jobId`
- `GET /api/audit/*`
- `DELETE /api/audit/logs`
- `GET /api/cache/health`
- `GET /api/cache/stats`
- `DELETE /api/cache`
- `DELETE /api/cache/invalidate`

## Notas importantes

- A validação de payload acontece em `validations/schemas.js`.
- Em produção, CSRF é aplicado (exceto rotas SSE).
- Filas e cache só são ativados quando Redis está configurado/disponível.
- O catálogo de modelos suportados vem de `config/aiModels.js`.
