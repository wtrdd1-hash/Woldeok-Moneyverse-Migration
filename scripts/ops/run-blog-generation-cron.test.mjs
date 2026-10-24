import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const script = resolve('scripts/ops/run-blog-generation-cron.sh');

function fixture(run) {
  const dir = mkdtempSync(join(tmpdir(), 'mv-blog-cron-'));
  const file = join(dir, 'blog-cron-header');
  const curl = join(dir, 'curl');
  const log = join(dir, 'curl-argv');
  writeFileSync(curl, '#!/bin/sh\nprintf "%s\\n" "$@" > "$MOCK_CURL_LOG"\n', { mode: 0o700 });
  try {
    return run({
      file,
      log,
      execute: () => spawnSync('/bin/sh', [script], {
        encoding: 'utf8',
        env: { ...process.env, BLOG_CRON_HEADER_FILE: file, MOCK_CURL_LOG: log, PATH: `${dir}:${process.env.PATH}` },
      }),
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('missing header file fails closed before issuing HTTP request', () => fixture(({ log, execute }) => {
  const res = execute();
  assert.equal(res.status, 78);
  assert.equal(existsSync(log), false);
}));

test('group/world readable credential file fails closed', () => fixture(({ file, log, execute }) => {
  writeFileSync(file, 'x-cron-secret: dummy-credential\n');
  chmodSync(file, 0o644);
  assert.equal(execute().status, 78);
  assert.equal(existsSync(log), false);
}));

test('symlinked credential file fails closed', () => fixture(({ file, log, execute }) => {
  const target = `${file}.target`;
  writeFileSync(target, 'x-cron-secret: dummy-credential\n', { mode: 0o600 });
  symlinkSync(target, file);
  assert.equal(execute().status, 78);
  assert.equal(existsSync(log), false);
}));

test('multi-header injection fails closed', () => fixture(({ file, log, execute }) => {
  writeFileSync(file, 'x-cron-secret: dummy-credential\nX-Injected: true\n', { mode: 0o600 });
  assert.equal(execute().status, 78);
  assert.equal(existsSync(log), false);
}));

test('valid private header invokes curl without exposing credential in argv or output', () => fixture(({ file, log, execute }) => {
  writeFileSync(file, 'x-cron-secret: dummy-credential\n', { mode: 0o600 });
  const res = execute();
  assert.equal(res.status, 0, res.stderr);
  assert.equal(res.stdout, '');
  assert.doesNotMatch(res.stderr, /dummy-credential/);
  const argv = readFileSync(log, 'utf8');
  assert.match(argv, /--header\n@/);
  assert.match(argv, /http:\/\/127\.0\.0\.1:3354\/api\/blog\/generate/);
  assert.match(argv, /--request\nPOST/);
  assert.doesNotMatch(argv, /dummy-credential|x-cron-secret:/);
}));

test('backend blog scheduler never uses a hardcoded credential fallback', () => {
  const source = readFileSync(resolve('backend/src/scheduler/scheduler.module.ts'), 'utf8');
  assert.doesNotMatch(source, /moneyverse-cron-internal-key-2026/);
  assert.match(source, /if \(!secret\)/);
});
