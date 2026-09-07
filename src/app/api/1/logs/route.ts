import { NextRequest } from "next/server";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { gygJson } from "@/lib/gyg/response";
import { getLogs } from "@/lib/gyg/logger";

export async function GET(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  const logs = getLogs();
  return gygJson(logs, { status: 200 });
}
