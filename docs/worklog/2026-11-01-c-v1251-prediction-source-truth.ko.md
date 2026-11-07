# 개발 C v1251 — 예측 마켓 원본·체결 진실성 (2026-11-01)

**판정: P0 안전 조치 구현, DRAFT / RELEASE HOLD.** 실제 예측 거래·WLD 정산 기능을 완성한 것이 아니다. 영문 정본은 같은 이름의 `.md` 파일이다.

## 기준과 중복 방지
- 시작·중간 확인한 `origin/main`: `f13bbce273ffc65e8576170992d82ea00c27a1c9`. 기본 main의 기존 `implementation_plan.md` 변경은 보존하고 수정하지 않았다.
- `AGENTS.md`, 루트 README, `README/README.ko.md`, 영문·국문 `docs/planning/PROJECT_PLAN`과 활성 PR·CI·A/B/QA·기존 C 개발을 확인했다. A #2272 공지, B #2273 은행 보안 헤더, QA #2271 DB CI, C #2274 기업 정보, 기획 #2275와 중복되지 않으며 열린 예측 마켓 PR은 없었다.
- 별도 `auto/hourly-c-prediction-truth-v1251-20261101-0715` worktree만 사용했다. 다른 작업, 공유 DB, 금융 원장, 마이그레이션, 운영 서비스는 변경하지 않았다.

## 실제 결함과 구현
- 기존 `/prediction`은 존재를 입증하지 못한 예측 시장 4개, 총 5,080,000 WLD, 배당률·거래량을 표시했고, 네트워크 요청이나 원장 영수증 없이 `handleTrade()`가 구매 성공 모달을 열었다. 기존 테스트도 이 가짜 성공을 기대했다. NestJS 예측 거래 컨트롤러·DB 정산 계약은 확인되지 않았다.
- 허위 거래 UI를 삭제하고 모바일 반응형·키보드·스크린리더 접근 가능한 이용 중단 안내로 교체했다. NestJS 시장 조회·주문 API는 명시적으로 HTTP 503을 반환하며, Android app-api도 주문을 전달하지 않고 503으로 차단한다. 비검증 예측 그룹을 정상 모바일 API로 광고하지 않는다.
- 실제 시장, 포지션, 수수료 소각, 환급, 정산을 구현했다고 주장하지 않는다. WLD 변경은 0건이다. 향후 활성화에는 본인 권한, 원장 영수증, 멱등성, 잔액 검증, 독립 PostgreSQL 보안 검증이 필요하다.

## 테스트와 미완료
- TDD RED: 프론트 3건 실패 재현, Backend 신규 경로 부재, Android 기존 404 확인. GREEN: 집중 Frontend/게이트웨이 21 PASS, Nest HTTP 3 PASS(503·비캐시·비색인).
- 전체 Lint PASS(오류 0, 기존 경고 1,016), Typecheck PASS, Build PASS(2GB 힙), 모바일 API 계약 PASS(184개).
- `NODE_ENV=test pnpm test` PASS: Frontend 2,906 PASS, Backend 2,953 PASS / 517 SKIP. SKIP은 PASS가 아니다.
- 운영 의존성 High 이상 보안 감사 통과. 전체 감사 FAIL(낮음 1, 보통 8).
- 격리 PostgreSQL 17.11에서 실제 마이그레이션을 시도했지만 공식 migrator 권한을 재현하지 못해 005/029/020 단계에서 차단되었다. 자체 검증 컨테이너는 모두 제거했다. **실제 DB·인증 흐름은 BLOCKED**이며 통과로 기록하지 않는다.
- 공식 exact-SHA 인증 Test/E2E, 독립 복원, 전체 경로 QA 증빙, 실제 엣지 비색인 헤더, 병합 SHA 검증, GitOps·Production 승격은 BLOCKED. 공통 헤더 문제는 기존 #2225와 연계하고 중복 수정하지 않았다.

## 배포·복구
- 모든 필수 게이트 PASS 전까지 Draft/HOLD. main 병합, Test/Production 배포, GitOps 및 금융 거래 없음. 추후 배포 시 롤백은 독립 변경 되돌리기이며, 원장 검증 없이 허위 거래 화면을 재활성화하지 않는다. PR·브랜치는 병합 또는 완전 대체 전까지 보존한다.
