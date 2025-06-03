// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Custom-Event-Calendar/', // <<< MAKE SURE THIS LINE IS ADDED AND CORRECT
                                   // (Ensure "Custom-Event-Calendar" matches your repo name casing)
  server: {
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});