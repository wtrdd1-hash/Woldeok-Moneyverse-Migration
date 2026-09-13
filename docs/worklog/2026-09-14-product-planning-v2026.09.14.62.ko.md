# 2026-09-14 — 제품 기획 작업기록 v2026.09.14.62

## 범위
문서-only 소비자 성장 기획입니다. 런타임, DB, API, 인증, 인프라, migration, scheduler, 보안 코드는 변경하지 않았습니다.

## 시작 상태
- 저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- 작업 시작 `main`: `5986c1357ac6d205aa0e1e346aaaa555aa5647c2`
- 작업 중간 `main` 재확인: 동일한 `5986c1357ac6d205aa0e1e346aaaa555aa5647c2`
- 현재 문서-only 정책에 따라 별도 문서 PR 없이 `main` 직접 반영.

## 검토한 입력
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`
- `docs/planning/LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`
- `docs/planning/SEASON_SYSTEM_SPEC.md`
- v2026.09.14.61까지 최신 main 커밋
- 공개 runtime 홈, `/guide`, `/announcements`

## 선택한 가장 큰 성장 공백
직전 컬렉션 기획은 discovery, preview, 첫 ownership, D1 recognition, D7 curation, D30 durable chapter까지 이어졌습니다. 남은 가장 큰 공백은 완료 이후의 복귀입니다.

`새 획득이 없어도 왜 D30~D90 사용자가 오래된 컬렉션을 다시 보는가?`

이번 답변은 다음으로 좁혔습니다.
`역사 보존 → 조용한 기간 허용 → 진짜 새 맥락이 생길 때만 다시 연결 → 사용자 authored 재해석 → multi-season memory`.

## 주요 기획 결정
- D30을 새로운 획득/claim 단계가 아니라 preservation checkpoint로 정의했습니다.
- 컬렉션 완료 후 조용한 기간을 명시적으로 허용했습니다.
- 유효한 재해석 계기로 새 시즌 맥락, 가상기업/직업/세계 이야기, editorial exhibit, retrospective, restoration/reframing, opt-in 문화 프로젝트를 추가했습니다.
- FOMO 대신 relevance와 사용자 선택을 중심으로 D-14/D-7/D-3/D-1 시즌 브리지를 추가했습니다.
- 장기 사다리를 `Acquire → Understand → Complete → Curate → Preserve → Revisit → Reinterpret → Anthologize`로 확장했습니다.
- archive history는 기본 비공개, 공개는 되돌릴 수 있는 opt-in으로 유지했습니다.
- archive 보존 자체는 수익화에서 제외하고, 반복 애착 이후 비-P2W 표현 수익화만 허용했습니다.

## 조사한 최신 자료
조사일: 2026-09-14.

### 직접 채택
1. FIFA Collect, `Dynamic Collectibles for World Cup 2026`, 2026-06-26.
   - 시사점: 수집품이 이벤트와 함께 변화하며 역사 기록이 될 수 있음.
   - 채택: living-memory/history 원칙만.
   - 미채택: 거래가치, 희소성, 실물 효용.
2. Discord Profile Widgets FAQ, 2026-09-08 업데이트.
   - 시사점: 사용자가 공개 정체성 요소를 직접 선택·재배치·삭제.
   - 채택: 사용자 공개통제와 가역성.
3. Google Search Central people-first content, 2026-09-14 확인.
   - 채택: 독립적·독창적 공개가치가 있는 archive만 색인 후보.
4. Naver Search Advisor content/basic/markup, 2026-09-14 확인.
   - 채택: 실제 사용자 가치, 정확한 제목/설명, search-only 콘텐츠 금지.
5. FTC Shutterstock settlement, 2026-05.
   - 채택: 중요 구독조건 명확화, express informed consent, simple cancellation.

### 방향성 참고
1. FIFA Collect Dynamic Match Collectible 페이지, 2026-09-14 확인.
   - 이벤트 결과를 오래 남는 역사로 보존하는 프레이밍 참고.
2. Google Preferred Sources global rollout, 2026-04-30.
   - 사용자가 직접 고른 반복 정보원/복귀경로 참고. Moneyverse 예상 성과로 사용하지 않음.
3. FTC Negative Option ANPRM, 2026-03.
   - 미국 negative-option 규정이 여전히 검토 중이므로 launch-time 법적 재확인 trigger.

## Runtime Product Reality Audit
`https://easy-scraping.com/` 공개 runtime 접근 가능.

2026-09-14 관찰:
- 홈은 WLD/보상이 game-only 가상 데이터임을 명확히 표시;
- shortcut은 지갑, 게임, 거래소, 상점, 퀘스트가 여전히 중심;
- sponsored advertisement가 이미 여러 곳 존재;
- 월간 공개소식은 준비 중;
- lobby는 비어 있거나 조용해 보일 수 있음;
- `/announcements`에는 공개 공지가 없지만 광고 placement는 존재;
- `/guide`는 예금, 국채, 대출, 가상주식 수익/배당, 사업, 카지노를 초반부터 강하게 설명하는 금융/경제 중심 서사 유지.

구현된 `D30 archive → D60 reinterpretation → next-season authored return` 경로는 확인하지 못했습니다.

## 보안·개인정보·악용 발견
### High — private-history leakage
최소조건: public-safe allowlist, 기본 비공개, 가역적 공개, 공유 전 preview, URL/analytics에 secret/session/recovery 값 금지.
개인화 public archive 전 별도 개발/보안/privacy QA 필요.

### High — archive/season phishing 및 ATO
최소조건: 공식 도메인 일관성, asset-loss 긴급성 금지, 알림에 민감정보 금지, 콘텐츠 안에서 credential/OAuth code 요구 금지.
이메일/푸시/외부 deep-link 전 별도 개발/보안 QA 필요.

### High — prestige/social-proof manipulation
최소조건: archive open/view/share 자체 WLD/WDX 보상 금지, fraud-adjusted metric, public prestige 전 abuse-resistant eligibility.
사회·경제 ranking reward 전 별도 fraud/security QA 필요.

### High — public-exhibit UGC abuse
최소조건: 첫 pilot bounded/preset text, 신고/삭제, 안전한 outbound-link 정책, 실명 강제 금지, 명시적 public opt-in.
open-ended public annotation 전 별도 trust/safety/privacy QA 필요.

### Medium — 미성년자 및 behavioral profiling
archive history로 민감특성을 추론하거나 맞춤광고를 강화하지 않습니다. 청소년 공개 discovery, stranger interaction, 새 tracking vendor, personalized advertising은 한국+미국 최신 법률/privacy/safety 검토가 필요합니다.

## 추가한 실험 backlog
- reinterpretation vs new-item novelty;
- user-chosen old chapter vs system-selected memory;
- permanent archive vs expiring comeback incentive;
- anthology recap vs raw activity statistics;
- monetization after reinterpretation vs before value.

각 실험은 canonical spec에 hypothesis, cohort, entry point, control/treatment, primary metric, guardrail, minimum observation, next action을 포함합니다.

## KPI 추가
- D30 chapter-preservation rate;
- D60 archive revisit;
- valid-context reinterpretation;
- reinterpretation → meaningful action;
- D7-after-reinterpretation;
- D90/multi-season retention;
- old-chapter → new-season continuation;
- anthology creation;
- share-recipient → activation → D7;
- D60/D90 LTV 및 retention-adjusted contribution;
- privacy/phishing/fraud/UGC/FOMO/ad-click trust guardrail.

## 추가 파일
- `docs/planning/COLLECTION_ARCHIVE_TO_SEASON_REINTERPRETATION_GROWTH_SPEC.md`
- `docs/planning/COLLECTION_ARCHIVE_TO_SEASON_REINTERPRETATION_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-collection-archive-season-reinterpretation-v2026.09.14.62.md`
- `docs/changelog/2026-09-14-collection-archive-season-reinterpretation-v2026.09.14.62.ko.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.62.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.62.ko.md`

## 검증 / 배포
- 문서-only이므로 이번 변경 자체에는 Test/Production 애플리케이션 배포가 필요하지 않습니다.
- Runtime verification은 가능했고 비파괴적으로 수행했습니다.
- 보안 코드는 변경하지 않았습니다.
- 문서 롤백은 Git 이력으로 가능합니다.

## 다음 우선순위
다음 좁은 장기 루프를 먼저 검증합니다.

`D30 보존 챕터 하나 → 진짜 새 시즌 맥락 하나 → 자발적 재해석 행동 하나 → 복귀 후 D7 → D90/multi-season retention`.

이 루프가 검증되기 전에는 public prestige leaderboard, 경제적 referral payout, 대량 개인페이지 SEO, open-ended public annotation, archive 기반 행동광고, 추가 interruptive ad inventory를 우선하지 않습니다.