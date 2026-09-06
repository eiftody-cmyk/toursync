import type { NextRequest } from "next/server";

interface LogContext {
  endpoint: string;
  method: string;
  requestId: string;
}

interface RequestLog {
  timestamp: string;
  endpoint: string;
  method: string;
  requestId: string;
  url: string;
  authPresent: boolean;
  bodyPreview?: string;
}

interface ResponseLog {
  timestamp: string;
  endpoint: string;
  method: string;
  requestId: string;
  status: number;
  responseBody: unknown;
  durationMs: number;
}

const requestLog: RequestLog[] = [];
const responseLog: ResponseLog[] = [];

const MAX_LOG_ENTRIES = 100;

export function createGygLogger(endpoint: string, req: NextRequest): LogContext {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const authHeader = req.headers.get("authorization");

  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    endpoint,
    method: req.method,
    requestId,
    url: req.url,
    authPresent: !!authHeader,
  };

  requestLog.push(log);
  if (requestLog.length > MAX_LOG_ENTRIES) requestLog.shift();

  console.log(`[GYG ${endpoint}] ${req.method} ${requestId} — auth=${!!authHeader}`);

  return { endpoint, method: req.method, requestId };
}

export function logResponse(
  ctx: LogContext,
  status: number,
  body: unknown,
  startTime: number
): void {
  const durationMs = Date.now() - startTime;

  const log: ResponseLog = {
    timestamp: new Date().toISOString(),
    endpoint: ctx.endpoint,
    method: ctx.method,
    requestId: ctx.requestId,
    status,
    responseBody: body,
    durationMs,
  };

  responseLog.push(log);
  if (responseLog.length > MAX_LOG_ENTRIES) responseLog.shift();

  const bodyStr = JSON.stringify(body);
  const truncated = bodyStr.length > 200 ? bodyStr.substring(0, 200) + "..." : bodyStr;

  console.log(
    `[GYG ${ctx.endpoint}] ${ctx.method} ${ctx.requestId} → ${status} (${durationMs}ms) body=${truncated}`
  );
}

export function getLogs(): { requests: RequestLog[]; responses: ResponseLog[] } {
  return { requests: [...requestLog], responses: [...responseLog] };
}
