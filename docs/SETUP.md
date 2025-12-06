# 🛠 Guia Completo de Instalação e Configuração

Este documento fornece instruções detalhadas para configurar o projeto Projeto IA Testes do zero.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Projeto](#instalação-do-projeto)
3. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
4. [Configuração de APIs Externas](#configuração-de-apis-externas)
5. [Executando o Projeto](#executando-o-projeto)
6. [Verificação de Funcionamento](#verificação-de-funcionamento)
7. [Troubleshooting](#troubleshooting)

## 🔧 Pré-requisitos

### Obrigatórios
- **Node.js** 14.0 ou superior ([download](https://nodejs.org/))
- **npm** 6.0 ou superior (incluído com Node.js)
- **Git** para clonar o repositório ([download](https://git-scm.com/))

### Recomendados
- **VSCode** ou IDE similar
- **Postman** para testar endpoints
- **SQLite Browser** para visualizar banco de dados

### Validar Instalação
```powershell
node --version        # Deve mostrar v14.0.0 ou superior
npm --version         # Deve mostrar 6.0.0 ou superior
git --version         # Deve mostrar a versão do git
```

## 📥 Instalação do Projeto

### Passo 1: Clonar Repositório
```powershell
git clone https://github.com/Caio-Maia/projeto-ia-testes.git
cd projeto-ia-testes
```

### Passo 2: Instalar Backend
```powershell
cd backend
npm install
```

Isso instalará:
- Express.js
- Sequelize (ORM)
- SQLite3
- CORS
- Morgan (logging)
- dotenv
- Axios

### Passo 3: Instalar Frontend
```powershell
cd ../front
npm install
```

Isso instalará:
- React 18
- Material-UI (MUI)
- React Router
- Axios
- React Markdown
- React Icons

### Estrutura de Diretórios Após Instalação
```
projeto-ia-testes/
├── backend/
│   ├── node_modules/     ← Pacotes instalados
│   ├── api/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   ├── package-lock.json
│   └── .env              ← Criar (variáveis de ambiente)
│
├── front/
│   ├── node_modules/     ← Pacotes instalados
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── .env              ← Criar (variáveis de ambiente)
│
└── docs/
```

## 🔐 Configuração de Variáveis de Ambiente

### Backend (.env)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# API Keys
OPENAI_API_KEY=sua_chave_openai_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui

# JIRA (Opcional)
JIRA_BASE_URL=https://sua-empresa.atlassian.net
JIRA_EMAIL=seu-email@empresa.com
JIRA_TOKEN=seu_token_jira_aqui

# Database
DATABASE_PATH=./data/database.sqlite

# Encryption (Opcional, para dados sensíveis)
ENCRYPTION_KEY=sua_chave_de_32_caracteres_aqui
```

**Variáveis Obrigatórias**:
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

**Nota sobre Autenticação**: 
- ❌ Autenticação foi removida (v1.2.0)
- ✅ API acessível sem tokens
- ✅ Protegida por: CORS, Rate Limiting, Helmet, CSRF

### Frontend (.env)

Crie um arquivo `.env` na pasta `front/`:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development

# Feedback Storage Mode
# 'local' = localStorage only (private, no backend needed)
# 'backend' = SQLite database (shared, requires backend)
# 'hybrid' = User can choose (toggle in dashboard)
REACT_APP_FEEDBACK_STORAGE=hybrid
```

**Nota**: Variáveis frontend devem ser prefixadas com `REACT_APP_`

**Modos de Armazenamento de Feedback**:
| Modo | Descrição | Uso Recomendado |
|------|-----------|-----------------|
| `local` | Dados salvos no navegador | Uso pessoal, testes |
| `backend` | Dados salvos no banco de dados | Ambiente corporativo |
| `hybrid` | Usuário pode escolher | Flexibilidade máxima |

## 🔑 Configuração de APIs Externas

### 1. OpenAI ChatGPT API

**Passo 1**: Acesse [OpenAI API Keys](https://platform.openai.com/api-keys)

**Passo 2**: Faça login com sua conta OpenAI

**Passo 3**: Clique em "Create new secret key"

**Passo 4**: Copie a chave

**Passo 5**: Adicione ao arquivo `.env` do backend:
```env
OPENAI_API_KEY=sk-...
```

**Verificar Acesso**:
```bash
curl -H "Authorization: Bearer sk-..." https://api.openai.com/v1/models
```

### 2. Google Gemini API

**Passo 1**: Acesse [Google AI Studio](https://aistudio.google.com/)

**Passo 2**: Clique em "Get API Key"

**Passo 3**: Selecione ou crie um projeto

**Passo 4**: Clique em "Create API Key"

**Passo 5**: Copie a chave

**Passo 6**: Adicione ao arquivo `.env` do backend:
```env
GEMINI_API_KEY=AIza...
```

### 3. JIRA (Opcional)

Se você deseja integração com JIRA:

**Passo 1**: Acesse [Atlassian Account Security](https://id.atlassian.com/manage-profile/security)

**Passo 2**: Clique em "Create API token"

**Passo 3**: Dê um nome (ex: "Projeto IA Testes")

**Passo 4**: Copie o token

**Passo 5**: Adicione ao arquivo `.env`:
```env
JIRA_BASE_URL=https://sua-empresa.atlassian.net
JIRA_EMAIL=seu-email@empresa.com
JIRA_TOKEN=seu_token_aqui
```

**Encontrar Base URL JIRA**:
- Vá para seu projeto JIRA
- A URL será: `https://[sua-empresa].atlassian.net`

## 🚀 Executando o Projeto

### Terminal 1: Backend

```powershell
cd backend
npm start
```

Saída esperada:
```
Server running on port 5000
Database connected
```

### Terminal 2: Frontend

```powershell
cd front
npm start
```

Saída esperada:
```
Compiled successfully!
You can now view front in the browser.
Local:            http://localhost:3000
```

Navegador abrirá automaticamente em `http://localhost:3000`

### Scripts Disponíveis

#### Backend
```bash
npm start          # Inicia servidor em modo desenvolvimento
npm run build      # Build para produção
npm test           # Executa testes
```

#### Frontend
```bash
npm start          # Inicia React dev server
npm run build      # Build otimizado para produção
npm test           # Executa testes
npm run eject      # Revela configuração (não reversível)
```

## ✅ Verificação de Funcionamento

### 1. Verificar Backend

```powershell
# Teste a rota principal
curl http://localhost:5000/api/health

# Resposta esperada:
# {"status":"ok"}

# Obter CSRF Token (necessário para operações seguras)
curl http://localhost:5000/api/csrf-token

# Resposta esperada:
# {"csrfToken":"...token-aqui..."}
```

### 2. Verificar Frontend

- Abra `http://localhost:3000` no navegador
- Você deve ver a página inicial com logo e botões de navegação
- Clique em "Configurar Tokens" (canto superior)
- Tente adicionar um token de teste
- ❌ Nota: Login/autenticação foi removido (v1.2.0)
- ✅ API acessível diretamente sem login

### 3. Testar IA

1. Configure tokens (OpenAI e/ou Gemini)
2. Acesse "Melhorar Tarefa"
3. Cole um exemplo de história de usuário:
   ```
   Como usuário, quero poder resetar minha senha
   Para recuperar acesso à minha conta
   ```
4. Clique em "Gerar"
5. Verifique se a IA gera uma resposta

### 4. Testar Análise de Cobertura de Testes (NEW)

1. Acesse "Cobertura de Testes" no menu
2. Configure seu coverage atual (statements, branches, functions, lines)
3. Selecione quais features têm testes
4. Clique em "Analisar"
5. Receba análise de gaps e recomendações

### 5. Verificar JIRA (opcional)

1. Configure credenciais JIRA
2. Acesse "Melhorar Tarefa"
3. Insira a chave do cartão (ex: `PROJECT-123`)
4. Clique em "Carregar do JIRA"
5. Se os dados carregarem, a conexão está funcional

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"

**Causa**: Dependencies não foram instaladas

**Solução**:
```bash
cd backend
npm install
```

### Erro: "Port 5000 already in use"

**Causa**: Outro processo usando a porta

**Solução** (Windows PowerShell):
```powershell
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

### Erro: "OPENAI_API_KEY is not defined"

**Causa**: Variável de ambiente não configurada

**Solução**:
1. Verifique se arquivo `.env` existe em `backend/`
2. Verifique se tem a linha `OPENAI_API_KEY=sk-...`
3. Reinicie o servidor

### "Failed to fetch" ao clicar em botões

**Causa**: Backend não está rodando

**Solução**:
```bash
cd backend
npm start
```

### Erro: "Invalid API Key"

**Causa**: Chave de API expirada ou inválida

**Solução**:
1. Regenere a chave na plataforma (OpenAI/Gemini)
2. Atualize no arquivo `.env`
3. Reinicie backend
4. Atualize o token na UI

### Erro: "CSRF Token Required" (429)

**Causa**: Token CSRF ausente ou inválido em requisições POST/PUT/DELETE

**Solução**:
1. Frontend obtém automaticamente via `GET /api/csrf-token`
2. Incluir em header: `X-CSRF-Token: token-aqui`
3. Se erro persistir, limpe cookies e tente novamente

### Frontend não carrega em http://localhost:3000

**Causa**: Processo React não iniciado ou porta 3000 em uso

**Solução**:
```bash
cd front
npm start
```

Se porta 3000 estiver em uso:
```powershell
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
npm start
```

### Banco de dados não criado

**Causa**: Pasta `data/` não existe

**Solução**: Backend criará automaticamente. Se não:
```bash
mkdir backend/data
npm start
```

### "CORS error" ao fazer requisição

**Causa**: CORS não configurado corretamente

**Solução**: Verifique em `backend/api/index.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

## 📊 Verificar Banco de Dados

Instale uma ferramenta para visualizar SQLite:

**Windows** - DB Browser for SQLite:
```bash
# Download em https://sqlitebrowser.org/
# Abra o arquivo database.sqlite em backend/data/
```

Ou use linha de comando:
```bash
cd backend/data
sqlite3 database.sqlite
sqlite> .tables         # Lista tabelas
sqlite> SELECT * FROM users;  # Vê dados
sqlite> .quit           # Sai
```

## 🎯 Próximos Passos

Após configuração bem-sucedida:

1. Leia [README.md](../README.md) para visão geral
2. Consulte [API.md](./API.md) para endpoints disponíveis
3. Revise [COMPONENTS.md](./COMPONENTS.md) para componentes React
4. Estude [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) para UI/UX
5. Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para contribuir
6. Confira [IMPROVEMENTS.md](./IMPROVEMENTS.md) para roadmap

## 📝 Mudanças Recentes (v1.2.0)

- ✅ Autenticação removida (API acessível diretamente)
- ✅ Sidebar com scroll (conteúdo responsivo)
- ✅ Test Coverage feature lançada
- ✅ UI/UX improvements (History alignment, menu reorganization)
- ✅ Security layers ativas (CORS, Rate Limit, Helmet, CSRF)

## 📞 Suporte

Se tiver problemas:

1. Verifique as variáveis de ambiente
2. Consulte logs do backend/frontend
3. Revise as variáveis de ambiente
4. Confira [Troubleshooting](#troubleshooting) acima
5. Abra uma [Issue no GitHub](https://github.com/Caio-Maia/projeto-ia-testes/issues)

---

**Última atualização**: Dezembro 2025 (v2.1.0)
