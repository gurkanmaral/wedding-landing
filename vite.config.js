import { defineConfig, loadEnv } from 'vite'
import { cwd } from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/backend': {
          target: env.WEDDING_CARD_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, ''),
        },
      },
    },
  }
})
