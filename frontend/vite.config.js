import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const apiUrl = process.env.VITE_API_URL ?? "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    watch:
      process.env.CHOKIDAR_USEPOLLING === "true"
        ? { usePolling: true }
        : undefined,
    proxy: {
      "/api": {
        target: apiUrl,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
  },
});
