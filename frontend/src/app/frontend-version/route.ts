import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

/**
 * Which frontend build is answering right now.
 *
 * Ensures 100% parity with client bundle's NEXT_PUBLIC_BUILD_ID.
 */
export const dynamic = 'force-dynamic';

let cachedBuildId: string | null = null;

function getBuildId(): string {
  if (cachedBuildId) return cachedBuildId;

  // 1. Check process.env.NEXT_PUBLIC_BUILD_ID directly
  if (process.env.NEXT_PUBLIC_BUILD_ID && process.env.NEXT_PUBLIC_BUILD_ID.trim() !== '') {
    cachedBuildId = process.env.NEXT_PUBLIC_BUILD_ID.trim();
    return cachedBuildId;
  }

  // 2. Read NEXT_PUBLIC_BUILD_ID from .next/required-server-files.json
  try {
    const requiredServerFilesPath = path.join(process.cwd(), '.next', 'required-server-files.json');
    if (fs.existsSync(requiredServerFilesPath)) {
      const content = fs.readFileSync(requiredServerFilesPath, 'utf8');
      const parsed = JSON.parse(content) as { config?: { env?: { NEXT_PUBLIC_BUILD_ID?: string } } };
      const envBuildId = parsed?.config?.env?.NEXT_PUBLIC_BUILD_ID;
      if (typeof envBuildId === 'string' && envBuildId.trim() !== '') {
        cachedBuildId = envBuildId.trim();
        return cachedBuildId;
      }
    }
  } catch {
    /* fallback */
  }

  // 3. Read .build_id helper
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

  // 4. Read .next/BUILD_ID generated at build time
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

  return process.env.BUILD_ID ?? 'unknown';
}

export function GET() {
  return NextResponse.json(
    { id: getBuildId() },
    { headers: { 'cache-control': 'no-store' } },
  );
}
