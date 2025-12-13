import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  root: 'demo',
  server: {
    open: true
  },
  resolve: {
    alias: {
      maju: resolve(__dirname, 'index.ts')
    }
  }
})
