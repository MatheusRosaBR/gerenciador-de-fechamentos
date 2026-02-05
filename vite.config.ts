import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Fix for reference errors in production
      'process.env': {},
      '__DEFINES__': JSON.stringify({}),
      '__HMR_CONFIG_NAME__': JSON.stringify(''),
      '__BASE__': JSON.stringify('/'),
      '__SERVER_HOST__': JSON.stringify('localhost'),
      '__HMR_PORT__': JSON.stringify(null),
      '__HMR_HOSTNAME__': JSON.stringify(null),
      '__HMR_DIRECT_TARGET__': JSON.stringify(''),
      '__HMR_BASE__': JSON.stringify('/'),
      '__HMR_TIMEOUT__': JSON.stringify(5000),
      '__HMR_ENABLE_OVERLAY__': JSON.stringify(false),
      '__HMR_PROTOCOL__': JSON.stringify(null),
      '__WS_TOKEN__': JSON.stringify(''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
