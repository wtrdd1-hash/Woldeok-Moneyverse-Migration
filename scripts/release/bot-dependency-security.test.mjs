import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const pkg = JSON.parse(readFileSync(new URL('../../bot/package.json', import.meta.url), 'utf8'));
const lock = JSON.parse(readFileSync(new URL('../../bot/package-lock.json', import.meta.url), 'utf8'));

test('CI policy rejects vulnerable native Opus/tar dependency path', () => {
  assert.equal(pkg.dependencies['@discordjs/opus'], undefined);
  assert.ok(pkg.dependencies.opusscript, 'the pure-JS voice codec must remain');
  for (const name of ['@discordjs/opus', '@discordjs/node-pre-gyp', 'tar']) {
    assert.equal(lock.packages[`node_modules/${name}`], undefined, `${name} is forbidden in the bot lockfile`);
  }
});

test('CI policy requires a patched undici in bot lockfile', () => {
  const version = lock.packages['node_modules/undici']?.version;
  assert.ok(version, 'undici must be present');
  const [major, minor, patch] = version.split('.').map(Number);
  assert.ok(major > 6 || (major === 6 && (minor > 29 || (minor === 29 && patch >= 1))), `unsafe undici ${version}`);
});
