# Setup (AITest Hub)

Guia atualizado para subir o projeto localmente.

## 1) Pré-requisitos

- Node.js 20+
- npm 10+
- Git
- (Opcional) Redis para filas/cache

Verificação rápida:

```powershell
node --version
npm --version
git --version
```

## 2) Instalação

```powershell
git clone https://github.com/Caio-Maia/projeto-ia-testes.git
cd projeto-ia-testes

cd backend
npm install

cd ../front
npm install
```

## 3) Configuração de ambiente

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

CHATGPT_API_KEY=seu_token_openai
GEMINI_API_KEY=seu_token_gemini

# Redis opcional
REDIS_ENABLED=false
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=

# Opcionais
COMPRESSION_LEVEL=6
LOG_LEVEL=info
```

### Frontend (`front/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:5000
# local | backend | user-choice
REACT_APP_FEEDBACK_STORAGE=user-choice
```

Observação:
- `user-choice` permite alternar no app entre persistência local e backend.

## 4) Subir aplicação

### Terminal 1 (backend)

```powershell
cd backend
npm start
```

### Terminal 2 (frontend)

```powershell
cd front
npm start
```

## 5) Verificação rápida

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `GET http://localhost:5000/health`
- CSRF token: `GET http://localhost:5000/api/csrf-token`

Teste mínimo via PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:5000/health -Method Get
```

## 6) Configurar tokens no app

Você pode usar tokens via:
- `.env` no backend (`CHATGPT_API_KEY`, `GEMINI_API_KEY`)
- interface do frontend (armazenamento local no navegador)

## 7) JIRA (opcional)

Para usar busca/atualização de cartões:
- `baseUrl`: ex. `https://sua-empresa.atlassian.net`
- `email`: conta Atlassian
- `token`: API token da Atlassian

## 8) Problemas comuns

### `npm run start` falha no backend
- Confirme se está em `backend/`.
- Verifique sintaxe do `.env`.
- Teste porta 5000 livre.

### Erro de validação em feedback/regeneração
- Atualize frontend e backend juntos (contratos foram alinhados recentemente).
- Consulte payloads atuais em [API.md](API.md).

### Respostas de IA não chegam
- Verifique token do provedor selecionado.
- Confira se `REACT_APP_BACKEND_URL` aponta para o backend ativo.
- Para Gemini, confirme token válido quando enviado por query.

### Filas/cache não funcionam
- Sem Redis, o sistema continua operando (modo degradado).
- Para habilitar: configure `REDIS_ENABLED=true` e host/porta.

## 9) Scripts úteis

### Backend

```bash
npm start
```

### Frontend

```bash
npm start
npm run build
npm test
npm run analyze
```
