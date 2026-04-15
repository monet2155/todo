import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/supabase.ts', 'lib/openai.ts', 'lib/runway.ts', 'lib/elevenlabs.ts', 'lib/shotstack.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
