# 🚀 Projeto IA Testes - Task & Test Generator

Uma aplicação web moderna que utiliza Inteligência Artificial (ChatGPT e Gemini) para gerar e melhorar histórias de usuário, casos de teste, código de teste e análise de riscos. Integração completa com JIRA para facilitar o fluxo de trabalho.

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Recursos Principais](#recursos-principais)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)

## 🎯 Visão Geral

O **Projeto IA Testes** é uma plataforma inteligente para automação de testes QA que integra modelos de IA avançados com fluxos de trabalho reais em JIRA. A aplicação oferece um ambiente educacional completo para aprender sobre testes de software enquanto gera artefatos de qualidade automaticamente.

**URL Base**: `http://localhost:3000` (Frontend) e `http://localhost:5000` (Backend)

## ✨ Recursos Principais

### 1. **Melhorar Tarefas (Improve Task)**
   - Refina histórias de usuário usando IA
   - Gera critérios de aceitação detalhados
   - Integração com JIRA para atualizar cartões
   - Modo educacional com dicas de QA

### 2. **Gerar Casos de Teste (Generate Tests)**
   - Cria casos de teste estruturados a partir de histórias
   - Suporta múltiplos modelos de IA
   - Versionamento de gerações anteriores
   - Sistema de feedback interativo

### 3. **Gerar Código de Teste (Generate Code)**
   - Gera código de teste automático
   - Suporta múltiplos frameworks (Jest, Mocha, Cypress, etc.)
   - Múltiplas linguagens (JavaScript, TypeScript, Python, Java, C#)
   - Regeneração com feedback

### 4. **Análise de Riscos (Risk Analysis)**
   - Identifica riscos potenciais em features
   - Recomendações de testes específicos
   - Relatórios estruturados
   - Integração com histórias de usuário

### 5. **Dashboard de Feedback**
   - Visualiza feedback de gerações
   - Estatísticas de uso
   - Histórico de melhorias
   - Análise de modelos mais eficientes

### 6. **Modo Educacional**
   - Explicações detalhadas de conceitos de QA
   - Dicas de particionamento de equivalência
   - Valores-limite e critérios de aceitação
   - Diferenciação entre testes positivos e negativos

## 🛠 Stack Tecnológico

### Frontend
- **React 18** - UI library
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Markdown** - Markdown rendering
- **React Icons** - Icon library

### Backend
- **Node.js / Express** - Web framework
- **SQLite + Sequelize** - Database & ORM
- **Axios** - HTTP requests
- **CORS** - Cross-origin requests
- **Morgan** - HTTP logging
- **dotenv** - Environment variables

### APIs Externas
- **OpenAI ChatGPT** - Modelos GPT-3.5 e GPT-4
- **Google Gemini** - Modelos Gemini Pro
- **Atlassian JIRA** - Integração com gerenciamento de tarefas

## 🏗 Arquitetura

```
projeto-ia-testes/
├── backend/                    # Servidor Node.js
│   ├── api/
│   │   ├── index.js           # Ponto de entrada
│   │   └── routes.js          # Rotas
│   ├── config/
│   │   ├── database.js        # Configuração SQLite
│   │   └── aiModels.js        # Modelos de IA
│   ├── controllers/           # Lógica de negócio
│   ├── models/                # Modelos de banco
│   ├── services/              # Serviços auxiliares
│   ├── utils/                 # Utilitários
│   └── package.json
│
├── front/                      # Aplicação React
│   ├── public/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── contexts/          # Context API
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Funções auxiliares
│   │   ├── locales/           # Internacionalização
│   │   ├── styles/            # Estilos globais
│   │   ├── App.js             # Componente raiz
│   │   └── App.css            # Estilos globais
│   └── package.json
│
└── docs/                       # Documentação
    ├── SETUP.md               # Guia de instalação
    ├── API.md                 # Documentação de API
    ├── COMPONENTS.md          # Referência de componentes
    ├── DESIGN_SYSTEM.md       # Sistema de design
    └── CONTRIBUTING.md        # Guia de contribuição
```

## 🚀 Instalação

### Pré-requisitos
- Node.js 14+ instalado
- npm ou yarn
- Tokens de API (OpenAI e Google Gemini)
- Credenciais JIRA (opcional)

### Passo 1: Clonar o repositório
```bash
git clone https://github.com/Caio-Maia/projeto-ia-testes.git
cd projeto-ia-testes
```

### Passo 2: Instalar dependências do Backend
```bash
cd backend
npm install
```

### Passo 3: Instalar dependências do Frontend
```bash
cd ../front
npm install
```

### Passo 4: Configurar variáveis de ambiente
```bash
# Backend - criar .env na pasta backend
OPENAI_API_KEY=sua_chave_aqui
GEMINI_API_KEY=sua_chave_aqui
PORT=5000
```

```bash
# Frontend - criar .env na pasta front
REACT_APP_BACKEND_URL=http://localhost:5000
```

## ⚙️ Configuração

### Configurar Tokens de API

1. **OpenAI (ChatGPT)**
   - Acesse [openai.com/api-keys](https://openai.com/api-keys)
   - Crie uma nova chave
   - Na aplicação, acesse Configurar Tokens e insira

2. **Google Gemini**
   - Acesse [aistudio.google.com](https://aistudio.google.com)
   - Gere uma nova chave de API
   - Na aplicação, acesse Configurar Tokens e insira

3. **JIRA (Opcional)**
   - Base URL: `https://sua-empresa.atlassian.net`
   - Email: seu email da conta JIRA
   - Token: Gere em [id.atlassian.com/manage-profile/security](https://id.atlassian.com/manage-profile/security)

## 🎮 Como Usar

### 1. Iniciar Servidores

**Backend** (terminal 1):
```bash
cd backend
npm start
# Servidor rodando em http://localhost:5000
```

**Frontend** (terminal 2):
```bash
cd front
npm start
# Aplicação aberta em http://localhost:3000
```

### 2. Workflow Básico

#### Melhorar uma História de Usuário
1. Acesse "Melhorar Tarefa" no menu
2. Cole a história de usuário (ou importe do JIRA)
3. Selecione o modelo de IA (ChatGPT/Gemini)
4. Clique em "Gerar"
5. Revise e clique em "Atualizar JIRA" se desejar sincronizar

#### Gerar Casos de Teste
1. Acesse "Gerar Casos de Teste"
2. Cole a história ou tarefa
3. Selecione o modelo
4. Clique em "Gerar"
5. Revise os casos e deixe feedback para refinamento

#### Gerar Código de Teste
1. Acesse "Gerar Código"
2. Cole os casos de teste
3. Escolha framework e linguagem
4. Selecione modelo de IA
5. Clique em "Gerar"
6. Copie o código gerado para seu projeto

### 3. Modo Educacional

Ative o modo educacional para:
- Receber explicações detalhadas da IA
- Aprender conceitos de QA enquanto gera artefatos
- Dicas sobre particionamento de equivalência
- Exemplos de testes positivos vs negativos

## 📚 Documentação

Consulte os arquivos específicos na pasta `/docs`:

- **[SETUP.md](./docs/SETUP.md)** - Guia detalhado de instalação e configuração
- **[API.md](./docs/API.md)** - Documentação completa de endpoints
- **[COMPONENTS.md](./docs/COMPONENTS.md)** - Referência de componentes React
- **[DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)** - Paleta de cores e componentes UI
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Guia para contribuir com código

## 🎨 Design System

### Cores Principais
- **Primária**: `#3b82f6` (Azul)
- **Secundária**: `#2563eb` (Azul escuro)
- **Sucesso**: `#22c55e` (Verde)
- **Perigo**: `#ef4444` (Vermelho)
- **Texto**: `#1f2937` (Cinza escuro)

### Componentes
- Buttons (Primary, Secondary, Danger, Outline)
- Cards com shadows consistentes
- Sidebar responsivo
- Modals e Dialogs
- Forms com validação

Para mais detalhes, veja [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)

## 🌍 Internacionalização

A aplicação suporta:
- 🇧🇷 Português (Brasil)
- 🇺🇸 English (USA)

Selecione o idioma usando o seletor de idioma no header.

## 🔐 Segurança

- Tokens de API armazenados em `localStorage` (segurança cliente)
- Variáveis de ambiente no backend para chaves sensíveis
- CORS configurado para aceitar requests locais
- Validação de entrada em formulários

## 📊 Endpoints Principais

### Backend API

```
POST   /api/improve-task          - Melhorar história de usuário
POST   /api/generate-tests        - Gerar casos de teste
POST   /api/generate-test-code    - Gerar código de teste
POST   /api/analyze-risks         - Analisar riscos
POST   /api/jira-task             - Buscar tarefa JIRA
POST   /api/jira-task/update      - Atualizar tarefa JIRA
GET    /api/feedback              - Listar feedback
POST   /api/feedback              - Criar feedback
```

Veja [API.md](./docs/API.md) para detalhes completos.

## 🐛 Troubleshooting

### "Failed to fetch" ao enviar requisição
- Verifique se o backend está rodando em `http://localhost:5000`
- Verifique CORS nas headers da resposta

### Token inválido para IA
- Confirme que a chave está ativa na plataforma (OpenAI/Gemini)
- Verifique se tem saldo/créditos disponíveis

### JIRA não sincroniza
- Confirme que as credenciais JIRA estão corretas
- Verifique se o cartão JIRA existe
- Certifique-se de ter permissões para editar o cartão

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo LICENSE para detalhes.

## 👨‍💻 Autor

**Caio Maia** - [GitHub](https://github.com/Caio-Maia)

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
1. Abra uma [Issue](https://github.com/Caio-Maia/projeto-ia-testes/issues)
2. Consulte a documentação em `/docs`
3. Revise os exemplos de uso

---

**Feito com ❤️ para melhorar a qualidade de software**
