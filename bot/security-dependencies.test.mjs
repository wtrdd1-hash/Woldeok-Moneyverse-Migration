import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { once } from 'node:events';
import test from 'node:test';

const require = createRequire(import.meta.url);
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const lock = JSON.parse(readFileSync(new URL('./package-lock.json', import.meta.url), 'utf8'));

test('Discord bot does not install vulnerable native Opus bootstrap or tar', () => {
  assert.equal(packageJson.dependencies['@discordjs/opus'], undefined);
  for (const name of ['@discordjs/opus', '@discordjs/node-pre-gyp', 'tar']) {
    assert.equal(lock.packages[`node_modules/${name}`], undefined, `${name} should not be installed`);
  }
  assert.ok(packageJson.dependencies.opusscript, 'OpusScript fallback must remain installed');
});

test('Discord REST undici is patched against known high-severity advisories', () => {
  const version = lock.packages['node_modules/undici']?.version;
  assert.ok(version, 'undici must be present in lockfile');
  const [major, minor, patch] = version.split('.').map(Number);
  assert.ok(major > 6 || (major === 6 && (minor > 29 || (minor === 29 && patch >= 1))), `unsafe undici ${version}`);
});

test('OpusScript fallback can encode and decode one 20ms stereo PCM frame', async () => {
  const prism = require('prism-media');
  const pcm = Buffer.alloc(960 * 2 * 2);
  const encoder = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
  const encoded = [];
  encoder.on('data', (chunk) => encoded.push(chunk));
  encoder.end(pcm);
  await once(encoder, 'end');
  assert.equal(encoded.length, 1);
  assert.ok(encoded[0].length > 0);
  const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
  const decoded = [];
  decoder.on('data', (chunk) => decoded.push(chunk));
  decoder.end(encoded[0]);
  await once(decoder, 'end');
  assert.equal(Buffer.concat(decoded).length, pcm.length);
});
