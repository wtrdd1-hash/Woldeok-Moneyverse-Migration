import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'backup-r2-free.sh');

test('retired backup entry point cannot execute dumps, upload plaintext, or rotate snapshots', () => {
  // CRITICAL: static check MUST precede execution. On the pre-fix script this
  // assertion fails without launching the live backup or its retention job.
  const source = readFileSync(scriptPath, 'utf8');
  assert.doesNotMatch(source, /\b(?:pg_dump|docker|sudo|aws|find|rm|mkdir|gzip|openssl|curl|wget)\b/);
  assert.match(source, /^exit 78\s*$/m);

  const sandbox = mkdtempSync(join(tmpdir(), 'moneyverse-retired-backup-'));
  try {
    for (const extra of [{}, { R2_BUCKET: 'fake', R2_ENDPOINT: 'https://example.invalid' }]) {
      const result = spawnSync('bash', [scriptPath], {
        cwd: sandbox,
        env: { ...process.env, BACKUP_DIR: join(sandbox, 'daily'), ...extra },
        encoding: 'utf8',
        timeout: 5000,
      });
      assert.equal(result.status, 78, result.stderr);
      assert.match(result.stderr, /legacy backup disabled/i);
      assert.deepEqual(readdirSync(sandbox), [], 'legacy entry point must not write or rotate files');
    }
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
