# AdSense frame CSP worklog — v2026.09.18.213

v212 reached the real Test edge and fixed the prior responsive/title/script-CSP faults. The release gate then exposed two iframe CSP violations that local pre-edge checks had not exercised. Production promotion was stopped. Official Google AdSense CSP guidance was rechecked; a minimal frame allowlist patch was chosen instead of globally widening frames.

Targeted security-header tests and frontend typecheck passed before this record. Full frontend validation, PR/CI, exact-main Test browser verification, and Production canary/cutover follow this worklog.
