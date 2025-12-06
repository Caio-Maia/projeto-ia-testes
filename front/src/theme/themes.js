import { createTheme } from '@mui/material/styles';

// Cores comuns
const primaryColor = '#3b82f6';
const secondaryColor = '#22c55e';
const warningColor = '#f59e0b';
const errorColor = '#ef4444';
const successColor = '#10b981';

// Tema Light
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryColor,
      light: '#60a5fa',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryColor,
      light: '#4ade80',
      dark: '#16a34a',
      contrastText: '#ffffff',
    },
    warning: {
      main: warningColor,
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: errorColor,
      light: '#f87171',
      dark: '#dc2626',
    },
    success: {
      main: successColor,
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      disabled: '#d1d5db',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1f2937',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1f2937',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1f2937',
    },
    body1: {
      fontSize: '1rem',
      color: '#374151',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1f2937',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
        },
      },
    },
  },
});

// Tema Dark
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4ade80',
      light: '#86efac',
      dark: '#16a34a',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#d97706',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#dc2626',
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#059669',
    },
    background: {
      default: '#0f1419',
      paper: '#1a202c',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#d1d5db',
      disabled: '#6b7280',
    },
    divider: '#374151',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#f3f4f6',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#f3f4f6',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#f3f4f6',
    },
    body1: {
      fontSize: '1rem',
      color: '#e5e7eb',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#d1d5db',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a202c',
          color: '#f3f4f6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a202c',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          border: '1px solid #374151',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a202c',
          borderRadius: '12px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a202c',
          borderRight: '1px solid #374151',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#374151',
            },
            '&:hover fieldset': {
              borderColor: '#4b5563',
            },
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a202c',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a202c',
        },
      },
    },
  },
});
