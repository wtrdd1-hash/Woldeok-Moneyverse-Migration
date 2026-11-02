# 개발 A 23:50 — 공개 게시판 식별자 검증 QA (P1 / 초안 / 운영 보류)

기준 main `9cade11af53db9f27c2b9f0ea9d39005ea8d0387`; 코드 중간 SHA `9cf83fa98899d06caec6ed9fc3d54f45829455bb`. 최종 SHA와 CI는 PR에서 별도 추적한다.

기존 `SECURITY DEFINER` 최근 50건 조회만 사용한다. Nest는 잘못된 UUID, 대소문자만 다른 중복 ID, 50건 초과, 공개 목록의 잘못된 소유자 표시를 거부한다. 웹은 식별자·시간·댓글 수·종목 메타데이터를 검증하기 전 링크를 렌더링하지 않는다. Android 게이트웨이는 검증되지 않은 HTTP 200, 잘못된 JSON, JSON이 아닌 성공 응답을 HTTP 503(no-store/noindex)으로 차단한다. 정상적인 빈 목록과 조회 실패는 구분한다.

검증: RED→GREEN 백엔드 대상 11 PASS, 프론트 대상 14 PASS; 타입검사 PASS; Android 계약 184개 엔드포인트·683개 메서드 PASS. 전체 백엔드 2,984 PASS / **2 FAIL** / 518 SKIP(기존 프로필 인증 HTTP 401 대 200); DB 62 PASS / 5 SKIP; 계약 41 PASS; 전체 프론트 2,952 PASS; lint 오류 0·경고 1,027; 빌드 PASS(정적 페이지 602개). 운영 의존성 감사 PASS, 전체 의존성 감사 **9건 FAIL**.

개발 PostgreSQL 17.11 읽기 전용 검사: 공개 게시글 1건; 앱 계정의 `account_balances UPDATE`와 `user_items DELETE` 허용은 기존 P0 #993. 운영 권한 확인 결과가 아니다. 원격 브랜치 총 294개(main 포함), 미통합 276개, 병합 완료 17개. PR #2540/#2530/#2519 가상 병합 충돌. 고유 변경 보호, 삭제 0개.

정확 SHA 공식 Test 인증 E2E·독립 복원·운영 DB 권한·전체 보안 감사·GitOps 게이트 미충족. main 병합, 운영배포, DB 변경, 서비스 재시작, 롤백 없음. **운영 보류**.
