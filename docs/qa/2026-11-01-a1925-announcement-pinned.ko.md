# A 2026-11-01 19:25 — 공개 고정 공지 필터 QA

영문 문서가 기준입니다. 기준 main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`에서 독립 브랜치로 개발했습니다. Backend 대상 4건, Frontend/Android 대상 5건 통과. 초기 Backend 전체 2건 실패(기존 프로필 인증 401), Frontend는 올바른 NODE_ENV=test에서 2,906건 통과(초기 환경 누락 실행은 496건 실패). DB 단위 62건 통과/4건 건너뜀. 개발 PostgreSQL 읽기 전용/ROLLBACK 검증에서 공개 공지 1건, 고정 0건으로 양성 데이터 검증은 미완료. 개발 DB의 최소 권한 P0 위반은 지속됩니다. 최종 SHA CI, 공식 Test E2E, 복원/롤백 및 GitOps 검증 전까지 RELEASE HOLD입니다.
