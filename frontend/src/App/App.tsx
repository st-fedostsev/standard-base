import { RouterProvider } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { ToastProvider } from '@/components/Toast';

import { AuthProvider } from './AuthProvider';
import { router } from './Routes';
import { theme } from './theme';
import { IGlobalLoader } from '@/components/Loader/IGlobalLoader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // повторить запрос один раз при ошибке
      staleTime: 30_000, // данные считаются свежими 30 секунд
    },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <IGlobalLoader />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
