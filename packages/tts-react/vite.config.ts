import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic'
    })
  ],
  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      name: 'TTSReact',
      entry: './src/index.ts',
      formats: ['umd'],
      fileName: () => 'umd/tts-react.min.js'
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  }
})
