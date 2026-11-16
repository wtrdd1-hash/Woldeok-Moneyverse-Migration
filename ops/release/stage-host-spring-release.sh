#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo 'Usage: stage-host-spring-release.sh <test|prod> <version> <40-char-sha> <clean-source-dir> [release-root]' >&2
  exit 64
}
[[ $# -ge 4 && $# -le 5 ]] || usage
channel="$1"
version="$2"
sha="$3"
source_dir="$(realpath "$4")"
release_root="$(realpath -m "${5:-/srv/moneyverse-data/releases}")"
[[ "$channel" == test || "$channel" == prod ]] || usage
[[ "$version" =~ ^v[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[0-9]{1,4}$ ]] || usage
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || usage
[[ -d "$source_dir/.git" || -f "$source_dir/.git" ]] || { echo 'Not a Git source' >&2; exit 65; }
[[ "$(git -C "$source_dir" rev-parse HEAD)" == "$sha" ]] || { echo 'Source SHA mismatch' >&2; exit 65; }
[[ -z "$(git -C "$source_dir" status --porcelain)" ]] || { echo 'Source worktree is not clean' >&2; exit 65; }
jar="$source_dir/spring-backend/build/libs/moneyverse-spring-backend-0.0.1-SNAPSHOT.jar"
build_id_file="$source_dir/frontend/.next/BUILD_ID"
[[ -s "$jar" && -s "$build_id_file" ]] || { echo 'Missing compiled Spring or Next artifact' >&2; exit 66; }
[[ "$(cat "$build_id_file")" == "$sha" ]] || { echo 'Next BUILD_ID does not match source SHA' >&2; exit 66; }

mkdir -p "$release_root"
target="$release_root/${channel}-${version}-${sha:0:12}"
tmp="$release_root/.${channel}-${version}-${sha:0:12}.tmp.$$"
[[ ! -e "$target" && ! -e "$tmp" ]] || { echo 'Immutable target already exists' >&2; exit 73; }
trap 'rm -rf -- "$tmp"' EXIT
mkdir -p "$tmp/backend" "$tmp/frontend" "$tmp/packages"
install -m 0644 "$jar" "$tmp/backend/moneyverse-spring-backend.jar"
rsync -a --exclude='.env' --exclude='.env.local' --exclude='.env.production' --exclude='.env.test' --exclude='.next/cache/***' \
  "$source_dir/frontend/" "$tmp/frontend/"
cp -a "$source_dir/node_modules" "$tmp/node_modules"
rsync -a --exclude='.env*' "$source_dir/packages/" "$tmp/packages/"
cp -a "$source_dir/package.json" "$source_dir/pnpm-lock.yaml" "$source_dir/pnpm-workspace.yaml" "$tmp/"
[[ -s "$tmp/backend/moneyverse-spring-backend.jar" && "$(cat "$tmp/frontend/.next/BUILD_ID")" == "$sha" ]] || {
  echo 'Staged artifact attestation failed' >&2; exit 74;
}
if find "$tmp" -name .git -print -quit | grep -q .; then
  echo 'Git metadata remains in artifact' >&2; exit 74
fi
created_at="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
jar_hash="$(sha256sum "$tmp/backend/moneyverse-spring-backend.jar" | cut -d' ' -f1)"
cat > "$tmp/.moneyverse-release.json" <<MANIFEST
{
  "schemaVersion": 1,
  "channel": "$channel",
  "version": "$version",
  "applicationSourceSha": "$sha",
  "createdAt": "$created_at",
  "mutableGitCheckout": false,
  "runtime": "Spring Boot + Next.js",
  "backendArtifact": "backend/moneyverse-spring-backend.jar",
  "backendArtifactSha256": "$jar_hash"
}
MANIFEST
mv -- "$tmp" "$target"
trap - EXIT
printf '%s\n' "$target"
