import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with aggressive auto-update and automatic reload on new deployment
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version detected from URL! Updating immediately...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] App is cached and ready for offline play.');
  },
  onRegistered(registration) {
    if (registration) {
      // Periodically check for new updates (every 20s)
      setInterval(() => {
        registration.update().catch(() => {});
      }, 20000);

      // Check for updates when tab or PWA becomes active again
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
      window.addEventListener('focus', () => {
        registration.update().catch(() => {});
      });
    }
  },
  onRegisterError(error) {
    console.warn('[PWA] Service worker registration error:', error);
  },
});

// Smoothly refresh clients as soon as the updated service worker takes control
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
