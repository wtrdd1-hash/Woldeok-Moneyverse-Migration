# 인프라 Stall 복원력 명세

> 버전: v2026.09.25.437
> 상태: PLANNING
> 시작 기준: `origin/main=4a4549f644972af972c47fb8f56bd9500766aa61`
> 영문 기준: [INFRASTRUCTURE_STALL_RESILIENCE_SPEC.md](INFRASTRUCTURE_STALL_RESILIENCE_SPEC.md)

## 1. 사고 기반 위협 모델
2026-09-25 사고에서 PostgreSQL 프로세스가 `kvm_async_pf_task_wait_schedule` 스택과 함께 uninterruptible `D` 상태에 들어갔고 block 시간이 120초에서 1,087초까지 증가했다. 이후 guest는 정상 shutdown 없이 재부팅되었고 system journal, Moneyverse 데이터 파일시스템 journal, PostgreSQL WAL 복구가 필요했다. 하이퍼바이저/host stall을 애플리케이션 crash와 분리된 1급 가용성·데이터연속성 위험으로 취급한다.

## 2. 자원 격리
Production에 보장 RAM 하한과 opportunistic workload가 사용할 수 없는 host reserve를 둔다. ballooning/memory overcommit은 실측 peak working set + 안전마진으로 정한 하한을 가져야 한다. host/guest available memory, memory PSI, swap-in/out, major fault, QEMU RSS, CPU steal/scheduling delay, storage latency를 관측한다. 로컬 AI inference, CI/build, browser QA, backup, Test workload가 Production과 경합할 수 있으면 cgroup/container/systemd limit 또는 스케줄 직렬화를 적용한다.

## 3. Health 권위 및 탐지
정상 판정은 외부 HTTPS public probe, Nginx/edge upstream, backend liveness/readiness, 제한시간 경량 PostgreSQL transaction/read, guest heartbeat/QEMU guest-agent, hypervisor QEMU state와 host memory/CPU/storage 신호를 함께 사용한다. 반복·장기 `kvm_async_pf`, hung task/D-state, heartbeat 손실, QEMU pause/reset, host OOM, 과도한 memory PSI, 비정상 scheduling delay, 지속 storage latency를 인프라 incident trigger로 사용한다. 로컬 `/health` 성공만으로 host-level 경보를 억제하지 않는다.

## 4. 자동 대응
guest 외부 watchdog을 사용하고 `healthy -> suspect -> degraded -> evidence_capture -> controlled_recovery -> verify -> healthy|escalated` 상태머신을 적용한다. 지속시간 임계치, cooldown, 최대 재시도 횟수를 명시하고 무한 reboot/restart loop를 금지한다. application instance -> dependency -> VM -> host/failover 순으로 가장 작은 안전 복구영역부터 조치한다. VM restart는 VM-level 증거가 있어야 한다. disruptive action 전 가능한 범위에서 journal/kernel/QEMU/DB 증거를 보존한다. multi-node failover는 fencing이 필수이며 single-host 구성은 HA라고 주장하지 않는다.

## 5. PostgreSQL 및 데이터 연속성
PostgreSQL WAL crash recovery와 `fsync` durability를 유지한다. 기동 순서는 data filesystem mount/recovery -> PostgreSQL transaction 수용 -> migration/schema compatibility -> backend ready -> frontend ready -> edge traffic이다. filesystem/WAL recovery 중 dependent service는 exponential backoff를 적용한다. 암호화 backup과 restore drill, RPO/RTO 증거를 유지한다. unclean shutdown 후 recovery 완료, migration state, 핵심 ledger invariant, session store health, 대표 authenticated flow를 검증한다.

## 6. 관측성 및 보존
Proxmox/QEMU task log, host kernel journal, OOM/PSI, disk latency/error, VM kernel/systemd journal, Docker, PostgreSQL, backend, frontend, Nginx를 동기화된 timestamp와 release identity로 연계하고 pre-crash 구간과 자동조치 이력을 보존한다.

## 7. Test 및 수용 매트릭스
Test에서 보장 하한을 침범하지 않는 memory pressure, controlled guest pause/stall 및 heartbeat loss, PostgreSQL abrupt termination/WAL recovery, 안전한 filesystem recovery simulation, host/guest health 불일치, watchdog cooldown/maximum-attempt를 검증한다. 수용 기준은 ledger corruption 0, 결정적 dependency recovery, restart storm 0, 외부 alert 증거, host-level 증거 보존, durable session authority가 유효한 경우 session continuity다.

## 8. 릴리스/운영 차단 조건
VM 보장 memory floor가 없거나 host-level telemetry가 없거나 external watchdog 책임/경로가 정의되지 않았거나 backup restore 증거가 오래됐거나 recovery ordering을 시험하지 않았다면 Production 승격 또는 인프라 변경을 차단한다.

## 9. 범위 사실
이 버전은 실측 사고 증거에서 도출한 기획/문서 계약이다. Proxmox host control, watchdog automation, fault injection, Production 완화책이 이미 구현됐다고 주장하지 않는다.
