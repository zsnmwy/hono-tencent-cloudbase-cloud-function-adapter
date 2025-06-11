// test-esm.mjs - ES Module 测试脚本
import { Hono } from "hono";
import { handle } from "./dist/esm/index.js";

console.log("🧪 Testing ES Module version...");
console.log("📋 Node.js version:", process.version);

// 创建测试应用
const app = new Hono();

app.get("/", (c) => c.text("Hello from ES Module!"));
app.get("/api/test", (c) => {
  return c.json({ 
    message: "ES Module test successful",
    nodeVersion: process.version,
    moduleType: "ES Module"
  });
});

// 创建处理器
const handler = handle(app);

// 测试事件
const testEvent = {
  path: "/api/test",
  httpMethod: "GET",
  headers: {
    "user-agent": "esm-test",
    "accept": "application/json"
  },
  queryStringParameters: {},
  body: "",
  isBase64Encoded: false,
  requestContext: {
    requestId: "esm-test-request",
    envId: "test-env",
    appId: 123456789,
    uin: 123456789
  }
};

const testContext = {
  callbackWaitsForEmptyEventLoop: false,
  memory_limit_in_mb: 128,
  time_limit_in_ms: 30000,
  request_id: "esm-test-request",
  environment: {},
  environ: "test",
  function_version: "1.0.0",
  function_name: "test-function",
  namespace: "default",
  tencentcloud_region: "ap-beijing",
  tencentcloud_appid: "123456789",
  tencentcloud_uin: "123456789"
};

try {
  const response = await handler(testEvent, testContext);
  console.log("✅ ES Module test successful!");
  console.log("📄 Response:", response);
  
  // 验证响应
  if (response.statusCode === 200) {
    const body = JSON.parse(response.body);
    if (body.moduleType === "ES Module") {
      console.log("🎉 ES Module adapter working correctly!");
    } else {
      console.log("⚠️  Module type not detected correctly");
    }
  } else {
    console.log("❌ Unexpected status code:", response.statusCode);
  }
} catch (error) {
  console.error("❌ ES Module test failed:", error);
  process.exit(1);
}
