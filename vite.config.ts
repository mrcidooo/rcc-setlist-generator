import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure the public folder (which now contains service-worker.js) is served.
  server: {
    host: "::",
    port: 8080,
    fs: {
      // Allow Vite to serve the service worker from the public directory.
      allow: ["./public"],
    },
  },
});