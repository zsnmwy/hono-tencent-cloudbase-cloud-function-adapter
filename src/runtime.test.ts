import { handle } from "./handler";
import type { TencentCloudBaseContext, TencentCloudBaseEvent } from "./types";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { describe, it, expect } from "vitest";

interface Bindings {
  event: TencentCloudBaseEvent;
  context: TencentCloudBaseContext;
}

describe("Tencent CloudBase Adapter for Hono", () => {
  const app = new Hono<{ Bindings: Bindings }>();

  app.get("/", (c) => {
    return c.text("Hello CloudBase!");
  });

  app.get("/binary", (c) => {
    return c.body("Fake Image", 200, {
      "Content-Type": "image/png",
    });
  });

  app.post("/post", async (c) => {
    const body = (await c.req.parseBody()) as { message: string };
    return c.text(body.message);
  });

  app.post("/post/binary", async (c) => {
    const body = await c.req.blob();
    return c.text(`${body.size} bytes`);
  });

  const username = "hono-user-a";
  const password = "hono-password-a";
  app.use("/auth/*", basicAuth({ username, password }));
  app.get("/auth/abc", (c) => c.text("Good Night CloudBase!"));

  const handler = handle(app);

  it("Should handle a GET request and return a 200 response", async () => {
    const event = {
      path: "/",
      httpMethod: "GET",
      headers: {
        host: "example.com",
        "user-agent": "curl/7.81.0",
        accept: "*/*",
      },
      queryStringParameters: {},
      body: "",
      isBase64Encoded: false,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const response = await handler(event, {} as TencentCloudBaseContext);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("Hello CloudBase!");
    expect(response.headers?.["content-type"]).toMatch(/^text\/plain/);
  });

  it("Should handle a GET request and return a 200 response with binary", async () => {
    const event = {
      path: "/binary",
      httpMethod: "GET",
      headers: {
        host: "example.com",
      },
      queryStringParameters: {},
      body: "",
      isBase64Encoded: false,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const response = await handler(event, {} as TencentCloudBaseContext);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("RmFrZSBJbWFnZQ=="); // base64 encoded "Fake Image"
    expect(response.headers?.["content-type"]).toMatch(/^image\/png/);
    expect(response.isBase64Encoded).toBe(true);
  });

  it("Should handle a POST request and return a 200 response", async () => {
    const message = "Good Morning CloudBase!";
    const searchParam = new URLSearchParams();
    searchParam.append("message", message);

    const event = {
      path: "/post",
      httpMethod: "POST",
      headers: {
        host: "example.com",
        "content-type": "application/x-www-form-urlencoded",
      },
      queryStringParameters: {},
      body: Buffer.from(searchParam.toString()).toString("base64"),
      isBase64Encoded: true,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const response = await handler(event, {} as TencentCloudBaseContext);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(message);
  });

  it("Should handle a POST request with binary and return a 200 response", async () => {
    const array = new Uint8Array([0xc0, 0xff, 0xee]);
    const buffer = Buffer.from(array);

    const event = {
      path: "/post/binary",
      httpMethod: "POST",
      headers: {
        host: "example.com",
        "content-type": "application/octet-stream",
      },
      queryStringParameters: {},
      body: buffer.toString("base64"),
      isBase64Encoded: true,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const response = await handler(event, {} as TencentCloudBaseContext);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("3 bytes");
  });

  it("Should handle a request and return a 401 response with Basic auth", async () => {
    const event = {
      path: "/auth/abc",
      httpMethod: "GET",
      headers: {
        host: "example.com",
        "content-type": "text/plain",
      },
      queryStringParameters: {},
      body: "",
      isBase64Encoded: false,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const response = await handler(event, {} as TencentCloudBaseContext);

    expect(response.statusCode).toBe(401);
  });

  it("Should handle a GET request and return a 404 response", async () => {
    const event = {
      path: "/nothing",
      httpMethod: "GET",
      headers: {
        host: "example.com",
      },
      queryStringParameters: {},
      body: "",
      isBase64Encoded: false,
      requestContext: {
        requestId: "cdbb96328072184d19d3fcd243e8cc4d",
        envId: "env-id",
        appId: 123456789,
        uin: 123456789,
      },
    };

    const response = await handler(event, {} as TencentCloudBaseContext);

    expect(response.statusCode).toBe(404);
  });
});
