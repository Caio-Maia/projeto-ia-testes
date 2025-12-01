# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Projeto IA Testes! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Contribuir](#como-contribuir)
3. [Processo de Desenvolvimento](#processo-de-desenvolvimento)
4. [Padrões de Código](#padrões-de-código)
5. [Commits e Pull Requests](#commits-e-pull-requests)
6. [Testes](#testes)
7. [Documentação](#documentação)
8. [Comunidade](#comunidade)

---

## 📜 Código de Conduta

### Nossos Compromissos

Este projeto e sua comunidade se comprometem em fornecer um ambiente acolhedor para todos, independentemente de:
- Idade
- Tamanho do corpo
- Deficiência
- Etnia
- Identidade de gênero
- Nível de experiência
- Nacionalidade
- Aparência pessoal
- Raça
- Religião
- Identidade e orientação sexual

### Nossos Padrões

Exemplos de comportamento que contribuem para criar um ambiente positivo:
- Usar linguagem acolhedora e inclusiva
- Ser respeitoso com pontos de vista e experiências divergentes
- Aceitar críticas construtivas com graça
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

### Aplicação

Instâncias de comportamento abusivo, de assédio ou inaceitável podem ser reportadas enviando um email para o mantenedor do projeto. Todas as reclamações serão revisadas e investigadas prontamente.

---

## 🚀 Como Contribuir

### Reportar Bugs

**Antes de criar um relatório de bug**, verifique se o problema já foi reportado. Se encontrar seu bug descrito já, adicione um comentário à issue existente ao invés de abrir uma nova.

**Quando você cria um relatório de bug, inclua o máximo de detalhe possível:**

1. **Título descritivo** para a issue
2. **Descrição exata** do comportamento observado
3. **Comportamento esperado** e o que você vê de diferente
4. **Screenshots** (se aplicável)
5. **Sistema operacional, navegador e versões**
6. **Passos para reproduzir** o problema

### Sugerir Melhorias

Sugestões de melhorias são sempre bem-vindas! Para sugerir uma melhoria:

1. Use um **título descritivo**
2. **Descreva o comportamento atual** e **o esperado**
3. **Liste alguns exemplos** de como a melhoria funcionaria
4. **Explique por que** essa melhoria seria útil

### Contribuir com Código

Contribuições de código são muito bem-vindas!

#### Passos Iniciais

1. **Fork o repositório**
   ```bash
   git clone https://github.com/seu-usuario/projeto-ia-testes.git
   cd projeto-ia-testes
   ```

2. **Crie uma branch para sua feature/fix**
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/bug-que-corrigi
   ```

3. **Instale dependências**
   ```bash
   cd backend && npm install
   cd ../front && npm install
   ```

4. **Faça suas mudanças**

5. **Teste suas mudanças**
   ```bash
   npm test
   ```

6. **Commit e push**
   ```bash
   git add .
   git commit -m "Descrição clara das mudanças"
   git push origin feature/minha-feature
   ```

7. **Abra um Pull Request**

---

## 🛠 Processo de Desenvolvimento

### Configurar Ambiente de Desenvolvimento

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Caio-Maia/projeto-ia-testes.git
   cd projeto-ia-testes
   ```

2. **Instale Node.js** (v14+)
   ```bash
   node --version
   ```

3. **Instale dependências do backend**
   ```bash
   cd backend
   npm install
   ```

4. **Instale dependências do frontend**
   ```bash
   cd ../front
   npm install
   ```

5. **Configure variáveis de ambiente**
   ```bash
   # Backend
   cd backend
   echo "OPENAI_API_KEY=sk-..." > .env
   echo "GEMINI_API_KEY=AIza..." >> .env
   echo "PORT=5000" >> .env
   
   # Frontend
   cd ../front
   echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env
   ```

6. **Inicie os servidores**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   cd front && npm start
   ```

### Estrutura de Branches

- `main` - Código em produção (protegida)
- `develop` - Desenvolvimento principal
- `feature/*` - Novas features
- `fix/*` - Bug fixes
- `docs/*` - Documentação
- `refactor/*` - Refatoração

**Nomeação de Branch**:
```
feature/nova-funcionalidade
fix/corrige-bug-login
docs/atualiza-readme
refactor/melhora-componente-card
```

---

## 📝 Padrões de Código

### JavaScript/Node.js

#### Estilo

```javascript
// ✅ Bom
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Evitar
function calc(i) {
  let s = 0;
  for (let x = 0; x < i.length; x++) {
    s += i[x].price;
  }
  return s;
}
```

#### Nomenclatura

- **Funções**: `camelCase`
  ```javascript
  function generateTestCases() { }
  const improveUserStory = () => { }
  ```

- **Classes**: `PascalCase`
  ```javascript
  class AIModel { }
  class TestGenerator { }
  ```

- **Constantes**: `UPPER_SNAKE_CASE`
  ```javascript
  const MAX_RETRIES = 3;
  const API_TIMEOUT = 5000;
  ```

- **Private**: Prefixo `_`
  ```javascript
  function _internalHelper() { }
  const _privateVar = 42;
  ```

#### Comentários

```javascript
// Comentários de linha para explicações rápidas

/**
 * Comentário de bloco para funções importantes
 * @param {string} input - Descrição do parâmetro
 * @returns {boolean} Descrição do retorno
 */
function importantFunction(input) {
  // Implementação
}
```

### React/JavaScript

#### Componentes

```javascript
// ✅ Functional Component
export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = React.useState(null);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// ✅ Com PropTypes
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};
```

#### Hooks

```javascript
// ✅ Use hooks corretamente
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Efeito colateral
  }, [count]);
  
  return <div>{count}</div>;
}

// ❌ Não use hooks condicionalmente
if (condition) {
  const [state, setState] = useState(0); // ❌ ERRADO
}
```

### Estilo CSS

```css
/* ✅ Bom */
.button-primary {
  background-color: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
  transition: background-color 0.2s ease-in-out;
}

.button-primary:hover {
  background-color: #2563eb;
}

/* ❌ Evitar */
.btn { background: blue; padding: 10px; }
.btn:hover { background: darkblue; }
```

### Padrões de Projeto

#### Separação de Responsabilidades

```javascript
// ✅ Controllers lidam com lógica de request/response
app.post('/api/improve-task', async (req, res) => {
  const { task, model } = req.body;
  const result = await improveTaskService.improve(task, model);
  res.json(result);
});

// ✅ Services lidam com lógica de negócio
class ImproveTaskService {
  async improve(task, model) {
    // Lógica
  }
}

// ✅ Models definem estrutura de dados
class Task {
  constructor(id, title, description) { }
}
```

---

## 📤 Commits e Pull Requests

### Mensagens de Commit

Use o padrão **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Tipos

- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Mudanças em documentação
- `style`: Mudanças de formato (sem lógica)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição ou mudança de testes
- `chore`: Mudanças em build, deps, etc

#### Exemplos

```bash
git commit -m "feat(test-generation): add ability to generate test code"
git commit -m "fix(jira): resolve issue with JIRA token validation"
git commit -m "docs(setup): update installation guide"
git commit -m "refactor(sidebar): improve button styling"
git commit -m "test(feedback): add unit tests for feedback component"
```

### Pull Request

Quando você abrir um PR:

1. **Título descritivo**
   ```
   feat: Add support for Jest test framework
   ```

2. **Descrição detalhada**
   ```markdown
   ## Descrição
   Adiciona suporte para Jest como framework de teste.
   
   ## Type de mudança
   - [x] Nova feature
   - [ ] Bug fix
   - [ ] Breaking change
   - [ ] Atualização de docs
   
   ## Como testar?
   1. Configure tokens de IA
   2. Acesse "Gerar Código"
   3. Selecione "Jest" como framework
   4. Clique em "Gerar"
   
   ## Checklist
   - [x] Código segue padrões do projeto
   - [x] Testes adicionados/atualizados
   - [x] Documentação atualizada
   - [x] Sem warnings do linter
   ```

3. **Reference issues**
   ```markdown
   Fixes #123
   Closes #456
   ```

---

## 🧪 Testes

### Executar Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd front
npm test

# Com coverage
npm test -- --coverage
```

### Escrever Testes

#### Testes Unitários (Backend)

```javascript
const { improveTask } = require('./taskController');
const { mockAI } = require('./mocks');

describe('Task Controller', () => {
  it('should improve a user story', async () => {
    const input = 'Como usuário, quero...';
    const model = 'gpt-3.5-turbo';
    
    const result = await improveTask(input, model, mockAI);
    
    expect(result).toBeDefined();
    expect(result.improved).toBeTruthy();
    expect(result.acceptanceCriteria).toBeInstanceOf(Array);
  });
  
  it('should throw error with invalid input', async () => {
    expect(() => improveTask('', 'gpt-3.5-turbo')).rejects.toThrow();
  });
});
```

#### Testes de Componentes (Frontend)

```javascript
import { render, screen } from '@testing-library/react';
import GenerateTestsPage from './GenerateTestsPage';

describe('GenerateTestsPage', () => {
  it('should render heading', () => {
    render(<GenerateTestsPage />);
    expect(screen.getByText('Gerar Casos de Teste')).toBeInTheDocument();
  });
  
  it('should submit form', async () => {
    const { user } = render(<GenerateTestsPage />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'User story');
    
    const button = screen.getByRole('button', { name: /gerar/i });
    await user.click(button);
    
    // Assertions
  });
});
```

### Cobertura de Testes

Mire por mínimo **80% de cobertura**:

```bash
npm test -- --coverage

# Resultado esperado:
# Statements   : 80% ( 400/500 )
# Branches     : 75% ( 150/200 )
# Functions    : 85% ( 170/200 )
# Lines        : 80% ( 400/500 )
```

---

## 📚 Documentação

### Atualizar README

Se sua mudança afeta funcionalidade geral:

1. Atualize [README.md](../README.md)
2. Atualize arquivos relevantes em `/docs`
3. Inclua exemplos de uso

### Comentários em Código

```javascript
/**
 * Melhora uma história de usuário usando IA
 * 
 * @param {string} task - Descrição da história de usuário
 * @param {string} model - Modelo de IA a usar (gpt-3.5-turbo, gpt-4, gemini-pro)
 * @param {Object} options - Opções adicionais
 * @param {boolean} options.educationMode - Ativa modo educacional
 * 
 * @returns {Promise<Object>} Histórico melhorada com critérios de aceitação
 * @throws {Error} Se task vazia ou modelo inválido
 * 
 * @example
 * const result = await improveTask('Como usuário...', 'gpt-3.5-turbo', {
 *   educationMode: true
 * });
 */
async function improveTask(task, model, options = {}) {
  // Implementação
}
```

### Documentação de Endpoints

Se adicionar um novo endpoint, documente em [API.md](./API.md):

```markdown
### POST `/api/novo-endpoint`

**Descrição**: O que faz

**Body**:
\`\`\`json
{ "param": "valor" }
\`\`\`

**Response**:
\`\`\`json
{ "result": "valor" }
\`\`\`

**Erros**: O que pode dar errado
```

---

## 👥 Comunidade

### Pedindo Ajuda

- **GitHub Issues**: Para bugs e features
- **Discussões**: Para dúvidas e ideias
- **Email**: caio@example.com

### Reconhecimento

Todos os contribuidores serão:
- Adicionados ao [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- Mencionados no [README.md](../README.md)
- Reconhecidos em releases notes

---

## 📋 Checklist Antes de Submeter

- [ ] Código segue padrões de estilo
- [ ] Nenhum console.log() ou comentários de debug
- [ ] Testes passando (`npm test`)
- [ ] Nenhum warning de linter
- [ ] Documentação atualizada
- [ ] Commits com mensagens descritivas
- [ ] Branch baseado em `develop` (ou `main`)
- [ ] Sem conflitos de merge

---

## 🚀 Processo de Review

1. **Automático**: Linter e testes passam
2. **Code Review**: Pelo menos 1 maintainer
3. **Testes Manuais**: Teste em ambiente real
4. **Merge**: Squash merge para `develop`
5. **Release**: Deploy em produção

---

## 📞 Dúvidas?

- Abra uma **Discussion** no GitHub
- Envie um **email** para o mantenedor
- Verifique [FAQ.md](./FAQ.md)

---

## 🎉 Obrigado!

Suas contribuições fazem este projeto melhor para todos. Obrigado por participar!

---

**Última atualização**: Janeiro 2024
