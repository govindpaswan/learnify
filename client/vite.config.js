import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "https://learnify-server-7stm.onrender.com", changeOrigin: true },
    },
  },
});
