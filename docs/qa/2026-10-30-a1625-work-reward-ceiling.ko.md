# 개발 A — 2026-10-30 16:25 — 업무 예상 보상 상한 필터 QA

**판정: 대상 테스트 PASS / 격리 PostgreSQL PASS / 전체 테스트 FAIL / 정확 SHA CI FAIL / 운영 배포 HOLD.** 영문 QA가 원본이며 이 문서는 한국어 보조 기록이다.

- 기준 main: `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`. 분리 작업 브랜치 `auto/hourly-a-20261030-1625-work-reward-ceiling`, Draft PR #2016.
- 로그인 회원의 업무 목록에서 예상 WLD 보상 상한 `maxReward`를 선택할 수 있다. 기존 최소 보상과 최대 업무 시간 필터를 조합한다. 최대 18자리 정수 문자열만 허용하며 중복·잘못된 값·모순된 범위는 HTTP 400으로 거부한다.
- 데이터베이스에서 회원별 `SECURITY DEFINER` 함수 결과에 바인딩된 `numeric` 비교를 적용한다. 원장 변경·새 마이그레이션·직접 테이블 권한 부여 없음. 웹 접근성 라벨과 초기화, Android app-api 정밀도 유지 및 `no-store/noindex` 확인.
- 구현 전 RED: Backend 15 실패 / Frontend 14 실패. 구현 후 Backend 관련 43 PASS, Frontend·Android 관련 81 PASS, 별도 필터 27 PASS.
- 격리 PostgreSQL 17.11에서 **SQL 마이그레이션 305개 전체 적용 PASS**, 실제 DB 접근 통제·보상 범위 검증 1 PASS. 합성 데이터 ROLLBACK, 테스트 전용 컨테이너만 삭제.
- Typecheck·전체 Build PASS, Lint 0 ERROR / 1,043 WARNING, 모바일 계약 183개 PASS, DB 단위 56 PASS / 4 SKIP, 운영 의존성 취약점 0건.
- Backend 전체 **2,578 PASS / 119 FAIL / 496 SKIP**, Frontend 전체 **2,625 PASS / 53 FAIL**. 이전 개발 A와 실패 테스트 이름 집합이 동일하지만, 필수 게이트 미통과 상태이다.
- 공식 Test는 후보 SHA가 아니며 국고 API가 여전히 미검증 데이터를 HTTP 200으로 제공한다. Production은 국고 HTTP 503 `UNVERIFIED`. 정확 SHA 인증 E2E 및 GitOps 승격 조건 미충족.
- main 병합·공식 Test/Production 배포·운영 DB 수정·서비스 재시작·롤백 없음. 시작 21개 브랜치/20개 PR, 종료 감사 22개 브랜치/21개 PR. 고유 미통합 커밋 보호를 위해 삭제 0건.
- 세부 증거: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-1625-work-reward-ceiling/`.
