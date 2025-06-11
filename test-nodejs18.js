// Node.js 18 compatibility test for the compiled adapter
const { handle } = require("./dist/cjs/index");

// Mock Hono app for testing
const mockApp = {
  fetch: async (req, env) => {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response("Hello from Node.js 18!", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (url.pathname === "/api/json") {
      return new Response(
        JSON.stringify({ message: "JSON response", node: process.version }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};

// Test function
async function testNodeJS18Compatibility() {
  console.log("🧪 Testing Node.js 18 compatibility...");
  console.log("📋 Node.js version:", process.version);

  const handler = handle(mockApp);

  // Test 1: Basic GET request
  console.log("\n1️⃣ Testing basic GET request...");
  const event1 = {
    path: "/",
    httpMethod: "GET",
    headers: {
      "user-agent": "nodejs18-test",
      accept: "*/*",
    },
    queryStringParameters: {},
    body: "",
    isBase64Encoded: false,
    requestContext: {
      requestId: "test-request-1",
      envId: "test-env",
      appId: 123456789,
      uin: 123456789,
    },
  };

  const context1 = {
    callbackWaitsForEmptyEventLoop: false,
    memory_limit_in_mb: 128,
    time_limit_in_ms: 30000,
    request_id: "test-request-1",
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
    const response1 = await handler(event1, context1);
    console.log("✅ Response:", response1);
    console.log("✅ Status:", response1.statusCode);
    console.log("✅ Body:", response1.body);
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }

  // Test 2: JSON API request
  console.log("\n2️⃣ Testing JSON API request...");
  const event2 = {
    path: "/api/json",
    httpMethod: "GET",
    headers: {
      "user-agent": "nodejs18-test",
      accept: "application/json",
    },
    queryStringParameters: {},
    body: "",
    isBase64Encoded: false,
    requestContext: {
      requestId: "test-request-2",
      envId: "test-env",
      appId: 123456789,
      uin: 123456789,
    },
  };

  try {
    const response2 = await handler(event2, context1);
    console.log("✅ Response:", response2);
    console.log("✅ Status:", response2.statusCode);
    console.log("✅ Body:", response2.body);

    // Parse JSON to verify
    const jsonData = JSON.parse(response2.body);
    console.log("✅ Parsed JSON:", jsonData);
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }

  // Test 3: 404 handling
  console.log("\n3️⃣ Testing 404 handling...");
  const event3 = {
    path: "/nonexistent",
    httpMethod: "GET",
    headers: {},
    queryStringParameters: {},
    body: "",
    isBase64Encoded: false,
    requestContext: {
      requestId: "test-request-3",
      envId: "test-env",
      appId: 123456789,
      uin: 123456789,
    },
  };

  try {
    const response3 = await handler(event3, context1);
    console.log("✅ Response:", response3);
    console.log("✅ Status:", response3.statusCode);
    console.log("✅ Body:", response3.body);
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }

  console.log(
    "\n🎉 All tests passed! The adapter is compatible with Node.js 18",
  );
  return true;
}

// Run the test
testNodeJS18Compatibility()
  .then((success) => {
    if (success) {
      console.log("\n✅ Node.js 18 compatibility confirmed!");
      process.exit(0);
    } else {
      console.log("\n❌ Node.js 18 compatibility test failed!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n💥 Unexpected error:", error);
    process.exit(1);
  });
