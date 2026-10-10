#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage: stage-host-release.sh <test|prod> <version> <40-char-sha> <clean-source-dir> [release-root]

Creates a NEW host release directory bound to one exact Git commit.
The destination is never reused or updated in place and contains no .git metadata.
EOF
  exit 64
}

[[ $# -ge 4 && $# -le 5 ]] || usage

channel="$1"
version="$2"
expected_sha="$3"
source_dir="$4"
release_root="${5:-/srv/moneyverse-data/releases}"

case "$channel" in
  test|prod) ;;
  *) echo "unsupported release channel: $channel" >&2; exit 64 ;;
esac

[[ "$version" =~ ^[A-Za-z0-9._-]+$ ]] || {
  echo "invalid release version: $version" >&2
  exit 64
}
[[ "$expected_sha" =~ ^[0-9a-f]{40}$ ]] || {
  echo "expected SHA must be 40 lowercase hexadecimal characters" >&2
  exit 64
}

source_dir="$(realpath "$source_dir")"
release_root="$(realpath -m "$release_root")"

git -C "$source_dir" rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "source directory is not a Git worktree: $source_dir" >&2
  exit 65
}

actual_sha="$(git -C "$source_dir" rev-parse HEAD)"
[[ "$actual_sha" == "$expected_sha" ]] || {
  echo "source HEAD mismatch: expected=$expected_sha actual=$actual_sha" >&2
  exit 65
}

if [[ -n "$(git -C "$source_dir" status --porcelain)" ]]; then
  echo "source worktree must be clean before staging an immutable release" >&2
  exit 65
fi

[[ -f "$source_dir/backend/dist/main.js" ]] || {
  echo "built backend artifact missing: backend/dist/main.js" >&2
  exit 66
}
[[ -f "$source_dir/frontend/.next/BUILD_ID" ]] || {
  echo "built frontend artifact missing: frontend/.next/BUILD_ID" >&2
  exit 66
}

mkdir -p "$release_root"
short_sha="${expected_sha:0:12}"
target="$release_root/${channel}-${version}-${short_sha}"
tmp="$release_root/.${channel}-${version}-${short_sha}.tmp.$$"

[[ ! -e "$target" ]] || {
  echo "immutable release already exists and will not be overwritten: $target" >&2
  exit 73
}
[[ ! -e "$tmp" ]] || {
  echo "temporary release path already exists: $tmp" >&2
  exit 73
}

cleanup() {
  rm -rf "$tmp"
}
trap cleanup EXIT

mkdir "$tmp"
cp -a "$source_dir/." "$tmp/"
rm -rf "$tmp/.git" "$tmp/.worktrees"

if find "$tmp" -name .git -print -quit | grep -q .; then
  echo "Git metadata remains inside staged release" >&2
  exit 74
fi

created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
cat > "$tmp/.moneyverse-release.json" <<EOF
{
  "schemaVersion": 1,
  "channel": "$channel",
  "version": "$version",
  "applicationSourceSha": "$expected_sha",
  "createdAt": "$created_at",
  "mutableGitCheckout": false
}
EOF

# Rename inside one filesystem so observers never see a partially copied release.
mv "$tmp" "$target"
trap - EXIT

printf '%s\n' "$target"
