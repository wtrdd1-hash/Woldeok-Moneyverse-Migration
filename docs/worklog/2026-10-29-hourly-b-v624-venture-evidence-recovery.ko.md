# Backend B v624 — 벤처 투자 금융 증빙 안전 차단 복구 (부분 완료 / 배포 보류)

- 시작·중간 main: `35971c600f25869c96f1c666d4b9f58927202730`. 독립 브랜치 `auto/hourly-b-venture-evidence-recovery-v624-20261029-0535`, 코드 SHA `f7b9d3f48096706cf8bf3de3f8a3db9affd3011c`.
- 기존에 종료됐지만 **병합되지 않은** PR #1374의 고유 변경을 최신 main에 복구하고 실제 NestJS HTTP 회귀 테스트를 추가했다. A/C/QA와 겹치는 열린 벤처 PR은 없다.
- `GET /api/v1/businesses/ventures/pitches`, `/investments`: 가상 투자자·회원 지분·배당금 반환 대신 HTTP 503, `VENTURE_EVIDENCE_UNAVAILABLE`, `Cache-Control: no-store` 반환. 기존 인증·동의 및 쓰기 차단은 유지했다.
- 웹 시뮬레이션의 6천만 WLD 예시 잔액과 IPO·배당·지분을 실제 원장처럼 표시하지 않도록 수정했다. 정상적인 실거래 기능이 구현된 것은 아니다.
- 수정 전 HTTP 테스트 2건, 프론트 표시 테스트 1건 및 추가 배당 문구 검증 실패를 확인했다. 수정 후 Backend 집중 7/7, Frontend 집중 5/5 PASS.
- Backend 전체 1,941 PASS / 440 SKIPPED, DB 패키지 46 PASS / 4 SKIPPED, Typecheck·Backend Build·API 계약 180개·보안 정책 15개 PASS. Lint 오류 0건, 경고 1,099건.
- 초기 `undici` 모듈 누락은 **격리 worktree 내부** 의존성 연결을 복구한 뒤 재검증했다. 공유 환경의 의존성을 수정하지 않았다.
- 보안 감사 `qs@6.16.0` Moderate 1건으로 FAIL. 디스크 99%로 전체 Frontend·Next.js 빌드 미실행. 실제 PostgreSQL·인증 E2E·공식 Test 동일 SHA 미검증.
- 공식 Test SHA `cfb13272beea53c4d8c20eff7f379b6f66343033`, Production SHA `unknown`. PR #1786 Draft + hold. main 병합·Test/Production 배포·금융 데이터 변경·브랜치 삭제·예약 변경 없음.
