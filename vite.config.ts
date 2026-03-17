import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  base: "/",
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    ViteImageOptimizer({
      webp: {
        quality: 65,
      },
      jpeg: {
        quality: 65,
      },
      jpg: {
        quality: 65,
      },
      png: {
        quality: 70,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
          'ui': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
        }
      }
    }
  }
}));
