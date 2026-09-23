# 작업기록 — 런타임 정리 v2026.09.23.405

기준: PR #702 병합 후 main 67e34d8df182403532e1541d16391f76edfafc57.

Production backend는 현재 127.0.0.1:5433/woldeok_moneyverse_dev, Test backend는 127.0.0.1:5585/woldeok_moneyverse_ci에 연결하며 두 경로 모두 active TCP 연결을 확인했다.

현재 repository/systemd/config 참조가 없고 현재 런타임이 아닌 상태를 확인한 stale container object 4개(mv-b280-pg, mv-ci315, mv-ci315b, wdmv-v127-fulltest-db)를 안전하게 제거했다. Volume은 의도적으로 보존했다.

나머지 QA/recovery DB container는 파괴적 정리 없이 인벤토리화했다. Production 5433과 QA 55432/55433/55555/56555에서 wildcard host bind를 관측했지만 network reachability는 독립 검증하지 못했으므로 bind-exposure 검토항목으로 유지한다.

Production service restart, DB migration, release promotion은 수행하지 않았다.
