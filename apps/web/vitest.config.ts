import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from apps/web/.env.local
const env = loadEnv("development", rootDir, "");

Object.assign(process.env, env);

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },

  test: {
    environment: "jsdom",
  },
});
