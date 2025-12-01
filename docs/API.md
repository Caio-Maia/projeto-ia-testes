# 📡 API Documentation

Referência completa de todos os endpoints disponíveis no backend do Projeto IA Testes.

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Melhorar Tarefa](#melhorar-tarefa)
3. [Gerar Casos de Teste](#gerar-casos-de-teste)
4. [Gerar Código de Teste](#gerar-código-de-teste)
5. [Análise de Riscos](#análise-de-riscos)
6. [Integração JIRA](#integração-jira)
7. [Feedback](#feedback)
8. [Códigos de Erro](#códigos-de-erro)

## 🔐 Autenticação

Todos os endpoints aceitam tokens de API via headers ou body.

### Header (Recomendado)
```
Authorization: Bearer sk-... (OpenAI) ou AIza... (Gemini)
```

### Body
```json
{
  "openaiToken": "sk-...",
  "geminiToken": "AIza..."
}
```

---

## ✏️ Melhorar Tarefa

Refine histórias de usuário usando IA.

### POST `/api/improve-task`

**Descrição**: Melhora uma história de usuário com sugestões de IA

**Headers**:
```http
Content-Type: application/json
```

**Body**:
```json
{
  "task": "Como usuário, quero resetar minha senha para recuperar acesso",
  "model": "gpt-3.5-turbo",
  "educationMode": true,
  "openaiToken": "sk-..."
}
```

**Parâmetros**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|------------|-----------|
| task | string | Sim | História de usuário a melhorar |
| model | string | Sim | Modelo de IA: `gpt-3.5-turbo`, `gpt-4`, `gemini-pro` |
| educationMode | boolean | Não | Adiciona explicações educacionais (default: false) |
| openaiToken | string | Condicional | Token OpenAI (se não em header) |
| geminiToken | string | Condicional | Token Gemini (se não em header) |

**Response (200 OK)**:
```json
{
  "improved": "Como usuário, quero redefinir minha senha...",
  "acceptanceCriteria": [
    "Deve solicitar email do usuário",
    "Deve enviar link de reset",
    "Link deve expirar em 1 hora",
    "Password deve ter requisitos mínimos"
  ],
  "tips": [
    "Considere testar diferentes navegadores",
    "Teste com emails válidos e inválidos"
  ],
  "model": "gpt-3.5-turbo",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Exemplo com cURL**:
```bash
curl -X POST http://localhost:5000/api/improve-task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Como usuário, quero resetar minha senha",
    "model": "gpt-3.5-turbo",
    "educationMode": true,
    "openaiToken": "sk-..."
  }'
```

---

## 🧪 Gerar Casos de Teste

Cria estrutura de casos de teste a partir de histórias.

### POST `/api/generate-tests`

**Descrição**: Gera casos de teste estruturados

**Body**:
```json
{
  "task": "Como usuário, quero fazer login com email e senha",
  "model": "gpt-3.5-turbo",
  "educationMode": false,
  "openaiToken": "sk-..."
}
```

**Parâmetros**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|------------|-----------|
| task | string | Sim | Descrição ou história de usuário |
| model | string | Sim | Modelo de IA a usar |
| educationMode | boolean | Não | Modo educacional (default: false) |
| openaiToken | string | Condicional | Token OpenAI |
| geminiToken | string | Condicional | Token Gemini |

**Response (200 OK)**:
```json
{
  "testCases": [
    {
      "id": "TC001",
      "title": "Login com credenciais válidas",
      "preconditions": [
        "Usuário acessa a página de login",
        "Usuário possui conta ativa"
      ],
      "steps": [
        "Inserir email válido",
        "Inserir senha correta",
        "Clicar em 'Entrar'"
      ],
      "expectedResult": "Usuário redirecionado para dashboard",
      "type": "Positive",
      "priority": "High"
    },
    {
      "id": "TC002",
      "title": "Login com senha inválida",
      "preconditions": ["Usuário acessa página de login"],
      "steps": [
        "Inserir email válido",
        "Inserir senha incorreta",
        "Clicar em 'Entrar'"
      ],
      "expectedResult": "Mensagem de erro: 'Credenciais inválidas'",
      "type": "Negative",
      "priority": "High"
    }
  ],
  "educationalNotes": {
    "boundaryValues": ["Empty strings", "Special characters", "Very long strings"],
    "equivalencePartitions": ["Valid credentials", "Invalid credentials", "Missing fields"]
  },
  "model": "gpt-3.5-turbo",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

**Exemplo com cURL**:
```bash
curl -X POST http://localhost:5000/api/generate-tests \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Login com email e senha",
    "model": "gpt-3.5-turbo",
    "openaiToken": "sk-..."
  }'
```

---

## 💻 Gerar Código de Teste

Gera código de teste automático em linguagens específicas.

### POST `/api/generate-test-code`

**Descrição**: Gera código de teste executável

**Body**:
```json
{
  "testCases": "TC001: Login com credenciais válidas\nSteps: 1. Insert email\n2. Insert password\n3. Click login\nExpected: Redirect to dashboard",
  "framework": "Jest",
  "language": "JavaScript",
  "model": "gpt-3.5-turbo",
  "openaiToken": "sk-..."
}
```

**Parâmetros**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|------------|-----------|
| testCases | string | Sim | Descrição dos casos de teste |
| framework | string | Sim | Framework: `Jest`, `Mocha`, `Cypress`, `PyTest`, `unittest` |
| language | string | Sim | Linguagem: `JavaScript`, `TypeScript`, `Python`, `Java`, `C#` |
| model | string | Sim | Modelo de IA |
| openaiToken | string | Condicional | Token OpenAI |
| geminiToken | string | Condicional | Token Gemini |

**Response (200 OK)**:
```json
{
  "code": "describe('Login Feature', () => {\n  it('should login with valid credentials', async () => {\n    const page = await browser.newPage();\n    await page.goto('http://localhost:3000/login');\n    await page.type('[data-testid=\"email\"]', 'user@example.com');\n    await page.type('[data-testid=\"password\"]', 'password123');\n    await page.click('[data-testid=\"login-btn\"]');\n    await page.waitForNavigation();\n    expect(page.url()).toContain('dashboard');\n  });\n});",
  "framework": "Jest",
  "language": "JavaScript",
  "model": "gpt-3.5-turbo",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

**Frameworks Suportados**:
- **JavaScript**: Jest, Mocha, Cypress
- **Python**: PyTest, unittest
- **Java**: JUnit, TestNG
- **C#**: NUnit, xUnit
- **TypeScript**: Jest, Mocha

---

## 🔍 Análise de Riscos

Identifica riscos potenciais em features e recomenda testes.

### POST `/api/analyze-risks`

**Descrição**: Analisa riscos de uma feature

**Body**:
```json
{
  "feature": "Sistema de pagamento com cartão de crédito",
  "model": "gpt-3.5-turbo",
  "openaiToken": "sk-..."
}
```

**Parâmetros**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|------------|-----------|
| feature | string | Sim | Descrição da feature/tarefa |
| model | string | Sim | Modelo de IA |
| openaiToken | string | Condicional | Token OpenAI |
| geminiToken | string | Condicional | Token Gemini |

**Response (200 OK)**:
```json
{
  "risks": [
    {
      "risk": "Fraud detection bypass",
      "severity": "Critical",
      "impact": "Unauthorized transactions",
      "mitigation": [
        "Implement 3D Secure",
        "Rate limiting",
        "AI fraud detection"
      ]
    },
    {
      "risk": "Data breach (card data)",
      "severity": "Critical",
      "impact": "PCI DSS non-compliance, customer trust loss",
      "mitigation": [
        "Use tokenization",
        "PCI DSS compliance",
        "Encryption at rest and in transit"
      ]
    }
  ],
  "recommendedTests": [
    "Security: SQL injection prevention",
    "Security: XSS prevention",
    "Performance: Transaction throughput",
    "Data: Payment confirmation accuracy"
  ],
  "complianceRequirements": ["PCI DSS 3.2.1", "GDPR", "Local payment laws"],
  "model": "gpt-3.5-turbo",
  "timestamp": "2024-01-15T10:45:00Z"
}
```

---

## 🔗 Integração JIRA

Sincronize tarefas com JIRA.

### POST `/api/jira-task`

**Descrição**: Carrega tarefa do JIRA

**Body**:
```json
{
  "issueKey": "PROJECT-123",
  "jiraBaseUrl": "https://empresa.atlassian.net",
  "jiraEmail": "user@empresa.com",
  "jiraToken": "token..."
}
```

**Response (200 OK)**:
```json
{
  "key": "PROJECT-123",
  "summary": "Add password reset feature",
  "description": "Como usuário, quero resetar minha senha",
  "status": "To Do",
  "assignee": "john@empresa.com",
  "priority": "High"
}
```

### POST `/api/jira-task/update`

**Descrição**: Atualiza tarefa no JIRA

**Body**:
```json
{
  "issueKey": "PROJECT-123",
  "description": "Nova descrição melhorada",
  "acceptanceCriteria": ["Critério 1", "Critério 2"],
  "jiraBaseUrl": "https://empresa.atlassian.net",
  "jiraEmail": "user@empresa.com",
  "jiraToken": "token..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "issueKey": "PROJECT-123"
}
```

---

## 📊 Feedback

Coleta feedback sobre gerações de IA.

### GET `/api/feedback`

**Descrição**: Lista todos os feedbacks

**Query Params**:
| Param | Tipo | Descrição |
|-------|------|-----------|
| limit | number | Máximo de resultados (default: 20) |
| offset | number | Deslocamento (for pagination) |
| type | string | Filtro: `positive`, `negative`, `neutral` |

**Response (200 OK)**:
```json
{
  "feedbacks": [
    {
      "id": "f001",
      "type": "positive",
      "rating": 5,
      "content": "Excelentes sugestões de teste",
      "model": "gpt-3.5-turbo",
      "timestamp": "2024-01-15T10:50:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

### POST `/api/feedback`

**Descrição**: Registra novo feedback

**Body**:
```json
{
  "type": "positive",
  "rating": 5,
  "content": "Muito bom!",
  "model": "gpt-3.5-turbo",
  "feature": "improve-task"
}
```

**Response (201 Created)**:
```json
{
  "id": "f002",
  "type": "positive",
  "rating": 5,
  "content": "Muito bom!",
  "model": "gpt-3.5-turbo",
  "feature": "improve-task",
  "timestamp": "2024-01-15T10:55:00Z"
}
```

---

## ⚠️ Códigos de Erro

### Erros Comuns

| Código | Mensagem | Solução |
|--------|----------|---------|
| 400 | Bad Request | Verifique parâmetros obrigatórios |
| 401 | Unauthorized | Token de API inválido ou ausente |
| 403 | Forbidden | Permissão insuficiente para recurso |
| 404 | Not Found | Endpoint ou recurso não existe |
| 429 | Too Many Requests | Rate limit excedido (espere antes de tentar novamente) |
| 500 | Internal Server Error | Erro do servidor (contacte suporte) |

### Exemplo de Erro

**Request**:
```bash
curl -X POST http://localhost:5000/api/improve-task \
  -H "Content-Type: application/json" \
  -d '{"task": "test"}'
```

**Response (400 Bad Request)**:
```json
{
  "error": "Missing required field: model",
  "code": 400,
  "timestamp": "2024-01-15T11:00:00Z"
}
```

---

## 🧪 Testar Endpoints

### Com Postman

1. Importe a collection:
   - Arquivo: `/backend/postman-collection.json`
   - Em Postman: `File > Import`

2. Configure environment:
   - `{{base_url}}`: `http://localhost:5000`
   - `{{openai_token}}`: Sua chave OpenAI
   - `{{gemini_token}}`: Sua chave Gemini

### Com cURL (Windows PowerShell)

```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    task = "Como usuário, quero resetar minha senha"
    model = "gpt-3.5-turbo"
    openaiToken = "sk-..."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/improve-task" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

## 📖 Mais Informações

- [README.md](../README.md) - Visão geral do projeto
- [SETUP.md](./SETUP.md) - Guia de instalação
- [COMPONENTS.md](./COMPONENTS.md) - Componentes React
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Paleta de cores

---

**Última atualização**: Janeiro 2024
