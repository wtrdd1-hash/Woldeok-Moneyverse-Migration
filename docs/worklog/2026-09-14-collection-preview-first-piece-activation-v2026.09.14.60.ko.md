# 작업기록 — 컬렉션 프리뷰→첫 조각 활성화 v2026.09.14.60

날짜: 2026-09-14
범위: 사용자 획득·활성화·리텐션·바이럴·SEO·수익화 기획만

## 확인한 main·문서
- 작업 시작 `main`: `c02afe0d1d5cf53792a588772797e793bc24ab4e`.
- `PROJECT_PLAN.md` Living Project Plan.
- `PRODUCT_GROWTH_PLAN.md`.
- `COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md` v2026.09.14.59.
- 저장소 검색을 통해 현재 retention/content/monetization/SEO/public-consumer 기획 스택을 확인했습니다.
- Living Project Plan의 기존 security/privacy/economy 경계를 보존했습니다.

## 선택한 가장 큰 공백
첫 바이럴 아티팩트는 정해졌지만, 수신자가 `흥미로운 쇼케이스`에서 `가입 + 첫 의미 있는 컬렉션 행동`으로 이동할 좁고 설득력 있는 이유가 부족합니다. 이 상태에서는 share traffic이 activation/D7 없이 vanity metric으로 끝날 수 있습니다.

## 기획 결정
`COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md`와 한국어 대응본을 추가합니다.

소비자 루프:
`쇼케이스 → 이해 → 프리뷰 → 내 선택 → 맥락형 가입 → 첫 컬렉션 행동 → 첫 가치 증명 → D1 → D7 → D30 → 선택적 자기 쇼케이스`.

## Runtime Product Reality Audit
2026-09-14 공개 서비스 접근 가능.

확인:
- 홈은 WLD/보상이 game-only 가상 데이터라고 고지합니다.
- 공개 shortcut은 지갑·게임·거래소·상점·퀘스트를 먼저 보여줍니다.
- sponsored advertisement가 여러 곳 보입니다.
- 월간 소식은 공개 운영 소식을 준비 중입니다.
- 로비는 조용하거나 비어 보일 수 있습니다.
- 시작 가이드는 복리예금·국채·대출·주식 시세차익/배당·패시브소득·`대표 자본가` 진행서사 등 경제 중심 설명이 강합니다.
- public collection showcase → preview → first-piece activation 경로는 확인되지 않았습니다.

런타임 코드는 변경하지 않았습니다.

## 외부 최신자료 확인
- Discord Profile Widgets FAQ — 2026-09-08 업데이트.
- Discord game discovery/social play — 2026-08-20.
- Xbox achievement/profile 개선 — 2026-04-08.
- Pokémon TCG Pocket community/support 안내 — 2026-05-12 업데이트.
- Google Search Central UGC spam 방지/noindex 안내.
- Google Site Reputation Policy 업데이트 — 2026-08-28.
- FTC Shutterstock 구독 집행 — 2026-05-13.
- FTC Publishing.com final order — 2026-07.
- 개인정보보호위원회 COPPA 2.0 국외동향 — 2026-04-01. 현행 한국법이 아니라 legal-review trigger로만 사용했습니다.

## 보안·신뢰 발견사항
High:
1. public preview에서 인벤토리·계정·경제·비공개 관계·보안정보 누출 가능성.
2. `첫 조각 저장/받기`를 사칭한 phishing/ATO 가능성.
3. starter/referral 가치가 다계정 farming을 유발할 가능성.
4. 자유 caption/link가 사칭·doxxing·spam·악성링크에 악용될 가능성.

최소 기획조건:
- public-safe allowlist + data minimization;
- personalized state 기본 비공개;
- URL/analytics에 secret/session/recovery 값 금지;
- preview/raw signup에 의미 있는 spendable reward 금지;
- auth 전에 유용한 공개맥락 + 일관된 공식도메인/브랜드;
- 첫 public pilot은 bounded/preset text 우선;
- personalized public preview, 외부 deep-link, 경제적 incentive, open UGC 구현 전 별도 개발/security/fraud/privacy QA.

## 추가 실험
- Preview-before-auth vs auth-first.
- Authored choice vs passive lore.
- Contextual signup vs generic signup.
- First-piece proof vs balance-first onboarding.
- Value-first monetization vs early interruption.

Primary는 share open/raw signup이 아니라 meaningful activation, time-to-first-value, D1/D7/D30, retention-adjusted contribution입니다.

## SEO·수익화 결정
- preview/draft/personal progression의 mass indexing 금지.
- 충분한 guide/lore/archive/editorial/public-safe project만 색인 후보.
- 첫 가치 증명 뒤 monetization.
- 금융게임 우위·가짜 희소성·숨은 sponsored ranking 금지.
- 구독은 중요조건 고지·명시적 동의·쉬운 해지 원칙 유지.

## 이번 버전 파일
- `docs/planning/COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md`
- `docs/planning/COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.ko.md`
- `docs/changelog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.md`
- `docs/changelog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.ko.md`
- `docs/worklog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.md`
- `docs/worklog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.ko.md`

## 변경하지 않음
런타임 코드, DB, API, 인증, 인프라, 보안코드, 배포설정은 변경하지 않았습니다. 기존 auth/session/RBAC/ledger/privacy/ad 경계를 약화시키지 않습니다.
