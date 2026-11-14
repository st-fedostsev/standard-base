// src/App/theme.ts
import { createTheme } from '@mui/material/styles';

const ACCENT = 'rgba(25, 118, 210, 1)'; // акцент из презентации
const ACCENT_HOVER = 'rgba(25, 118, 210, 1)'; // подобран мной: в образце наведения нет

export const theme = createTheme({
  palette: {
    primary: { main: ACCENT, dark: ACCENT_HOVER, contrastText: '#FFFFFF' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
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
  },
});
