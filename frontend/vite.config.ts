import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const host = env.HOST || 'localhost';
  const api_host = env.API_PROXY_TARGET;
  const port = 5173;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host,
      port,
      open: process.env.CI ? false : `http://${host}:${port}/`,
      proxy: {
        '/api': {
          rewrite: (path) => path.replace(/^\/api(?=\/|$)/, '') || '/',
          target: `http://${api_host}:8000/`,
          changeOrigin: true,
          prependPath: false,
          secure: false,
        },
      },
    },
  };
});
