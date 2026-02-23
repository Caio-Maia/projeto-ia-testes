# Frontend (AITest Hub)

Aplicação React responsável pela experiência do usuário dos fluxos de QA com IA.

## Stack

- React 19
- Material UI
- React Router
- React Query
- React Markdown
- Zustand

## Execução

```bash
npm install
npm start
```

App padrão: `http://localhost:3000`

## Variáveis de Ambiente

```env
REACT_APP_BACKEND_URL=http://localhost:5000
# local | backend | user-choice
REACT_APP_FEEDBACK_STORAGE=user-choice
```

## Estrutura resumida

```text
front/src/
├── components/      # páginas e componentes UI
├── hooks/           # hooks de integração e fluxo
├── services/        # chamadas backend e persistência local
├── locales/         # traduções
├── stores/          # estado global
├── utils/           # helpers
└── theme/           # tema/estilos
```

## Fluxos principais

- Improve Task
- Generate Test Cases
- Generate Code
- Risk Analysis
- Test Coverage Analysis
- Feedback Dashboard
- Documentation / Prompt editing

## Pontos técnicos

- Streaming via SSE para geração incremental (`useAIStream`).
- Histórico local por tipo de geração (`task`, `test`, `code`, `risk`).
- Feedback com modo configurável: localStorage, backend ou escolha do usuário.
- Internacionalização `pt-BR` e `en-US`.
