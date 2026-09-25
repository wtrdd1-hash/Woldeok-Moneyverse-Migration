# 디스크 용량 정리 작업 기록 — v2026.09.25.438

**한국어 보조 문서** | 영문 기준: `2026-09-25-disk-capacity-hygiene-v2026.09.25.438.md`

- 작업 시작 main SHA: `328b4623f2f063eaaade74e38cb4d8f4f14561c2`
- 브랜치: `ops/disk-hygiene-v2026.09.25.438`
- 호스트: `debian13`
- 시작 루트 디스크: 전체 99G, 사용 55G, 여유 40G (59%).
- 시작 데이터 디스크: 전체 197G, 사용 135G, 여유 54G (72%).
- 운영 current: `prod-d058df3-v436`; backend/frontend 실제 CWD 모두 일치.
- 테스트 current: `test-d058df3-v436`; backend/frontend 실제 CWD 모두 일치.
- Swap: 총 30GiB이며 24G 디스크 swapfile은 0B 사용, zram은 활성 상태.
- 목표: 현재 런타임, DB, 업로드, 백업, 보호 대상 Docker 볼륨을 건드리지 않고 오래된 불변 릴리스 사본만 회수.
- 보존안: 환경별 현재 릴리스 + 최신 버전 릴리스 10개를 보존하고 롤백 후보를 명시적으로 유지.
- 런타임 변경은 안전한 저장공간 정리로 제한하며 서비스/프로세스 정체성과 최종 용량을 재검증한다.

## 완료 증거
- 오래된 불변 릴리스 디렉터리 207개를 제거하고 Production 10개, Test 10개만 보존했다.
- 최종 root: 전체 99G, 사용 55G, 여유 39G (59%); inode 사용률 32%.
- 최종 data disk: 전체 197G, 사용 41G, 여유 148G (22%); inode 392,186 / 13,107,200 (3%).
- 관측 기준 대비 data disk 약 94G와 inode 약 450만 개를 회수했다.
- Production/Test frontend/backend systemd 서비스 4개 모두 active다.
- Production backend `127.0.0.1:3000/health`, Test backend `127.0.0.1:3100/health` 모두 `{"status":"ok"}`를 반환했다.
- 활성 Production/Test 릴리스 정체성은 v436으로 유지됐다. PostgreSQL, upload, backup, 보호 대상 QA 데이터는 삭제하지 않았다.
- 24G disk swapfile은 v437 VM memory-continuity 계약 대상이므로 보존했다.
- application code release, DB migration, Test/Production 승격은 수행하지 않았다.
