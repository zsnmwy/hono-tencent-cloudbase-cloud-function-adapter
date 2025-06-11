# 腾讯云开发 ES Module 使用指南

本指南详细说明如何在腾讯云开发云函数中使用 ES Module 和 Hono 适配器。

## 📋 前提条件

- Node.js 18.0.0 或更高版本
- 腾讯云开发环境
- `hono-tencent-cloudbase-cloud-function-adapter` 包

## 🏗️ 项目结构

根据腾讯云开发的要求，ES Module 项目需要以下结构：

```
your-function/
├── index.js          # CommonJS 入口文件（必须）
├── entry.mjs         # ES Module 入口文件
├── package.json      # 项目配置
├── services/         # 业务逻辑模块（可选）
│   └── userService.js
└── middleware/       # 中间件模块（可选）
    ├── auth.js
    └── logger.js
```

## 🚀 基础使用

### 1. 安装依赖

```bash
npm install hono hono-tencent-cloudbase-cloud-function-adapter
```

### 2. 创建 package.json

```json
{
  "name": "your-cloudbase-function",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "hono": "^4.6.12",
    "hono-tencent-cloudbase-cloud-function-adapter": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. 创建 index.js（CommonJS 入口）

```javascript
// index.js - 必须是 CommonJS 格式
exports.main = async (event, context) => {
    // 动态导入 ES Module 入口文件
    const { entry } = await import('./entry.mjs');
    return entry(event, context);
};
```

### 4. 创建 entry.mjs（ES Module 入口）

```javascript
// entry.mjs - ES Module 格式
import { Hono } from "hono";
import { handle } from "hono-tencent-cloudbase-cloud-function-adapter";

const app = new Hono();

// 定义路由
app.get("/", (c) => c.text("Hello from ES Module!"));

app.get("/api/user", (c) => {
  return c.json({ 
    name: "John", 
    age: 30,
    moduleType: "ES Module"
  });
});

// 创建处理器
const handler = handle(app);

// 导出入口函数
export const entry = (event, context) => {
  return handler(event, context);
};
```

## 🔧 高级使用

### 使用业务逻辑模块

创建 `services/userService.js`：

```javascript
// services/userService.js
export const userService = {
  async getAllUsers() {
    // 业务逻辑
    return { users: [], total: 0 };
  },
  
  async getUserById(id) {
    // 业务逻辑
    return { id, name: "User" };
  }
};
```

在 `entry.mjs` 中使用：

```javascript
import { userService } from "./services/userService.js";

app.get("/api/users", async (c) => {
  const users = await userService.getAllUsers();
  return c.json(users);
});
```

### 使用中间件

创建 `middleware/auth.js`：

```javascript
// middleware/auth.js
export const authMiddleware = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  // 验证逻辑
  await next();
};
```

在 `entry.mjs` 中使用：

```javascript
import { authMiddleware } from "./middleware/auth.js";

app.use("/api/protected/*", authMiddleware);
```

## 📦 双重构建支持

本适配器同时支持 CommonJS 和 ES Module：

### CommonJS 使用

```javascript
const { handle } = require("hono-tencent-cloudbase-cloud-function-adapter");
```

### ES Module 使用

```javascript
import { handle } from "hono-tencent-cloudbase-cloud-function-adapter";
```

## 🧪 测试

### 本地测试

创建测试脚本 `test.mjs`：

```javascript
import { entry } from "./entry.mjs";

const testEvent = {
  path: "/",
  httpMethod: "GET",
  headers: {},
  queryStringParameters: {},
  body: "",
  isBase64Encoded: false,
  requestContext: {
    requestId: "test",
    envId: "test-env",
    appId: 123456789,
    uin: 123456789
  }
};

const response = await entry(testEvent, {});
console.log(response);
```

运行测试：

```bash
node test.mjs
```

## ⚠️ 注意事项

1. **入口文件名**：腾讯云开发要求入口文件必须是 `index.js`
2. **文件扩展名**：ES Module 文件建议使用 `.mjs` 扩展名或在 `package.json` 中设置 `"type": "module"`
3. **导入路径**：ES Module 中的相对导入必须包含文件扩展名（如 `./module.js`）
4. **Node.js 版本**：确保使用 Node.js 18 或更高版本

## 🔍 故障排除

### 常见错误

1. **ERR_MODULE_NOT_FOUND**：检查导入路径是否包含文件扩展名
2. **Cannot use import statement**：确保文件是 `.mjs` 格式或 `package.json` 中设置了 `"type": "module"`
3. **require is not defined**：在 ES Module 中不能使用 `require`，使用 `import` 代替

### 调试技巧

1. 使用 `console.log` 输出调试信息
2. 检查腾讯云开发控制台的函数日志
3. 确保所有依赖都正确安装

## 📚 示例项目

查看 `examples/` 目录中的完整示例：

- `examples/cloudbase-esm/` - 基础 ES Module 示例
- `examples/cloudbase-esm-advanced/` - 高级 ES Module 示例（包含中间件和服务）

## 🎯 最佳实践

1. **模块化设计**：将业务逻辑分离到不同的模块中
2. **错误处理**：使用 Hono 的错误处理机制
3. **类型安全**：使用 TypeScript 获得更好的开发体验
4. **性能优化**：避免在每次请求时重新创建 Hono 应用实例

通过以上指南，您可以在腾讯云开发中充分利用 ES Module 的优势，同时享受 Hono 框架的便利性！
