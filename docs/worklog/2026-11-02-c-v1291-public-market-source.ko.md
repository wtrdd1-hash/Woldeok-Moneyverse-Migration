# 개발 C v1291 — 공개 주식시장 원천 검증

## 시작 — 2026-11-02 09:48 KST
- 미니PC Debian 13.6 서비스 7개 정상, 개발 PostgreSQL 연결 확인.
- 기준 main `a8541927c3a351d980454c66e95a3356c47e0722`. 기존 공유 checkout 변경 파일 보존, 별도 worktree 사용.
- AGENTS, README 영/한, 통합기획 영/한, PR/CI, A/B/QA 기록 확인. QA v1458 운영배포 P0 HOLD.
- 실제 미구현: 공개 `/stocks`가 미검증 API 응답을 시세로 처리하고 장애를 빈 시장으로 표시하며 BigInt 가격을 Number로 반올림할 수 있음. SEO에 검증되지 않은 10단 호가 및 가입 보상 문구 존재.
- 구현: 엄격한 서버 응답 검증, 정확한 정수 가격·변동률, 실패/빈 시장 분리, 접근성·SEO. 금융 원장·DB 쓰기 없음.

## 진행
- TDD, 독립 검증, 원격 CI 및 병합·배포 게이트 대기.

## 종료 — RELEASE HOLD
- 코드 체크포인트 `30173ab6dc70cac6a5a66fb5a8dc7ca5b8edbe24`: 전체 Lint 오류 0, Typecheck PASS. 최초 1GiB Next 빌드 OOM → 3GiB 재시도 PASS. Frontend 2,933 PASS, Backend 2,980 PASS/518 SKIP, Contract 41 PASS, DB 패키지 62 PASS/5 SKIP, app-api 184개 PASS, 보안 정책 11 PASS.
- 추가 TDD RED 2건(거래 가능 수량 불일치, 장애 시 상장 종목 0건 허위 표기) 수정 후 집중 테스트 11 PASS.
- 독립 PostgreSQL 17.11 마이그레이션 322/322 PASS, 실제 주식 DB 테스트 15 PASS. 앱 계정의 주식 원본 테이블 직접 조회·삽입 불가, 승인된 시세 조회 함수 실행 가능. 컨테이너 제거.
- 독립 HTTP `/stocks` 200 및 시세 조회 장애/재조회 표시 확인. 공식 인증 브라우저·모바일 E2E는 BLOCKED.
- 전체 의존성 감사 9건(보통 8, 낮음 1) FAIL, 전체 경로 QA 증빙 파일 누락 FAIL. QA v1459 운영 P0 HOLD(운영 다국어 500, DB 권한·마이그레이션 불일치, 복원 미인증).
- Draft PR #2454, main 동일. 최종 HEAD exact-SHA 검증 결과는 PR에 별도 기재. Test/Production 미배포, 병합 SHA 없음, 롤백 불필요.
- 별도 브랜치/worktree 및 고유 변경 보존. Gemini/A/B/QA와 핵심 5개 예약 설정 미변경.


## 중간 — 2026-11-02 09:51 KST
- TDD RED: 파서 3건, 페이지 4건 실패 재현. GREEN: 파서 5건, 페이지 5건 통과.
- 실제 문제: 비정상 시세 API가 화면 오류, 장애를 종목 0개로 표시, 31자리 WLD 가격 반올림, 확인되지 않은 SEO 혜택 문구.
- 변경: 응답·종목 유효성 검증, BigInt 가격·변동률, 거래정지 매수 버튼 차단, 모바일 가격 줄바꿈, 접근 가능한 재조회 링크.
- main 재확인 동일, 기획서 EN/KO SHA256 불변. 전체 필수 검증 대기.
