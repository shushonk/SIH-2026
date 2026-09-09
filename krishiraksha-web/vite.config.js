import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/fields': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/observations': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/expert-reviews': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/officer': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/interventions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/outcomes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/alerts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/knowledge': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/copilot': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/simulator': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/model-info': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sensors': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/forecast': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/messages': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
});
