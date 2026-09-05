import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API calls in dev so the browser sees them as same-origin
    // (localhost:5173 -> localhost:5173) and CORS never applies locally.
    // Also immune to any stale cross-origin preflight cached by the browser.
    proxy: {
      '/api': {
        target: 'https://tournest-server.vercel.app',
        changeOrigin: true,
      },
    },
  },
});
