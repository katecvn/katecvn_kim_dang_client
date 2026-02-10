import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), Inspect()],
  server: {
    port: 5174,
    hmr: true,
    host: true,
    watch: {
      ignored: ['**/node_modules/**'],
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      'react-day-picker': 'react-day-picker/dist/index.esm.js',
    },
  },
})
