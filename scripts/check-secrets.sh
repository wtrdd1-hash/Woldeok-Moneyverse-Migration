#!/bin/sh
# Nothing in this repository is a credential. Every secret is generated on the
# host by deploy/bootstrap-env.sh, copied host-locally from another container,
# or held by GitHub -- so a credential appearing in a tracked file is always a
# mistake, and the cheapest place to catch it is before the first build step.
#
# This is a floor, not a full scanner: it reads the working tree, not the
# history, so a secret that was committed and then removed is still in the
# history and still has to be rotated. It is here rather than as a hosted
# action because it can be run and read locally, and because it can encode this
# repository's own conventions -- which is what keeps it quiet enough to be
# believed:
#
#   - a value that is an environment reference (${VAR}) is not a secret;
#   - a credential named ci_* is a throwaway constant for the CI Postgres
#     service and appears in .github/workflows/ci.yml on purpose;
#   - a placeholder (CHANGE_ME, <token>, GENERATE_A_..., USER:PASSWORD@HOST)
#     is documentation. The specification quotes an example .env, and a
#     scanner that reports the example is a scanner people learn to ignore --
#     which costs more than the narrow forms allowed here. Each allowed
#     placeholder is a SCREAMING_CASE word that says what it is, so a real
#     credential cannot take the shape by accident.
#
# Adding a real credential to any of those forms defeats this check, so the
# rule is the convention itself: CI credentials are named ci_*, and everything
# else is a reference.
set -eu

fail=0

# Anything matching this is a form the conventions above allow. It is applied
# to whole grep output lines, so it covers the file name as well as the value.
allowed='\$\{|\$\(|<[A-Za-z_ -]+>|CHANGE_ME|GENERATE_A_[A-Z_]+|USER:PASSWORD@HOST|\bci_[a-z0-9_]+|:'"'"'[a-z_]+'"'"'|process\.env'

scan() {
  pattern="$1"
  message="$2"
  # -I skips binary files; the lockfile and the checksum manifest are text and
  # are scanned like everything else.
  hits="$(git ls-files -z | xargs -0 grep -InE -- "$pattern" 2>/dev/null || true)"
  hits="$(printf '%s' "$hits" | grep -vE "$allowed" || true)"
  if [ -n "$hits" ]; then
    printf '%s\n' "$hits" >&2
    echo "^ $message" >&2
    fail=1
  fi
}

# A real .env is written on the host and never travels. .gitignore already
# refuses one; `git add -f` does not, and this is the case that matters most.
env_files="$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -vE '\.example$' || true)"
if [ -n "$env_files" ]; then
  printf '%s\n' "$env_files" >&2
  echo '^ a real .env file is tracked: it belongs on the host, written by deploy/bootstrap-env.sh' >&2
  fail=1
fi

# Runtime databases, dumps, backups and backend-generated exports belong on the
# host or backup storage, never in Git. This also catches `git add -f`, which
# .gitignore alone cannot prevent. SQL source migrations are intentionally not
# matched; only dump/compressed-data shapes and runtime data paths are blocked.
data_files="$(git ls-files | grep -E '(^|/)(backend/(data|storage|uploads|backups)/|backups/)|\.(dump|backup|db|sqlite|sqlite3)(\.gz)?$|\.sql\.(gz|zst|xz)$|^backend/.*\.(csv|jsonl|ndjson|log|bak)$' || true)"
if [ -n "$data_files" ]; then
  printf '%s\n' "$data_files" >&2
  echo '^ backend runtime data or a database backup is tracked: keep only code/schema in Git' >&2
  fail=1
fi

scan '\-\-\-\-\-BEGIN [A-Z ]*PRIVATE KEY\-\-\-\-\-' \
  'a private key block'

# Shapes that cannot be anything but a live credential. Each is anchored on the
# provider's own prefix rather than on entropy, which is what keeps a sha256 in
# production-checksums.json from being reported every run.
scan 'gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}' \
  'a GitHub token'
scan 'AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}' \
  'a cloud provider key'
scan 'xox[abprs]-[0-9A-Za-z-]{10,}|https://hooks\.slack\.com/services/' \
  'a Slack credential'
scan 'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}' \
  'a signed JWT'

# A password inside a connection URL. This is how a DATABASE_URL leaks, and
# compose.yml and the CI workflow both hold URLs whose password is a reference
# or a ci_* constant, which the allowlist above passes.
scan '://[A-Za-z0-9._%+-]+:[^@/[:space:]"'"'"']{6,}@' \
  'a credential inside a URL'

# A secret-named setting given a value long enough to be a generated one.
# bootstrap-env.sh writes 64 hex characters; the shortest thing the API accepts
# as INTERNAL_API_TOKEN is 32. Twenty-four is below both and above every
# placeholder and ci_* constant in the tree.
scan '[A-Z_]*(PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY|ENCRYPTION_KEY)[A-Z_]*[[:space:]]*[:=][[:space:]>]*.?[A-Za-z0-9+/=_-]{24,}' \
  'a secret-named setting with a generated-looking value'

if [ "$fail" != 0 ]; then
  echo 'rotate whatever was found, then remove it from the history -- deleting the line is not enough' >&2
  exit 1
fi

echo 'no committed secret found'
