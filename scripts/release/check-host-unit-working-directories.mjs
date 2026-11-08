#!/usr/bin/env node
// Read-only preflight: fail closed on missing systemd WorkingDirectory paths.
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

export function inspectUnit(unit, show, exists = (directory) => statSync(directory).isDirectory()) {
  const properties = Object.fromEntries(show.split('\n').filter(Boolean).map((line) => {
    const at = line.indexOf('=');
    return [line.slice(0, at), line.slice(at + 1)];
  }));
  if (properties.LoadState && properties.LoadState !== 'loaded') return { unit, status: 'UNIT_NOT_LOADED' };
  const directory = properties.WorkingDirectory;
  if (!directory || !directory.startsWith('/')) return { unit, status: 'INVALID_DIRECTORY', directory };
  try {
    if (!exists(directory)) return { unit, status: 'MISSING_DIRECTORY', directory };
  } catch (error) {
    if (error.code === 'ENOENT') return { unit, status: 'MISSING_DIRECTORY', directory };
    return { unit, status: 'UNVERIFIED_DIRECTORY', directory };
  }
  return { unit, status: 'OK', directory };
}

export function checkUnits(units, showUnit, exists) {
  return units.map((unit) => inspectUnit(unit, showUnit(unit), exists));
}

if (process.argv[1]?.endsWith('/check-host-unit-working-directories.mjs')) {
  const units = process.argv.slice(2);
  if (!units.length) {
    console.error('Usage: node check-host-unit-working-directories.mjs <explicit-systemd-unit> [...]');
    process.exitCode = 64;
  } else {
    const results = units.map((unit) => {
      if (!/^[A-Za-z0-9_.@-]+\.service$/.test(unit)) return { unit, status: 'INVALID_UNIT' };
      try {
        return inspectUnit(unit, execFileSync('systemctl', ['show', unit, '--property=WorkingDirectory', '--property=LoadState'], { encoding: 'utf8', timeout: 5000 }));
      } catch { return { unit, status: 'UNVERIFIED_UNIT' }; }
    });
    for (const result of results) console.log(JSON.stringify(result));
    if (results.some((result) => result.status !== 'OK')) process.exitCode = 1;
  }
}
