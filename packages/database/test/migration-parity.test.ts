import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const PORTED_ROOT = join(__dirname, '..');

interface ProductionManifest {
  readonly source: string;
  readonly readAt: string;
  readonly migrations: Record<string, string>;
}

/**
 * The authoritative baseline is the production database, not a git checkout.
 *
 * The branch this repository was ported from did not contain 041, 042 or 043
 * at all. An earlier version of this test compared the ported files against
 * that same checkout, so it agreed with itself and reported a complete port
 * while three migrations were missing — including one that redefines
 * `grant_bootstrap_discord_administrator`, which the application calls.
 *
 * `production-checksums.json` was read from `public.schema_migrations` on the
 * live production database. `migrate.sh` refuses to run a migration whose
 * sha256 differs from the recorded one, so any mismatch here is a deployment
 * that would fail, not a formatting difference.
 */
const MANIFEST = JSON.parse(
  readFileSync(join(PORTED_ROOT, 'production-checksums.json'), 'utf8'),
) as ProductionManifest;

function portedDigests(directory: string): Map<string, string> {
  const digests = new Map<string, string>();
  for (const name of readdirSync(directory).sort()) {
    if (!name.endsWith('.sql') && !name.endsWith('.sh')) continue;
    digests.set(name, createHash('sha256').update(readFileSync(join(directory, name))).digest('hex'));
  }
  return digests;
}

describe('migration parity with the production database', () => {
  const ported = portedDigests(join(PORTED_ROOT, 'migrations'));

  it('ports every migration production has applied', () => {
    const missing = Object.keys(MANIFEST.migrations).filter((name) => !ported.has(name));
    expect(missing, 'applied in production but absent here').toEqual([]);
  });

  /**
   * The manifest is a floor, not an exact match. Everything production has
   * applied must be here and unchanged; migrations numbered above it are new
   * work and are how the project moves forward. What must never happen is a
   * new file claiming a number production already used, because migrate.sh
   * matches on filename and would skip it as already applied.
   */
  it('numbers every new migration above the production baseline', () => {
    const baseline = Math.max(
      ...Object.keys(MANIFEST.migrations).map((name) => Number(name.slice(0, 3))),
    );
    const tooLow = [...ported.keys()]
      .filter((name) => name.endsWith('.sql') && !(name in MANIFEST.migrations))
      .filter((name) => Number(name.slice(0, 3)) <= baseline);
    expect(tooLow, `a new migration must be numbered above ${baseline}`).toEqual([]);
  });

  it('reproduces every migration byte-for-byte', () => {
    const mismatched = [...ported.entries()]
      .filter(([name, digest]) => name in MANIFEST.migrations && MANIFEST.migrations[name] !== digest)
      .map(([name]) => name);
    expect(mismatched, 'same name, different bytes — migrate.sh would refuse these').toEqual([]);
  });

  it('carries a contiguous, duplicate-free sequence from 002', () => {
    const numbers = [...ported.keys()]
      .filter((name) => name.endsWith('.sql'))
      .map((name) => Number(name.slice(0, 3)))
      .sort((a, b) => a - b);
    const expected = Array.from({ length: numbers.length }, (_, index) => index + 2);
    expect(numbers, 'a gap or a repeated number').toEqual(expected);
  });

  it('ports the two init scripts', () => {
    expect([...portedDigests(join(PORTED_ROOT, 'init')).keys()]).toEqual([
      '000-create-app-role.sh',
      '001-economy-core.sql',
    ]);
  });

  it('rejects schema-qualified SQL constructs outside immutable legacy migrations', () => {
    const legacy = new Set([
      '018-economy-reconciliation-health.sql',
      '030-discord-outbox-delivery-lease.sql',
      '040-virtual-stock-corporate-actions.sql',
      '041-virtual-bank-auto-interest.sql',
      '178-business-settlement-v2-idempotency.sql',
    ]);
    const offenders: string[] = [];
    const pattern = /pg_catalog\.(?:coalesce|greatest|least|nullif|extract)\s*\(/i;
    const directory = join(PORTED_ROOT, 'migrations');

    for (const name of readdirSync(directory).sort()) {
      if (!name.endsWith('.sql') || legacy.has(name)) continue;
      if (pattern.test(readFileSync(join(directory, name), 'utf8'))) offenders.push(name);
    }

    expect(offenders, 'SQL constructs must not be schema-qualified').toEqual([]);
  });

  // An unpinned SECURITY DEFINER function is a privilege-escalation
  // primitive: it runs as its owner with whatever search_path the caller
  // chose, so a caller can shadow a referenced object with one of their own.
  it('pins every SECURITY DEFINER function search_path', () => {
    const offenders: string[] = [];
    const directory = join(PORTED_ROOT, 'migrations');
    for (const name of readdirSync(directory).sort()) {
      if (!name.endsWith('.sql')) continue;
      const sql = readFileSync(join(directory, name), 'utf8');
      for (const definer of sql.match(/SECURITY DEFINER[\s\S]{0,200}?(?=AS \$)/g) ?? []) {
        if (!/SET\s+search_path/i.test(definer)) offenders.push(name);
      }
    }
    expect(offenders).toEqual([]);
  });
});
