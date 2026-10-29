import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

/**
 * Which frontend build is answering right now.
 *
 * Reads the actual .next/BUILD_ID generated during compile time to ensure
 * 100% parity with the client bundle's NEXT_PUBLIC_BUILD_ID.
 */
export const dynamic = 'force-dynamic';

let cachedBuildId: string | null = null;

function getBuildId(): string {
  if (cachedBuildId) return cachedBuildId;

  // 1. Read .next/BUILD_ID generated at build time
  try {
    const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    if (fs.existsSync(buildIdPath)) {
      const id = fs.readFileSync(buildIdPath, 'utf8').trim();
      if (id) {
        cachedBuildId = id;
        return id;
      }
    }
  } catch {
    /* fallback */
  }

  // 2. Read .build_id helper if present
  try {
    const idPath = path.join(process.cwd(), '.build_id');
    if (fs.existsSync(idPath)) {
      const id = fs.readFileSync(idPath, 'utf8').trim();
      if (id) {
        cachedBuildId = id;
        return id;
      }
    }
  } catch {
    /* fallback */
  }

  return process.env.NEXT_PUBLIC_BUILD_ID ?? process.env.BUILD_ID ?? 'unknown';
}

export function GET() {
  return NextResponse.json(
    { id: getBuildId() },
    { headers: { 'cache-control': 'no-store' } },
  );
}
