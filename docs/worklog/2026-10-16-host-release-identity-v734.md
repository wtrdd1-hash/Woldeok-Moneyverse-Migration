# v734 — Host release identity fix: start, intermediate, closure record

## START
- 2026-10-16 around 19:42 KST: on authorized miniPC, inspected latest GitHub main, full master, release procedure and current service manifests.
- Initial source `main=2d153ec3486d9d7b1e51a4b811abb67cf3569568`. Production public v717 `176ca04e`, Test public v721.2 `10d5dfdb`.
- PR #886 ready but behind, based on old v712-only live assumptions; finance PR #892 draft and conflicting, with 221 raw-app-write tables and authoritative Test financial gaps.
- Created isolated integration worktree `/srv/moneyverse-tasks/release-identity-v726/source`; no concurrent owners' branches modified. Local start log `/srv/moneyverse-tasks/release-identity-v726/start.log`.

## INTERMEDIATE
- Merged read-only #886 code into current main without conflicts; reviewed release verifier/tests and bilingual operational instructions.
- Ran exact live Production and Test release-identity verifier with `sudo node`, both `ok=true, failures=[]`.
- Ran release regression suite 29/29 PASS. Reserved v734 because collaborators had committed planning branches v723 through v733.
- Confirmed neither Nginx nor Test/Production pointers nor finances, schema, sessions were modified.

## END / acceptance
- The code PR's fresh CI and integration status are authoritative GitHub checks; they are separate from existing runtime-identity observations.
- The remaining app/finance/UI release gates cannot be marked passed by this read-only preflight. Production v717 and Test v721.2 remain unchanged.
- [Release notes](../releases/v2026.10.16.734.md) and paired updates are part of this record.

## FINAL (2026-10-16 KST)
- PR #894 merged into main `81133c9aaddad36cb829676d6e14089848ba1765`; PR #886's original `41b987ad` source commit is contained in main and GitHub marked it merged. Both remote branches deleted following ancestry/unchanged-SHA checks.
- Branch CI #38889685103 and Build Test Candidate #38889653864 PASS. Postmerge main CI #38889810247 and Build Test Candidate #38889810204 PASS. Control-plane-only runtime build correctly skipped; no code deployment was requested by this CI classification.
- Production v717 and Test v721.2 retained unchanged. Draft monetary #892, 221 direct-write table privileges and full authenticated UI/finance release gates remain blocked.
