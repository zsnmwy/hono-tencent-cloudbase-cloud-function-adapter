// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: ["dist/*", "scripts/*", "examples/*"],
  },
  {
    // Node.js 环境配置 - 适用于测试文件和 CommonJS 文件
    files: ["test-*.js", "test-*.mjs", "example-*.js", "*.config.js", "*.config.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        URL: "readonly",
        Response: "readonly",
        Request: "readonly",
        fetch: "readonly",
      },
    },
    rules: {
      // 允许 CommonJS 文件使用 require
      "@typescript-eslint/no-require-imports": "off",
      // 允许未使用的变量（测试文件中常见）
      "@typescript-eslint/no-unused-vars": "warn",
    },
  }
);
