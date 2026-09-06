import { NextResponse } from "next/server";

export async function GET() {
  const u = process.env.GYG_INBOUND_USERNAME;
  const p = process.env.GYG_INBOUND_PASSWORD;
  
  // Test decode what GYG would send
  const testAuth = "Basic " + Buffer.from("ExperienceRelay:P421105x#").toString("base64");
  const decoded = Buffer.from(testAuth.split(" ")[1], "base64").toString();
  const colonIndex = decoded.indexOf(":");
  const sentUser = decoded.substring(0, colonIndex);
  const sentPass = decoded.substring(colonIndex + 1);
  
  return NextResponse.json({
    storedUsername: u,
    storedPassword: p,
    sentUsername: sentUser,
    sentPassword: sentPass,
    userMatch: u === sentUser,
    passMatch: p === sentPass,
    storedUserChars: u ? Array.from(u).map((c) => c.charCodeAt(0)) : null,
    storedPassChars: p ? Array.from(p).map((c) => c.charCodeAt(0)) : null,
    sentPassChars: Array.from(sentPass).map((c) => c.charCodeAt(0)),
  });
}
