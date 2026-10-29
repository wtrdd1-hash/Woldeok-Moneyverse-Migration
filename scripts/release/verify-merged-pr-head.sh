#!/usr/bin/env bash
# A merged PR may have been squash/stack merged. Preserve its exact head until
# Git ancestry proves the commit itself is retained by the authoritative main.
set -euo pipefail

block() {
  printf 'BLOCKED: %s\n' "$1" >&2
  exit 2
}

[[ $# -eq 3 ]] || block 'expected branch, exact PR head SHA, exact main SHA'
branch="$1"
head_sha="$2"
expected_main="$3"
[[ "$branch" != main ]] || block 'main cannot be deleted'
git check-ref-format --branch "$branch" >/dev/null 2>&1 || block 'invalid branch name'
[[ "$head_sha" =~ ^[a-f0-9]{40}$ ]] || block 'invalid exact head SHA'
[[ "$expected_main" =~ ^[a-f0-9]{40}$ ]] || block 'invalid exact main SHA'

# The fetch is read-only on GitHub. Force-refresh local remote-tracking refs so
# a stale checkout cannot falsely authorize a deletion after a branch rewrite.
git fetch --no-tags --quiet origin \
  '+refs/heads/main:refs/remotes/origin/main' \
  "+refs/heads/${branch}:refs/remotes/origin/${branch}" \
  || block 'could not independently fetch main and the original PR branch'
actual_head="$(git rev-parse "refs/remotes/origin/${branch}^{commit}" 2>/dev/null)" \
  || block 'branch does not resolve to a commit'
[[ "$actual_head" == "$head_sha" ]] || block 'head changed after the merged PR event'
actual_main="$(git rev-parse 'refs/remotes/origin/main^{commit}' 2>/dev/null)" \
  || block 'main does not resolve to a commit'
[[ "$actual_main" == "$expected_main" ]] || block 'main advanced after the deletion snapshot'

git merge-base --is-ancestor "$head_sha" "$actual_main" \
  || block 'exact merged PR head is not an ancestor of current main'
printf 'PASS: exact merged head %s is contained in main %s\n' "$head_sha" "$actual_main"
