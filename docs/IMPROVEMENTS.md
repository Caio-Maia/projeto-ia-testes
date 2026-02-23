# 🚀 Documento de Melhorias Futuras

Este documento lista possíveis melhorias, otimizações e novas features para o Projeto IA Testes.

## 📋 Índice

1. [Padrões de Projeto (Design Patterns)](#padrões-de-projeto)
2. [Novas IAs](#novas-ias)
3. [Atualização de Modelos](#atualização-de-modelos)
4. [Novas Integrações](#novas-integrações)
5. [Arquitetura Backend](#arquitetura-backend)
6. [Arquitetura Frontend](#arquitetura-frontend)
7. [Performance](#performance)
8. [Segurança](#segurança)
9. [Testes e Qualidade](#testes-e-qualidade)
10. [DevOps e Infraestrutura](#devops-e-infraestrutura)

---

## 🏗️ Padrões de Projeto

### 1. Strategy Pattern para Provedores de IA
**Status**: Não implementado  
**Prioridade**: Alta  
**Esforço**: Médio

**Problema Atual**: Código duplicado em cada controller para cada provedor de IA (ChatGPT, Gemini). Adicionar nova IA requer criar novo controller e rotas.

**Solução**: Implementar Strategy Pattern para abstrair provedores de IA.

```javascript
// backend/services/ai/AIProvider.js (Interface)
class AIProvider {
  constructor(config) { this.config = config; }
  async generateContent(prompt, options) { throw new Error('Not implemented'); }
  async streamContent(prompt, options) { throw new Error('Not implemented'); }
  validateToken(token) { throw new Error('Not implemented'); }
}

// backend/services/ai/providers/OpenAIProvider.js
class OpenAIProvider extends AIProvider {
  async generateContent(prompt, options) {
    const response = await axios.post(this.config.endpoint, {
      model: options.model || this.config.defaultModel,
      messages: [{ role: 'user', content: prompt }]
    }, { headers: { Authorization: `Bearer ${options.token}` } });
    return response.data.choices[0].message.content;
  }
}

// backend/services/ai/providers/GeminiProvider.js
class GeminiProvider extends AIProvider { /* ... */ }

// backend/services/ai/providers/ClaudeProvider.js
class ClaudeProvider extends AIProvider { /* ... */ }

// backend/services/ai/AIProviderFactory.js (Factory Pattern)
class AIProviderFactory {
  static providers = new Map();
  
  static register(name, ProviderClass) {
    this.providers.set(name, ProviderClass);
  }
  
  static create(name, config) {
    const Provider = this.providers.get(name);
    if (!Provider) throw new Error(`Provider ${name} not found`);
    return new Provider(config);
  }
}
```

**Benefícios**:
- Adicionar nova IA = 1 arquivo (novo Provider)
- Código testável e isolado
- Single Responsibility Principle

---

### 2. Repository Pattern para Dados
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Médio

**Problema Atual**: Controllers acessam diretamente o Sequelize. Difícil trocar de banco.

**Solução**:
```javascript
// backend/repositories/FeedbackRepository.js
class FeedbackRepository {
  async create(data) { return Feedback.create(data); }
  async findById(id) { return Feedback.findByPk(id); }
  async findByType(type, options) { return Feedback.findAll({ where: { type }, ...options }); }
  async getStats() { /* aggregations */ }
}

// Permite trocar SQLite por PostgreSQL/MongoDB sem alterar controllers
```

---

### 3. Command Pattern para Operações de IA
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Médio

**Problema Atual**: Lógica de operações (improve task, generate tests) misturada nos controllers.

**Solução**:
```javascript
// backend/commands/ImproveTaskCommand.js
class ImproveTaskCommand {
  constructor(aiProvider, promptService) {
    this.aiProvider = aiProvider;
    this.promptService = promptService;
  }
  
  async execute(taskDescription, options) {
    const prompt = await this.promptService.getPrompt('taskModel', options.language);
    const fullPrompt = prompt + '\n\n' + taskDescription;
    return this.aiProvider.generateContent(fullPrompt, options);
  }
}

// Permite logging, undo, queue de comandos
```

---

### 4. Observer Pattern para Eventos
**Status**: Não implementado  
**Prioridade**: Baixa  
**Esforço**: Médio

**Uso**: Notificar múltiplos listeners sobre eventos (feedback criado, geração completada).

```javascript
// backend/events/EventEmitter.js
const eventBus = new EventEmitter();

// Quando feedback é criado:
eventBus.emit('feedback:created', feedback);

// Listeners podem reagir:
eventBus.on('feedback:created', async (feedback) => {
  await analyticsService.trackFeedback(feedback);
  await notificationService.notifyAdmin(feedback);
});
```

---

### 5. Singleton para Configurações
**Status**: Parcialmente implementado  
**Prioridade**: Baixa  
**Esforço**: Baixo

```javascript
// backend/config/ConfigManager.js
class ConfigManager {
  static instance = null;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ConfigManager();
      this.instance.load();
    }
    return this.instance;
  }
  
  get(key) { return this.config[key]; }
}
```

---

## 🤖 Novas IAs

### 1. Claude (Anthropic)
**Status**: Não implementado  
**Prioridade**: Alta  
**Esforço**: Baixo (com Strategy Pattern)

**Modelos a Suportar**:
- `claude-sonnet-4-20250514` - Modelo principal, excelente custo-benefício
- `claude-opus-4-20250514` - Máxima capacidade
- `claude-3-5-haiku-20241022` - Mais rápido e econômico

**Implementação**:
```javascript
// backend/services/ai/providers/ClaudeProvider.js
class ClaudeProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.endpoint = 'https://api.anthropic.com/v1/messages';
  }
  
  async generateContent(prompt, options) {
    const response = await axios.post(this.endpoint, {
      model: options.model || 'claude-sonnet-4-20250514',
      max_tokens: options.maxTokens || 4096,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': options.token,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });
    return response.data.content[0].text;
  }
}
```

**Frontend**:
```javascript
// Adicionar em aiModels.js
{ label: 'Claude Sonnet 4', apiName: 'claude', version: 'claude-sonnet-4-20250514' },
{ label: 'Claude Opus 4', apiName: 'claude', version: 'claude-opus-4-20250514' },
{ label: 'Claude 3.5 Haiku', apiName: 'claude', version: 'claude-3-5-haiku-20241022' },
```

---

### 2. Mistral AI
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Baixo

**Modelos**:
- `mistral-large-latest` - Modelo principal
- `mistral-small-latest` - Rápido e econômico
- `codestral-latest` - Especializado em código

---

### 3. DeepSeek
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Baixo

**Modelos**:
- `deepseek-chat` - Chat geral
- `deepseek-coder` - Especializado em código (excelente para geração de testes)

---

### 4. Cohere
**Status**: Não implementado  
**Prioridade**: Baixa  
**Esforço**: Baixo

**Modelos**:
- `command-r-plus` - Modelo principal
- `command-r` - Mais rápido

---

### 5. Groq (LLaMA via Groq Cloud)
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Baixo

**Benefício**: Extremamente rápido (tokens/segundo muito alto)

**Modelos**:
- `llama-3.3-70b-versatile`
- `llama-3.1-8b-instant`

---

## 🔗 Novas Integrações

### 1. Azure DevOps
**Status**: Não implementado  
**Prioridade**: Alta  
**Esforço**: Médio

```javascript
// backend/integrations/AzureDevOpsIntegration.js
class AzureDevOpsIntegration {
  constructor(organization, project, token) {
    this.baseUrl = `https://dev.azure.com/${organization}/${project}/_apis`;
    this.token = token;
  }
  
  async getWorkItem(id) {
    const response = await axios.get(
      `${this.baseUrl}/wit/workitems/${id}?api-version=7.0`,
      { headers: { Authorization: `Basic ${Buffer.from(':' + this.token).toString('base64')}` } }
    );
    return response.data;
  }
  
  async updateWorkItem(id, updates) { /* PATCH request */ }
}
```

---

### 2. GitHub Issues
**Status**: Não implementado  
**Prioridade**: Alta  
**Esforço**: Baixo

```javascript
// backend/integrations/GitHubIntegration.js
class GitHubIntegration {
  async getIssue(owner, repo, issueNumber) {
    return axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers: { Authorization: `token ${this.token}` } }
    );
  }
}
```

---

### 3. GitLab Issues
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Baixo

---

### 4. Notion
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Médio

**Uso**: Importar/exportar tarefas e casos de teste para Notion.

---

### 5. Slack/Teams Notifications
**Status**: Não implementado  
**Prioridade**: Baixa  
**Esforço**: Baixo

**Uso**: Notificar quando análise de cobertura completar, feedback negativo recebido, etc.

---

### 6. TestRail
**Status**: Não implementado  
**Prioridade**: Alta  
**Esforço**: Médio

**Uso**: Sincronizar casos de teste gerados com TestRail.

---

### 7. Xray (Jira Test Management)
**Status**: Não implementado  
**Prioridade**: Alta  
**Esforço**: Médio

**Uso**: Criar test cases no Xray a partir dos testes gerados.

---

## 🏛️ Arquitetura Backend

### 1. Estrutura de Pastas Melhorada
**Status**: Parcialmente implementado  
**Prioridade**: Alta

```
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── ai.routes.js
│   │   │   ├── integrations.routes.js
│   │   │   ├── feedback.routes.js
│   │   │   └── index.js
│   │   └── middlewares/
│   │       ├── auth.middleware.js
│   │       ├── validation.middleware.js
│   │       └── error.middleware.js
│   ├── services/
│   │   ├── ai/
│   │   │   ├── AIProvider.js
│   │   │   ├── AIProviderFactory.js
│   │   │   └── providers/
│   │   │       ├── OpenAIProvider.js
│   │   │       ├── GeminiProvider.js
│   │   │       └── ClaudeProvider.js
│   │   ├── PromptService.js
│   │   └── CacheService.js
│   ├── repositories/
│   │   └── FeedbackRepository.js
│   ├── integrations/
│   │   ├── JiraIntegration.js
│   │   ├── GitHubIntegration.js
│   │   └── AzureDevOpsIntegration.js
│   ├── models/
│   ├── config/
│   └── utils/
├── tests/
└── package.json
```

---

### 2. Validação com Joi/Zod
**Status**: ✅ Implementado  
**Prioridade**: Alta  
**Esforço**: Médio

**Implementação**:
- `backend/validations/schemas.js` - Schemas Joi para todas as rotas
- `backend/middlewares/validate.js` - Middleware de validação
- Todas as rotas protegidas com validação

---

### 3. Error Handling Centralizado
**Status**: ✅ Implementado  
**Prioridade**: Alta  
**Esforço**: Baixo

**Implementação Backend**:
- `backend/middlewares/errorHandler.js` - AppError class + errorHandler middleware
- `asyncHandler` wrapper para funções async
- Erros operacionais vs erros de programação
- Integrado em todos os controllers

**Implementação Frontend**:
- `front/src/utils/errorHandler.js` - Utilitário centralizado de erros
  - `AppError` class com code, statusCode, details, isRetryable
  - `parseError(error)` - Extrai erro de respostas Axios
  - `parseStreamError(response)` - Extrai erro de respostas SSE/fetch
  - `isAuthError()`, `isRateLimitError()`, `isNetworkError()`, `isRetryableError()`
  - `logError(context, error)` - Logging formatado no console

**Hooks atualizados**:
- `useAIMutations.js` - Usa parseError
- `useAIStream.js` - Usa parseStreamError
- `useAI.js` - Usa parseError
- `useJira.js` - Usa parseError

**Componentes atualizados**:
- FeedbackComponent, FeedbackDashboard, TestCoverageAnalysis, RegenerateButton

---

### 4. Logging Estruturado
**Status**: ✅ Implementado  
**Prioridade**: Média  
**Esforço**: Baixo

**Implementação**:
- `backend/utils/logger.js` - Logger Pino com pino-pretty
- Helpers: `aiRequest`, `aiResponse`, `aiError`, `feedback`, `validationError`, `security`
- Morgan removido, substituído por Pino
- Logs estruturados em JSON (produção) ou coloridos (desenvolvimento)

---

### 5. Cache com Redis
**Status**: ✅ Implementado  
**Prioridade**: Média  
**Esforço**: Médio

**Implementação**:

**Serviço de Cache** (`backend/services/cacheService.js`):
```javascript
const { getFromCache, setInCache, getTTL, isCacheEnabled } = require('../services/cacheService');

// Verificar cache antes de chamar IA
const cached = await getFromCache('chatgpt', model, feature, prompt);
if (cached.hit) {
  return res.json({ ...cached.data.result, cached: true, cachedAt: cached.data.cachedAt });
}

// Salvar no cache após resposta
await setInCache('chatgpt', model, feature, prompt, result, getTTL(feature));
```

**Features**:
- Cache de respostas de IA para prompts idênticos
- Hash SHA256 do prompt + modelo + feature como chave
- TTL configurável por feature (1h para improve-task, 30min para generate-code)
- Skip cache via query param `?skipCache=true`
- Estatísticas de hit/miss rate
- API REST para gerenciamento

**TTL por Feature**:
| Feature | TTL |
|---------|-----|
| improve-task | 1 hora |
| generate-tests | 1 hora |
| generate-code | 30 minutos |
| analyze-risks | 1 hora |
| analyze-coverage | 30 minutos |

**API Endpoints**:
```javascript
GET    /api/cache/health    // Health check do cache
GET    /api/cache/stats     // Estatísticas (hits, misses, hit rate)
DELETE /api/cache           // Limpar todo o cache
DELETE /api/cache/invalidate // Invalidar por padrão (query: provider, feature, model)
```

**Controllers Integrados**:
- ✅ chatgptController.js
- ✅ geminiController.js  
- ✅ codeGenerationController.js (generate-code, analyze-risks)

**Benefícios**:
- Redução de custos com chamadas repetidas
- Resposta instantânea para prompts já processados
- Redução de latência

---

### 6. Queue para Requests Longos
**Status**: ✅ Implementado  
**Prioridade**: Média  
**Esforço**: Alto

**Implementação**:

**Dependências**:
- `bullmq` - Sistema de filas
- `ioredis` - Cliente Redis

**Arquivos criados**:
- `backend/config/redis.js` - Configuração de conexão Redis
- `backend/services/queueService.js` - Serviço genérico de filas
- `backend/services/aiQueueService.js` - Filas específicas para IA
- `backend/controllers/jobsController.js` - API REST para jobs

**Rotas**:
```javascript
GET  /api/jobs/health     // Health check com status do Redis
GET  /api/jobs/stats      // Estatísticas das filas
GET  /api/jobs            // Listar jobs (query: queue, status)
GET  /api/jobs/:jobId     // Status/resultado de um job
DELETE /api/jobs/:jobId   // Cancelar job pendente
POST /api/analyze-coverage/async  // Análise de cobertura assíncrona
```

**Uso**:
```javascript
// Enfileirar análise de cobertura
const job = await queueCoverageAnalysis({
  requirements: [...],
  testCases: [...],
  token: '...',
  model: 'gpt-4o'
});

// Verificar status
GET /api/jobs/{jobId}
// Resposta: { status: 'completed', result: {...} }
```

**Features**:
- Fallback para processamento síncrono quando Redis não está disponível
- Graceful shutdown com fechamento de conexões
- Retry automático em caso de falha
- Jobs de diferentes prioridades

### 7. Monitoramento de Uso e Analytics
**Status**: Não implementado  
**Prioridade**: Alta  
**Esforço**: Médio

**Problema Atual**: Não há visibilidade centralizada sobre quais features, modelos e idiomas geram mais valor, nem sobre gargalos (tempo médio por geração, erros frequentes, cancelamentos).

**Solução Proposta**:
- Instrumentar todos os controllers de IA para enviar eventos para um `analyticsService`.
- Persistir métricas agregadas em uma tabela `AnalyticsEvent` (ou armazenar em Redis + job diário que consolida em banco).
- Expor dashboards via `/api/analytics` e uma página em React mostrando gráficos (Top modelos, tempo médio por feature, distribuição de idiomas, taxa de erro/cancelamento).

**Exemplo de Evento**:
```javascript
await analyticsService.trackGeneration({
  feature: 'generate-tests',
  provider: 'chatgpt',
  model: 'gpt-5-nano',
  language: req.body.language || 'pt-BR',
  durationMs,
  cached: Boolean(req.query.skipCache),
  success: true
});
```

**Benefícios**:
- Produto guiado por dados (priorizar modelos/features com maior ROI).
- Identificação rápida de regressões (aumento de erros ou tempo médio).
- Possibilidade de mostrar métricas para usuários Enterprise (relatórios de adoção).

---

## 🎨 Arquitetura Frontend

### 1. Custom Hooks Melhorados
**Status**: ✅ Implementado  
**Prioridade**: Alta  
**Esforço**: Médio  
**Implementado em**: v1.x.x

**Implementação**:
Os seguintes hooks foram criados em `front/src/hooks/`:

- **useAI.js**: Hook genérico para chamadas de IA
  - `useImproveTask()` - Melhoria de tarefas
  - `useGenerateTests()` - Geração de casos de teste
  - `useGenerateTestCode()` - Geração de código de teste
  - `useAnalyzeRisks()` - Análise de riscos
  
- **useJira.js**: Integração com JIRA
  - `fetchTask(taskCode)` - Buscar tarefa do JIRA
  - `updateDescription(taskCode, description)` - Atualizar descrição
  
- **useGenerationHistory.js**: Gerenciamento de versões
  - `addNewVersion()`, `restore()`, `clear()`, `toggleHistory()`
  
- **useLocalStorage.js**: Storage com sincronização de estado
  - `useLocalStorage(key, initialValue)` - Hook genérico
  - `useEducationMode()` - Modo educacional
  - `useApiToken(provider)` - Tokens de API

**Uso**:
```javascript
import { useImproveTask, useJira, useGenerationHistory, useEducationMode } from '../hooks';

function MyPage() {
  const [educationMode] = useEducationMode();
  const { improveTask, result, loading, error, generationId } = useImproveTask();
  const { fetchTask, isConfigured } = useJira();
  const { versions, showHistory, toggleHistory } = useGenerationHistory(generationId);

  const handleSubmit = async () => {
    await improveTask(prompt, model, taskInfo);
  };
}
```

**Páginas refatoradas**:
- ✅ ImproveTaskPage.js
- ✅ GenerateTestsPage.js
- ✅ RiskAnalysisPage.js

---

### 2. React Query / TanStack Query
**Status**: ✅ Implementado  
**Prioridade**: Alta  
**Esforço**: Médio

**Implementação**:
- `front/src/config/queryClient.js` - Configuração do QueryClient
- `front/src/hooks/useAIMutations.js` - Mutations com React Query
- `App.js` - QueryClientProvider e ReactQueryDevtools

**Hooks disponíveis**:
```javascript
import { 
  useImproveTaskMutation,
  useGenerateTestsMutation,
  useGenerateTestCodeMutation,
  useAnalyzeRisksMutation
} from '../hooks';

// Uso
const mutation = useImproveTaskMutation({
  onSuccess: (data, variables, id) => { /* ... */ },
  onError: (err) => { /* ... */ }
});

mutation.mutate({ promptText, model, taskInfo, generationId });
```

**Benefícios**:
- Cache automático
- Estados `isPending`, `isError`, `isSuccess`
- DevTools para debug
- Invalidação automática de queries

---

### 3. Zustand para Estado Global
**Status**: ✅ Implementado  
**Prioridade**: Média  
**Esforço**: Baixo

**Implementação**:

**Stores criadas** (`front/src/stores/`):

```javascript
// settingsStore.js - Configurações globais
const useSettingsStore = create(persist((set) => ({
  selectedModel: null,
  educationMode: false,
  language: 'pt-BR',
  darkMode: false,
  streamingEnabled: true,
  setModel: (model) => set({ selectedModel: model }),
  toggleEducationMode: () => set((state) => ({ educationMode: !state.educationMode })),
  setLanguage: (lang) => set({ language: lang }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleStreaming: () => set((state) => ({ streamingEnabled: !state.streamingEnabled }))
}), { name: 'settings-storage' }));

// tokensStore.js - Tokens de API
const useTokensStore = create(persist((set, get) => ({
  tokens: {},
  validationStatus: {},
  setToken: (provider, token) => { ... },
  getToken: (provider) => get().tokens[provider],
  hasValidToken: (provider) => { ... },
  removeToken: (provider) => { ... }
}), { name: 'api-tokens' }));

// uiStore.js - Estado da interface
const useUIStore = create((set, get) => ({
  tokenDialogOpen: false,
  historyDrawerOpen: false,
  notifications: [],
  globalLoading: false,
  openTokenDialog: () => set({ tokenDialogOpen: true }),
  notifySuccess: (msg) => get().addNotification({ type: 'success', message: msg }),
  notifyError: (msg) => get().addNotification({ type: 'error', message: msg })
}));

// generationStore.js - Histórico de gerações
const useGenerationStore = create(persist((set, get) => ({
  history: { task: [], tests: [], code: [], risks: [], coverage: [] },
  current: { type: null, input: null, output: null, isLoading: false },
  startGeneration: (type, input) => set({ current: { type, input, isLoading: true } }),
  completeGeneration: (output, save = true) => { ... },
  addToHistory: (type, item) => { ... },
  getHistory: (type) => get().history[type]
}), { name: 'generation-history' }));
```

**Hooks de compatibilidade** (`front/src/stores/hooks.js`):
```javascript
// Mesma interface dos contextos antigos
export const useDarkMode = () => {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const toggleDarkMode = useSettingsStore((state) => state.toggleDarkMode);
  return { isDarkMode: darkMode, toggleDarkMode };
};

export const useLanguage = () => {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const t = (key) => { /* tradução */ };
  return { language, changeLanguage: setLanguage, t };
};
```

**Benefícios**:
- Sem re-renders desnecessários (selectors granulares)
- Persistência automática no localStorage
- DevTools disponíveis
- Remoção dos Context Providers (código mais limpo)

---

### 4. Componentes Compostos
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Médio

```javascript
// Compound Components Pattern
<AIGenerator>
  <AIGenerator.Input placeholder="Descrição da tarefa" />
  <AIGenerator.ModelSelector />
  <AIGenerator.Submit>Gerar</AIGenerator.Submit>
  <AIGenerator.Result />
  <AIGenerator.Feedback />
</AIGenerator>
```

---

### 5. Streaming de Respostas
**Status**: ✅ Implementado  
**Prioridade**: Alta  
**Esforço**: Alto

**Implementação**:

**Backend** (`backend/controllers/streamController.js`):
- `streamChatGPT` - SSE streaming para OpenAI
- `streamGemini` - SSE streaming para Gemini
- `streamAI` - Roteador genérico por provider

**Rotas**:
```javascript
POST /api/stream/chatgpt  // Streaming ChatGPT
POST /api/stream/gemini   // Streaming Gemini
POST /api/stream/:provider // Roteador genérico
```

**Frontend** (`front/src/hooks/useAIStream.js`):
```javascript
import { 
  useAIStream,
  useImproveTaskStream,
  useGenerateTestsStream,
  useGenerateTestCodeStream,
  useAnalyzeRisksStream
} from '../hooks';

// Uso
const { 
  stream, 
  result, 
  isStreaming, 
  error, 
  abort 
} = useAIStream();

await stream({
  provider: 'chatgpt',
  promptText: 'Minha tarefa...',
  model: { apiName: 'chatgpt', version: 'gpt-4o' },
  feature: 'improve-task',
  onChunk: (chunk, fullContent) => setResult(fullContent),
  onComplete: (finalContent, id) => console.log('Done!'),
  onError: (err) => console.error(err)
});
```

**Features**:
- Toggle para ativar/desativar streaming na UI
- Cursor piscante durante streaming
- Botão para cancelar streaming
- Callbacks: `onChunk`, `onComplete`, `onError`
- Função `abort()` para cancelar

**Benefícios**:
- Resposta aparece em tempo real
- Menor tempo percebido de espera
- Melhor UX para respostas longas

### 6. Templates Personalizados de Prompts
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Médio

**Problema Atual**: Cada squad precisa reescrever prompts semelhantes (ex.: "Checklist de segurança mobile", "Plano de testes regressivos") e não há forma de padronizar boas práticas ou compartilhar modelos aprovados.

**Solução Proposta**:
- Criar um módulo "Templates" onde o usuário monta um prompt com variáveis (`{{feature}}`, `{{language}}`, etc.), define linguagem/stack padrão e salva localmente ou no backend.
- Mostrar lista de templates na sidebar/HistoryDrawer, permitindo aplicar rapidamente em qualquer página de geração.
- Compatível com multi-idioma: campos de descrição/labels entram no arquivo `translations.js`.

**Estrutura Sugestão**:
```javascript
// front/src/utils/templates.js
export const defaultTemplates = [
  {
    id: 'regression-mobile',
    label: {
      'pt-BR': 'Regressivo Mobile',
      'en-US': 'Mobile Regression'
    },
    prompt: 'Gere casos para {{platform}} focando em regressão de {{feature}}...'
  }
];
```

**Benefícios**:
- Reaproveitamento de conhecimento entre times.
- Redução de tempo para configurar prompts complexos.
- Maior consistência nas entregas (especialmente para empresas com compliance).

---

## ⚡ Performance

### 1. Bundle Splitting Melhorado
**Status**: ✅ Implementado  
**Prioridade**: Média

**Implementação**:
Todos os componentes lazy carregados agora usam `webpackChunkName` para gerar chunks semânticos:

```javascript
// Lazy load com chunk names semânticos
const LandingPage = lazy(() => import(/* webpackChunkName: "landing" */ './components/LandingPage'));
const HomePage = lazy(() => import(/* webpackChunkName: "home" */ './components/HomePage'));
const ImproveTaskPage = lazy(() => import(/* webpackChunkName: "improve-task" */ './components/ImproveTaskPage'));
const GenerateTestsPage = lazy(() => import(/* webpackChunkName: "generate-tests" */ './components/GenerateTestsPage'));
const CodeGenerationPage = lazy(() => import(/* webpackChunkName: "code-generation" */ './components/CodeGenerationPage'));
const RiskAnalysisPage = lazy(() => import(/* webpackChunkName: "risk-analysis" */ './components/RiskAnalysisPage'));
const FeedbackDashboard = lazy(() => import(/* webpackChunkName: "feedback" */ './components/FeedbackDashboard'));
const TestCoverageAnalysis = lazy(() => import(/* webpackChunkName: "coverage" */ './components/TestCoverageAnalysis'));
const DocumentationPage = lazy(() => import(/* webpackChunkName: "docs" */ './components/DocumentationPage'));
const PromptPage = lazy(() => import(/* webpackChunkName: "prompts" */ './components/PromptPage'));
```

**Resultado**: Chunks com nomes descritivos (landing.xxx.chunk.js, coverage.xxx.chunk.js, etc.)

---

### 2. Virtualização de Listas
**Status**: ✅ Implementado  
**Prioridade**: Média  
**Esforço**: Baixo

**Implementação**:
- Instalado `react-window` para renderização eficiente
- Criado componente `VirtualizedList.js` reutilizável

```javascript
import { VirtualizedList, VirtualizedVariableList, useVirtualizedHeight } from '../components/VirtualizedList';

// Lista com itens de tamanho fixo
<VirtualizedList
  items={history}
  height={400}
  itemSize={80}
  renderItem={({ item, index, style }) => (
    <HistoryItem item={item} style={style} />
  )}
  emptyMessage="Nenhum item"
/>

// Lista com itens de tamanho variável
<VirtualizedVariableList
  items={items}
  height={400}
  getItemSize={(item) => item.expanded ? 150 : 60}
  renderItem={({ item, style }) => <Item item={item} style={style} />}
/>
```

---

### 3. Debounce em Inputs
**Status**: ✅ Implementado  
**Prioridade**: Baixa

**Implementação**:
- Instalado `use-debounce` para debounce otimizado
- Criado hook `useDebounce.js` com múltiplas utilidades

```javascript
import { 
  useDebouncedValue, 
  useDebouncedCallback, 
  useDebouncedInput,
  useThrottledCallback 
} from '../hooks';

// Debounce de valor
const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 300);

// Debounce de callback
const handleSearch = useDebouncedCallback((value) => {
  api.search(value);
}, 300);

// Debounce de input controlado
const { value, debouncedValue, setValue } = useDebouncedInput('', 300);

// Throttle de callback
const handleScroll = useThrottledCallback((e) => {
  trackScrollPosition(e.target.scrollTop);
}, 100);
```

---

## 🔒 Segurança

### 1. Tokens no Frontend (Decisão Arquitetural)
**Status**: ✅ Implementado (por design)  
**Prioridade**: N/A

**Decisão**: Tokens de API são armazenados **apenas no frontend** (localStorage do navegador).

**Justificativa**:
- ✅ **Zero armazenamento server-side** → Sem risco de vazamento de banco
- ✅ **Usuário tem controle total** → Pode revogar/limpar a qualquer momento
- ✅ **Sem responsabilidade legal** → Não guardamos dados sensíveis de terceiros
- ✅ **Compliance simplificado** → LGPD/GDPR mais fácil
- ✅ **Arquitetura stateless** → Backend escala horizontalmente

**Fluxo**:
1. Usuário configura token no frontend
2. Token salvo no localStorage (browser)
3. Token enviado em cada request via header
4. Backend usa token e descarta (não persiste)

---

### 2. Rate Limiting por Usuário
**Status**: Parcialmente implementado (por IP)  
**Prioridade**: Média

```javascript
// Rate limit por token de usuário, não só IP
const userRateLimiter = rateLimit({
  keyGenerator: (req) => req.user?.id || req.ip,
  max: 50
});
```

---

### 3. Audit Log
**Status**: ✅ Implementado  
**Prioridade**: Média  
**Esforço**: Médio

**Implementação**:

**Modelo** (`backend/models/auditLogModel.js`):
```javascript
const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING }, // IMPROVE_TASK, GENERATE_TESTS, etc.
  resource: { type: DataTypes.STRING }, // ai, jira, feedback, job, stream, system
  method: { type: DataTypes.STRING },   // GET, POST, etc.
  path: { type: DataTypes.STRING },     // /api/chatgpt/improve-task
  statusCode: { type: DataTypes.INTEGER },
  details: { type: DataTypes.JSON },    // model, promptLength, etc.
  ip: { type: DataTypes.STRING },
  userAgent: { type: DataTypes.STRING },
  duration: { type: DataTypes.INTEGER }, // ms
  success: { type: DataTypes.BOOLEAN },
  errorMessage: { type: DataTypes.TEXT }
});

// Métodos estáticos
AuditLog.logAI(action, details, req, options);
AuditLog.logJira(action, details, req, options);
AuditLog.logFeedback(action, details, req, options);
AuditLog.logError(action, error, req, options);
AuditLog.getStats(options);
```

**Middleware** (`backend/middlewares/audit.js`):
```javascript
// Middleware automático que registra todas as operações
app.use('/api', auditMiddleware(), routes);

// Helpers para logging manual
import { logAIOperation, logJiraOperation, logError, logRateLimit, logStreamOperation } from './middlewares/audit';
```

**API Endpoints**:
```javascript
GET  /api/audit/logs          // Lista logs com filtros e paginação
GET  /api/audit/stats         // Estatísticas gerais
GET  /api/audit/stats/hourly  // Estatísticas por hora (24h)
GET  /api/audit/actions       // Lista ações disponíveis
GET  /api/audit/resources     // Lista recursos disponíveis
GET  /api/audit/errors        // Últimos erros
GET  /api/audit/logs/:id      // Detalhes de um log
DELETE /api/audit/logs        // Limpar logs antigos (query: olderThanDays)
```

**Ações Registradas**:
- `IMPROVE_TASK`, `GENERATE_TESTS`, `GENERATE_CODE`, `ANALYZE_RISKS`, `ANALYZE_COVERAGE`
- `STREAM_START`, `STREAM_COMPLETE`, `STREAM_ERROR`
- `JIRA_FETCH`, `JIRA_UPDATE`
- `FEEDBACK_CREATE`, `FEEDBACK_UPDATE`
- `JOB_CREATE`, `JOB_COMPLETE`, `JOB_FAIL`
- `API_ERROR`, `RATE_LIMIT_HIT`, `VALIDATION_ERROR`

**Benefícios**:
- Rastreamento completo de operações
- Detecção de abusos e rate limit hits
- Análise de performance (duração)
- Debugging facilitado
- Estatísticas de uso

---

## 🧪 Testes e Qualidade

### 1. Testes Unitários
**Status**: Mínimo (1 teste)  
**Prioridade**: Alta  
**Esforço**: Alto

**Meta**: 80% de cobertura

```bash
# Setup
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Testes de Controllers
describe('chatgptController', () => {
  it('should return 401 if no token configured', async () => {
    const req = { body: { task: 'test' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await improveTaskChatGPT(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

---

### 2. Testes E2E
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Alto

**Ferramenta**: Playwright ou Cypress

```javascript
test('should improve task with gpt-5', async ({ page }) => {
  await page.goto('/improve-task');
  await page.fill('[data-testid="task-input"]', 'Criar tela de login');
  await page.click('[data-testid="model-selector"]');
  await page.click('text=GPT-4o');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="result"]')).toBeVisible({ timeout: 30000 });
});
```

---

### 3. ESLint + Prettier
**Status**: Parcialmente implementado  
**Prioridade**: Média  
**Esforço**: Baixo

---

### 4. Husky + lint-staged
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Baixo

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 🚀 DevOps e Infraestrutura

### 1. Docker
**Status**: Não implementado  
**Prioridade**: Alta  
**Esforço**: Baixo

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "api/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - CHATGPT_API_KEY=${CHATGPT_API_KEY}
  
  frontend:
    build: ./front
    ports:
      - "3000:80"
```

---

### 2. CI/CD com GitHub Actions
**Status**: ✅ Parcialmente implementado  
**Prioridade**: Alta  
**Esforço**: Médio

**Implementado**:
- `.github/workflows/auto-version.yml` - Versionamento semântico automático com Git Flow

**Estratégia de Branches (Git Flow)**:
```
develop (desenvolvimento) → main (produção/deploy)
       ↓                        ↓
   Push trigger            Merge automático
       ↓                        ↓
   Version bump              Tag + Release
```

**Fluxo**:
1. Desenvolver na branch `develop`
2. Push para `develop` aciona o workflow
3. Workflow detecta tipo de bump pelos commits
4. Atualiza versão nos `package.json`
5. Faz merge para `main` automaticamente
6. Cria tag e GitHub Release
7. Netlify faz deploy da `main`

**Padrão de Commits para Versionamento**:
| Tipo de Bump | Palavras-chave no Commit |
|--------------|--------------------------|
| **MAJOR** (X.0.0) | `BREAKING CHANGE`, `breaking:`, `major:` |
| **MINOR** (0.X.0) | `feat`, `feature:`, `minor:`, `add` |
| **PATCH** (0.0.X) | `fix`, `patch`, `bugfix`, `hotfix`, `chore`, `refactor` |

**Pendente**: 
- Workflow de CI para testes
- Proteção de branches

---

### 3. Monitoramento
**Status**: Não implementado  
**Prioridade**: Média  
**Esforço**: Médio

**Ferramentas**:
- Sentry para error tracking
- Prometheus + Grafana para métricas
- OpenTelemetry para tracing

---

### 4. Health Check Endpoint
**Status**: ✅ Implementado  
**Prioridade**: Alta  
**Esforço**: Baixo

**Implementação**:
```javascript
// GET /api/jobs/health
{
  status: 'ok',
  timestamp: '2025-12-10T...',
  redis: { connected: true/false, host: '...' },
  queues: { enabled: true/false }
}
```

---

## 📝 Roadmap Sugerido

### Fase 1 (1-2 semanas) ✅ CONCLUÍDA
- [x] ~~Validação com Joi~~ ✅ Implementado
- [x] ~~Error handling centralizado (Backend + Frontend)~~ ✅ Implementado
- [x] ~~Logging estruturado~~ ✅ Implementado
- [ ] Implementar Strategy Pattern para IAs
- [ ] Adicionar Claude como provider
- [ ] Atualizar modelos OpenAI para nomes reais

### Fase 2 (2-3 semanas) ✅ PARCIALMENTE CONCLUÍDA
- [x] ~~React Query no frontend~~ ✅ Implementado
- [x] ~~Custom Hooks melhorados~~ ✅ Implementado
- [x] ~~Zustand para estado global~~ ✅ Implementado
- [ ] Integração GitHub Issues
- [ ] Integração Azure DevOps
- [ ] Testes unitários (50% cobertura)

### Fase 3 (3-4 semanas) ✅ PARCIALMENTE CONCLUÍDA
- [x] ~~Streaming de respostas~~ ✅ Implementado
- [x] ~~Queue com BullMQ~~ ✅ Implementado
- [x] ~~Health Check Endpoint~~ ✅ Implementado
- [ ] Docker + CI/CD completo
- [ ] Cache com Redis (para respostas de IA)

### Fase 4 (Contínuo)
- [ ] Mais provedores de IA (Claude, Mistral, DeepSeek)
- [ ] Integração TestRail/Xray
- [ ] Testes E2E
- [ ] Monitoramento (Sentry, Prometheus)

---

## 📊 Resumo de Status

| Categoria | Total | ✅ Implementado | 🔄 Parcial | ❌ Pendente |
|-----------|-------|-----------------|------------|-------------|
| Padrões de Projeto | 5 | 1 | 0 | 4 |
| Novas IAs | 5 | 0 | 0 | 5 |
| Integrações | 7 | 0 | 0 | 7 |
| Arquitetura Backend | 7 | 6 | 0 | 1 |
| Arquitetura Frontend | 6 | 4 | 0 | 2 |
| Performance | 3 | 3 | 0 | 0 |
| Segurança | 3 | 2 | 1 | 0 |
| Testes | 4 | 0 | 1 | 3 |
| DevOps | 4 | 2 | 1 | 1 |

### ✅ Implementações Completas:
1. **Validação com Joi** - Schemas e middleware
2. **Error Handling Centralizado** - Backend + Frontend
3. **Logging Estruturado** - Pino com formatação
4. **Queue com BullMQ** - Processamento assíncrono
5. **Cache com Redis** - Cache de prompts idênticos com TTL configurável
6. **Custom Hooks** - useAI, useJira, useAIStream, etc.
7. **React Query** - Mutations e cache
8. **Zustand** - Estado global sem Context
9. **Streaming SSE** - Respostas em tempo real
10. **Health Check** - Endpoint de status
11. **CI/CD Auto-versioning** - GitHub Actions
12. **Bundle Splitting** - Chunks semânticos com webpack
13. **Virtualização de Listas** - react-window component
14. **Debounce/Throttle** - Hooks otimizados
15. **Tokens no Frontend** - Arquitetura stateless por design (segurança)
16. **Audit Log** - Registro completo de operações com API de consulta

### 🧹 Limpezas Realizadas:
- **Pacotes removidos (frontend)**:
  - `@testing-library/user-event` - Não utilizado
  - `@craco/craco` - Não utilizado
  - `terser-webpack-plugin` - Não utilizado (já incluído no CRA)
- **Arquivos removidos**:
  - `front/src/contexts/DarkModeContext.js` - Substituído por Zustand
  - `front/src/contexts/LanguageContext.js` - Substituído por Zustand
  - Pasta `front/src/contexts/` removida

---

**Última atualização**: Dezembro 2025
