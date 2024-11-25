import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json-summary", "json", "html", "clover"],
      include: ["src"],
      exclude: ["src/index.ts"],
    },
  },
});
