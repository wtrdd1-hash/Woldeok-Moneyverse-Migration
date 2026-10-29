# v2026.10.29.1364 — Scheduled QA disk hygiene visibility (GitHub)

- Fix an inert QA-exclusive cleanup workflow: the hourly job successfully executed the cleaner, but no disposable scratch runs were produced, so it always reclaimed zero bytes.
- Emit one bounded, no-credential, completed disposable smoke summary per scheduled QA run. Entries age out after 72 hours using the existing strict current-UID ownership, symlink protection, 20-run/2-GiB cleanup limits.
- Report `NO_ELIGIBLE_QA_SCRATCH` rather than implying that a successful no-op reclaimed disk space. Alert at >=90% usage without deleting non-QA files.
- No API/DB/frontend change or authenticated full-functional QA certification. Test results, immutable scheduler operations release and rollback details are in the versioned worklog.
