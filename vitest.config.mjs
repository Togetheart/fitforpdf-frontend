import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // jsdom emulates a browser, so resolve packages' "browser" export condition.
  // react-resizable-panels ships a server build (under the "node" condition)
  // whose Panels never register with their group — its imperative API
  // (collapse/expand/isCollapsed) then throws "Panel size not found". The
  // browser build registers panels via layout effects, which is what jsdom needs.
  resolve: {
    conditions: ['browser', 'development', 'module', 'import', 'default'],
  },
  test: {
    environment: 'jsdom',
    include: ['app/__tests__/*.test.jsx'],
    setupFiles: ['app/__tests__/setup.mjs'],
    poolOptions: {
      threads: {
        maxThreads: 2,
        minThreads: 1,
      },
    },
  },
});
