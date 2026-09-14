# v2026.09.15.101 — 장기 미사용 보유품 재활용·큐레이션 리텐션 성장

## 추가
- `DORMANT_INVENTORY_REUSE_CURATION_RETENTION_GROWTH_SPEC.md`와 한국어 대응본을 추가했다.
- 더 넓어진 cosmetic catalog와 최신 marketplace cleanup 기능이 만든 현재 리텐션 공백을 선택했다. Moneyverse는 보유품을 더 많이 만들고 더 쉽게 찾게 되었지만, 오래된 보유품을 잡동사니·신규획득 압박이 아니라 정체성·기억·큐레이션·자발적 복귀로 연결하는 소비자 루프가 필요하다.
- `Acquire → Use → Curate → Reinterpret` stewardship ladder와 `그대로 두기 / 다시 전시 / 그룹화 / 일상 화면에서 보관 / 나중에 보기 / 별도 구현된 미래 행동 준비`의 가역적 선택사다리를 정의했다.
- 현재 marketplace 경계를 보존했다. 회원전용 작업대는 noindex이며 실시간 player trading이 아니고 필터 결과가 거래가능성을 뜻하지 않는다.
- D1/D3/D7/D14/D30 생애주기, quick/meaningful/deep cleanup session, 시즌·직업·컬렉션 재해석, public-safe 바이럴 artifact, private inventory SEO 제한, retention-first 수익화 원칙을 추가했다.
- 오래된 아이템 재해석 vs 신규획득 추천, cleanup 종료요약, 중립 stewardship 문구, 시즌 재사용, opt-in public-safe transformation 공유의 5개 실험을 추가했다.
- phishing/ATO, private inventory leakage, 미래 wash trading/collusion/multi-accounting, destructive-action manipulation, finance-like appreciation framing, inventory-history profiling을 보안·악용·개인정보 관점에서 기록했다.

## 최신 main 동시변경 반영
- 작업 시작·중간 `main`: `8e56f533b7f53935654a5a18f136fdbd30fd66a8` (`v2026.09.15.98`, marketplace cleanup controls).
- 반영 직전 `main`이 `76bb3339cf5bdc10ecec8964f0593c3a2e0c846c` (`v2026.09.15.100`, cosmetic sink를 포함한 shop-item 통합)으로 이동했다.
- 최신 head를 다시 읽고 임시 v99 초안을 `v2026.09.15.101`로 재번호한 뒤 반영하도록 정리했다.
- 동시 구현 변경은 이번 공백을 무효화하지 않고 오히려 강화한다. catalog/ownership breadth가 넓어질수록 기존 보유품을 의미 있게 재사용·큐레이션하는 경험이 더 중요해진다.

## Funnel / KPI 변경
핵심 funnel:

`보유 역사 존재 → 정리 후보 발견 → keep/feature/group/later 선택 → 정리 결과 확인 → D7/D14 자발적 재방문 → D30 durable chapter → 선택적 재해석/공유`

추가 측정에는 오래된/미장착 발견→큐레이션, 신규획득 없는 cleanup, old-item re-feature/grouping, voluntary finish, cleanup 후 D7, D14 두 번째 curation, D30 durable-history coverage, 작업대와 실거래 이해도, privacy/phishing/미래 market abuse guardrail이 포함된다.

## SEO / Viral / 수익화 영향
- private holdings, acquisition history, serialized private inventory, 개인화 cleanup state는 계속 비색인이다.
- 얇은 `아이템 × 사용자 × 날짜 × 희귀도` 페이지보다 public season retrospective, exhibit/curation guide, fictional item lore/provenance를 우선한다.
- wealth나 private inventory volume이 아니라 authored transformation을 공유한다.
- 기본 inventory organization을 storage paywall로 만들지 않는다. 보호구간은 `발견 → 이해 → 큐레이션 → 보존상태 확인 → 종료`다.

## 최신 레퍼런스
직접 채택한 방향성: Epic Games Fortnite Archive 현행 안내, Pinterest board personalization(2025-10-27), Steam Trade Protected Items 현행 안내.

참고/guardrail: FTC Elite Events 조치(2026-07), FTC personalized-pricing 집행정책 제안 및 9월 의견기간 연장(2026-08/09, 최종 규칙으로 취급하지 않음), eBay collectible coins Authenticity Guarantee 확대(2026-08-18), Discord phishing 안내(2026-07-23 갱신), 개인정보위 TikTok·Apple 제재(2026-07-27).

## Runtime verification
Production 공개 홈은 접근 가능했고 WLD/보상의 game-only·비현금성 경계를 확인했다. 인증 marketplace는 이번 회차에 회원계정으로 독립 실행하지 않았으며 최신 `main`에서 noindex/workbench/filter/no-live-trading 경계를 확인했다. 따라서 Runtime verification은 부분 가능이다.

## 변경 범위
문서 전용. 런타임·DB·API·인증·migration·scheduler·인프라·marketplace transaction·보안 코드는 변경하지 않았다.
