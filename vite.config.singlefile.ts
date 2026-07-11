import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Builds the whole app into ONE self-contained index.html that runs from file://
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-sf",
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
});
