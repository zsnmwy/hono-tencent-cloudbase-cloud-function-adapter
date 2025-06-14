import type { Hono } from "hono";
import type { Env, Schema } from "hono/types";
import { decodeBase64, encodeBase64 } from "hono/utils/encode";
import type {
  TencentCloudBaseContext,
  TencentCloudBaseEvent,
  TencentCloudBaseEventRaw,
  TencentCloudBaseHandler,
  TencentCloudBaseTimerEvent,
} from "./types.js";

const isTimerEvent = (
  event: TencentCloudBaseEventRaw,
): event is TencentCloudBaseTimerEvent => {
  return "Type" in event && event.Type === "Timer";
};

const parseEvent = (event: TencentCloudBaseEventRaw): TencentCloudBaseEvent => {
  // If it's a timer event, convert it to HTTP event format
  if (isTimerEvent(event)) {
    return {
      path: `/CLOUDBASE_TIMER_TRIGGER/${event.TriggerName}`,
      httpMethod: "GET",
      headers: {
        "content-type": "application/json",
        "user-agent": "cloudbase-timer-trigger",
      },
      queryStringParameters: {},
      requestContext: {
        requestId: `timer-${Date.now()}`,
        envId: "timer-trigger",
        appId: 0,
        uin: 0,
      },
      body: "",
      isBase64Encoded: false,
    };
  }

  // For regular HTTP events, return as-is
  return event as TencentCloudBaseEvent;
};

/**
 * Accepts events from Tencent CloudBase and return Tencent CloudBase responses
 */
export const handle = <
  E extends Env = Env,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  S extends Schema = {},
  BasePath extends string = "/",
>(
  app: Hono<E, S, BasePath>,
): TencentCloudBaseHandler => {
  return async (
    eventRaw: TencentCloudBaseEventRaw,
    context: TencentCloudBaseContext,
  ) => {
    const event = parseEvent(eventRaw);
    const req = createRequest(event);

    // Add original event to the environment for timer events
    const env = isTimerEvent(eventRaw)
      ? {
          event: eventRaw,
          context,
          originalTimerEvent: eventRaw,
        }
      : {
          event,
          context,
        };

    const res = await app.fetch(req, env);

    return createResponse(res);
  };
};

export const createRequest = (event: TencentCloudBaseEvent): Request => {
  // For Tencent CloudBase, we need to construct a proper URL
  // Since we don't have a domain name in the event, we'll use a placeholder
  const url = new URL(`https://cloudbase.example.com${event.path}`);

  const params = new URLSearchParams(event.queryStringParameters);
  url.search = params.toString();
  const headers = new Headers(event.headers);

  const method = event.httpMethod;
  const requestInit: RequestInit = {
    headers,
    method,
  };

  if (event.body) {
    requestInit.body = event.isBase64Encoded
      ? decodeBase64(event.body)
      : event.body;
  }

  return new Request(url, requestInit);
};

export const createResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type");
  let isBase64Encoded =
    contentType && isContentTypeBinary(contentType) ? true : false;

  if (!isBase64Encoded) {
    const contentEncoding = res.headers.get("content-encoding");
    isBase64Encoded = isContentEncodingBinary(contentEncoding);
  }

  const body = isBase64Encoded
    ? encodeBase64(await res.arrayBuffer())
    : await res.text();

  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    statusCode: res.status,
    headers,
    body,
    isBase64Encoded,
  };
};

export const isContentTypeBinary = (contentType: string) => {
  return !/^(text\/(plain|html|css|javascript|csv).*|application\/(.*json|.*xml).*|image\/svg\+xml.*)$/.test(
    contentType,
  );
};

export const isContentEncodingBinary = (contentEncoding: string | null) => {
  if (contentEncoding === null) {
    return false;
  }
  return /^(gzip|deflate|compress|br)/.test(contentEncoding);
};
