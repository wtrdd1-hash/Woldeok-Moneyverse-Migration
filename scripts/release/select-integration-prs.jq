# Run against each page of GitHub's open-main PR API response. Draft/WIP and
# non-allowlisted heads must never reach the expensive per-branch REST loop.
def blocked_label:
  [.labels[]?.name | ascii_downcase]
  | any(. == "wip" or . == "work-in-progress" or . == "work in progress"
    or . == "do-not-merge" or . == "do not merge" or . == "hold"
    or . == "merge-blocked" or . == "in-progress");
def blocked_title:
  (.title // "" | ascii_downcase) as $t
  | ($t | startswith("wip")) or ($t | startswith("draft"))
    or ($t | startswith("work in progress")) or ($t | startswith("작업중"));
.[]
| select(.head.repo.full_name == .base.repo.full_name)
| select(.draft == false)
| select(.head.ref | type == "string")
| select(.head.ref | test("^(feat|feature|fix|bugfix|integrate|ops|auto|test-candidate|security|docs)/"))
| select((blocked_label or blocked_title) | not)
| .head.ref
