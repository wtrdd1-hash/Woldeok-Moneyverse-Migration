/**
 * Read-only release gate: compare the actual database migration history against
 * exact SQL bytes in this checkout. Never "repair" a checksum or run migrations.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const FILENAME = /^\d{3}-[A-Za-z0-9][A-Za-z0-9_.-]*\.sql$/;
const SHA256 = /^[0-9a-f]{64}$/i;
const SELECT_APPLIED = 'SELECT filename, checksum FROM public.schema_migrations ORDER BY filename';

export function requiredReadOnlyEnv(env) {
  for (const key of ['PGHOST', 'PGPORT', 'PGUSER', 'PGDATABASE']) {
    if (!env[key] || typeof env[key] !== 'string') throw new Error(key + ' is required');
  }
  return {
    ...env,
    PGOPTIONS: [env.PGOPTIONS, '-c default_transaction_read_only=on'].filter(Boolean).join(' '),
  };
}

export function parseAppliedRows(stdout) {
  if (typeof stdout !== 'string') throw new Error('invalid migration query output');
  const lines = stdout.split('\n').filter((line) => line.length > 0);
  return lines.map((line) => {
    const fields = line.split('\t');
    if (fields.length !== 2 || fields.some((field) => field.length === 0)) {
      throw new Error('invalid migration query output');
    }
    return { filename: fields[0], checksum: fields[1] };
  });
}

export function readAppliedChecksums(env = process.env, runner = spawnSync) {
  const readOnlyEnv = requiredReadOnlyEnv(env);
  const result = runner(
    'psql',
    [
      '-X',
      '--no-password',
      '-q',
      '-A',
      '-t',
      '-F',
      '\t',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      SELECT_APPLIED,
    ],
    {
      env: readOnlyEnv,
      encoding: 'utf8',
      timeout: 30_000,
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  if (result.error || result.status !== 0 || result.signal) {
    // Do not echo psql stderr: connection errors can contain private details.
    throw new Error('read-only migration query failed');
  }
  return parseAppliedRows(result.stdout);
}

export function compareAppliedChecksums(rows, directory) {
  const source = new Map();
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isFile() && FILENAME.test(entry.name)) {
      const bytes = readFileSync(join(directory, entry.name));
      source.set(entry.name, createHash('sha256').update(bytes).digest('hex'));
    }
  }
  const seen = new Set();
  const invalid = [];
  const missing = [];
  const mismatched = [];
  let matched = 0;
  for (const row of rows) {
    if (
      !row ||
      typeof row.filename !== 'string' ||
      !FILENAME.test(row.filename) ||
      typeof row.checksum !== 'string' ||
      !SHA256.test(row.checksum) ||
      seen.has(row.filename)
    ) {
      invalid.push(typeof row?.filename === 'string' ? row.filename : '<invalid>');
      continue;
    }
    seen.add(row.filename);
    const actual = source.get(row.filename);
    if (!actual) missing.push(row.filename);
    else if (actual !== row.checksum.toLowerCase()) {
      mismatched.push({ filename: row.filename, stored: row.checksum, source: actual });
    } else matched += 1;
  }
  return {
    ok: rows.length > 0 && invalid.length === 0 && missing.length === 0 && mismatched.length === 0,
    applied: rows.length,
    matched,
    invalid,
    missing,
    mismatched,
    unapplied: [...source.keys()].filter((name) => !seen.has(name)).sort(),
  };
}

export function verifyAppliedChecksums(
  directory = join(dirname(fileURLToPath(import.meta.url)), 'migrations'),
) {
  return compareAppliedChecksums(readAppliedChecksums(), directory);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = verifyAppliedChecksums();
    console.log(
      JSON.stringify(
        {
          gate: 'applied-migration-checksum-parity',
          status: result.ok ? 'PASS' : 'BLOCKED',
          ...result,
        },
        null,
        2,
      ),
    );
    if (!result.ok) process.exitCode = 2;
  } catch (error) {
    console.error(
      JSON.stringify({
        gate: 'applied-migration-checksum-parity',
        status: 'BLOCKED',
        reason: error.message,
      }),
    );
    process.exitCode = 2;
  }
}
