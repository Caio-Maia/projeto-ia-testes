# 🧩 React Components Reference

Guia completo de todos os componentes React disponíveis no projeto.

## 📋 Índice

1. [Componentes de Layout](#componentes-de-layout)
2. [Componentes de Página](#componentes-de-página)
3. [Componentes de Formulário](#componentes-de-formulário)
4. [Componentes de Controle](#componentes-de-controle)
5. [Hooks Customizados](#hooks-customizados)
6. [Stores (Zustand)](#stores-zustand)

---

## 📐 Componentes de Layout

### Header

Cabeçalho da aplicação com navegação e controles.

**Localização**: `src/components/Header.js`

**Props**:
```javascript
<Header />
```

**Features**:
- Logo e título do projeto
- Seletor de idioma (PT/EN)
- Botão de configurar tokens
- Modo educacional toggle
- Links de navegação

**Exemplo**:
```jsx
import Header from './components/Header';

export default function App() {
  return (
    <div>
      <Header />
      {/* Conteúdo */}
    </div>
  );
}
```

---

### Sidebar

Menu lateral com navegação e informações de usuário.

**Localização**: `src/components/Sidebar.js`

**Props**:
```javascript
<Sidebar 
  open={boolean}      // Estado do sidebar (aberto/fechado)
  onToggle={function} // Callback ao clicar toggle
/>
```

**Features**:
- Menu colapsível
- Links para todas as páginas
- Botão de token flutuante
- Modo responsivo

**Exemplo**:
```jsx
import Sidebar from './components/Sidebar';
import { useState } from 'react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <Sidebar 
      open={sidebarOpen}
      onToggle={() => setSidebarOpen(!sidebarOpen)}
    />
  );
}
```

---

### Footer

Rodapé com links e informações.

**Localização**: `src/components/Footer.js`

**Props**:
```javascript
<Footer />
```

**Features**:
- Links de navegação
- Copyright
- Links sociais

---

## 📄 Componentes de Página

### HomePage

Página inicial com apresentação do projeto.

**Localização**: `src/components/HomePage.js`

**Props**: Nenhuma

**Features**:
- Hero section com CTA
- Seção de features
- Seção de benefícios
- Testemunhos

**Exemplo**:
```jsx
import HomePage from './components/HomePage';

function App() {
  return <HomePage />;
}
```

---

### GenerateTestsPage

Página para gerar casos de teste.

**Localização**: `src/components/GenerateTestsPage.js`

**Features**:
- Formulário de entrada (descrição da tarefa)
- Seletor de modelo de IA
- Gerador de casos de teste
- Visualizador de resultados
- Histórico de gerações

**Exemplo**:
```jsx
import GenerateTestsPage from './components/GenerateTestsPage';

export default function App() {
  return <GenerateTestsPage />;
}
```

---

### CodeGenerationPage

Página para gerar código de teste.

**Localização**: `src/components/CodeGenerationPage.js`

**Features**:
- Formulário com casos de teste
- Seletor de linguagem (JS, Python, Java, C#)
- Seletor de framework (Jest, Mocha, Cypress, PyTest)
- Seletor de modelo de IA
- Visualizador de código com syntax highlighting

**Exemplo**:
```jsx
import CodeGenerationPage from './components/CodeGenerationPage';

export default function App() {
  return <CodeGenerationPage />;
}
```

---

### ImproveTaskPage

Página para melhorar histórias de usuário.

**Localização**: `src/components/ImproveTaskPage.js`

**Features**:
- Formulário de entrada da história
- Integração com JIRA
- Modo educacional
- Seletor de modelo de IA
- Visualizador de resultados
- Diálogo JIRA para sincronização

**Exemplo**:
```jsx
import ImproveTaskPage from './components/ImproveTaskPage';

export default function App() {
  return <ImproveTaskPage />;
}
```

---

### RiskAnalysisPage

Página para análise de riscos.

**Localização**: `src/components/RiskAnalysisPage.js`

**Features**:
- Formulário de descrição da feature
- Análise de riscos por severidade
- Recomendações de testes
- Requisitos de compliance

**Exemplo**:
```jsx
import RiskAnalysisPage from './components/RiskAnalysisPage';

export default function App() {
  return <RiskAnalysisPage />;
}
```

---

### FeedbackDashboard

Dashboard de análise de feedback com armazenamento configurável.

**Localização**: `src/components/FeedbackDashboard.js`

**Features**:
- Visualização de feedback
- Estatísticas de satisfação
- Análise por modelo de IA
- Gráficos de tendências
- **Armazenamento configurável**: local (privado) ou backend (compartilhado)
- Indicador visual do modo de armazenamento
- Toggle para alternar entre modos (no modo de escolha do usuário)

**Configuração de Armazenamento**:

A variável de ambiente `REACT_APP_FEEDBACK_STORAGE` define o modo:

| Modo | Descrição |
|------|-----------|
| `local` | Dados salvos no localStorage do navegador (privado) |
| `backend` | Dados salvos no banco de dados via API (compartilhado) |
| `user-choice` | Usuário pode alternar entre local e backend |

**Exemplo de configuração (.env)**:
```env
REACT_APP_FEEDBACK_STORAGE=user-choice
```

**Serviço de Armazenamento**:

O componente utiliza o `feedbackStorageService` para abstrair a lógica de armazenamento:

```javascript
import feedbackStorageService from '../services/feedbackStorageService';

// Verificar modo atual
const mode = feedbackStorageService.getStorageMode();

// Enviar feedback (roteado automaticamente)
await feedbackStorageService.submitFeedback(feedbackData);

// Buscar estatísticas
const stats = await feedbackStorageService.getFeedbackStats();
```

---

## 📝 Componentes de Formulário

### ModelSelector

Dropdown para selecionar modelo de IA.

**Localização**: `src/components/ModelSelector.js`

**Props**:
```javascript
<ModelSelector 
  value={string|object}    // Modelo selecionado (ex: "gpt-5-nano" ou objeto do selector)
  onChange={function}      // Callback onChange
  educationMode={boolean}  // Modo educacional (opcional)
/>
```

**Modelos Disponíveis**:
- `gpt-5-nano` - ChatGPT 5 Nano (default)
- `gpt-5` - ChatGPT 5
- `gemini-2.5-flash` - Google Gemini 2.5 Flash

**Exemplo**:
```jsx
import ModelSelector from './components/ModelSelector';
import { useState } from 'react';

function MyForm() {
  const [model, setModel] = useState('gpt-5-nano');
  
  return (
    <ModelSelector 
      value={model}
      onChange={(e) => setModel(e.target.value)}
    />
  );
}
```

---

### LanguageSelector

Dropdown para selecionar idioma.

**Localização**: `src/components/LanguageSelector.js`

**Props**:
```javascript
<LanguageSelector />
```

**Idiomas**:
- `pt-BR` - Português (Brasil)
- `en-US` - English (USA)

**Exemplo**:
```jsx
import LanguageSelector from './components/LanguageSelector';

function Header() {
  return <LanguageSelector />;
}
```

---

### EducationModeToggle

Toggle para ativar/desativar modo educacional.

**Localização**: `src/components/EducationModeToggle.js`

**Props**:
```javascript
<EducationModeToggle />
```

**Features**:
- Toggle switch
- Armazena em context global
- Ativa/desativa dicas educacionais em toda a app

**Exemplo**:
```jsx
import EducationModeToggle from './components/EducationModeToggle';

function Header() {
  return <EducationModeToggle />;
}
```

---

## 🎛 Componentes de Controle

### TokenDialog

Modal para configurar tokens de API.

**Localização**: `src/components/TokenDialog.js`

**Props**:
```javascript
<TokenDialog 
  open={boolean}      // Controla visibilidade
  onClose={function}  // Callback ao fechar
/>
```

**Features**:
- Formulário para OpenAI token
- Formulário para Gemini token
- Visualizador/ocultador de senha
- Validação de entrada
- Armazenamento em localStorage

**Exemplo**:
```jsx
import TokenDialog from './components/TokenDialog';
import { useState } from 'react';

function Header() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Configurar Tokens</button>
      <TokenDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

---

### FeedbackComponent

Componente para enviar feedback sobre uma geração. Utiliza armazenamento configurável.

**Localização**: `src/components/FeedbackComponent.js`

**Props**:
```javascript
<FeedbackComponent 
  featureType={string}  // Tipo de feature (ex: "improve-task")
  model={string}        // Modelo usado (ex: "gpt-5-nano")
  onSubmit={function}   // Callback ao enviar (opcional)
/>
```

**Features**:
- Seletor de tipo (positivo/negativo/neutro)
- Campo de comentário
- Rating de estrelas
- **Armazenamento configurável**: envia para localStorage ou backend conforme configuração
- Integração com `feedbackStorageService`

**Armazenamento**:

O feedback é salvo de acordo com a variável `REACT_APP_FEEDBACK_STORAGE`:
- `local`: Salva no localStorage (privado)
- `backend`: Envia para API (compartilhado)
- `user-choice`: Segue preferência do usuário

**Exemplo**:
```jsx
import FeedbackComponent from './components/FeedbackComponent';

function ResultsPage() {
  return (
    <FeedbackComponent 
      featureType="improve-task"
      model="gpt-5-nano"
      onSubmit={() => alert('Feedback enviado!')}
    />
  );
}
```

---

### HistoryDrawer

Drawer com histórico de gerações anteriores.

**Localização**: `src/components/HistoryDrawer.js`

**Props**:
```javascript
<HistoryDrawer 
  open={boolean}           // Controla visibilidade
  onClose={function}       // Callback ao fechar
  onSelectItem={function}  // Callback ao selecionar item
/>
```

**Features**:
- Lista de gerações anteriores
- Seleção de gerações
- Filtro por tipo de feature
- Exclusão de itens

**Exemplo**:
```jsx
import HistoryDrawer from './components/HistoryDrawer';
import { useState } from 'react';

function GenerateTestsPage() {
  const [historyOpen, setHistoryOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setHistoryOpen(true)}>Histórico</button>
      <HistoryDrawer 
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
}
```

---

## 🎣 Hooks Customizados

### usePrompt

Hook para gerenciar prompts de IA.

**Localização**: `src/hooks/usePrompt.js`

**Retorno**:
```javascript
const {
  prompt,           // Prompt atual
  setPrompt,        // Setter do prompt
  generatePrompt,   // Função para gerar via IA
  loading,          // Estado de loading
  error,            // Erro se houver
  educationMode     // Modo educacional
} = usePrompt('improve-task');
```

**Exemplo**:
```jsx
import { usePrompt } from './hooks/usePrompt';

function ImproveTask() {
  const { prompt, setPrompt, generatePrompt, loading } = usePrompt('improve-task');
  
  return (
    <div>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={generatePrompt} disabled={loading}>
        Gerar
      </button>
    </div>
  );
}
```

---

## 🌍 Stores (Zustand)

O projeto utiliza **Zustand** para gerenciamento de estado global, substituindo a Context API anterior.

### settingsStore

Store para configurações do aplicativo (tema, idioma, modo educacional).

**Localização**: `src/stores/settingsStore.js`

**Usage**:
```jsx
import { useSettingsStore } from '../stores/settingsStore';

function MyComponent() {
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useSettingsStore();
  
  return (
    <div>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <button onClick={() => setLanguage('en-US')}>English</button>
    </div>
  );
}
```

**Propriedades**:
| Propriedade | Tipo | Descrição |
|------------|------|-----------|
| isDarkMode | boolean | Se o tema escuro está ativo |
| toggleDarkMode | function | Alterna o tema |
| language | string | Idioma atual (pt-BR, en-US) |
| setLanguage | function | Define o idioma |
| educationMode | boolean | Se o modo educacional está ativo |
| toggleEducationMode | function | Alterna o modo educacional |

---

### tokensStore

Store para gerenciar tokens de API.

**Localização**: `src/stores/tokensStore.js`

**Usage**:
```jsx
import { useTokensStore } from '../stores/tokensStore';

function TokenManager() {
  const { tokens, setToken, hasToken } = useTokensStore();
  
  return (
    <div>
      <input 
        value={tokens.openai || ''} 
        onChange={(e) => setToken('openai', e.target.value)}
      />
      {hasToken('openai') && <span>✓ Token configurado</span>}
    </div>
  );
}
```

---

### uiStore

Store para estado da UI (modais, sidebars, notificações).

**Localização**: `src/stores/uiStore.js`

---

### generationStore

Store para histórico de gerações e cache.

**Localização**: `src/stores/generationStore.js`

---

### Hooks de Compatibilidade

Para facilitar a migração, existem hooks de compatibilidade que mantêm a mesma interface dos contextos antigos:

**Localização**: `src/stores/hooks.js`

```jsx
import { useDarkMode, useLanguage, useTokens } from '../stores/hooks';

function MyComponent() {
  // Mesma interface do contexto antigo
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { language, t } = useLanguage();
  const { tokens, setToken } = useTokens();
  
  return <div>{t('welcome')}</div>;
}

---

## 🎨 Estilos

### CSS Classes Globais

**Localização**: `src/styles/global.css`

**Classes Disponíveis**:
```css
.container          /* Container principal */
.btn-primary        /* Botão primário (azul) */
.btn-secondary      /* Botão secundário (verde) */
.btn-danger         /* Botão perigo (vermelho) */
.btn-outline        /* Botão outline */
.card               /* Card com sombra */
.card:hover         /* Card com efeito hover */
```

### CSS Variables (App.css)

```css
--primary-color: #3b82f6;           /* Azul primário */
--secondary-color: #2563eb;         /* Azul escuro */
--success-color: #22c55e;           /* Verde */
--danger-color: #ef4444;            /* Vermelho */
--text-main: #1f2937;               /* Texto principal */
--text-secondary: #6b7280;          /* Texto secundário */
--background-main: #ffffff;         /* Fundo principal */
--background-card: #f9fafb;         /* Fundo de card */
--border-color: #e5e7eb;            /* Cor de borda */
--border-radius: 8px;               /* Raio de borda */
--shadow-soft: 0 4px 12px rgba(...);/* Sombra suave */
```

---

## 📖 Estrutura de Arquivo Típico

```jsx
// Componente funcional com hooks
import { useState } from 'react';
import { useLanguage } from '../stores/hooks';
import { usePrompt } from '../hooks/usePrompt';
import ModelSelector from './ModelSelector';
import FeedbackComponent from './FeedbackComponent';

export default function MyFeaturePage() {
  // Hooks
  const { language, t } = useLanguage();
  const { prompt, setPrompt, generatePrompt, loading } = usePrompt('feature-name');
  
  // State
  const [model, setModel] = useState('gpt-5-nano');
  const [results, setResults] = useState(null);
  
  // Handlers
  const handleGenerate = async () => {
    const result = await generatePrompt(model);
    setResults(result);
  };
  
  // Render
  return (
    <div className="container">
      <h1>{t('feature.title')}</h1>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t('feature.placeholder')}
      />
      
      <ModelSelector value={model} onChange={(e) => setModel(e.target.value)} />
      
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? t('loading') : t('generate')}
      </button>
      
      {results && (
        <>
          <div>{results}</div>
          <FeedbackComponent featureType="feature-name" model={model} />
        </>
      )}
    </div>
  );
}
```

---

## 🚀 Boas Práticas

### Nomenclatura
- Componentes: `PascalCase` (ex: `MyComponent.js`)
- Arquivos de função: `camelCase` (ex: `myFunction.js`)
- Hooks: `camelCase` com prefixo `use` (ex: `useMyHook`)

### Organização
```
src/
├── components/         # Componentes reutilizáveis
├── stores/            # Zustand stores para estado global
├── hooks/             # Custom hooks
├── pages/             # Componentes de página
├── utils/             # Funções auxiliares
├── locales/           # Arquivos de tradução
└── styles/            # Estilos globais
```

### Props
- Sempre validar com PropTypes ou TypeScript
- Documentar com comentários
- Fornecer valores padrão

### Performance
- Use `React.memo()` para componentes puros
- `useMemo()` para cálculos pesados
- `useCallback()` para funções passadas como props
- Lazy load componentes com `React.lazy()`

---

## 📞 Referências

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Documentação de Projeto](../README.md)

---

**Última atualização**: Janeiro 2024
