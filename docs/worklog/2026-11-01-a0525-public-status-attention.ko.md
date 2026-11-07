# 개발 A — 공개 서비스 상태 확인 필요 필터 (2026-11-01 05:25 KST)

영문 정본: `2026-11-01-a0525-public-status-attention.md`.

- 작업 전: main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, 원격 브랜치 39개, 열린 PR 37개. 다른 작업 변경은 보존.
- 작업 중: 공개 상태의 `attentionOnly=1` 필터를 Nest·Next·Android API에 구현. 오래된 정상 관측은 `unknown`으로 정규화한 뒤 필터링. 전체 상태 요약은 필터 적용 전 자료로 유지.
- 테스트: 신규 테스트 RED 확인 후 GREEN(Backend 2, Frontend 4), 전체 타입 검사 PASS, Lint 오류 0/기존 경고 1,022. 개발 PostgreSQL 읽기 전용 3행, 앱 역할 EXECUTE 확인, ROLLBACK.
- 남은 검증: 전체 테스트/빌드/CI/공식 Test 인증 E2E/운영 GitOps 및 롤백. 운영 배포 보류.

## 종료 기록 — 코드 구현, 배포 보류
- 기능 PR #2264, 코드 SHA `c5ec7f948330e7cc93902ca82acbcb868e0ee168`; HTTP 통합 테스트 2개 추가. 최종 SHA는 PR 기록 확인.
- Frontend 전체 2,907 PASS, Backend 대상 6 + HTTP 2 PASS, DB 단위 62 PASS/4 SKIP, 계약 41 PASS. 타입 검사·빌드 PASS, Lint 오류 0/기존 경고 1,022, 운영 의존성 감사 취약점 0건.
- Backend 전체 2,950 PASS/517 SKIP/**2 FAIL**. 동일 실패를 순수 main에서 재현했고, 별도 복구 PR #2265에서 테스트 내부 토큰 픽스처 수정 후 Backend 전체 2,950 PASS/517 SKIP. 기능 브랜치에는 복구 코드 미포함. 임시 결합 전체 테스트는 워커 EPIPE로 중단되어 PASS 판정 불가.
- 개발 PostgreSQL에서 `moneyverse_app`의 상태 원천 테이블 직접 SELECT/UPDATE 권한 발견(P0 #993). 조회 함수 실행은 가능하지만 최소 권한 검증 실패. 개발 DB 결과를 운영 DB로 일반화하지 않음.
- Test `bc8cd8a6…`, Production `353c6d5d…`, 후보 SHA 불일치. 공식 Test 인증 E2E·독립 복원·운영 실행 출처·GitOps 미충족. 배포/병합/재시작/롤백/브랜치 삭제 0건.
- 원격 브랜치 39→41, 열린 PR 37→39. main SHA 변화 없음. 다른 개발자의 미통합 변경 전부 보존. **운영 배포 보류.**
