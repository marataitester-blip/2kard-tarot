import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Эта строка позволяет использовать любые имена в папке api
        rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
});
