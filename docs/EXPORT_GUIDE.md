# 📥 Guia de Exportação de Resultados

## Visão Geral

O sistema agora suporta exportação de gerações em **5 formatos diferentes**, permitindo que você compartilhe e documente seus resultados de forma flexível.

## Formatos Suportados

### 1. **PDF** (📄)
- **Ideal para:** Documentos formais, relatórios, compartilhamento
- **Características:**
  - Formatação preservada
  - Múltiplas páginas automáticas
  - Sem dependência de software adicional
- **Uso:** Botão "Exportar como PDF"

### 2. **Word (.docx)** (📝)
- **Ideal para:** Edição adicional, documentos corporativos
- **Características:**
  - Compatível com Microsoft Word
  - Pode ser editado após exportação
  - Formatação estruturada
- **Uso:** Botão "Exportar como Word (.docx)"

### 3. **Markdown** (📋)
- **Ideal para:** Versionamento, GitHub, wikis
- **Características:**
  - Formato texto puro
  - Compatível com Git
  - Ideal para documentação técnica
- **Uso:** Botão "Exportar como Markdown"

### 4. **JSON** ({ })
- **Ideal para:** Integração com APIs, processamento programático
- **Características:**
  - Inclui metadados completos
  - Estruturado e validável
  - Fácil de parsear
- **Uso:** Botão "Exportar como JSON"

### 5. **CSV** (📊)
- **Ideal para:** Análise em Excel, banco de dados
- **Características:**
  - Formato tabular
  - Importável em planilhas
  - Ideal para dados estruturados
- **Uso:** Botão "Exportar como CSV"

## Como Usar

### No Histórico de Gerações

1. Abra o drawer de **Histórico** (ícone de relógio na sidebar)
2. Clique em uma geração para visualizar
3. No diálogo de visualização, clique no botão **📥 Download** (azul)
4. Selecione o formato desejado
5. O arquivo será automaticamente baixado

### Via Componente ExportButton

Para adicionar exportação em outros componentes:

```jsx
import ExportButton from './components/ExportButton';

<ExportButton
  data={{
    description: 'Minha Geração',
    type: 'Casos de Teste',
    model: 'GPT-4',
    generation: 'Conteúdo...'
  }}
  onExportSuccess={(msg) => console.log(msg)}
  onExportError={(msg) => console.error(msg)}
/>
```

## Estrutura de Arquivos

### `/src/utils/exportUtils.js`
Funções principais:
- `exportToPDF()` - Exporta para PDF
- `exportToWord()` - Exporta para Word
- `exportToMarkdown()` - Exporta para Markdown
- `exportToJSON()` - Exporta para JSON
- `exportToCSV()` - Exporta para CSV
- `exportGeneration()` - Função unificada
- `generateFilename()` - Gera nome com timestamp

### `/src/components/ExportButton.js`
Componente reutilizável para botões de exportação

### `/src/components/HistoryDrawer.js`
Integração de exportação no diálogo de histórico

## Características Técnicas

### Dependências Instaladas
- **jspdf** ^3.x - Geração de PDFs
- **docx** ^8.x - Geração de Word
- **papaparse** ^5.x - Parsing CSV

### Nomes de Arquivo
Todos os arquivos exportados incluem timestamp automático:
```
minha-geracao-2025-12-01-14-30-45.pdf
```

### Metadados JSON
Quando exportado como JSON, inclui:
```json
{
  "title": "Descrição",
  "type": "Tipo de Geração",
  "model": "Modelo de IA usado",
  "exportedAt": "ISO timestamp",
  "content": "Conteúdo completo..."
}
```

## Exemplos de Uso

### Exportar Teste para PDF
```jsx
const result = exportGeneration({
  description: 'Teste de Login',
  type: 'Test Cases',
  model: 'GPT-4',
  generation: 'Casos de teste para validação de login...'
}, 'pdf');
```

### Exportar Código para Markdown
```jsx
const result = exportGeneration({
  description: 'Função Calculator',
  type: 'Code',
  model: 'Claude',
  generation: 'function sum(a, b) { return a + b; }'
}, 'md');
```

## Dicas e Boas Práticas

✅ **PDFs** - Use para documentação formal e relatórios
✅ **Word** - Use quando necessário editar depois
✅ **Markdown** - Use para repositórios Git e documentação técnica
✅ **JSON** - Use para integração com outros sistemas
✅ **CSV** - Use para análise de dados em Excel

## Suporte a Navegadores

Compatível com:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🆕 Exportação de Análise de Cobertura (v1.2.0)

### Test Coverage Analysis Results

Os resultados de análise de cobertura também podem ser exportados:

```jsx
<ExportButton
  data={{
    description: 'Análise de Cobertura de Testes - Projeto X',
    type: 'Coverage Analysis',
    model: 'GPT-4',
    generation: JSON.stringify({
      overallCoverage: 72.5,
      gapAnalysis: [...],
      improvementTips: [...],
      targetCoverage: {...}
    }, null, 2)
  }}
/>
```

### Formatos Recomendados para Coverage

| Formato | Uso |
|---------|-----|
| **PDF** | Relatório executivo para stakeholders |
| **Word** | Documentação de projeto com notas |
| **JSON** | Processamento automático de métricas |
| **CSV** | Análise histórica em Excel |
| **Markdown** | Wiki do projeto/repositório |

---

**Última atualização**: Dezembro 2024 (v1.2.0)

## Resolução de Problemas

### Pop-up bloqueado
Se o download não funcionar:
- Verifique bloqueadores de pop-up
- Permita downloads do domínio

### Arquivo corrompido
Se o arquivo não abrir:
- Tente um formato diferente
- Verifique se há caracteres especiais no nome
- Limpe o cache do navegador

### Arquivo muito grande
Para arquivos grandes (100+ MB):
- Considere exportar em JSON para processamento programático
- Divida o conteúdo em múltiplos arquivos
