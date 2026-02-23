# AITest Hub

Plataforma full-stack para apoiar times de QA com IA: melhora de tarefas, geração de casos de teste, geração de código de teste, análise de riscos, análise de cobertura, feedback e integração com JIRA.

## Visão Geral

- Frontend em React (`front/`) com páginas especializadas por fluxo.
- Backend em Express (`backend/`) com validação Joi, logging estruturado, SQLite, filas/cache opcionais com Redis e suporte a streaming (SSE).
- Suporte multi-modelo para ChatGPT e Gemini (modelos configuráveis em `backend/config/aiModels.js`).
- Histórico local de gerações e dashboard de feedback.

## Funcionalidades

- Improve Task
- Generate Test Cases
- Generate Code
- Risk Analysis
- Test Coverage Analysis (sync e async)
- Feedback (envio, estatísticas, regeneração de conteúdo)
- ChatGPT Conversation API
- Integração com JIRA
- Exportação de resultados

## Arquitetura (resumo)

```text
projeto-ia-testes/
├── backend/
│   ├── api/                # bootstrap da API e rotas
│   ├── controllers/        # handlers HTTP
│   ├── validations/        # schemas Joi
│   ├── services/           # filas, cache e serviços auxiliares
│   ├── models/             # modelos Sequelize + templates .md
│   └── config/             # DB, Redis, catálogo de modelos
├── front/
│   ├── src/components/     # páginas e UI
│   ├── src/hooks/          # hooks de fluxo e streaming
│   ├── src/services/       # chamadas HTTP e persistência local
│   ├── src/locales/        # i18n
│   └── src/stores/         # estado global
└── docs/
    ├── API.md
    ├── SETUP.md
    ├── CHANGELOG.md
    ├── COMPONENTS.md
    ├── DESIGN_SYSTEM.md
    ├── CONTRIBUTING.md
    └── IMPROVEMENTS.md
```

## Requisitos

- Node.js 20+
- npm 10+
- Chave de API OpenAI e/ou Gemini
- Redis opcional (apenas para filas/cache)

## Quick Start

### 1) Instalar dependências

```bash
cd backend
npm install

cd ../front
npm install
```

### 2) Configurar ambiente

Backend (`backend/.env`):

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

CHATGPT_API_KEY=...
GEMINI_API_KEY=...

# Opcional (filas e cache)
REDIS_ENABLED=false
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
```

Frontend (`front/.env`):

```env
REACT_APP_BACKEND_URL=http://localhost:5000
# local | backend | user-choice
REACT_APP_FEEDBACK_STORAGE=user-choice
```

### 3) Subir aplicação

```bash
# terminal 1
cd backend
npm start

# terminal 2
cd front
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `GET /health`

## Segurança e Operação

- CORS, Helmet, rate limiting e tratamento centralizado de erros.
- CSRF habilitado em produção; em desenvolvimento o endpoint `/api/csrf-token` retorna token de modo dev.
- SSE (`/api/stream/*`) para respostas incrementais em tempo real.
- Logging estruturado com Pino.

## Documentação

- Setup detalhado: [docs/SETUP.md](docs/SETUP.md)
- Endpoints e contratos: [docs/API.md](docs/API.md)
- Histórico de mudanças: [docs/CHANGELOG.md](docs/CHANGELOG.md)
- Frontend (visão específica): [front/README.md](front/README.md)
- Backend (visão específica): [backend/README.md](backend/README.md)

## Observações

- O projeto está em evolução ativa; os modelos suportados refletem o catálogo em `backend/config/aiModels.js`.
- Alguns documentos de referência extensos (como `docs/IMPROVEMENTS.md`) são intencionalmente prospectivos e não representam estado implementado.
