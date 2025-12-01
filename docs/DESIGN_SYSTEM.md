# 🎨 Design System

Guia completo do sistema de design do Projeto IA Testes, incluindo cores, tipografia, espaçamento e componentes.

## 📋 Índice

1. [Paleta de Cores](#paleta-de-cores)
2. [Tipografia](#tipografia)
3. [Espaçamento](#espaçamento)
4. [Componentes UI](#componentes-ui)
5. [Sombras e Elevação](#sombras-e-elevação)
6. [Transições e Animações](#transições-e-animações)
7. [Estados de Componentes](#estados-de-componentes)
8. [Implementação](#implementação)

---

## 🎨 Paleta de Cores

### Cores Primárias

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Azul Primário** | `#3b82f6` | 59, 130, 246 | Botões, links, elementos interativos |
| **Azul Escuro** | `#2563eb` | 37, 99, 235 | Hover, gradiente, ênfase |
| **Azul Claro** | `#dbeafe` | 219, 234, 254 | Backgrounds, estados focus |

### Cores Secundárias

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Verde Sucesso** | `#22c55e` | 34, 197, 94 | Confirmação, sucesso, aprovação |
| **Verde Claro** | `#dcfce7` | 220, 252, 231 | Background verde, estados hover |
| **Vermelho Perigo** | `#ef4444` | 239, 68, 68 | Erros, exclusão, ações críticas |
| **Vermelho Claro** | `#fee2e2` | 254, 226, 226 | Background vermelho, alertas |

### Cores Neutras

| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Texto Principal** | `#1f2937` | 31, 41, 55 | Texto de corpo, headings |
| **Texto Secundário** | `#6b7280` | 107, 114, 128 | Textos auxiliares, hints |
| **Texto Placeholder** | `#9ca3af` | 156, 163, 175 | Placeholders, texto desabilitado |
| **Borda** | `#e5e7eb` | 229, 231, 235 | Borders, separadores |
| **Borda Claro** | `#f3f4f6` | 243, 244, 246 | Borders suaves, dividers |
| **Background Claro** | `#f9fafb` | 249, 250, 251 | Backgrounds de cards |
| **Background Branco** | `#ffffff` | 255, 255, 255 | Fundo principal, cards |

### Cores Semânticas

```css
--primary-color: #3b82f6;          /* Cor primária */
--primary-gradient: linear-gradient(135deg, #3b82f6, #2563eb);
--secondary-color: #2563eb;        /* Cor secundária */
--success-color: #22c55e;          /* Sucesso */
--danger-color: #ef4444;           /* Perigo */
--warning-color: #f59e0b;          /* Aviso */
--info-color: #06b6d4;             /* Informação */

--text-main: #1f2937;              /* Texto principal */
--text-secondary: #6b7280;         /* Texto secundário */
--text-placeholder: #9ca3af;       /* Placeholder */

--background-main: #ffffff;        /* Fundo principal */
--background-card: #f9fafb;        /* Fundo de card */
--background-hover: #f3f4f6;       /* Fundo hover */

--border-color: #e5e7eb;           /* Borda padrão */
--border-light: #f3f4f6;           /* Borda clara */
```

### Exemplos de Uso

```jsx
// Botão primário
<button style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}>
  Clique aqui
</button>

// Alert de sucesso
<div style={{ 
  backgroundColor: '#dcfce7',
  borderLeft: '4px solid #22c55e',
  color: '#166534'
}}>
  Ação realizada com sucesso!
</div>

// Alert de erro
<div style={{ 
  backgroundColor: '#fee2e2',
  borderLeft: '4px solid #ef4444',
  color: '#991b1b'
}}>
  Ocorreu um erro
</div>
```

---

## 📝 Tipografia

### Escala de Tamanhos

| Nome | Tamanho | Weight | Linha | Uso |
|------|---------|--------|-------|-----|
| **H1** | 32px | 700 | 1.2 | Títulos principais |
| **H2** | 28px | 700 | 1.3 | Títulos secundários |
| **H3** | 24px | 700 | 1.4 | Subtítulos |
| **H4** | 20px | 600 | 1.5 | Titles de seção |
| **Body** | 16px | 400 | 1.6 | Texto de corpo |
| **Small** | 14px | 400 | 1.5 | Textos pequenos |
| **Xs** | 12px | 400 | 1.4 | Textos muito pequenos |

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### Exemplos

```jsx
// Heading 1
<h1 style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.2 }}>
  Título Principal
</h1>

// Body
<p style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.6 }}>
  Este é um texto de corpo padrão.
</p>

// Small
<span style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280' }}>
  Texto auxiliar
</span>
```

---

## 📏 Espaçamento

### Sistema de Espaçamento (Base: 8px)

| Nome | Valor | Exemplo |
|------|-------|---------|
| **xs** | 4px | Espaços muito pequenos |
| **sm** | 8px | Espaços pequenos |
| **md** | 16px | Espaços médios |
| **lg** | 24px | Espaços grandes |
| **xl** | 32px | Espaços muito grandes |
| **2xl** | 48px | Espaços gigantes |

### Padding

```css
/* Componentes */
--padding-xs: 4px;
--padding-sm: 8px;
--padding-md: 16px;
--padding-lg: 24px;
--padding-xl: 32px;
```

### Margin

```css
/* Espaçamento entre elementos */
--margin-xs: 4px;
--margin-sm: 8px;
--margin-md: 16px;
--margin-lg: 24px;
--margin-xl: 32px;
```

### Exemplos

```jsx
// Card com padding
<div style={{ 
  padding: '24px',
  marginBottom: '24px',
  backgroundColor: '#f9fafb'
}}>
  Conteúdo do card
</div>

// Grid com gap
<div style={{ 
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px'
}}>
  {/* Items */}
</div>
```

---

## 🧩 Componentes UI

### Botões

#### Botão Primário
```jsx
<button style={{
  padding: '12px 24px',
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
}}>
  Botão Primário
</button>
```

#### Botão Secundário
```jsx
<button style={{
  padding: '12px 24px',
  backgroundColor: '#22c55e',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out'
}}>
  Botão Secundário
</button>
```

#### Botão Outline
```jsx
<button style={{
  padding: '12px 24px',
  backgroundColor: 'transparent',
  color: '#3b82f6',
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out'
}}>
  Botão Outline
</button>
```

#### Estados de Botão

```jsx
// Hover
style={{ 
  backgroundColor: '#2563eb',
  boxShadow: '0 10px 24px rgba(59, 130, 246, 0.3)'
}}

// Active
style={{ 
  backgroundColor: '#1d4ed8',
  transform: 'scale(0.98)'
}}

// Disabled
style={{ 
  backgroundColor: '#d1d5db',
  cursor: 'not-allowed',
  opacity: 0.6
}}
```

### Cards

```jsx
<div style={{
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '24px',
  boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)',
  transition: 'all 0.2s ease-in-out',
  border: '1px solid #e5e7eb'
}}>
  Conteúdo do card
</div>

// Com hover
<div style={{
  // ... estilos acima
  '&:hover': {
    boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)',
    transform: 'translateY(-2px)'
  }
}}>
```

### Inputs

```jsx
<input style={{
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  fontSize: '16px',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease-in-out'
}}
onFocus={(e) => {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
}}
onBlur={(e) => {
  e.target.style.borderColor = '#e5e7eb';
  e.target.style.boxShadow = 'none';
}} />
```

---

## 🌑 Sombras e Elevação

### Níveis de Sombra

```css
/* Sombra Suave (Elevation 1) */
box-shadow: 0 4px 12px rgba(50, 71, 101, 0.08);

/* Sombra Média (Elevation 2) */
box-shadow: 0 6px 16px rgba(50, 71, 101, 0.12);

/* Sombra Forte (Elevation 3) */
box-shadow: 0 8px 24px rgba(50, 71, 101, 0.16);

/* Sombra Hover (Cards) */
box-shadow: 0 10px 24px rgba(59, 130, 246, 0.15);

/* Sombra Focus */
box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
```

### Exemplos

```jsx
// Card normal
<div style={{ boxShadow: '0 4px 12px rgba(50, 71, 101, 0.08)' }}>
  Card normal
</div>

// Card elevated
<div style={{ boxShadow: '0 10px 24px rgba(59, 130, 246, 0.15)' }}>
  Card destaque
</div>
```

---

## ⏱ Transições e Animações

### Transições Padrão

```css
/* Transição Suave */
transition: all 0.2s ease-in-out;

/* Transição Color */
transition: color 0.2s ease-in-out;

/* Transição Transform */
transition: transform 0.2s ease-in-out;

/* Transição Box Shadow */
transition: box-shadow 0.2s ease-in-out;

/* Transição Múltiplas Propriedades */
transition: background-color 0.2s ease-in-out, 
            color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
```

### Animações Customizadas

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Uso */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.slide-in {
  animation: slideIn 0.3s ease-in-out;
}
```

---

## 🔘 Estados de Componentes

### Estados de Botão

```jsx
// Normal
backgroundColor: '#3b82f6'

// Hover
backgroundColor: '#2563eb'
boxShadow: '0 10px 24px rgba(59, 130, 246, 0.3)'

// Focus
outline: 'none'
boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'

// Active
backgroundColor: '#1d4ed8'
transform: 'scale(0.98)'

// Disabled
backgroundColor: '#d1d5db'
color: '#9ca3af'
cursor: 'not-allowed'
opacity: 0.6
```

### Estados de Input

```jsx
// Normal
borderColor: '#e5e7eb'
backgroundColor: '#ffffff'

// Focus
borderColor: '#3b82f6'
boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
backgroundColor: '#ffffff'

// Error
borderColor: '#ef4444'
boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'

// Success
borderColor: '#22c55e'
boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)'

// Disabled
backgroundColor: '#f3f4f6'
borderColor: '#e5e7eb'
color: '#9ca3af'
cursor: 'not-allowed'
```

---

## 🛠 Implementação

### Variáveis CSS em App.css

```css
:root {
  /* Cores */
  --primary-color: #3b82f6;
  --primary-gradient: linear-gradient(135deg, #3b82f6, #2563eb);
  --secondary-color: #2563eb;
  --success-color: #22c55e;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --info-color: #06b6d4;

  /* Textos */
  --text-main: #1f2937;
  --text-secondary: #6b7280;
  --text-placeholder: #9ca3af;

  /* Backgrounds */
  --background-main: #ffffff;
  --background-card: #f9fafb;
  --background-hover: #f3f4f6;

  /* Borders */
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Radius */
  --border-radius: 8px;

  /* Shadows */
  --shadow-soft: 0 4px 12px rgba(50, 71, 101, 0.08);
  --shadow-medium: 0 6px 16px rgba(50, 71, 101, 0.12);
  --shadow-hover: 0 10px 24px rgba(59, 130, 246, 0.15);

  /* Transitions */
  --transition-smooth: 0.2s ease-in-out;
}
```

### Estilos Globais

```css
/* Body */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: var(--background-main);
  color: var(--text-main);
  line-height: 1.6;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-main);
}

h1 { font-size: 32px; }
h2 { font-size: 28px; }
h3 { font-size: 24px; }

/* Buttons */
button {
  font-weight: 600;
  border-radius: var(--border-radius);
  transition: all var(--transition-smooth);
  cursor: pointer;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* Cards */
.card {
  background-color: var(--background-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border-color);
  transition: all var(--transition-smooth);
}

.card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}
```

### Componentes MUI com Design System

```jsx
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
      dark: '#2563eb',
      light: '#dbeafe'
    },
    secondary: {
      main: '#22c55e',
      light: '#dcfce7'
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2'
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280'
    },
    background: {
      default: '#ffffff',
      paper: '#f9fafb'
    }
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: { fontSize: 32, fontWeight: 700 },
    h2: { fontSize: 28, fontWeight: 700 },
    body1: { fontSize: 16, fontWeight: 400 }
  },
  shape: {
    borderRadius: 8
  }
});

// Usar
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

---

## 📐 Checklist de Implementação

- [ ] Cores aplicadas em botões
- [ ] Tipografia consistente em headings
- [ ] Espaçamento com múltiplos de 8px
- [ ] Sombras em cards e elementos elevated
- [ ] Transições suaves (0.2s ease-in-out)
- [ ] Estados hover/focus definidos
- [ ] Responsividade testada
- [ ] Modo escuro (se aplicável)
- [ ] Acessibilidade (contrast ratios)

---

## 🔗 Referências

- [Material Design Colors](https://material.io/design/color/)
- [Tailwind CSS Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/test-evaluate/)
- [Documentação Principal](../README.md)

---

**Última atualização**: Janeiro 2024
