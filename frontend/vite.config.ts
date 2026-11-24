import { URL, fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const host = env.HOST;
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
      // true открывает фактический адрес Vite, даже если 5173 занят и порт
      // автоматически сдвинулся. Иначе можно попасть в чужой dev-сервер.
      open: process.env.CI ? false : true,
      proxy: {
        '/api': {
          rewrite: (path) => path.replace(/^\/api(?=\/|$)/, '') || '/',
          // target: `http://${api_host}:8000/`,
          target: `http://127.0.0.1:8000/`,
          changeOrigin: true,
          prependPath: false,
          secure: false,
        },
      },
    },
  };
});
