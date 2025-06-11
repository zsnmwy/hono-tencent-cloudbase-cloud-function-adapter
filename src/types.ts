// https://docs.cloudbase.net/service/access-cloud-function
export interface TencentCloudBaseEvent {
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

// Timer trigger event structure
export interface TencentCloudBaseTimerEvent {
  Message: string;
  Time: string;
  TriggerName: string;
  Type: "Timer";
}

// Tencent CloudBase event can be either HTTP event or Timer event
export type TencentCloudBaseEventRaw =
  | TencentCloudBaseEvent
  | TencentCloudBaseTimerEvent;

// https://docs.cloudbase.net/service/access-cloud-function
// Tencent CloudBase context object
export interface TencentCloudBaseContext {
  callbackWaitsForEmptyEventLoop: boolean;
  memory_limit_in_mb: number;
  time_limit_in_ms: number;
  request_id: string;
  environment: Record<string, string>;
  environ: string;
  function_version: string;
  function_name: string;
  namespace: string;
  tencentcloud_region: string;
  tencentcloud_appid: string;
  tencentcloud_uin: string;
}

// https://docs.cloudbase.net/service/access-cloud-function
export interface TencentCloudBaseResponse {
  statusCode: number;
  headers?: Record<string, string>;
  isBase64Encoded?: boolean;
  body: string;
}

export type TencentCloudBaseHandler = (
  event: TencentCloudBaseEventRaw,
  context: TencentCloudBaseContext,
) => Promise<TencentCloudBaseResponse>;
