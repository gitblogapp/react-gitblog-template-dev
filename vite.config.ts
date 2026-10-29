import { defineConfig } from "vite";
import { loadConfig } from "./src/lib/template/config.ts";
export default defineConfig(() => ({
  base: `${loadConfig().base}/`,
  publicDir: "static",
  cacheDir: ".vite",
  build: {
    outDir: "build",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: { input: "src/entry-client.tsx" },
  },
}));
