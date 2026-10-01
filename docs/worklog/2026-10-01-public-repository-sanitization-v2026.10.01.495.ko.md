# 작업기록 — 공개 저장소 정리 v2026.10.01.495

[English canonical](2026-10-01-public-repository-sanitization-v2026.10.01.495.md) | **한국어**

## 시작
- 서버 main 91efe427, 앱 main e24a2f8 기준으로 시작.
- 격리 worktree와 전용 security branch 사용.
- 동시에 진행 중인 security/treasury/admin 작업은 수정하지 않음.

## 중간
- 서버 main이 2bad12eb로 이동해 구현 전 fast-forward.
- 기준 전체 test에서 과거 삭제된 필수 DB init 소스로 인한 migration-parity 실패 확인.
- 공개/내부 문서 경계 드리프트와 모바일 release-signing fallback 확인.
- 상세 보안 증거는 Git 밖에 유지.

## 구현
- 공개 추적 내부 업데이트 기록 제거 및 재발 방지.
- 비밀값 없는 필수 DB init 소스만 복구하고 script ignore 규칙을 좁힘.
- security assurance, 통합 기획, 문서 거버넌스 갱신.
- 비권위/공개 호환 문서 정리.
- 앱 저장소에 Android signing/CI 분리 적용.

## 로컬 검증
- 핵심 hygiene assertion: PASS.
- Database package test: 7/7 PASS.
- 서버 전체 test: PASS(exit 0). DB 미설정 환경의 DB-backed test는 suite에서 skip으로 기록.
- Typecheck: PASS(exit 0).
- Lint: 최신 main의 기존 부채 13 errors, 430 warnings로 RED.
- Android signing/CI 정적 check: PASS.
- Android Gradle: Debian 호스트에 Android SDK가 없어 로컬 실행 불가, PR CI 필요.

Git 과거 이력 재작성, Test 배포, Production 승격 없음.
