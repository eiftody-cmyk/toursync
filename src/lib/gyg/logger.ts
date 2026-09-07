import type { NextRequest } from "next/server";

interface LogContext {
  endpoint: string;
  method: string;
  requestId: string;
}

interface ResponseLog {
  endpoint: string;
  requestId: string;
  status: number;
  durationMs: number;
}

const responseLog: ResponseLog[] = [];

const MAX_LOG_ENTRIES = 50;

export function createGygLogger(endpoint: string, req: NextRequest): LogContext {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return { endpoint, method: req.method, requestId };
}

export function logResponse(
  ctx: LogContext,
  status: number,
  body: unknown,
  startTime: number
): void {
  const durationMs = Date.now() - startTime;

  responseLog.push({ endpoint: ctx.endpoint, requestId: ctx.requestId, status, durationMs });
  if (responseLog.length > MAX_LOG_ENTRIES) responseLog.shift();

  console.log(`[GYG ${ctx.endpoint}] ${ctx.method} ${ctx.requestId} → ${status} (${durationMs}ms)`);
}

export function getLogs(): { responses: ResponseLog[] } {
  return { responses: [...responseLog] };
}
