import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Necessário para Docker
    port: 5173, // Porta padrão do Vite
    watch: {
      usePolling: true, // Necessário se hot reload não funcionar no Windows/WSL
    },
  },
})
