import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleMaritimeApi } from './src/server/apiMiddleware.ts';

function maritimeApiPlugin(): Plugin {
  return {
    name: 'maritime-api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleMaritimeApi(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handleMaritimeApi(req, res, next);
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [maritimeApiPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

