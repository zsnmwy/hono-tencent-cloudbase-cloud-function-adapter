# Hono Tencent CloudBase Cloud Function Adapter

[![Build](https://github.com/zsnmwy/hono-tencent-cloudbase-cloud-function-adapter/actions/workflows/build.yml/badge.svg)](https://github.com/zsnmwy/hono-tencent-cloudbase-cloud-function-adapter/actions/workflows/build.yml)
[![NPM Version](https://img.shields.io/npm/v/hono-tencent-cloudbase-cloud-function-adapter)](https://www.npmjs.com/package/hono-tencent-cloudbase-cloud-function-adapter)
![GitHub License](https://img.shields.io/github/license/zsnmwy/hono-tencent-cloudbase-cloud-function-adapter)

An adapter for using [Hono](https://hono.dev) with [Tencent CloudBase Cloud Function](https://docs.cloudbase.net/service/access-cloud-function).

一个用于在[腾讯云开发云函数](https://docs.cloudbase.net/service/access-cloud-function) 中使用 [Hono](https://hono.dev) 的适配器。

## Requirements

- Node.js 18.0.0 or higher
- Tencent CloudBase Cloud Function environment

## Installation

```bash
npm install hono-tencent-cloudbase-cloud-function-adapter
```

## Usage

### CommonJS (Node.js 18+)

```javascript
const { Hono } = require("hono");
const { handle } = require("hono-tencent-cloudbase-cloud-function-adapter");

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

exports.handler = handle(app);
```

### ES Module (Node.js 18+)

For ES Module support in Tencent CloudBase, you need a hybrid approach:

**index.js** (CommonJS entry point - required by CloudBase):
```javascript
exports.main = async (event, context) => {
    const { entry } = await import('./entry.mjs');
    return entry(event, context);
};
```

**entry.mjs** (ES Module):
```javascript
import { Hono } from "hono";
import { handle } from "hono-tencent-cloudbase-cloud-function-adapter";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

const handler = handle(app);

export const entry = (event, context) => {
  return handler(event, context);
};
```

**package.json**:
```json
{
  "type": "module",
  "dependencies": {
    "hono": "^4.6.12",
    "hono-tencent-cloudbase-cloud-function-adapter": "^1.0.0"
  }
}
```

### TypeScript

```typescript
import { Hono } from "hono";
import { handle } from "hono-tencent-cloudbase-cloud-function-adapter";

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

export const handler = handle(app);
```

For more details, check out:
- [Tencent CloudBase Cloud Function Documentation](https://docs.cloudbase.net/service/access-cloud-function)
- [ES Module Usage Guide](./ES_MODULE_GUIDE.md) - Detailed guide for using ES Module in CloudBase

## Example

Here's a complete example of how to use this adapter in a Tencent CloudBase Cloud Function:

```typescript
import { Hono } from "hono";
import { handle } from "hono-tencent-cloudbase-cloud-function-adapter";

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

// Export the handler for CloudBase
export const handler = handle(app);
```

## Event Format

The adapter automatically converts Tencent CloudBase HTTP events to standard Request objects and Response objects back to CloudBase format. The CloudBase event structure includes:

```typescript
{
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string>;
  requestContext: {
    requestId: string;
    envId: string;
    appId: number;
    uin: number;
  };
  body: string;
  isBase64Encoded: boolean;
}
```
