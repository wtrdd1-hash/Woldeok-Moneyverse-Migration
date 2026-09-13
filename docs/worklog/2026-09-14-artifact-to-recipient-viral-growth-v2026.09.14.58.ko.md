# 작업 기록 — 아티팩트→수신자 바이럴 성장 v2026.09.14.58

날짜: 2026-09-14
범위: 문서-only 소비자 성장 기획
영문 대응본: `docs/worklog/2026-09-14-artifact-to-recipient-viral-growth-v2026.09.14.58.md`

## 검토 입력
- 작업 시작 및 쓰기 직전 최신 `main`: `b955412d82012636b110fb2c13dee68e0a01c12f`;
- 동시 main 작업은 앱 API 회원가입/지갑 안정성 v2026.09.13.57까지 반영된 상태;
- `docs/planning/PROJECT_PLAN.md`;
- `docs/planning/PRODUCT_GROWTH_PLAN.md`;
- `docs/planning/COMMUNITY_PROOF_TO_PARTICIPATION_GROWTH_SPEC.md`;
- 저장소에서 확인한 브랜드/콘텐츠, retention-to-viral, content-to-habit, weekly brief, 수익화/SEO 최신 기획;
- 현재 공개 홈 런타임;
- 최신/현행 공식 제품·검색·광고 레퍼런스.

## 선택한 가장 큰 공백
기존 작업에는 진짜 커뮤니티 증거와 공유 가능한 사용자 아티팩트가 존재하지만, 공유받은 사람이 Moneyverse를 모르는 상태에서 왜 관심을 가져야 하는지, 그리고 그 유입이 인증을 지나 D1/D7까지 어떻게 보존되는지가 충분히 구체화되지 않았다.

이번 좁은 문제:
`사용자의 의미 있는 결과 → 공유할 가치가 있는 아티팩트 → 로그인 전 수신자 이해 → 맥락형 preview → activation → D1/D7 → 수신자의 자기 아티팩트 생성`.

## Runtime 확인
공개 서비스 확인 가능.
홈에서 확인:
- WLD game-only 고지 유지;
- Discord/커뮤니티 포지셔닝 유지;
- Start Here에서 로그인 전 활동 탐색 가능성을 설명;
- 공개 로비가 실제로 조용하거나 비어 보일 수 있음;
- 월간 소식은 아직 공개 운영소식이 없음;
- 여러 sponsored placement가 이미 존재.

해석: 현재 acquisition에는 공유수신자 가치보다 기능/내비게이션·광고 표면이 더 강하게 보인다. context-rich 공개 아티팩트 루프를 검증하기 전에 referral 지급이나 광고 인벤토리를 확대하지 않는다.

## 조사
직접 채택:
- Discord Profile Widgets FAQ, 2026-09-08 업데이트 — 사용자가 정체성 공개를 직접 커스터마이즈하고 통제.
- Spotify Messages, 2026-01-07 및 2026-01-28 그룹공유 업데이트 — 의미 있는 콘텐츠를 중심으로 공유하고 사용자 통제/안전 기능 유지.
- Google Search Central UGC spam 가이드 — abuse policy, 신고, 스팸계정 탐지, 선택적/noindex 통제.
- Google Search Central Site Reputation Policy, 2026-08-28 — 제3자 콘텐츠를 호스트 도메인 권위 악용용으로 발행하지 않음.
- FTC 현행 Endorsement Guides/FAQ — 인센티브 공유에 material connection이 있으면 적용 가능한 범위에서 명확하게 공개하고, 가짜/왜곡 사회적 증거를 금지.

참고만:
- Discord Game Discovery/Social Play, 2026-08-20 — 단순 노출보다 downstream meaningful play·retention을 성공조건으로 보는 방향.

## 변경한 기획
영문 canonical과 한국어 대응본에 다음을 추가:
- 내재적 공유동기;
- 공유 아티팩트 구조;
- 수신자 첫 30초/3분/첫 세션;
- 수신자 코호트 퍼널;
- D1/D3/D7/D14/D30 연속성;
- referral 경계;
- SEO/공개 발견 기준;
- 리텐션 우선 수익화;
- abuse/privacy/security 조건;
- 통제 실험 5개;
- share-recipient KPI와 trust guardrail.

## 보안/신뢰 발견
High:
1. 개인화 공유물의 비공개정보 유출;
2. 업적/보상 공유를 사칭한 피싱·ATO;
3. 다계정 referral/share fraud;
4. 유해 UGC, 사칭, doxxing, 악성링크.

최소조건은 public-safe allowlist, 개인화 기본 비공개, URL에 secret/session/recovery 값 금지, 공식도메인 식별, 신고/삭제, 단순 클릭·공유·가입에 의미 있는 경제보상 금지, 경제적 referral 또는 대규모 공개 UGC 전 별도 security/fraud QA이다.

## 준비한 파일
- `docs/planning/ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.md`
- `docs/planning/ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-artifact-to-recipient-viral-growth-v2026.09.14.58.md`
- `docs/changelog/2026-09-14-artifact-to-recipient-viral-growth-v2026.09.14.58.ko.md`
- `docs/worklog/2026-09-14-artifact-to-recipient-viral-growth-v2026.09.14.58.md`
- `docs/worklog/2026-09-14-artifact-to-recipient-viral-growth-v2026.09.14.58.ko.md`

## 검증/배포
- 문서-only 작업.
- 런타임 코드, DB, API, 인증, 인프라, 보안 구현 변경 없음.
- 기존 main 보안/경제 경계 보존.
- 문서 자체에는 Test/Production 배포 불필요.
- Runtime Product Reality Audit: 가능, 비파괴적으로 수행.

## 다음 성장 우선순위
여러 아티팩트 유형과 성숙한 D7 코호트에서 좁은 recipient loop를 검증한다. recipient activation/D7이 개선되고 fraud·privacy·spam·phishing 지표가 악화되지 않는 것이 확인되기 전에는 referral payout, viral prompt, 공개 wealth card, 개인화 추적, 광고 중심 share page를 확대하지 않는다.
