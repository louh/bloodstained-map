import { defineConfig } from 'vitest/config'
import yaml from '@rollup/plugin-yaml'

export default defineConfig({
  plugins: [yaml()],
  oxc: {
    jsx: { runtime: 'classic' }
  },
  build: {
    outDir: 'build'
  },
  optimizeDeps: {
    rolldownOptions: {
      transform: { jsx: { runtime: 'classic' } }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})