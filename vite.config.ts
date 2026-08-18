import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Set DISABLE_HMR=true in constrained development environments.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when HMR is disabled to reduce CPU usage.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
