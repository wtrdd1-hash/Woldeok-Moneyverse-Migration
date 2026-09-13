# 2026-09-14 — 리텐션 안전 수익화 진입 v2026.09.14.64

## 요약
익명 신규·활성·복귀·장기 사용자 생애주기별로 언제 수익화가 허용되는지 정의하는 문서-only 소비자 성장 명세를 추가했다.

가장 큰 공백은 기존 문서가 광고 허용/금지 면과 결제 보호조건은 잘 정의하지만, activation과 retention을 해치지 않고 제품이 언제 수익화를 노출할 자격을 얻는지 충분히 좁히지 못했다는 점이다.

선택한 순서:
`약속된 가치 → meaningful activation → continuity proof → monetization eligibility → 낮은 방해의 수익화 → retention/trust 검증 → 확대`.

## 주요 결정
- answer/preview/첫 의미 행동/next-goal 설정 구간을 interruptive monetization에서 보호한다.
- 첫 로그인보다 D7 repeat value를 넓은 수익화 실험의 첫 기준점으로 본다.
- comeback catch-up과 첫 복귀 행동 사이에는 광고를 넣지 않는다.
- 경제 우위보다 표현/꾸미기/archive 수익화를 우선한다.
- 광고제거 구독은 사용자가 제거되는 광고 가치를 이해할 수 있는 시점 이후 제안한다.
- 광고 성공은 impressions/CTR이 아니라 retention-adjusted contribution으로 평가한다.
- 잔액/WDX/부채/카지노/보안/비공개 소셜 데이터를 광고 타기팅에서 제외한다.
- raw ad view/click에 의미 있는 WLD/WDX 보상을 주지 않는다.

## 실험
value-before-ad vs early-ad, D7-gated subscription vs first-session offer, expression product vs economy-adjacent benefit, contextual sponsor vs display ad, lifecycle ad-load cap vs uniform load 실험을 추가했다.

## 연구
Discord Play Quest+/Quests(2026-08-20, FAQ 2026-08-31), Discord Ads Policy(2026-09-09 업데이트), FTC 2026 구독 집행, 개인정보보호위원회 2026-04-01 청소년/privacy 국외동향을 직접 참고했다. 외부 성과 수치를 Moneyverse 예측치로 사용하지 않는다.

## 보안/신뢰
High: sponsor 사칭/phishing, 비공개 경제데이터 행동광고, rewarded-ad 경제 어뷰징, 구독/결제 phishing·dark pattern. Medium: 광고측정 과수집. 보안 코드는 수정하지 않았다.

## Runtime audit
공개 런타임 접근 가능. 홈에는 이미 여러 광고 슬롯이 있지만 월간 소식은 준비 중이며 공지에도 게시물 없이 광고 슬롯이 있다. 가이드는 여전히 경제 중심이다. 따라서 새 inventory보다 sequencing/ad-load discipline이 우선이다.

## 추가 파일
- `docs/planning/RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
- `docs/planning/RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.ko.md`
- v2026.09.14.64 영/한 changelog 및 worklog.

런타임, DB, API, 인증, migration, 인프라, 배포 변경 없음.