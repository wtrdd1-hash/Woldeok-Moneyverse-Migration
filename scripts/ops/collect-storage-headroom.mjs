#!/usr/bin/env node
// Host-only, read-only statfs collector. It cannot execute commands or accept mount paths.
import { createPrivateKey, sign } from 'node:crypto';
import { closeSync, existsSync, fsyncSync, lstatSync, openSync, readFileSync, readlinkSync, renameSync, statSync, statfsSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const mounts = [
  { mountAlias: 'ROOT', path: '/' },
  { mountAlias: 'DATA', path: '/srv/moneyverse-data' },
];

function collect() {
  if (existsSync('/.dockerenv') || readFileSync('/proc/1/comm', 'utf8').trim() !== 'systemd' ||
      readlinkSync('/proc/self/ns/mnt') !== readlinkSync('/proc/1/ns/mnt')) {
    throw new Error('collector is not in the host mount namespace');
  }
  const mountpoints = new Set(readFileSync('/proc/self/mountinfo', 'utf8')
    .split('\n').filter(Boolean).map((line) => line.split(' ')[4]));
  if (mounts.some(({ path }) => !mountpoints.has(path))) throw new Error('expected host mounts are absent');
  const keyFile = process.env.MONEYVERSE_STORAGE_PRIVATE_KEY_FILE || '/etc/moneyverse/storage-evidence-ed25519-private.pem';
  const outputFile = process.env.MONEYVERSE_STORAGE_EVIDENCE_FILE || '/run/moneyverse/storage-evidence.json';
  const keyInfo = lstatSync(keyFile);
  const dirInfo = statSync(dirname(outputFile));
  if (!keyInfo.isFile() || keyInfo.size < 100 || keyInfo.size > 4096 || (keyInfo.mode & 0o027) !== 0 ||
      !dirInfo.isDirectory() || (dirInfo.mode & 0o002) !== 0) {
    throw new Error('collector key/output permissions are unsafe');
  }
  const key = readFileSync(keyFile);
  try {
    const payload = {
      schemaVersion: 1,
      sourceKind: 'HOST_SIGNED',
      bootId: readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim(),
      mountNamespace: readlinkSync('/proc/self/ns/mnt'),
      observedAt: new Date().toISOString(),
      sequence: Date.now().toString(),
      mounts: mounts.map(({ mountAlias, path }) => {
        const fs = statfsSync(path, { bigint: true });
        const bsize = fs.frsize > 0n ? fs.frsize : fs.bsize;
        return {
          mountAlias,
          blocks: fs.blocks.toString(),
          bfree: fs.bfree.toString(),
          bavail: fs.bavail.toString(),
          bsize: bsize.toString(),
          files: fs.files.toString(),
          ffree: fs.ffree.toString(),
        };
      }),
    };
    const envelope = JSON.stringify({
      payload,
      signature: sign(null, Buffer.from(JSON.stringify(payload)), createPrivateKey(key)).toString('hex'),
    });
    if (envelope.length > 8192) throw new Error('storage evidence too large');
    const temp = `${outputFile}.${process.pid}.tmp`;
    const fd = openSync(temp, 'wx', 0o640);
    try {
      writeFileSync(fd, `${envelope}\n`);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(temp, outputFile);
    process.stdout.write('Signed host storage evidence written.\n');
  } finally {
    key.fill(0);
  }
}

try {
  collect();
} catch {
  process.stderr.write('Host storage evidence collection unavailable.\n');
  process.exitCode = 1;
}
