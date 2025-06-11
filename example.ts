import { Hono } from "hono";
import { handle } from "./src/index";

// For CommonJS usage (Node.js 18+):
// const { Hono } = require("hono");
// const { handle } = require("hono-tencent-cloudbase-cloud-function-adapter");

const app = new Hono();

// Basic route
app.get("/", (c) => c.text("Hello from Tencent CloudBase!"));

// JSON response
app.get("/api/user", (c) => {
  return c.json({ name: "John", age: 30 });
});

// Handle POST requests
app.post("/api/data", async (c) => {
  const body = await c.req.json();
  return c.json({ received: body });
});

// Handle query parameters
app.get("/api/search", (c) => {
  const query = c.req.query("q");
  return c.json({ query, results: [] });
});

// Handle timer trigger events
// Timer events are automatically converted to GET requests with path: /CLOUDBASE_TIMER_TRIGGER/${TriggerName}
app.get("/CLOUDBASE_TIMER_TRIGGER/:triggerName", (c) => {
  const triggerName = c.req.param("triggerName");

  // Access the original timer event from the environment
  const originalTimerEvent = c.env?.originalTimerEvent;

  console.log(`Timer triggered: ${triggerName}`);
  console.log(`Timer event:`, originalTimerEvent);

  // Perform your scheduled task here
  return c.json({
    message: `Timer ${triggerName} executed successfully`,
    timestamp: new Date().toISOString(),
    originalEvent: originalTimerEvent,
  });
});

// Export the handler for CloudBase
export const handler = handle(app);

// Example usage test
async function testExample() {
  const event = {
    path: "/",
    httpMethod: "GET",
    headers: {
      "user-agent": "test-agent",
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

  const response = await handler(event, context);
  console.log("Response:", response);
}

// Timer event test
async function testTimerExample() {
  const timerEvent = {
    Message: "",
    Time: "2025-06-11T05:06:40Z",
    TriggerName: "myTrigger",
    Type: "Timer" as const,
  };

  const context = {
    callbackWaitsForEmptyEventLoop: false,
    memory_limit_in_mb: 128,
    time_limit_in_ms: 30000,
    request_id: "timer-request-id",
    environment: {},
    environ: "test",
    function_version: "1.0.0",
    function_name: "test-function",
    namespace: "default",
    tencentcloud_region: "ap-beijing",
    tencentcloud_appid: "123456789",
    tencentcloud_uin: "123456789",
  };

  const response = await handler(timerEvent, context);
  console.log("Timer Response:", response);
}

// Run the tests
testExample();
testTimerExample();
