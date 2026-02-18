import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['app/__tests__/*.test.jsx'],
    setupFiles: ['app/__tests__/setup.mjs'],
  },
});
