import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration
// Added a proxy so that during development, requests to /API go to the backend (localhost:5000)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000"
    }
  }
});