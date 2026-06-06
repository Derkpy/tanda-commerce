import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["**/dist/**", "**/node_modules/**"],
    fileParallelism: false,
    hookTimeout: 30_000,
    setupFiles: ["./src/test/setup-env.ts"],
    testTimeout: 30_000,
  },
});
