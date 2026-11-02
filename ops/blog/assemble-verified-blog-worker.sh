#!/usr/bin/env bash
# v2026.11.02.1624 — Create a portable, isolated release for the verified blog publisher.
# Usage: assemble-verified-blog-worker.sh <trusted_workspace> <base_release> <target_release>
# Does not change the active release pointer, systemd, Nginx, or any database.
set -Eeuo pipefail
if [ "$#" -ne 3 ]; then echo "usage: $0 <trusted_workspace> <base_release> <target_release>" >&2; exit 64; fi
source_root="$(realpath "$1")"
base_release="$(realpath "$2")"
target="$3"
if [ -e "$target" ] || [ -L "$target" ]; then echo "target already exists: $target" >&2; exit 65; fi
for p in "$source_root/pnpm-lock.yaml" "$source_root/backend/package.json" "$source_root/node_modules/.pnpm" "$source_root/backend/node_modules" "$source_root/packages/contract/dist" "$source_root/packages/contract/package.json" "$base_release/backend/package.json" "$base_release/backend/dist/blog-editorial/blog-standalone-worker.js"; do
  test -e "$p" || { echo "missing source: $p" >&2; exit 66; }
done
if ! cmp -s "$source_root/backend/package.json" "$base_release/backend/package.json"; then
  echo "trusted backend manifest differs from target release" >&2; exit 67
fi
if ! cmp -s "$source_root/backend/dist/blog-editorial/blog-standalone-worker.js" "$base_release/backend/dist/blog-editorial/blog-standalone-worker.js"; then
  echo "trusted compiled worker differs from target release" >&2; exit 68
fi
if ! test -e "$source_root/backend/node_modules/reflect-metadata"; then
  echo "source dependencies are not fully linked" >&2; exit 69
fi
free_kib="$(df -Pk "$(dirname "$target")" | awk 'END {print $4}')"
if [ "$free_kib" -lt 2097152 ]; then echo "less than 2GiB available: refusing" >&2; exit 70; fi
mkdir -p "$target/backend" "$target/node_modules" "$target/packages/contract"
# Copy virtual store within the *new release*. Never link production to a mutable checkout
# or to an older release that may be garbage-collected.
cp -a "$source_root/node_modules/.pnpm" "$target/node_modules/.pnpm"
cp -a "$source_root/backend/node_modules" "$target/backend/node_modules"
cp -a "$base_release/backend/package.json" "$target/backend/package.json"
cp -a "$base_release/backend/dist" "$target/backend/dist"
cp -a "$source_root/packages/contract/dist" "$target/packages/contract/dist"
cp -a "$source_root/packages/contract/package.json" "$target/packages/contract/package.json"
# Two required runtime resolutions and a load-only test. No env/DB/network access here.
(cd "$target/backend" && node - <<'NODE'
const path = require('node:path');
const assert = require('node:assert/strict');
for (const mod of ['reflect-metadata', 'pg', '@moneyverse/contract']) {
  const resolved = require.resolve(mod);
  assert.ok(resolved.startsWith(process.cwd().replace(/\\/g,'/').replace(/\\/g,'/').replace(/\\/g,'/').split('/backend')[0]), 'external dependency path: ' + resolved);
  console.log('RESOLVED', mod, resolved);
}
const w = require('./dist/blog-editorial/blog-standalone-worker.js');
assert.equal(typeof w.publishAutomaticBlogWindow, 'function');
assert.equal(typeof w.activePublicationWindow, 'function');
const nov2 = w.activePublicationWindow(new Date('2026-11-02T13:00:00Z'));
assert.ok(Number.isFinite(nov2.getTime()), 'window selection');
console.log('VERIFIED_WORKER_LOAD_OK');
NODE
)
sha256sum "$target/backend/dist/blog-editorial/blog-standalone-worker.js" > "$target/WORKER_SHA256"
sha256sum "$source_root/pnpm-lock.yaml" > "$target/SOURCE_LOCK_SHA256"
echo "COMPLETE_RELEASE=$target"
