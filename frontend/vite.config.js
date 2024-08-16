import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  logLevel: 'info', // Set to 'info' or 'debug' for more detailed output
})
