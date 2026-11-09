import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'

export default defineConfig({
  plugins: [react(), yaml()],
  build: {
    outDir: 'build'
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})