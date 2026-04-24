import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        qcm: resolve(__dirname, 'src/quiz-templates/qcm-template.html'),
        text: resolve(__dirname, 'src/quiz-templates/text-template.html')
      }
    }
  }
})