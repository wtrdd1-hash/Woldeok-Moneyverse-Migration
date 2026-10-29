import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const REQUIRED = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE', 'APP_DB_PASSWORD'];

export function requiredDatabaseEnv(env) {
  for (const name of REQUIRED) {
    if (!env[name]) throw new Error(`${name} is required`);
  }
  return {
    PGHOST: env.PGHOST,
    PGPORT: env.PGPORT,
    PGUSER: env.PGUSER,
    PGDATABASE: env.PGDATABASE,
    APP_DB_PASSWORD: env.APP_DB_PASSWORD,
  };
}

export function listMigrationFiles(dir) {
  const names = readdirSync(dir)
    .filter((name) => /^\d{3}-.*\.sql$/.test(name))
    .sort();
  const seen = new Set();
  for (const name of names) {
    const number = Number(name.slice(0, 3));
    if (seen.has(number)) throw new Error(`duplicate migration number ${number}: ${name}`);
    seen.add(number);
  }
  return names.map((name) => join(dir, name));
}

/** Abort before any SQL if the source lineage is not exactly 002..N. */
export function assertContiguousMigrationSequence(files) {
  if (files.length === 0) throw new Error('missing migration 002: empty migration directory');
  for (const [index, path] of files.entries()) {
    const expected = index + 2;
    const actual = Number(basename(path).slice(0, 3));
    if (actual !== expected) {
      throw new Error(`migration sequence gap: expected ${String(expected).padStart(3, '0')}, found ${String(actual).padStart(3, '0')}`);
    }
  }
}

export function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function sqlLiteral(value) {
  return "'" + String(value).replaceAll("'", "''") + "'";
}

function runPsql(args = [], input) {
  const result = spawnSync(
    'psql',
    ['-X', '-v', 'ON_ERROR_STOP=1', ...args],
    {
      env: process.env,
      encoding: 'utf8',
      input,
      stdio: input === undefined ? 'inherit' : ['pipe', 'inherit', 'inherit'],
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`psql failed with exit code ${result.status}`);
}

export function applyFreshCiDatabase(rootDir = dirname(fileURLToPath(import.meta.url))) {
  const migrationsDir = join(rootDir, 'migrations');
  const migrations = listMigrationFiles(migrationsDir);
  assertContiguousMigrationSequence(migrations);
  const env = requiredDatabaseEnv(process.env);
  const coreSql = join(rootDir, 'init', '001-economy-core.sql');

  runPsql([], `
CREATE ROLE moneyverse_app LOGIN PASSWORD ${sqlLiteral(env.APP_DB_PASSWORD)}
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
`);

  runPsql(['-f', coreSql]);

  runPsql([], `
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  filename text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
`);

  for (const migration of migrations) {
    const filename = migration.split('/').pop();
    const checksum = sha256File(migration);
    console.log(`Applying migration: ${filename}`);
    runPsql(['-f', migration]);
    runPsql([], `
INSERT INTO public.schema_migrations (filename, checksum)
VALUES (${sqlLiteral(filename)}, ${sqlLiteral(checksum)});
`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  applyFreshCiDatabase();
}
