import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

const LOG_FILE = "/var/log/moneyverse/frontend-errors.log";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const timestamp = new Date().toISOString();
    const route = body.route || "UNKNOWN_ROUTE";
    const errorName = body.errorName || "Error";
    const errorMessage = (body.errorMessage || "Unknown client error").replace(/\r?\n/g, " ");
    const stack = (body.stack || "").replace(/\r?\n/g, " | ");
    const userAgent = (req.headers.get("user-agent") || body.userAgent || "Unknown-UA").replace(/\r?\n/g, " ");
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const userId = body.userId || "anonymous";

    const logLine = `[${timestamp}] [CLIENT_ERROR] [ROUTE:${route}] [USER:${userId}] [IP:${ip}] [${errorName}] ${errorMessage} (UA: ${userAgent}) ${stack ? "STACK: " + stack : ""}\n`;

    try {
      fs.appendFileSync(LOG_FILE, logLine, "utf8");
    } catch (fsErr) {
      console.error("[Telemetry] Failed to append to frontend-errors.log:", fsErr);
    }

    return NextResponse.json({ ok: true, recordedAt: timestamp });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
