import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './AppRouter.tsx'
import './index.css'

// Enregistrement du Service Worker pour PWA (PRODUCTION SEULEMENT)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // En développement: désactiver complètement les service workers
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((registration) => {
      registration.unregister().then(() => {
        console.log('Dev mode: Service worker unregistered');
      });
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
