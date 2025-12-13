import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: '.',
  test: {
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['demo/**', 'dist/**', 'node_modules/**'],
    globals: true
  }
})
