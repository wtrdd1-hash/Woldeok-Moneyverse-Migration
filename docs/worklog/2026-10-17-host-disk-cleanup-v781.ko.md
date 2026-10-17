# 미니PC 디스크 안전 정리 작업기록 — v2026.10.17.781

**상태:** 실제 호스트 정리 및 사후 검증 완료. 앱 코드·DB·기능 스위치·Test·Production 승격 없음.

**일시:** 2026-10-17 KST. [영문 정본](2026-10-17-host-disk-cleanup-v781.md).

## 시작 기록
- Debian 13: 루트 `/dev/sdb1`, 데이터 `/dev/sda1` (`/srv/moneyverse-data`: DB/릴리스/백업/디스크 스왑).
- 시작·중간 원격 `main` SHA `4a7c1398c8611a514650d33db48bf5bbf6ac4594`, 전용 문서 브랜치 `docs/host-disk-cleanup-v2026.10.17.781`.
- `AGENTS.md`, 문서 정책·목록, `PROJECT_PLAN`, 통합마스터, 보존 정책, v749 두 디스크 지침, v619/v749 이전 기록 검토.
- 시스템 정리 전 `df -B1`: **사용 90,650,734,592 B / 여유 10,209,361,920 B / 90%**, inode 사용 **2,998,446개**. 데이터 디스크 **58%**.
- 운영 링크 `prod-v2026.10.16.717-176ca04ecfbd`, 테스트 링크 `test-v2026.10.17.761-4a7c1398c861` 확인. 실행 프로세스 CWD 확인 후 현재 작업 v780 제외.

## 중간 기록
- 과거 Next.js의 **재생성 가능한 `.next` 18개**를 9+7+2개로 나누어 삭제. 각 경로의 실경로·디스크·심볼릭 링크·실행 프로세스 CWD 검증.
- 파일별 블록 합산 **11,117,133,824 B**. 동시 빌드의 신규 기록으로 최종 순증가 용량과 다름.
- 보호: 소스·Git·`node_modules`·현재 v780 빌드·운영/테스트/롤백 릴리스·DB·백업·업로드·Docker 볼륨·swap·systemd. 삭제/변경 안 함.
- 정리 대상 정확한 경로:
- `/srv/moneyverse-tasks/treasury-v677/source/frontend/.next`
- `/srv/moneyverse-tasks/treasury-v678/source/frontend/.next`
- `/srv/moneyverse-tasks/treasury-fix-v683/source/frontend/.next`
- `/srv/moneyverse-tasks/treasury-v690/frontend/.next`
- `/srv/moneyverse-tasks/blog-country-seo-v710/frontend/.next`
- `/srv/moneyverse-tasks/promotion-remediation-v721/repo/frontend/.next`
- `/srv/moneyverse-tasks/promotion-v716/source/frontend/.next`
- `/srv/moneyverse-tasks/bank-credit-truth-v715/repo/frontend/.next`
- `/srv/moneyverse-tasks/full-function-runtime-v687-20261015/frontend/.next`
- `/srv/moneyverse-tasks/function-acceptance-audit-20261014-v605/app/frontend/.next`
- `/srv/moneyverse-tasks/release-identity-v717/repo/frontend/.next`
- `/srv/moneyverse-tasks/monetary-guard-v737/source/frontend/.next`
- `/srv/moneyverse-tasks/seo-cron-v739/source/frontend/.next`
- `/srv/moneyverse-tasks/production-promotion-repair-v2026.10.16.744/repo/frontend/.next`
- `/srv/moneyverse-tasks/promotion-attempt-v2026.10.17.753/current-source/frontend/.next`
- `/srv/moneyverse-tasks/prod-finance-closure-v2026.10.17.754/main/frontend/.next`
- `/srv/moneyverse-tasks/prod-finance-closure-v2026.10.17.754/repo/frontend/.next`
- `/srv/moneyverse-tasks/stock-league-test-read-v2026.10.17.755/repo/frontend/.next`
- 시작/중간/완료 및 대상 목록: `/srv/moneyverse-data/build-workspaces/host-disk-cleanup-v2026.10.17.781/`.

## 완료 기록
- 루트 최종: **사용 79,661,645,824 B / 여유 21,198,450,688 B / 79%**.
- 실제 순확보 **10,989,088,768 B (약 10.99GB / 10.23GiB)**. inode 사용 **2,828,584개**로 **169,862개 감소**.
- 데이터 디스크 **58%** 유지. 운영/Test 링크 변경 없음. 현재 v780 `.next` 보존.
- 재점검: 백엔드·프론트엔드·디스코드 봇·MCP·Nginx·Docker **active**, DB 연결 정상, PostgreSQL 연결 수락, 공개 홈페이지 HTTP 200, 기존 Docker 컨테이너 3개 유지.
- 위 결과는 **호스트 디스크 정리 검증만** 증명. 인증 E2E, 재정 원장 게이트, CI, 신규 Test/운영 앱 승격은 수행하거나 통과했다고 주장하지 않음. 기존 P0 차단 유지.
- 시스템 79%는 80% 조치 기준 아래이나 70% 경고 기준 이상. 미래 캐시 증가 관찰 필요; 자동 삭제 작업 설치 없음.

## 근거
- 호스트 보존 로그: `start.log`, `middle.log`, `completion.log`, `candidates.txt`, `candidates-second.txt`.
- 문서만 전용 브랜치에 반영하며 병행 작업 및 현재 `main`을 덮어쓰지 않음.
