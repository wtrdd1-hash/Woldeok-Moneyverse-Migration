# v2026.11.10.1949 — Treasury funding pathways, validated mint and honest SWF state
[한국어](2026-11-10-funded-treasury-v1949.ko.md) · **Candidate / Not Production deployed**

- Introduce administrator own-cash donation form using canonical existing `treasury_user_donate`; does not create WLD.
- Add distinct approved `TREASURY_ISSUANCE` policy and atomic `MINT -> TREASURY` issuance (SQL345), bounded to 10M WLD, existing freeze stays, single replay-safe receipt and matching fiscal ledger, certification and vault.
- Add mobile mint-to-Treasury dialog and protected BFF, fail closed if no canonical ledger transaction; preserve certificate-only legacy path.
- Correct SWF false executed status after snapshot and label legacy modeled AUM as unspendable; do not pretend stock buying/settlement works.
- PG17 rollback evidence and detailed record in [worklog](../worklog/2026-11-10-funded-treasury-v1949.md). Full release gates pending.
