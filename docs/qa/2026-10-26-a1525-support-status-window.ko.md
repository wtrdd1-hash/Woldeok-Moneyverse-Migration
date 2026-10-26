# QA A1525 — 본인 관리자 문의 최근 상태 필터 (초안 / 운영승격 보류)

**일시:** 2026-10-26 KST. **main 기준:** 1c5b84a1c45baafcca83f375a6f99698121e9bb5. **기능 코드 SHA:** 33bcced78357e01bc706051c9e49c8cb73329a24. **브랜치:** auto/hourly-a-support-status-window-20261026-1525. 최종 브랜치 SHA·CI는 PR에 별도 기록한다.

로그인 회원 /support에서 본인 최근 **최대 100건**의 문의를 전체/관리자 답변 대기/내 답변 대기/처리 완료로 필터링한다. 전체 이력 검색이 아님을 명시하고, 빈 결과가 과거 문의 0건을 뜻하지 않도록 안내한다. 기존 본인 검증 메시지 API의 명시적 딥링크, noindex, 동적 렌더링 유지. Backend는 기존 SECURITY DEFINER support_my_threads(세션 사용자,100)을 재사용하며 windowLimit=100 반환. Android app-api 179개 엔드포인트의 기존 응답 스키마 갱신. 신규 DB 마이그레이션·권한 GRANT·원장/WLD 쓰기 없음. #1415의 읽음 영수증/알림 기능은 미구현.

**TDD:** Backend RED→2 PASS, Frontend RED→6 PASS, 관리자 CSRF 가드 2 PASS. 전체 pnpm test **FAIL**: Contract 38 PASS, DB 15 PASS/3 SKIP, Backend 1,315 PASS/398 SKIP, Frontend 1,403 PASS/6 FAIL(SEO·다국어 3, 로그인 접근성 1, 계산기 가입 링크 1, 관리자 M2 1). 별도 QA PR #1412의 수정은 중복 구현·무검증 통합 금지. Lint PASS(오류0/경고1128), Typecheck PASS, 기본 Turbopack Build PASS, app-api 계약 179 PASS, Bot npm ci 후 8 PASS. 보안 감사 FAIL: 운영 High 2, 전체 Critical 2/High 10/Moderate 11/Low 3, Bot Critical 1/High 5.

**격리 PostgreSQL 17.11:** 127.0.0.1:5580/5585의 wdmv_v761_test_acl(마이그레이션 281개). BEGIN 안에 본인 문의 101건·타인 1건 생성 후 moneyverse_app 역할로 본인 100건, 기본 50건, 타인 노출 0건, 상태별 33/34/33 확인. 테이블 직접 SELECT 차단, ROLLBACK 후 임시 기록 0건. 운영 연결 5433 접근·쓰기 없음. 기존 메시지 최신 답변 누락 가능성(오래된 순 200건 제한)은 이 기능으로 해결하지 않음.

**동시성·차단:** 시작 원격 브랜치 264개, 열린 PR 260개(Draft 258), 확인 가능한 비-main 260개 모두 미통합, Git 객체 미확보 3개 보호, 중복 Head SHA 0, 충돌 #1107/#1110/#1143. 280번 마이그레이션 중복 PR #1105/#1117/#1139/#1143 모두 보존. 브랜치 삭제 0. 공식 Test 공개 SHA 6f697e74b7bf0cd1e4521d36534cfd9c140f8010, Production 6a989b5ac0c6155587d43426d64f6def6b62c917. 정확 SHA 인증 E2E·전체 보안·복원·GitOps 게이트 미충족으로 **main 병합·Test 승격·운영배포·운영 DB 변경·서비스 재시작 0건**. 롤백은 코드 revert, DB 조치 없음. **Production RELEASE HOLD**.
