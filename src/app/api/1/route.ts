import { NextRequest } from "next/server";
import { verifyGygAuth } from "@/lib/gyg/auth";
import { gygJson } from "@/lib/gyg/response";

export async function GET(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  return gygJson(
    {
      data: {
        supplierId: "ExperienceRelay",
        apiVersion: "1",
        status: "active",
      },
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const authError = verifyGygAuth(req);
  if (authError) return authError;

  return gygJson({ data: {} }, { status: 200 });
}
