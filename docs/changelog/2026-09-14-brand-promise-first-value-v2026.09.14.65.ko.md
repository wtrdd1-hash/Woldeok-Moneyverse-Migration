# 2026-09-14 — 브랜드 약속→첫 가치 정렬 v2026.09.14.65

## 요약

Moneyverse가 acquisition 단계에서 약속하는 모습과 activation·retention 단계에서 실제 요구하는 행동을 일치시키기 위한 소비자 성장 명세를 추가했다.

이번에 선택한 공백은 expectation mismatch다. 최근 성장기획은 authored choice, 학습, 컬렉션, 정체성, 시즌, 커뮤니티, 장기 기록을 강조하지만 현재 공개 runtime은 여전히 지갑·금융·카지노·자산성장 개념을 강하게 전면화할 수 있다. 이 차이는 클릭·가입은 늘어도 질 낮은 acquisition과 금융상품 오인을 만들 수 있다.

## 추가 문서

- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`
- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.ko.md`
- v2026.09.14.65 영/한 changelog 및 worklog.

## 소비자 기획 변경

- canonical category를 지속형 커뮤니티 시뮬레이션 / 가상경제 게임으로 정리했다.
- 핵심 약속을 사용자의 선택, 지속되는 진행, 기억되는 기록 중심으로 정의했다.
- 사람의 결과 → 구체적 제품 증거 → 신뢰경계 → 행동 하나의 4단 메시지 계층을 추가했다.
- 첫 30초와 첫 3분 이해 목표를 정의했다.
- 동일한 약속을 D1/D3/D7/D14/D30 리텐션에 연결했다.
- home, guide, SEO, share landing, auth continuation, comeback의 surface별 메시지 구조를 추가했다.
- acquisition에서 제한하거나 맥락을 붙여야 할 finance-like 표현을 정리했다.
- comprehension, expectation alignment, activation, D7/D30, CAC/LTV, trust를 연결한 message-cohort KPI를 추가했다.
- persistence/identity hero, one-proof vs feature-grid, goal-first guide, contextual game-only qualifier, paid message-cohort gate 총 5개 실험을 추가했다.

## 보안·악용·개인정보

High로 기록:
- 공식 브랜드 사칭·피싱·ATO;
- finance-like 기만/오인;
- public/private 데이터 누출.

Medium으로 기록:
- bot/fake-signup/referral 조작;
- analytics 과수집;
- UGC 사칭/doxxing.

기존 auth/session/RBAC/admin/ledger/privacy 경계는 유지한다.

## 최신 research note

조사일: 2026-09-14.

직접채택/참고:
- Discord GDC 2026 social layer/Instant Play: 발견에서 실제 첫 경험까지의 마찰을 줄이는 원칙.
- Discord Official + 2026-08-20 discovery update: canonical trusted identity와 discovery 일관성.
- Meta 2026-03 original creator update: original content와 impersonation protection.
- Instagram Instants 2026-05: low-friction share와 private archive/user control.
- Google Search Central people-first 및 2026-08-28 Site Reputation Policy.
- Naver Search Advisor의 현행 브랜드/title/content/spam 가이드.
- 공정위 표시광고 법령·지침: 정확성/기만 방지 guardrail.
- 개인정보보호위원회 2026-04-01 COPPA 2.0 국외동향: 한국법이 아닌 youth/privacy review trigger.

## Runtime reality audit

2026-09-14 runtime verification 가능.

관찰:
- homepage는 WLD가 game-only라는 점을 명확히 표시한다.
- 브랜드 설명보다 앞쪽/주변에 wallet/game/stock/shop/quest shortcut 및 여러 sponsored placement가 존재한다.
- 월간소식은 아직 비어 있다.
- 시작 가이드는 복리예금, 국채, 대출, 주식 시세차익/배당, 사업 배당, 카지노와 “대표 자본가” wealth ladder를 강하게 보여준다.

결론: 현재 런타임은 disclosure는 비교적 강하지만 브랜드 hierarchy는 최신 성장방향과 완전히 일치하지 않는다. 이번 회차에서는 이를 growth/trust hypothesis로만 기록하고 runtime copy는 수정하지 않는다.

## 배포 상태

문서-only 변경. 런타임, DB, API, 인증, 인프라, 보안코드, 배포, Production configuration 변경 없음.
