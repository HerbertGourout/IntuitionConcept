import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { ClientRequest } from 'http';

// Minimal local typing to avoid importing 'http-proxy' types
type ProxyServer = {
  on(event: 'proxyReq', handler: (proxyReq: ClientRequest) => void): void;
  on(event: 'error', handler: (err: Error) => void): void;
  on(event: 'proxyRes', handler: (proxyRes: { statusCode?: number }) => void): void;
};
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('🔑 Anthropic API Key chargée:', env.VITE_ANTHROPIC_API_KEY ? 'Oui ✅' : 'Non ❌');

  return {
    plugins: [react()],
    build: {
      target: 'esnext', // Support pour top-level await (requis par pdfjs-dist)
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
      esbuildOptions: {
        target: 'esnext', // Support pour top-level await dans les dépendances
      },
      include: ['pdfjs-dist'], // Inclure pdfjs-dist pour optimisation
    },
    worker: {
      format: 'es', // Format ES modules pour les workers
    },
    server: {
      proxy: {
        '/ai': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false
        },
        // Dev-only proxy to avoid CORS calling Anthropic from the browser
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            console.log('🔄 Proxy Anthropic - Path original:', path);
            const newPath = path.replace(/^\/api\/anthropic/, '');
            console.log('🔄 Proxy Anthropic - Nouveau path:', newPath);
            return newPath;
          },
          headers: {
            // Ce header est requis par Anthropic lorsqu'une requête a une origine navigateur
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          configure: (proxy: ProxyServer) => {
            proxy.on('proxyReq', (proxyReq: ClientRequest) => {
              const key = env.VITE_ANTHROPIC_API_KEY || '';
              console.log('🔑 Proxy Anthropic - Ajout des headers, clé présente:', !!key);
              
              if (key) {
                proxyReq.setHeader('x-api-key', key);
                proxyReq.setHeader('anthropic-version', '2023-06-01');
                // Important: Anthropic exige ce header pour les requêtes venant d'un navigateur
                // Même si nous passons par le proxy, certaines vérifications côté API peuvent le demander
                proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true');
                // Supprimer l'en-tête Origin pour éviter la détection CORS côté Anthropic
                proxyReq.removeHeader('origin');
                console.log('✅ Headers Anthropic ajoutés');
              } else {
                console.error('❌ Clé API Anthropic manquante dans le proxy!');
              }
            });
            
            proxy.on('error', (err) => {
              console.error('❌ Erreur proxy Anthropic:', err);
            });
            
            proxy.on('proxyRes', (proxyRes) => {
              console.log('📥 Réponse Anthropic:', proxyRes.statusCode);
            });
          }
        },
        // Proxy pour Replicate API (génération 3D)
        '/api/replicate': {
          target: 'https://api.replicate.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            console.log('🔄 Proxy Replicate - Path original:', path);
            const newPath = path.replace(/^\/api\/replicate/, '');
            console.log('🔄 Proxy Replicate - Nouveau path:', newPath);
            return newPath;
          },
          configure: (proxy: ProxyServer) => {
            proxy.on('proxyReq', (proxyReq: ClientRequest) => {
              const key = env.VITE_REPLICATE_API_KEY || '';
              console.log('🔑 Proxy Replicate - Ajout des headers, clé présente:', !!key);
              
              if (key) {
                proxyReq.setHeader('Authorization', `Token ${key}`);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.removeHeader('origin');
                console.log('✅ Headers Replicate ajoutés');
              } else {
                console.error('❌ Clé API Replicate manquante dans le proxy!');
              }
            });
            
            proxy.on('error', (err) => {
              console.error('❌ Erreur proxy Replicate:', err);
            });
            
            proxy.on('proxyRes', (proxyRes) => {
              console.log('📥 Réponse Replicate:', proxyRes.statusCode);
            });
          }
        }
      }
    }
  };
});
