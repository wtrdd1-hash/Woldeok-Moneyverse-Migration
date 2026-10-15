import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import type { TreasuryGrantApplication } from '@/app/treasury/treasury.types';

// Historical records only. Not authenticated receipts or valid payment requests.
function getGrantsFilePath(): string {
  const sharedDir = '/srv/moneyverse-data/shared/data';
  if (fs.existsSync('/srv/moneyverse-data/shared')) {
    return path.join(sharedDir, 'treasury-grants.json');
  }
  const dataDir = path.join(process.cwd(), 'data');
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
