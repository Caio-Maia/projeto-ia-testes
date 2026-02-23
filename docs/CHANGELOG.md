# Changelog

Todas as mudanças relevantes do projeto.

## [2.14.0] - 2026-02-22

### Added
- `front/README.md` com visão específica do frontend.
- Documentação consolidada de setup e API atual.

### Changed
- Alinhamento de contratos de feedback:
  - `POST /api/feedback` agora documentado com `generationId`, `type` (`task|testcase|code|risk`) e `rating` (`positive|negative`).
  - `POST /api/feedback/regenerate` documentado com `feedbackId` e `model` objeto/string.
- Normalização dos tipos de geração no frontend (`task`, `test`, `code`, `risk`) para histórico local.
- Prompt de geração de código reforçado (streaming + caminhos legados).
- Prompt de análise de riscos reforçado (streaming + backend + modelos legados).
- Ícones dos títulos das páginas alinhados com os ícones da sidebar.
- Contraste do botão de fechar no `HistoryDrawer` em dark mode.

### Fixed
- Erros de validação no envio de feedback por incompatibilidade entre frontend e schema do backend.
- Erros de validação na regeneração de conteúdo (`/feedback/regenerate`).
- Itens salvos em `otherGenerations` não exibidos no histórico geral.

### Documentation
- Reescrita de:
  - `README.md`
  - `backend/README.md`
  - `docs/API.md`
  - `docs/SETUP.md`
  - `docs/CHANGELOG.md`

## [2.13.0] - 2025-12 (resumo)

- Evoluções em segurança, cobertura de testes, observabilidade e dashboard.

## [1.x] - Histórico inicial

- Lançamento inicial do hub de IA para QA.
- Inclusão de fluxos Improve Task, Generate Tests, Generate Code e Risk Analysis.
