# 미니PC 디스크 안전 정리 작업기록 — v2026.10.20.981

**상태: 실기기 정리 및 검증 완료 / GitHub 문서 후보.** [영문 정본](2026-10-20-host-storage-cleanup-v981.md).

## 작업 전
- AGENTS, 문서 표준·목록, 통합 마스터, 저장공간 보존 지침, 두 디스크 명세, 이전 v781/v782 작업기록 확인.
- 시작·중간 origin/main 18c40e59beb975571ed39cd6bd664770c541fba3. 다른 작업자와 충돌 방지를 위한 별도 문서 작업트리 및 브랜치 사용.
- 루트 /dev/sdb1 64%, 데이터 /dev/sda1 23%. 운영·테스트 릴리스 링크와 서비스 CWD 확인.
- 사전증거: /srv/moneyverse-data/build-workspaces/host-storage-cleanup-v2026.10.20.981/00-preflight.txt.

## 작업 중
- [x] 장치·마운트·심볼릭 링크, 실행 중 Gradle 부재, 최근 파일 변경일, 프로세스 CWD 보호 검사.
- [x] 재생성 가능한 비활성 캐시 3개만 삭제:
  - /root/.gradle/caches/9.5.0 — 982,855,680바이트
  - /root/.npm/_cacache — 255,401,984바이트
  - /home/debian/automation-moneyverse/c262/frontend/.next — 267,317,248바이트 (9월 19일 빌드)
- [x] 10월 17일 변경된 Debian npm 캐시, 최근 빌드, 모든 Git 작업트리, 원본 코드, Android/AVD, 데이터베이스·WAL, 백업, swap, Docker 볼륨과 운영/Test 릴리스 보존.
- [x] 중간 기록 01-progress.json, 완료 기록 02-result.json 별도 보존.

## 작업 종료 / 실제 검증
| 시스템 디스크 | 정리 직전 | 정리 직후 |
|---|---:|---:|
| 사용 바이트 | 63,963,516,928 | 62,457,942,016 |
| 가용 바이트 | 36,896,579,584 | 38,402,154,496 |
| 사용 inode | 2,105,386 | 2,078,556 |
| 사용률(df 반올림) | 64% | 62% |

**순확보 1,505,574,912바이트(약 1.51GB, 1.40GiB)**, inode 26,830개 감소. 데이터 디스크 23% 유지. 백엔드·프론트엔드·봇·MCP·Nginx·Docker 모두 active, PostgreSQL 연결 수락, 로컬 홈페이지 HTTP 200 확인. 운영 링크 prod-v2026.10.19.920-01c34e4b / Test 링크 test-v2026.10.18.805-e54e6843df27 그대로.

호스트 로그 00-preflight.txt / 01-progress.json / 02-result.json SHA-256은 [영문](2026-10-20-host-storage-cleanup-v981.md)에 기록. 원본 파일은 데이터 SSD에 보관, GitHub에는 인증정보 없이 작업결과 문서만 업로드.

## 승격 구분
앱 소스·DB·원장·설정·기능 스위치·운영/Test 포인터 변경 및 재시작 없음. **이번 변경은 디스크 정리 + 문서 기록이며 신규 앱 배포 또는 금융/UI 검증 통과가 아님.**
