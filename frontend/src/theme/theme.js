import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1b4332', // Emerald Resort Green
      light: '#2d6a4f',
      dark: '#081c15',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4af37', // Gold Accent
      light: '#e6c86e',
      dark: '#997a15',
      contrastText: '#101010',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1c252e',
      secondary: '#637381',
    },
    success: {
      main: '#2e7d32',
      light: '#e8f5e9',
    },
  },
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h1: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
    },
    button: {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(27, 67, 50, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.25s ease-in-out',
          border: '1px solid rgba(145, 158, 171, 0.12)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 28px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
