# Worklog — Runtime hygiene v2026.09.23.405

Baseline: main 67e34d8df182403532e1541d16391f76edfafc57 after PR #702.

Production backend currently connects to 127.0.0.1:5433/woldeok_moneyverse_dev and Test backend to 127.0.0.1:5585/woldeok_moneyverse_ci; active TCP connections were observed for both.

Four stale container objects were safely removed after confirming no current repository/systemd/config references and non-current runtime state: mv-b280-pg, mv-ci315, mv-ci315b, wdmv-v127-fulltest-db. Volumes were intentionally preserved.

Remaining QA/recovery DB containers were inventoried without destructive cleanup. Wildcard host bindings were observed on Production 5433 and QA ports 55432/55433/55555/56555; network reachability was not independently verified, so this remains a bind-exposure review item.

No Production service restart, DB migration or release promotion was performed.
