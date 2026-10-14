import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { isLoggedInMember } from '@/lib/session';
import type { TreasuryGrantApplication } from '@/app/treasury/treasury.types';

export const dynamic = 'force-dynamic';

function getGrantsFilePath(): string {
  const sharedDir = '/srv/moneyverse-data/shared/data';
  if (fs.existsSync('/srv/moneyverse-data/shared')) {
    if (!fs.existsSync(sharedDir)) {
      try {
        fs.mkdirSync(sharedDir, { recursive: true });
      } catch (err) {
        console.debug('[apply-grant] mkdir sharedDir error:', err);
      }
    }
    return path.join(sharedDir, 'treasury-grants.json');
  }
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (err) {
      console.debug('[apply-grant] mkdir dataDir error:', err);
    }
  }
  return path.join(dataDir, 'treasury-grants.json');
}

export function loadGrants(): TreasuryGrantApplication[] {
  try {
    const filePath = getGrantsFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as TreasuryGrantApplication[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[TreasuryGrants] Failed to read from disk:', err);
  }
  return [];
}

export function saveGrants(grants: TreasuryGrantApplication[]): void {
  try {
    const filePath = getGrantsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(grants, null, 2), 'utf-8');
  } catch (err) {
    console.error('[TreasuryGrants] Failed to write to disk:', err);
  }
}

// The legacy JSON store is retained read-only for audit of previous submissions.
export async function POST(_request: Request) {
  return NextResponse.json(
    { ok: false, message: '창업 지원금 신청은 본인 확인 및 DB 원자 기록 기능 검증 전까지 일시 중단되었습니다.' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
