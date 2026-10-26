import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { chmodSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const runner = resolve('scripts/security/run-blog-cron.sh');
const dummySecret = 'test-only-scheduler-secret-ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function withFixture(callback) {
  const dir = mkdtempSync(join(tmpdir(), 'mv-blog-cron-'));
  const file = join(dir, 'secret');
  const curl = join(dir, 'curl');
  writeFileSync(file, `${dummySecret}\n`, { mode: 0o600 });
  chmodSync(file, 0o600);
  writeFileSync(curl, '#!/bin/sh\nprintf "%s\\n" "$@" > "$CAPTURE_ARGS"\ncat > "$CAPTURE_STDIN"\nexit "${FAKE_CURL_EXIT:-0}"\n', { mode: 0o700 });
  chmodSync(curl, 0o700);
  const args = join(dir, 'args');
  const stdin = join(dir, 'stdin');
  const env = {
    ...process.env,
    PATH: `${dir}:${process.env.PATH ?? '/usr/bin:/bin'}`,
    MONEYVERSE_BLOG_CRON_SECRET_FILE: file,
    CAPTURE_ARGS: args,
    CAPTURE_STDIN: stdin,
  };
  try {
    callback({ dir, file, env, args, stdin });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function run(env) {
  return spawnSync('/bin/sh', [runner], { cwd: resolve('.'), env, encoding: 'utf8', timeout: 5000 });
}

test('passes scheduler credential only through curl stdin config, never argv or stdout', () => {
  withFixture(({ env, args, stdin }) => {
    assert.ok(Object.values(env).every((value) => !String(value).includes(dummySecret)));
    const result = run(env);
    assert.equal(result.status, 0, result.stderr);
    const argv = readFileSync(args, 'utf8');
    const config = readFileSync(stdin, 'utf8');
    assert.match(argv, /^-q\n--config\n-\n/);
    assert.match(argv, /--request\nPOST\n/);
    assert.match(argv, /https:\/\/easy-scraping\.com\/api\/blog\/generate/);
    assert.doesNotMatch(argv, /test-only-scheduler-secret/);
    assert.match(config, /header = "x-cron-secret: test-only-scheduler-secret-ABCDEFGHIJKLMNOPQRSTUVWXYZ"/);
    assert.doesNotMatch(result.stdout + result.stderr, /test-only-scheduler-secret/);
  });
});

test('fails closed when credential file is missing', () => {
  withFixture(({ env, dir }) => {
    const result = run({ ...env, MONEYVERSE_BLOG_CRON_SECRET_FILE: join(dir, 'missing') });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /credential file/i);
  });
});

test('fails closed when credential file is group readable', () => {
  withFixture(({ env, file }) => {
    chmodSync(file, 0o640);
    const result = run(env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /permission|mode/i);
  });
});

test('rejects symlinked credential files', () => {
  withFixture(({ env, file, dir }) => {
    const link = join(dir, 'secret-link');
    symlinkSync(file, link);
    const result = run({ ...env, MONEYVERSE_BLOG_CRON_SECRET_FILE: link });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /credential file/i);
  });
});

test('rejects newline and header injection payloads', () => {
  withFixture(({ env, file }) => {
    writeFileSync(file, `${dummySecret}\nX-Injected: true\n`, { mode: 0o600 });
    const result = run(env);
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stderr + result.stdout, /test-only-scheduler-secret/);
  });
});

test('propagates curl failure without echoing the credential', () => {
  withFixture(({ env }) => {
    const result = run({ ...env, FAKE_CURL_EXIT: '22' });
    assert.equal(result.status, 22);
    assert.doesNotMatch(result.stderr + result.stdout, /test-only-scheduler-secret/);
  });
});


test('rejects missing secret-file configuration without a fallback', () => {
  withFixture(({ env }) => {
    const { MONEYVERSE_BLOG_CRON_SECRET_FILE: _omitted, ...withoutFile } = env;
    const result = run(withoutFile);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /credential file/i);
  });
});

test('rejects credentials shorter than 32 characters', () => {
  withFixture(({ env, file }) => {
    writeFileSync(file, 'short-credential\n', { mode: 0o600 });
    const result = run(env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /credential file/i);
  });
});


test('real curl parses the piped header config without placing the secret in argv', async () => {
  let received;
  const server = createServer((req, res) => {
    received = req.headers['x-cron-secret'];
    res.writeHead(204);
    res.end();
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const port = server.address().port;
    const argv = ['--config', '-', '--silent', '--show-error', '--fail', '--max-time', '5', '--request', 'POST', '--url', `http://127.0.0.1:${port}/test-only`];
    assert.doesNotMatch(argv.join(' '), /test-only-scheduler-secret/);
    const code = await new Promise((resolve, reject) => {
      const child = spawn('curl', argv, { stdio: ['pipe', 'ignore', 'pipe'] });
      let stderr = '';
      child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
      child.on('error', reject);
      child.on('close', (status) => status === 0 ? resolve(status) : reject(new Error(`curl exit ${status}: ${stderr}`)));
      child.stdin.end(`header = "x-cron-secret: ${dummySecret}"\n`);
    });
    assert.equal(code, 0);
    assert.equal(received, dummySecret);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
