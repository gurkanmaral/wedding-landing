import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'node:fs'
import { cwd } from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Paints the right background before any JS runs, so opening a template or
// the landing page never flashes the default light body. Colours come from
// the registry: each template's path and the first colour of its intro.
function bootBackground() {
  return {
    name: 'boot-background',
    transformIndexHtml() {
      const source = readFileSync('src/templates/registry.js', 'utf8')
      const colours = { '/': '#0f1512', '/tasarim': '#0f1512' }
      for (const [, path, bg] of source.matchAll(/path: '([^']+)'[\s\S]*?bg: '([^']+)'/g)) {
        const first = bg.match(/#[0-9a-f]{3,8}/i)
        if (first) colours[path] = first[0]
      }
      const script = `(function(){var c=${JSON.stringify(colours)};var p='/'+(location.pathname.split('/')[1]||'');var v=p==='/'?c['/']:c[p];if(v)document.documentElement.style.setProperty('--boot-bg',v)})()`
      return [{ tag: 'script', children: script, injectTo: 'head-prepend' }]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')

  return {
    plugins: [react(), tailwindcss(), bootBackground()],
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
