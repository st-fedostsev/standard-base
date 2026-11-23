// src/App/theme.ts
import { createTheme } from '@mui/material/styles';

const ACCENT = 'rgba(25, 118, 210, 1)'; // акцент из презентации
const ACCENT_HOVER = '#1976D214)';

export const theme = createTheme({
  palette: {
    primary: { main: ACCENT, dark: ACCENT_HOVER, contrastText: '#FFFFFF' },
    background: {
      default: '#F3F7FA', // общий цвет фона страницы
      paper: '#FFFFFF', // цвет фона карточек и поверхностей
    },
    action: {
      hover: 'rgba(25, 118, 210, 0.08)',
      selected: '#1976D226',
    },
  },
  typography: {
    fontFamily: 'Raleway, sans-serif',
    button: {
      textTransform: 'none',
      fontSize: 16,
      lineHeight: '22px',
      fontWeight: 400,
      letterSpacing: 'normal',
    },
  },
  shape: { borderRadius: 8 },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 990, lg: 1200, xl: 1440 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 16px 8px 10px',
          boxShadow: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#1976D226',
          color: '#111111',
          fontFamily: 'Raleway, Arial, sans-serif',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: '20px',
        },
        body: {
          color: '#242424',
          fontFamily: 'Raleway, Arial, sans-serif',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '20px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: '#1976D226',
          },
        },
      },
    },
  },
});
