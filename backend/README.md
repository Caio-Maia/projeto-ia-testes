# Backend API - Gerador de Testes com IA

API para interação com modelos de IA (ChatGPT e Gemini) para melhoria de tarefas, geração de casos de teste e análise de riscos.

## Estrutura

```
backend/
├── api/
│   ├── index.js              # Entry point com middlewares
│   └── routes.js             # Definição de rotas
├── controllers/
│   ├── chatgptController.js  # Endpoints ChatGPT
│   ├── geminiController.js   # Endpoints Gemini
│   ├── codeGenerationController.js  # Geração de código
│   ├── coverageController.js # Análise de cobertura
│   ├── feedbackController.js # Sistema de feedback
│   ├── fileController.js     # Gerenciamento de arquivos
│   ├── jiraController.js     # Integração JIRA
│   └── chatgptConversationController.js  # Conversations API
├── middlewares/
│   ├── errorHandler.js       # Error handling centralizado
│   └── validate.js           # Middleware de validação Joi
├── validations/
│   └── schemas.js            # Schemas Joi para todas as rotas
├── utils/
│   └── logger.js             # Logging estruturado com Pino
├── models/
│   ├── feedbackModel.js      # Modelo de feedback (SQLite)
│   └── *.md                  # Templates de prompts
├── config/
│   ├── aiModels.js           # Configuração de modelos IA
│   └── database.js           # Configuração SQLite
└── data/                     # Dados SQLite
```

## Instalação

```bash
cd backend
npm install
```

## Configuração

Crie um arquivo `.env` baseado em `.env.example`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
CHATGPT_API_KEY=sua-chave-openai
LOG_LEVEL=info  # debug, info, warn, error
```

## Execução

```bash
npm start
```

## Endpoints

### ChatGPT
- `POST /api/chatgpt/improve-task` - Melhorar descrição de tarefa
- `POST /api/chatgpt/generate-tests` - Gerar casos de teste
- `POST /api/chatgpt/generate-test-code` - Gerar código de teste

### Gemini
- `POST /api/gemini/improve-task?token=KEY` - Melhorar tarefa
- `POST /api/gemini/generate-tests?token=KEY` - Gerar testes
- `POST /api/gemini/generate-test-code?token=KEY` - Gerar código

### Análise
- `POST /api/analyze-risks` - Análise de riscos
- `POST /api/analyze-coverage` - Análise de cobertura

### JIRA
- `POST /api/jira-task` - Buscar tarefa do JIRA
- `POST /api/jira-task/update` - Atualizar tarefa

### Feedback
- `POST /api/feedback` - Enviar feedback
- `GET /api/feedback/stats` - Estatísticas
- `GET /api/feedback/recent` - Feedbacks recentes

### Arquivos
- `GET /api/files/:filename` - Ler arquivo de prompt
- `PUT /api/files/:filename` - Atualizar arquivo

## Segurança

O backend inclui:
- **CORS** - Controle de origem
- **Helmet** - Headers de segurança
- **Rate Limiting** - 100 req/15min por IP
- **CSRF** - Proteção contra CSRF
- **Compression** - Respostas comprimidas

## Banco de Dados

SQLite local em `data/database.sqlite` para armazenar feedbacks.
