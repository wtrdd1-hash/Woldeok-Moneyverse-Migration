# 미니PC 디스크 용량 정밀 실사 — v2026.11.17.1

[English canonical](2026-11-17-disk-capacity-audit-v2026.11.17.1.md) | 한국어

상태: OBSERVED / 읽기 전용 / 정리 미수행.
환경: debian13, 2026-11-17 14:11~14:17 KST.
기준 main SHA: e96e8f81f4d6b99b221392a2b6fe46356361b145 (작업 시작·중간 확인).
실측 근거: 원격 MCP의 df -hT, df -i, lsblk, du, docker system df, free -h, ps, lsof +L1, /proc/*/fd의 중복 제거된 열린 삭제파일 실제 할당 블록 수, systemd 및 배포 링크.

## 파일시스템
| 경로 | 장치/형식 | 전체 | 사용 | 가용 | 사용률 |
|---|---|---:|---:|---:|---:|
| / | /dev/sdb1 ext4 | 99G | 56G | 39G | 59% |
| /srv/moneyverse-data | /dev/sda1 ext4 | 197G | 128G | 61G | 68% |
| /tmp | tmpfs (RAM/스왑 기반, 물리 디스크 아님) | 6.7G | 6.4G | 289M | **96%** |

두 ext4 파일시스템 inode 사용률은 각각 20%. df 반올림 표시. 검사 중 루트 사용량 55G→56G 변동.

## P0 /tmp 임시공간 고갈 원인
탐색 가능한 파일은 약 1.4G(node-compile-cache 약 1.1G, Google Play 약관 작업 임시 체크아웃 약 140M 등). 실제로 열린 삭제파일 inode 2,580개가 **4.98GiB** 점유. FD 중복은 inode 단위로 제거해 집계함. Chromium headless 렌더러 PID 2580423, 2580434, 2580435가 각 약 1,702MiB 사용. Playwright 브라우저 QA Node 부모 PID 2580315(PPID 1)는 2026-11-15 19:48 KST 시작 후 현재까지 남음. 파일이 삭제됐어도 마지막 프로세스 핸들이 닫혀야 공간 회수 가능. QA 소유자·진행 작업 확인 전 강제 종료 및 무분별한 /tmp 삭제 금지.

## 서비스 데이터 디스크 주요 점유(권한 제한 있는 비root du)
| /srv/moneyverse-data 하위 | 대략 점유 |
|---|---:|
| releases | 35G |
| tasks | 20G |
| agent-worktrees | 12G |
| ai | 7.9G |
| backups | 4.2G |
| relocated-home | 2.4G |
| automation-builds | 1.2G |

운영 production-current는 prod-v2026.11.17.1024-d239aec87, Test test-current는 test-v2026.11.11.1831-cfc178ab55d9를 가리켰음. 운영/테스트/롤백 불변 릴리스 및 타 AI 작업자의 미병합 Worktree 삭제 금지. 비root du는 약 111G만 확인되어 df의 128G와 차이 있으며 일부 보호 디렉터리는 접근 불가. 이 차이를 삭제파일 때문이라고 단정하지 않음.

## OS 디스크
/home 약 27G, Migration 저장소 약 15G(그중 .worktrees 11G), automation-moneyverse 5.5G, .codex 2.1G. root 권한 측정 /var/lib/docker 약 11G 및 /var/lib/containerd 약 1.7G. Docker 자체 보고: 볼륨 10.3GB, 이미지 1.52GB, 컨테이너 206.3MB; 회수 가능 표시 이미지는 645.8MB, 볼륨은 306.4MB이지만 DB 볼륨·소유권 검증 없이 삭제하면 안 됨. /var/log 약 151M(Nginx 38M, journal 99M), Nginx logrotate는 매일 14회전 및 압축·지연압축.

## 우선 개선안 (미실행)
1. P0 QA 소유자와 작업 진행상태 확인 후 고아 Playwright/Chromium 프로세스의 정상 종료를 협의. 종료 전후 /tmp df 및 열린 삭제파일 수 비교.
2. P0 브라우저/컨텍스트 finally 정리, QA 최대 시간·소유 태그, /tmp 85/95% 경보, 열린 삭제파일 누적 점검. 임시 빌드 저장 경로 전환은 격리/용량/권한 확인 후.
3. P1 systemd ExecStart, 현재 릴리스 심볼릭 링크, 롤백 포인터, 다른 에이전트 작업 소유권 대조 후 완료된 소유 캐시만 정리.
4. P1 물리 디스크 80/90%, inode 80/90%, tmpfs 85/95% 추세·경보. 일반 로그 7일/중요 로그 30일 보관·압축·예외 확인.
5. P1 백업 실행 주기, 외부 사본, 해시, 암호화, 격리 복원 검증. 과거 DB 덤프 존재만으로 일일 백업 정상 선언 금지.
6. P2 Node 캐시 및 진짜 미사용 Docker 이미지 정리 후보만 검토. docker system prune -a --volumes 일괄 실행 금지.

읽기 전용 점검·분리 GitHub 문서 브랜치 외 데이터 삭제, 프로세스 중단, DB 변경, Test/Production 운영 배포/승격 없음.