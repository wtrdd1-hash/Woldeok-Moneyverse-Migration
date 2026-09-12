# 백엔드 데이터 Git 차단

버전: v2026.09.12.1

## 변경사항

- 백엔드 런타임 데이터, DB 덤프, 백업 파일, 로컬 DB 파일, 내보내기 데이터, 런타임 로그를 `.gitignore`에 추가했습니다.
- `git add -f`로 `.gitignore`를 우회하더라도 CI에서 백엔드 데이터 또는 DB 백업 파일 추적을 거부하도록 `scripts/check-secrets.sh`를 강화했습니다.
- SQL 마이그레이션과 백업/복구 소스 스크립트는 계속 Git에서 추적됩니다.

## 검증

- `sh -n scripts/check-secrets.sh`: 통과
- `scripts/check-secrets.sh`: 통과
- `.dump`, 백엔드 CSV 데이터, 백업 파일 ignore 확인: 통과
- 마이그레이션 SQL 추적 가능 확인: 통과
- `git diff --check`: 통과
