# 작업 기록 — 획득 포트폴리오·증분 성장 배분 v2026.09.15.90

기준일: 2026-09-15
저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
변경 유형: 문서-only 소비자 성장 기획

## 시작 상태
- 시작 `main`: `b24788ca82d2a25d83c23ad44153357a2068fad9`.
- 시작 시 최신 기획: v2026.09.14.89 paid acquisition quality.
- 작업 중 write 직전 `main`을 다시 확인했으며 변경 없음.

## 검토 입력
- `PROJECT_PLAN.md` Living Project Plan.
- `PRODUCT_GROWTH_PLAN.md`.
- 최신 paid-acquisition quality 기획.
- creator/community acquisition, referral/viral, SEO/content, monetization, comeback, privacy/security 경계 관련 저장소 문서.
- production `/`, `/guide`, `/announcements`, `/privacy`.

## 선택한 가장 큰 공백
채널별 명세는 충분했지만 allocation은 분절돼 있었다. paid, organic, creator, referral, branded/direct가 서로 conversion을 주장할 수 있으나 무엇이 실제 incremental D30 retained user를 만들었는지 결정하는 공통 기준이 부족했다.

## 제품 결정
`ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC` v2026.09.15.90 생성.

핵심 결정:
- 통합 acquisition portfolio 성과를 incremental fraud-adjusted D30 retained user + retained contribution으로 정의;
- demand creation과 demand capture 분리;
- operational attribution, first-party retained cohort, scale에 비례한 incrementality evidence를 삼각측량;
- 과거 평균 ROI보다 marginal allocation 우선;
- organic/content/creator를 later branded/direct demand를 만드는 compounding asset으로 평가;
- 모든 acquisition source에 동일한 first-value/monetization contract 유지.

## 최신 조사
직접 채택:
1. Google Search Console branded query filter — 2025-11-20 발표, 2026-03-11 광범위 제공.
2. Search Generative AI performance report — 2026-06-03 발표, 2026-08-31 worldwide rollout.
3. social/video platform property — 2026-07-07 발표, 2026-07-29 global availability.
4. Google Meridian v2.0/GeoX — 2026-09 현재 공식 문서. experiment 기반 cross-channel calibration 방향.
5. Google Meridian full-funnel MMM — lower-funnel이 brand demand를 harvest하며 과대평가될 수 있다는 원칙.
6. 개인정보보호위원회 2026-07-27 TikTok·Apple 제재 — attribution을 이유로 third-party behavioral tracking을 확대하지 않는 guardrail.

참고만:
- vendor 사례 uplift를 Moneyverse 예상치로 사용하지 않음;
- MMM/tracking 구현 추가 없음;
- FTC review/endorsement guidance는 marketing integrity guardrail로 유지.

## Runtime audit
2026-09-15 production 확인.
- 홈: game-only 고지는 명확하지만 wallet/mini-games와 broad quick link, sponsored placement가 main positioning 전후에 나타남.
- 가이드: 복리예금·국채·대출·가상주식 시세차익/배당·사업 배당·casino·초보자→자본가 roadmap 등 finance/wealth 서사가 강함.
- 운영소식: 공개 공지 없음, sponsored placement 있음.
- 개인정보처리방침: login, virtual-economy ledger, security 목적의 최소 처리 원칙을 공개.

결론: 여러 acquisition channel이 broad public experience로 수렴하므로 generic homepage 방문량보다 downstream retained quality로 성공을 판단해야 함.

## 보안/개인정보 발견
- HIGH cross-channel private-state leakage.
- HIGH referral/creator/paid arbitrage.
- HIGH finance/gambling claim drift.
- HIGH acquisition phishing/impersonation.
- MEDIUM measurement overcollection.

보안 코드는 수정하지 않았고 기존 OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community 경계를 보존함.

## 추가 파일
- `docs/planning/ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.md`
- `docs/planning/ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.ko.md`
- 영문/한국어 changelog.
- 영문/한국어 worklog.

## Runtime/code 범위
런타임, DB, API, 인증, migration, scheduler, 인프라, 보안 코드 변경 없음.
