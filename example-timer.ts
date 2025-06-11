import { Hono } from "hono";
import type { Context } from "hono";
import { handle } from "./src/index";
import type { TencentCloudBaseTimerEvent } from "./src/types";

const app = new Hono();

// Regular HTTP routes
app.get("/", (c) => c.text("Hello from Tencent CloudBase!"));

app.get("/api/status", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Timer trigger handler
// This route will be called when a timer trigger fires
app.get("/CLOUDBASE_TIMER_TRIGGER/:triggerName", (c) => {
  const triggerName = c.req.param("triggerName");

  // Access the original timer event from the environment
  const originalTimerEvent = c.env?.originalTimerEvent;

  console.log(`Timer triggered: ${triggerName}`);
  console.log(`Timer event details:`, originalTimerEvent);

  // Example: Different actions based on trigger name
  switch (triggerName) {
    case "dailyCleanup":
      return handleDailyCleanup(c, originalTimerEvent);
    case "hourlyReport":
      return handleHourlyReport(c, originalTimerEvent);
    case "myTrigger":
      return handleMyTrigger(c, originalTimerEvent);
    default:
      return c.json({
        message: `Unknown timer trigger: ${triggerName}`,
        timestamp: new Date().toISOString(),
        originalEvent: originalTimerEvent,
      });
  }
});

// Handler functions for different timer triggers
function handleDailyCleanup(
  c: Context,
  timerEvent: TencentCloudBaseTimerEvent,
) {
  console.log("Performing daily cleanup...");

  // Your daily cleanup logic here
  // e.g., delete old files, clean up database, etc.

  return c.json({
    message: "Daily cleanup completed successfully",
    timestamp: new Date().toISOString(),
    triggerTime: timerEvent?.Time,
    actions: [
      "Cleaned temporary files",
      "Archived old logs",
      "Updated statistics",
    ],
  });
}

function handleHourlyReport(
  c: Context,
  timerEvent: TencentCloudBaseTimerEvent,
) {
  console.log("Generating hourly report...");

  // Your hourly report logic here
  // e.g., generate reports, send notifications, etc.

  return c.json({
    message: "Hourly report generated successfully",
    timestamp: new Date().toISOString(),
    triggerTime: timerEvent?.Time,
    report: {
      totalRequests: Math.floor(Math.random() * 1000),
      activeUsers: Math.floor(Math.random() * 100),
      systemHealth: "good",
    },
  });
}

function handleMyTrigger(c: Context, timerEvent: TencentCloudBaseTimerEvent) {
  console.log("Handling myTrigger...");

  // Your custom trigger logic here

  return c.json({
    message: "MyTrigger executed successfully",
    timestamp: new Date().toISOString(),
    triggerTime: timerEvent?.Time,
    originalEvent: timerEvent,
  });
}

// Export the handler for CloudBase
export const handler = handle(app);

// Example timer event for testing
async function testTimerTriggers() {
  console.log("Testing timer triggers...\n");

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

  // Test different timer triggers
  const timerEvents = [
    {
      Message: "",
      Time: "2025-06-11T05:06:40Z",
      TriggerName: "myTrigger",
      Type: "Timer" as const,
    },
    {
      Message: "",
      Time: "2025-06-11T06:00:00Z",
      TriggerName: "hourlyReport",
      Type: "Timer" as const,
    },
    {
      Message: "",
      Time: "2025-06-11T00:00:00Z",
      TriggerName: "dailyCleanup",
      Type: "Timer" as const,
    },
    {
      Message: "",
      Time: "2025-06-11T05:06:40Z",
      TriggerName: "unknownTrigger",
      Type: "Timer" as const,
    },
  ];

  for (const timerEvent of timerEvents) {
    console.log(`Testing timer: ${timerEvent.TriggerName}`);
    const response = await handler(timerEvent, context);
    console.log(`Response:`, JSON.parse(response.body));
    console.log("---");
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testTimerTriggers();
}
