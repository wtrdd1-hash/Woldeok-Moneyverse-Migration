import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveRuntimeBuildId } from './runtime-version';

describe('exact backend runtime release identity', () => {
  const dirs: string[] = [];
  afterEach(() => {
    while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
  });
  it('prefers an explicit build SHA when present', () => {
    const sha = 'a'.repeat(40);
    expect(resolveRuntimeBuildId(sha, '/does/not/exist')).toBe(sha);
  });
  it('reads the immutable deployed release manifest when build env is absent', () => {
    const dir = mkdtempSync(join(tmpdir(), 'wdmv-v639-')); dirs.push(dir);
    const sha = 'b'.repeat(40);
    writeFileSync(join(dir, '.moneyverse-release.json'), JSON.stringify({ applicationSourceSha: sha }));
    expect(resolveRuntimeBuildId(undefined, dir)).toBe(sha);
  });
  it('does not invent a version for absent or malformed manifests', () => {
    const dir = mkdtempSync(join(tmpdir(), 'wdmv-v639-')); dirs.push(dir);
    expect(resolveRuntimeBuildId(undefined, dir)).toBe('unknown');
    writeFileSync(join(dir, '.moneyverse-release.json'), '{ invalid');
    expect(resolveRuntimeBuildId(undefined, dir)).toBe('unknown');
  });
});
