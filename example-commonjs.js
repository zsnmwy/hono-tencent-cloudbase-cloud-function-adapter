// CommonJS example for Node.js 18+ compatibility
const { Hono } = require("hono");
const { handle } = require("./dist/cjs/index");

const app = new Hono();

// Basic route
app.get("/", (c) => c.text("Hello from Tencent CloudBase with Node.js 18!"));

// JSON response
app.get("/api/user", (c) => {
  return c.json({
    name: "John",
    age: 30,
    nodeVersion: process.version,
    platform: process.platform,
  });
});

// Handle POST requests
app.post("/api/data", async (c) => {
  const body = await c.req.json();
  return c.json({
    received: body,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  });
});

// Handle query parameters
app.get("/api/search", (c) => {
  const query = c.req.query("q");
  const limit = c.req.query("limit") || "10";
  return c.json({
    query,
    limit: parseInt(limit),
    results: [],
    nodeVersion: process.version,
  });
});

// Error handling
app.get("/api/error", (c) => {
  throw new Error("Test error handling");
});

app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
      nodeVersion: process.version,
    },
    500,
  );
});

// Export the handler for CloudBase
exports.handler = handle(app);

// Example usage test (for development)
async function testCommonJSExample() {
  console.log("🧪 Testing CommonJS example...");
  console.log("📋 Node.js version:", process.version);

  const handler = exports.handler;

  // Test basic route
  const event = {
    path: "/",
    httpMethod: "GET",
    headers: {
      "user-agent": "commonjs-test",
      accept: "*/*",
    },
    queryStringParameters: {},
    body: "",
    isBase64Encoded: false,
    requestContext: {
      requestId: "test-request-id",
      envId: "test-env",
      appId: 123456789,
      uin: 123456789,
    },
  };

  const context = {
    callbackWaitsForEmptyEventLoop: false,
    memory_limit_in_mb: 128,
    time_limit_in_ms: 30000,
    request_id: "test-request-id",
    environment: {},
    environ: "test",
    function_version: "1.0.0",
    function_name: "test-function",
    namespace: "default",
    tencentcloud_region: "ap-beijing",
    tencentcloud_appid: "123456789",
    tencentcloud_uin: "123456789",
  };

  try {
    const response = await handler(event, context);
    console.log("✅ CommonJS Response:", response);
    return true;
  } catch (error) {
    console.error("❌ CommonJS Error:", error);
    return false;
  }
}

// Only run test if this file is executed directly
if (require.main === module) {
  testCommonJSExample()
    .then((success) => {
      if (success) {
        console.log("✅ CommonJS example works perfectly!");
        process.exit(0);
      } else {
        console.log("❌ CommonJS example failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("💥 Unexpected error:", error);
      process.exit(1);
    });
}
