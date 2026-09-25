import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
    manifest: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        remote: resolve(import.meta.dirname, "remote.html")
      }
    }
  }
});
