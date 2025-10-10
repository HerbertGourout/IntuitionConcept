import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        // Dev-only proxy to avoid CORS calling Anthropic from the browser
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
          headers: {
            'x-api-key': env.VITE_ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01'
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_ANTHROPIC_API_KEY || '';
              if (key) {
                proxyReq.setHeader('x-api-key', key);
                proxyReq.setHeader('anthropic-version', '2023-06-01');
              }
            });
          }
        }
      }
    }
  };
});
