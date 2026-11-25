import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "fs";
import { allowTelemetry } from "@/lib/telemetry-rate-limit";
import { isSameOriginFinanceMutation } from '@/lib/finance-mutation-origin';

const LOG_FILE = "/var/log/moneyverse/frontend-errors.log";
const MAX_BYTES = 8192;

/*
 * Origin stops browsers, not scripts (independent review 2026-11-25), so the
 * log is also bounded per client: at most 20 lines a minute per address, and
 * the body is read with a byte cap instead of buffering it whole first.
 */
async function readCapped(req: Request): Promise<string | null> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BYTES) return null;
  const reader = req.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(req: NextRequest) {
  // Same-origin only (QA 2026-11-25): the BFF spends its own CSRF token, so
  // the Origin check is the only cross-site defence for this write.
  if (!isSameOriginFinanceMutation(req)) {
    return NextResponse.json({ error: '요청 출처가 허용되지 않았습니다.' }, { status: 403, headers: { 'cache-control': 'private, no-store' } });
  }
  try {
    // Bounded, single-line fields only (QA 2026-11-25): the endpoint is public,
    // so a body can neither fill the disk nor forge log lines or a user id.
    const client = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "local";
    if (!allowTelemetry(client)) return NextResponse.json({ ok: false }, { status: 429 });
    const raw = await readCapped(req);
    if (raw === null) return NextResponse.json({ ok: false }, { status: 413 });
    const body = JSON.parse(raw) as Record<string, unknown>;
    const clean = (v: unknown, max: number, fallback: string) =>
      (typeof v === 'string' && v ? v : fallback).replace(/[\r\n\t]+/g, " ").replace(/[[\]]/g, "").slice(0, max);
    const timestamp = new Date().toISOString();
    const route = clean(body.route, 200, "UNKNOWN_ROUTE");
    const errorName = clean(body.errorName, 80, "Error");
    const errorMessage = clean(body.errorMessage, 500, "Unknown client error");
    const stack = clean(body.stack, 2000, "").replace(/ {2,}/g, " ");
    const userAgent = clean(req.headers.get("user-agent"), 300, "Unknown-UA");
    const ip = clean(req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for"), 100, "127.0.0.1");
    const userId = "client-reported";

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
