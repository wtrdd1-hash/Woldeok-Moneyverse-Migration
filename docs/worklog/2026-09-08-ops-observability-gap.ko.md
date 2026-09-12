# 2026-09-08 운영 / 관측성 개선

[English](2026-09-08-ops-observability-gap.md) | **한국어** | [문서 색인](../INDEX.ko.md)

## 배경
공개 탐색은 사용자가 권한이 없을 때 회원/운영자 전용 기능을 의도적으로 숨깁니다. 이것은 제품 부족 사항이 아니므로 변경하지 않습니다.

현재 저장소 감사에서는 권한을 약화하거나 경제 규칙을 변경하지 않고 해결할 수 있는 운영 부족 사항을 확인했습니다.

## 이 브랜치의 변경
- 문서화된 Test → Production 배포 경계를 복구했습니다.
  - 임의 브랜치는 `test`에만 배포 가능
  - `production`은 `main` 이외 ref를 모두 거부
  - Test/Production은 서로 다른 스택 이름, 디렉터리, DB, 포트, 이미지 태그, 공개 주소, 검색 색인, GitHub 환경을 유지
  - 모든 배포는 먼저 CI를 실행하고 롤아웃 후 공개 `/` + `/status` 스모크 검사 수행
- `deploy/backup-watchdog.sh`를 추가했습니다.
  - 백업 검증을 중복 구현하지 않고 기존 암호화/덤프 검증을 실행
  - 1시간보다 오래된 백업을 실패로 간주
  - URL을 git에 저장하지 않고 `BACKUP_ALERT_WEBHOOK_URL`로 알림 가능
  - 10분마다 반복 스팸하지 않고 실패 시작 시 1회, 복구 시 1회 알림
- `install-backup-cron.sh`를 확장해 각 스택의 엇갈린 백업 구간 3분 뒤에 검증 실행
- 권한 기반 메뉴 표시는 그대로 유지
- PostgreSQL 경제 함수, 마이그레이션, Production 데이터 변경 없음

## main 전 Test 서버 필수 검증
1. 브랜치 CI: 비밀정보 검사, lint, typecheck, build, migration, DB/애플리케이션 테스트 통과
2. 이 브랜치에서 `deploy.yml`을 `environment=test`로 실행
3. Test 스택 컨테이너 상태와 공개 `/`, `/status` 스모크 검사 확인
4. 미권한 세션에 제한 메뉴가 계속 숨겨지고 권한 있는 테스트 계정에는 허용 메뉴가 보이는지 확인
5. webhook 없이 Test 백업 watchdog을 실행해 정상 백업은 종료 코드 0인지 확인. 의도적으로 오래된 격리 Test 백업 디렉터리를 대상으로 실행해 데이터를 건드리지 않고 0이 아닌 종료 코드를 내는지 확인
6. 그 후 현재 `main`을 다시 반영하고 동시 변경 충돌을 해결한 뒤 CI/Test 배포를 다시 실행한 경우에만 PR 병합 가능 상태로 전환

## Production 게이트
이 브랜치에서 Production을 직접 배포하지 않습니다. 병합 후 정상 Production 백업 검증을 거친 정확한 테스트 완료 `main` 커밋만 배포합니다. Production 배포는 `production` GitHub 환경의 보호를 계속 받습니다.
