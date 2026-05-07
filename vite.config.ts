import { readFileSync } from "node:fs";

import { defineConfig } from "vite";

const base = "/z3-smt-game/";
const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  version: string;
};

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.VITE_APP_VERSION || packageJson.version,
    ),
    __GIT_COMMIT__: JSON.stringify(process.env.VITE_GIT_COMMIT || "dev"),
  },
  build: {
    outDir: "docs",
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  worker: {
    format: "es",
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
  },
});
