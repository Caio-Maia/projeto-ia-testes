# API Reference (AITest Hub)

Documentação operacional dos endpoints atuais do backend.

Base URL (local): `http://localhost:5000`

## Convenções

- Todas as rotas de produto ficam sob `/api`.
- `Content-Type: application/json` para rotas POST/PUT.
- Em desenvolvimento, `/api/csrf-token` retorna token de desenvolvimento.
- Em produção, CSRF é validado para operações state-changing (exceto SSE).

## Infra e segurança

### GET `/health`
Health check da aplicação.

### GET `/api/csrf-token`
Retorna token CSRF.

### GET `/api/rate-limit-status`
Retorna configuração de limites e identidade considerada.

### POST `/api/csp-report`
Recebe relatórios de violação de CSP.

## IA síncrona

## POST `/api/chatgpt/improve-task`
## POST `/api/gemini/improve-task`

Body (Joi `improveTaskSchema`):

```json
{
  "task": "texto...",
  "model": "gpt-5-nano",
  "language": "pt-BR",
  "educationMode": false
}
```

Regras:
- `task` ou `data` (um dos dois) é obrigatório.
- `model` deve estar em `SUPPORTED_MODELS`.

## POST `/api/chatgpt/generate-tests`
## POST `/api/gemini/generate-tests`

Body (Joi `generateTestsSchema`):

```json
{
  "task": "texto...",
  "model": "gpt-5",
  "language": "pt-BR",
  "educationMode": false
}
```

## POST `/api/chatgpt/generate-test-code`
## POST `/api/gemini/generate-test-code`

Body (Joi `generateTestCodeSchema`):

```json
{
  "task": "casos de teste...",
  "model": "gpt-5",
  "language": "pt-BR",
  "framework": "jest",
  "programmingLanguage": "javascript",
  "educationMode": false
}
```

## POST `/api/analyze-risks`

Body (Joi `analyzeRisksSchema`):

```json
{
  "task": "descrição da funcionalidade...",
  "model": "gemini-2.5-flash",
  "language": "pt-BR",
  "educationMode": false
}
```

## Streaming (SSE)

### POST `/api/stream/chatgpt`
### POST `/api/stream/gemini`
### POST `/api/stream/:provider`

Query:
- `token` (quando necessário)
- `feature` (ex.: `improve-task`, `generate-tests`, `generate-test-code`, `analyze-risks`)

Body:

```json
{
  "task": "prompt completo...",
  "model": "gpt-5-nano"
}
```

Eventos SSE (`data:`) podem conter:
- `{ "content": "...", "done": false }`
- `{ "done": true, "fullContent": "..." }`
- `{ "error": "...", "done": true }`

## Cobertura de testes

### POST `/api/analyze-coverage`
### POST `/api/analyze-coverage/async`
### POST `/api/chatgpt/analyze-coverage`
### POST `/api/chatgpt/analyze-coverage/async`
### POST `/api/gemini/analyze-coverage`
### POST `/api/gemini/analyze-coverage/async`

Body (Joi `analyzeCoverageSchema` para rotas validadas):

```json
{
  "requirements": ["REQ-1 ..."],
  "testCases": ["TC-1 ..."],
  "model": "gpt-5-nano",
  "language": "pt-BR"
}
```

### POST `/api/extract-requirements`
Body:

```json
{
  "content": "documento bruto...",
  "model": "gpt-5-nano",
  "language": "pt-BR"
}
```

### POST `/api/parse-test-cases`
Body:

```json
{
  "content": "casos de teste em texto...",
  "format": "text"
}
```

## Feedback

### POST `/api/feedback`
Body (Joi `feedbackSchema`):

```json
{
  "generationId": "task-123",
  "type": "task",
  "rating": "positive",
  "comment": "bom resultado",
  "originalContent": "...",
  "conversationHistory": [
    { "role": "assistant", "content": "..." }
  ]
}
```

Regras:
- `type`: `task | testcase | code | risk`
- `rating`: `positive | negative`

### POST `/api/feedback/regenerate`
Body (Joi `regenerateContentSchema`):

```json
{
  "feedbackId": 10,
  "model": {
    "apiName": "chatgpt",
    "version": "gpt-5"
  }
}
```

`model` também pode ser string: `chatgpt` ou `gemini`.

### GET `/api/feedback/stats`
### GET `/api/feedback/recent`

## ChatGPT Conversations

### POST `/api/chatgpt-conversation`
### POST `/api/chatgpt-conversation/message`
### POST `/api/chatgpt-conversation/regenerate`
### GET `/api/chatgpt-conversation/:conversationId`

Observação:
- `conversationId` usa UUID nas rotas validadas.

## JIRA

### POST `/api/jira-task`

```json
{
  "taskId": "PROJ-123",
  "baseUrl": "https://empresa.atlassian.net",
  "email": "qa@empresa.com",
  "token": "jira_api_token"
}
```

### POST `/api/jira-task/update`

```json
{
  "taskId": "PROJ-123",
  "content": "novo conteúdo...",
  "baseUrl": "https://empresa.atlassian.net",
  "email": "qa@empresa.com",
  "token": "jira_api_token"
}
```

## Arquivos de prompt

### GET `/api/files/:filename?language=pt-BR|en-US`
Lê prompt em `backend/models` (`.md`).

### PUT `/api/files/:filename`
Atualiza arquivo base (`.md` sem sufixo de idioma).

## Jobs, Audit e Cache

### Jobs
- `GET /api/jobs/health`
- `GET /api/jobs/stats`
- `GET /api/jobs`
- `GET /api/jobs/:jobId`
- `DELETE /api/jobs/:jobId`

### Audit
- `GET /api/audit/logs`
- `GET /api/audit/stats`
- `GET /api/audit/stats/hourly`
- `GET /api/audit/actions`
- `GET /api/audit/resources`
- `GET /api/audit/errors`
- `GET /api/audit/logs/:id`
- `DELETE /api/audit/logs`

### Cache
- `GET /api/cache/health`
- `GET /api/cache/stats`
- `DELETE /api/cache`
- `DELETE /api/cache/invalidate`

## Erros (formato)

Validação Joi:

```json
{
  "error": "Dados inválidos",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "type", "message": "...", "type": "any.only" }
  ]
}
```

Rate limit:

```json
{
  "error": "Muitas requisições",
  "message": "...",
  "retryAfter": 1234567890
}
```

CSRF:

```json
{
  "error": "Token CSRF inválido",
  "code": "CSRF_ERROR",
  "message": "..."
}
```
