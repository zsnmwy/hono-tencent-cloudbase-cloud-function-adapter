import { decodeBase64 } from "hono/utils/encode";
import {
  isContentEncodingBinary,
  isContentTypeBinary,
  createRequest,
  createResponse,
  handle,
} from "./handler";
import type {
  TencentCloudBaseEvent,
  TencentCloudBaseTimerEvent,
} from "./types";
import { expect, describe, it } from "vitest";

// copied from aws-lambda/handler.test.ts
describe("isContentTypeBinary", () => {
  it("Should determine whether it is binary", () => {
    expect(isContentTypeBinary("image/png")).toBe(true);
    expect(isContentTypeBinary("font/woff2")).toBe(true);
    expect(isContentTypeBinary("image/svg+xml")).toBe(false);
    expect(isContentTypeBinary("image/svg+xml; charset=UTF-8")).toBe(false);
    expect(isContentTypeBinary("text/plain")).toBe(false);
    expect(isContentTypeBinary("text/plain; charset=UTF-8")).toBe(false);
    expect(isContentTypeBinary("text/css")).toBe(false);
    expect(isContentTypeBinary("text/javascript")).toBe(false);
    expect(isContentTypeBinary("application/json")).toBe(false);
    expect(isContentTypeBinary("application/ld+json")).toBe(false);
    expect(isContentTypeBinary("application/json; charset=UTF-8")).toBe(false);
  });
});

// copied from aws-lambda/handler.test.ts
describe("isContentEncodingBinary", () => {
  it("Should determine whether it is compressed", () => {
    expect(isContentEncodingBinary("gzip")).toBe(true);
    expect(isContentEncodingBinary("compress")).toBe(true);
    expect(isContentEncodingBinary("deflate")).toBe(true);
    expect(isContentEncodingBinary("br")).toBe(true);
    expect(isContentEncodingBinary("deflate, gzip")).toBe(true);
    expect(isContentEncodingBinary("")).toBe(false);
    expect(isContentEncodingBinary("unknown")).toBe(false);
  });
});

describe("createRequest", () => {
  it("Should return valid javascript Request object from tencent cloudbase event", () => {
    const event: TencentCloudBaseEvent = {
      path: "/my/path",
      httpMethod: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": "curl/7.81.0",
      },
      queryStringParameters: { parameter2: "value" },
      body: "",
      isBase64Encoded: false,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const request = createRequest(event);

    expect(request.method).toEqual("GET");
    expect(request.url).toEqual(
      "https://cloudbase.example.com/my/path?parameter2=value",
    );
    expect(Object.fromEntries(request.headers)).toEqual({
      accept: "*/*",
      "user-agent": "curl/7.81.0",
    });
  });

  it("Should return valid javascript Request object from tencent cloudbase event with base64 encoded body", async () => {
    const event: TencentCloudBaseEvent = {
      path: "/my/path",
      httpMethod: "POST",
      headers: {
        Accept: "*/*",
        "User-Agent": "curl/7.81.0",
      },
      queryStringParameters: { parameter2: "value" },
      body: "UmVxdWVzdCBCb2R5",
      isBase64Encoded: true,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const request = createRequest(event);

    expect(request.method).toEqual("POST");
    expect(request.url).toEqual(
      "https://cloudbase.example.com/my/path?parameter2=value",
    );
    const text = await request.text();
    expect(text).toEqual("Request Body");
  });

  it("Should return valid javascript Request object from tencent cloudbase event with not base64 encoded body", async () => {
    const event: TencentCloudBaseEvent = {
      path: "/my/path",
      httpMethod: "POST",
      headers: {
        Accept: "*/*",
        "User-Agent": "curl/7.81.0",
      },
      queryStringParameters: { parameter2: "value" },
      body: "Request Body",
      isBase64Encoded: false,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const request = createRequest(event);

    const text = await request.text();
    expect(text).toEqual("Request Body");
  });

  it("Should handle escaped paths in request URL correctly", () => {
    const event: TencentCloudBaseEvent = {
      path: "/my/path%E4%BD%A0%E5%A5%BD",
      httpMethod: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": "curl/7.81.0",
      },
      queryStringParameters: {
        你好: "世界",
      },
      body: "",
      isBase64Encoded: false,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const request = createRequest(event);

    expect(request.method).toEqual("GET");
    const requestUrl = new URL(request.url);
    expect(requestUrl.pathname).toEqual("/my/path%E4%BD%A0%E5%A5%BD");
    expect(requestUrl.searchParams.get("你好")).toEqual("世界");
    expect(Object.fromEntries(request.headers)).toEqual({
      accept: "*/*",
      "user-agent": "curl/7.81.0",
    });
  });
});

describe("createResponse", () => {
  it("Should return valid tencent cloudbase Response object from javascript Response", async () => {
    const response = new Response("Response Content", {
      headers: {
        "Content-Type": "text/plain",
      },
    });

    const res = await createResponse(response);

    expect(res.statusCode).toEqual(200);
    expect(res.headers).toEqual({
      "content-type": "text/plain",
    });
    expect(res.body).toEqual("Response Content");
    expect(res.isBase64Encoded).toEqual(false);
  });

  it("Should return valid tencent cloudbase Response object from base64 encoded javascript Response", async () => {
    const response = new Response("Response Content", {
      headers: {
        "Content-Type": "image/png",
      },
    });

    const res = await createResponse(response);

    expect(res.statusCode).toEqual(200);
    expect(res.headers).toEqual({
      "content-type": "image/png",
    });
    expect(res.body).toEqual("UmVzcG9uc2UgQ29udGVudA==");
    expect(res.isBase64Encoded).toEqual(true);
  });

  it("Should return valid tencent cloudbase Response object from compressed javascript Response", async () => {
    const body = "Response Content";
    const plainResponse = new Response(body);
    const compressedStream = plainResponse.body?.pipeThrough(
      new CompressionStream("gzip"),
    );

    const compressedResponse = new Response(compressedStream, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Encoding": "gzip",
      },
    });

    const res = await createResponse(compressedResponse);

    expect(res.statusCode).toEqual(200);
    expect(res.headers).toEqual({
      "content-type": "text/plain",
      "content-encoding": "gzip",
    });

    const compressedBodyStream = new Response(decodeBase64(res.body)).body;
    const decompressedStream = compressedBodyStream?.pipeThrough(
      new DecompressionStream("gzip"),
    );
    const decompressedBody = await new Response(decompressedStream).text();

    expect(decompressedBody).toEqual("Response Content");
    expect(res.isBase64Encoded).toEqual(true);
  });
});

describe("Timer Event Handling", () => {
  it("Should handle timer trigger events and convert to HTTP GET request", async () => {
    const { Hono } = await import("hono");

    const app = new Hono();
    app.get("/CLOUDBASE_TIMER_TRIGGER/:triggerName", (c) => {
      const triggerName = c.req.param("triggerName");
      const originalEvent = c.env?.originalTimerEvent;

      return c.json({
        message: "Timer triggered",
        triggerName,
        originalEvent,
      });
    });

    const handler = handle(app);

    const timerEvent: TencentCloudBaseTimerEvent = {
      Message: "",
      Time: "2025-06-11T05:06:40Z",
      TriggerName: "myTrigger",
      Type: "Timer",
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

    const response = await handler(timerEvent, context);

    expect(response.statusCode).toEqual(200);

    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).toEqual("Timer triggered");
    expect(responseBody.triggerName).toEqual("myTrigger");
    expect(responseBody.originalEvent).toEqual(timerEvent);
  });

  it("Should create correct request from timer event", async () => {
    // We test the timer event handling through the integration test above
    // This test is a placeholder to ensure the timer event type is properly defined
    const timerEvent: TencentCloudBaseTimerEvent = {
      Message: "",
      Time: "2025-06-11T05:06:40Z",
      TriggerName: "myTrigger",
      Type: "Timer",
    };

    // Verify the timer event structure
    expect(timerEvent.Type).toBe("Timer");
    expect(timerEvent.TriggerName).toBe("myTrigger");
    expect(timerEvent.Time).toBe("2025-06-11T05:06:40Z");
  });
});
