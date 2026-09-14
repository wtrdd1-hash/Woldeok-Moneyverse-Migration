# 작업기록 — 정체성 안전형 머천다이징·투명 로테이션 v2026.09.15.96

## 저장소 기준
- 저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- write 전 시작/최신 `main`: `a194cc220c8d8d2c6c2bf38146c0c654515b22b8`
- 바로 전 통합 release: v2026.09.15.95.
- 보존한 최신 런타임 범위: calendar shop deadline, marketplace recent-acquisition filter, first-party web local login, cosmetic/convenience sink.

## 검토 문서
- `PROJECT_PLAN.md`
- `PRODUCT_GROWTH_PLAN.md`
- `COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`
- 저장소 검색을 통한 retention-safe monetization, brand/trust, acquisition, collection 관련 최신 방향.
- 최신 `main` commit/diff metadata.

## 공백 선택
기존 문서에는 collection ownership-to-curation, pre-signup activation, comeback, retention ladder, brand positioning, trust, paid acquisition, acquisition portfolio가 이미 있다. v95 런타임 확장으로 이제 **상점이 사용자에게 무엇을 열망하라고 가르치는가**가 별도 핵심 공백이 됐다.

Production에는 표현형 catalog가 충분하지만 wealth/profit/casino status 문구도 있다. 따라서 이번에는 collection schema나 구매 구현 상세가 아니라 identity-safe merchandising + transparent rotation을 선택했다.

## Runtime verification
2026-09-15 확인:
- `https://easy-scraping.com/`
- `https://easy-scraping.com/shop`
- `https://easy-scraping.com/guide`

확인:
- WLD/reward의 game-only/non-cash 고지는 명확하다.
- 홈은 깊은 브랜드 설명 전후로 여러 기능과 sponsored placement를 함께 보여준다.
- Store 2.0은 다수의 cosmetic/convenience 카테고리에서 136개 catalog 항목과 WLD sink를 노출한다.
- 일부 label은 wealth/profit/investing/casino outcome을 prestige로 표현한다.
- 인증이 필요한 `/calendar`, holdings는 독립 실행하지 못했으며 최신 main 문서에서 authoritative sale-ending deadline과 recent-acquisition filtering 통합을 확인했다.

Runtime verification: **부분 가능 — 공개 소비자 surface 검증, 인증 calendar/holdings 미실행.**

## 외부 조사
1. Epic Games 현재 지원문서 — 개별 cosmetic 제거 날짜/시간 노출. 직접 채택: exact authoritative deadline.
2. Supercell Clash of Clans 2026-01-09 — 명확한 이벤트 종료 + 2일 교환 grace. 직접 채택: end/grace 실험 패턴.
3. 미국 FTC 2026-08 personalized-pricing enforcement-policy 제안 — data-driven individualized pricing을 고정가격처럼 오인시키는 위험에 대한 최신 정책 신호. 최종규칙으로 취급하지 않음.
4. 한국 공정위 2025-02-13 온라인 다크패턴 공식 문답 — 현행 준수 참고.
5. 한국소비자원 2026 광고감시 — 소비자 기망형 다크패턴을 계속 모니터링.
6. Google Search 최신 product-data 안내 — 공개 검색에서 price/availability 동기화 중요. Moneyverse 공개 item page가 색인될 때만 참고.

## 소비자 기획 변경
- 표현형 우선 merchandising hierarchy.
- wealth/profit/casino prestige 하향.
- authoritative deadline/expiry 의미.
- bounded redemption grace 실험.
- follow-intent 알림.
- D1/D3/D7/D14/D30 shop/identity return logic.
- public-safe artifact 공유.
- deadline 압박이 아니라 이해 후 수익화.
- timer page farm보다 season/collection 큐레이션 SEO.

## 실험 backlog
가설, cohort, entry, control/treatment, primary metric, guardrail, observation window, next action을 모두 포함한 5개 실험:
A. identity-first merchandising;
B. exact deadline vs generic urgency;
C. hard cutoff vs redemption grace;
D. follow-intent vs broadcast notification;
E. catalog SEO volume vs curated public content.

## 보안·개인정보·fraud
- HIGH: deadline phishing/ATO.
- HIGH: false scarcity/deceptive urgency.
- HIGH: wealth/casino/profit prestige의 금융 오인/loss-chasing 유도.
- HIGH: inventory sniping/bot/multi-account abuse.
- HIGH: sensitive recommendation/share leakage.
- MEDIUM: 숨은 individualized pricing/profile overreach.

보안 코드는 수정하지 않았다. 관련 런타임 확대 전 별도 security/privacy/fraud/legal QA가 필요하다.

## 추가 파일
- `docs/planning/IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.md`
- `docs/planning/IDENTITY_SAFE_MERCHANDISING_TRANSPARENT_ROTATION_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-15-identity-safe-merchandising-transparent-rotation-v2026.09.15.96.md`
- `docs/changelog/2026-09-15-identity-safe-merchandising-transparent-rotation-v2026.09.15.96.ko.md`
- `docs/worklog/2026-09-15-identity-safe-merchandising-transparent-rotation-v2026.09.15.96.md`
- `docs/worklog/2026-09-15-identity-safe-merchandising-transparent-rotation-v2026.09.15.96.ko.md`

## 반영 정책
최종 latest-main 재확인 뒤 문서 전용 변경을 `main`에 force 없이 fast-forward로 직접 반영한다. 별도 문서 PR은 만들지 않는다.
