#!/usr/bin/env node

// 发布前检查脚本
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Running pre-publish checks...");

// 检查必要的文件是否存在
const requiredFiles = [
  "dist/cjs/index.js",
  "dist/cjs/index.d.ts",
  "dist/esm/index.js",
  "dist/esm/index.d.ts",
  "package.json",
  "README.md",
];

console.log("\n📁 Checking required files...");
let missingFiles = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    missingFiles.push(file);
  } else {
    console.log(`✅ ${file}`);
  }
}

if (missingFiles.length > 0) {
  console.error("\n💡 To fix missing files, run:");
  console.error("   pnpm run build");
  console.error("\n📋 This will generate the required distribution files.");
  process.exit(1);
}

// 检查 package.json 配置
console.log("\n📦 Checking package.json configuration...");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const requiredFields = [
  "name",
  "version",
  "description",
  "main",
  "module",
  "types",
  "exports",
];
for (const field of requiredFields) {
  if (!packageJson[field]) {
    console.error(`❌ Missing required field in package.json: ${field}`);
    process.exit(1);
  }
  console.log(
    `✅ ${field}: ${typeof packageJson[field] === "object" ? "configured" : packageJson[field]}`,
  );
}

// 检查版本号格式
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(packageJson.version)) {
  console.error(`❌ Invalid version format: ${packageJson.version}`);
  process.exit(1);
}

console.log("\n🎉 All pre-publish checks passed!");
console.log(`📦 Ready to publish ${packageJson.name}@${packageJson.version}`);
