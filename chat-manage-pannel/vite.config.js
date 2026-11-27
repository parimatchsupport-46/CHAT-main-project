import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Local dev mode me /api requests dev-server (port 4317) par jaati hain.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4317',
        changeOrigin: true,
      },
    },
  },
});
