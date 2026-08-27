import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ORIGINAL_ROOT = process.env.ORIGINAL_REPO ?? '/home/ruma/Woldeok-Moneyverse';
const PORTED_ROOT = join(__dirname, '..');

function digestsOf(directory: string): Map<string, string> {
  const digests = new Map<string, string>();
  for (const name of readdirSync(directory).sort()) {
    if (!name.endsWith('.sql') && !name.endsWith('.sh')) continue;
    digests.set(name, createHash('sha256').update(readFileSync(join(directory, name))).digest('hex'));
  }
  return digests;
}

function directoryExists(path: string): boolean {
  try {
    readdirSync(path);
    return true;
  } catch {
    return false;
  }
}

describe('migration parity with the original repository', () => {
  // 42, not 45: the numbering deliberately skips 041, 042 and 043. Numbers are
  // never reused, so the gap is expected and must not be "fixed".
  it('ports exactly 42 numbered migrations', () => {
    expect(digestsOf(join(PORTED_ROOT, 'migrations')).size).toBe(42);
  });

  it('preserves the deliberate numbering gap at 041 through 043', () => {
    const numbers = [...digestsOf(join(PORTED_ROOT, 'migrations')).keys()].map((name) =>
      Number(name.slice(0, 3)),
    );
    expect(numbers).not.toContain(41);
    expect(numbers).not.toContain(42);
    expect(numbers).not.toContain(43);
    expect(Math.max(...numbers)).toBe(46);
  });

  it('ports the two init scripts', () => {
    expect([...digestsOf(join(PORTED_ROOT, 'init')).keys()]).toEqual([
      '000-create-app-role.sh',
      '001-economy-core.sql',
    ]);
  });

  it.skipIf(!directoryExists(ORIGINAL_ROOT))(
    'reproduces every original SQL file byte-for-byte',
    () => {
      for (const relative of ['init', 'migrations']) {
        const original = digestsOf(join(ORIGINAL_ROOT, 'test/db', relative));
        const ported = digestsOf(join(PORTED_ROOT, relative));
        expect(ported).toEqual(original);
      }
    },
  );

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
