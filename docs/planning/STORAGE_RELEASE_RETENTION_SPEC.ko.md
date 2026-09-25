# 저장공간 및 릴리스 보존 상세 명세

[English canonical](STORAGE_RELEASE_RETENTION_SPEC.md) | **한국어**

> 버전: v2026.09.25.438
> 상태: PLANNING + 관측된 런타임 정리 증거

## 안전 불변조건
1. 삭제 전 `production-current`, `test-current`를 해석하고 실행 중 backend/frontend 프로세스 CWD를 확인한다.
2. 활성 symlink target 또는 프로세스 CWD release root는 버전이 오래되어도 보호한다.
3. PostgreSQL 데이터, 업로드, 백업, 활성 release root, retain-until-classified QA 데이터는 일반 정리 대상이 아니다.
4. `docker system prune --volumes` 같은 광범위 volume 삭제를 금지한다.

## 보존 정책
- Production은 활성 릴리스 + 최근 롤백 가능 불변 릴리스 최소 10개를 보존한다.
- Test도 활성 릴리스 + 최근 롤백 가능 불변 릴리스 최소 10개를 보존한다.
- 사고, 감사, 법적, migration, rollback 증거가 필요한 릴리스는 owner와 만료/재검토일을 지정해 추가 고정할 수 있다.
- 릴리스 이름만으로 권위를 판단하지 않고 exact SHA/version/실행 프로세스 증거를 우선한다.

## 용량 정책
- 70% 미만: 정상.
- 70% 이상: 경고와 상위 증가 원인 보고.
- 80% 이상: 비필수 build/QA artifact 증가 중단 및 정리/증설 조치.
- 90% 이상: 운영 사고로 처리하고 용량 회복 전 artifact-heavy 신규 작업 차단.
- 모든 정리 전후 byte와 inode 사용량을 기록한다.

## 자동화 수용 조건
정상 승격과 session/version 검증 후 fail-closed retention job이 오래된 릴리스를 정리할 수 있다. 실행 직전에 symlink/CWD 보호 목록을 다시 읽고 보존 창을 유지하며 identity가 모호하면 중단하고, destructive 작업을 직렬화하며 삭제 목록과 회수 byte/inode를 감사 가능하게 남긴다. Production 적용 전 Test에서 검증한다.

## Swap
disk swap은 v437 VM memory-continuity 계약에 따른다. 공간 확보만을 위해 축소/삭제하지 않으며 guest/host memory, PSI, zram/swap usage, rollback 증거를 요구한다.
