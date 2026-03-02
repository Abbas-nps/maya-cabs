import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  // Force-bundle CJS packages in SSR so Node ESM can import them correctly
  ssr: {
    noExternal: ["react-helmet-async"],
  },
  build: {
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            manualChunks: {
              vendor: ["react", "react-dom", "react-router-dom"],
              supabase: ["@supabase/supabase-js"],
              booking: [
                "./src/pages/Schedule",
                "./src/pages/Details",
                "./src/pages/Review",
                "./src/pages/Payment",
              ],
            },
          },
        },
    target: "es2020",
    minify: "esbuild",
  },
}));