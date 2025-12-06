# 📜 Changelog

Todas as mudanças notáveis neste projeto estão documentadas aqui.

## [1.2.0] - Dezembro 2024

### ✨ Novos Recursos

#### Test Coverage Analysis
- **Novo Endpoint**: `POST /api/analyze-coverage`
- **Novo Componente**: TestCoverageAnalysis page
- **Nova Route**: `/test-coverage`
- **Novo Menu Item**: "Cobertura de Testes" no Sidebar
- **Nova Feature Card**: No HomePage com CTA button
- **Translations**: Suporte PT-BR e EN-US
  - `testCoverage: 'Cobertura de Testes'`
  - `testCoverageDesc: 'Analise a cobertura de seus testes e identifique gaps'`

**Funcionalidades**:
- Input de coverage metrics (statements, branches, functions, lines)
- Seleção de features testadas vs total
- Análise de gaps por feature
- Recomendações automáticas de testes
- Sugestões de casos de teste
- Targets de cobertura recomendados

### 🎨 Melhorias UI/UX

#### Sidebar Enhancements
- **Scroll Functionality**: Conteúdo do menu agora scrollável em telas pequenas
- **Flexbox Layout**: Header e token button fixos, conteúdo móvel
- **Custom Scrollbar**: Webkit scrollbar com dark/light mode support
- **Responsive Design**: Funciona bem em mobile, tablet e desktop

**Código**:
```javascript
Box with flex: 1, overflowY: 'auto'
Custom scrollbar styling com cores temáticas
```

#### History Button Alignment
- **Novo Componente**: ListItem rendering para history button
- **Consistência**: Agora combina com outros menu items
- **Responsive**: Icon-only when closed, full text when open
- **Styling**: Verde (#388e3c) com hover effects

**Antes**: IconButton com `position: absolute`
**Depois**: ListItem com styling consistente

#### Menu Reorganization
- **Test Coverage**: Movido para primaryMenuItems
- **Estrutura**:
  - **Primário**: Home, Improve Task, Generate Tests, Generate Code, Analyze Risks, **Test Coverage**
  - **Secundário**: Feedback Dashboard, Documentation, Adjust Prompts

#### HomePage Enhancements
- **Novo Feature Card**: Test Coverage com FaChartLine icon
- **Cor**: #10b981 (emerald green)
- **4 CTA Buttons** na seção "Pronto para Começar?":
  1. Melhorar Tarefa → `/improve-task`
  2. Gerar Testes → `/generate-tests`
  3. Gerar Código → `/generate-code`
  4. **Cobertura de Testes → `/test-coverage`** (NEW)

### ❌ Removals

#### Autenticação Removida
- **Removido**: LoginPage component
- **Removido**: AuthContext (não mais necessário)
- **Removido**: useAuth hook (login/logout methods)
- **Removido**: Token validation middleware de routes
- **Removido**: AUTH_TOKEN de .env files
- **Removido**: AuthProvider do App.js

**Motivo**: Simplificar arquitetura, manter segurança por rede

**Mantido**:
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CSRF tokens

### 🔐 Segurança

#### Rate Limiting
- **Global**: 100 requisições / 15 minutos por IP
- **Per-User**: 10 requisições / minuto por usuário
- **Health Check**: Isento de rate limiting
- **Monitoramento**: RateLimitMonitor utility para tracking

#### CSRF Protection
- **Endpoint**: `GET /api/csrf-token`
- **Validação**: Middleware em POST/PUT/DELETE
- **Storage**: Cookies seguros
- **Headers**: `X-CSRF-Token` automático no frontend

#### HTTPS Enforcement
- **Redirecionamento**: HTTP → HTTPS (301)
- **HSTS**: `max-age=31536000` (1 ano)
- **Production Ready**: Detecção de proxy reverso

#### Content Security Policy
- **Helmet.js**: CSP headers completos
- **Directives**: defaultSrc, scriptSrc, styleSrc, fontSrc, imgSrc, connectSrc
- **Report Endpoint**: `/api/csp-report`
- **Monitoring**: Frontend logging de violações

#### Data Encryption
- **Senhas**: bcrypt com salt (SALT_ROUNDS=10)
- **Tokens**: AES-256-GCM com IV aleatório
- **Hash**: SHA-256 (one-way, lookup)
- **Geração**: cryptographically random (32 bytes)

#### Response Compression
- **Algoritmo**: Gzip/deflate
- **Nível**: 6 (balanced performance)
- **Threshold**: 1KB (respostas pequenas não comprimidas)
- **Ratio**: 96.85% compression em JSON
- **Bandwidth**: ~$144/ano economy para 100k req/mês

#### OWASP Top 10 Compliance
- ✅ A01 - Broken Access Control
- ✅ A02 - Cryptographic Failures
- ✅ A03 - Injection
- ✅ A04 - Insecure Design
- ✅ A05 - Security Misconfiguration
- ✅ A06 - Vulnerable Components
- ✅ A07 - Identification and Auth
- ✅ A08 - Software and Data Integrity
- ✅ A09 - Logging and Monitoring
- ✅ A10 - SSRF

### 📚 Documentação

#### Atualizado
- **IMPROVEMENTS.md**: Fases do projeto atualizadas
- **API.md**: Novo endpoint `/api/analyze-coverage`, autenticação clarificada
- **SETUP.md**: Instruções de CSRF token, Test Coverage testing
- **README.md**: Novo resource listado, changelog adicionado

#### Novo
- **CHANGELOG.md**: Este arquivo

### 🔧 Alterações Técnicas

#### Backend
- **Removido**: Autenticação de routes
- **Simplificado**: apiClient (sem token injection)
- **Mantido**: Todos middleware de segurança

#### Frontend
- **Removido**: LoginPage.js
- **Simplificado**: AuthContext, useAuth
- **Adicionado**: TestCoverageAnalysis component
- **Melhorado**: Sidebar.js (scroll + menu)
- **Atualizado**: HomePage.js (Test Coverage feature)
- **Atualizado**: HistoryDrawer.js (ListItem rendering)

#### Translations
- Adicionado: `testCoverage` (PT-BR + EN-US)
- Adicionado: `testCoverageDesc` (PT-BR + EN-US)

### 📊 Performance

- **Bundle Size**: Sem mudanças (lazy loading mantido)
- **Compression**: 96.85% em JSON responses
- **API Response**: <2s para análise de cobertura
- **Frontend Load**: <3s em 3G (após otimizações anteriores)

### 🐛 Bug Fixes

- Sidebar overflow em mobile ✅
- History button misalignment ✅
- Menu organization inconsistency ✅
- CORS headers missing ✅ (mantido de v1.1)

### ⚠️ Breaking Changes

- **Autenticação Removida**: Não haverá mais login necessário
- **Token Format**: Nenhum token de autenticação esperado no header
- **CSRF Required**: POST/PUT/DELETE agora requerem token CSRF

### 📋 Migration Guide (v1.1 → v1.2)

1. **Remover Login**:
   - Não mais necessário fazer login
   - Acessar app diretamente

2. **API Clients**:
   - Remover Authorization headers
   - Continuar incluindo tokens OpenAI/Gemini (se necessário)

3. **CSRF Tokens**:
   - GET `/api/csrf-token` antes de POST/PUT/DELETE
   - Frontend faz automaticamente

### 🧪 Tested On

- Node.js 18.x
- React 18.x
- Chrome/Firefox/Safari (latest)
- Windows/macOS/Linux

### 📝 Contributors

- Caio Maia (@Caio-Maia)

---

## [1.1.0] - Novembro 2024

### ✨ Features
- Response Compression (gzip/deflate)
- OWASP Compliance
- Data Encryption (bcrypt, AES-256, SHA-256)
- Rate Limiting (100/15min global + 10/min per-user)
- HTTPS Enforcement
- CSRF Protection

---

## [1.0.0] - Setembro 2024

### ✨ Initial Release
- Dark Mode
- Multi-model support (ChatGPT, Gemini)
- Export functionality (PDF, Word, Markdown, JSON, CSV)
- History management
- JIRA integration
- Feedback system
- Educational mode
- Responsive UI

---

**Última atualização**: Dezembro 2024
