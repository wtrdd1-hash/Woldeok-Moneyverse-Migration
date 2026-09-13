# 2026-09-14 — 제품 기획 작업기록 v2026.09.14.63

## 범위
문서-only 소비자 성장 기획. 런타임, DB, API, 인증, 인프라, migration, scheduler, 보안코드 변경 없음.

## 시작 상태
- 저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- 시작 시 `main`: `b33a7843c05964eebff11b11c9236f404e1885ae`
- 중간 `main` 재확인: 동일한 `b33a7843c05964eebff11b11c9236f404e1885ae`
- 문서-only는 별도 PR 없이 `main` 직접 반영 정책 사용.

## 확인한 문서/상태
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/COLLECTION_ARCHIVE_TO_SEASON_REINTERPRETATION_GROWTH_SPEC.md`
- v2026.09.14.62까지 최근 성장기획 커밋
- 공개 runtime 홈, `/guide`, `/announcements`
- Google Search Central, Naver Search Advisor, Discord discovery/trust, Spotify editorial discovery, FTC subscription 관련 최신 자료.

## 가장 큰 성장 공백
최근 회차는 collection/share/retention을 D90까지 깊게 구체화했다. 상대적으로 부족한 앞단은 공개 검색 유입에서 제품 activation으로 넘어가는 연결이다.

핵심 질문:
`Google/Naver/share에서 답을 얻은 사용자가 왜 이탈하거나 generic auth wall을 만나는 대신 Moneyverse에서 첫 의미 행동을 하는가?`

선택한 답:
`검색의도 충족 → contextual preview 하나 → authored choice 하나 → contextual signup → meaningful activation → D1 exact-intent recognition → D7 continuation`.

## Runtime Product Reality Audit
2026-09-14 공개 runtime 접근 가능.

관찰:
- 홈은 WLD/보상이 game-only 가상 데이터임을 명확히 고지;
- 홈은 지갑, 게임, 거래소, 상점, 퀘스트와 여러 sponsored advertisement를 전면화;
- 월간 공개소식은 준비 중이고 로비는 조용하게 보일 수 있음;
- `/announcements`에는 공개 공지가 없지만 광고영역은 존재;
- `/guide`는 내용은 충분하지만 예금, 국채, 대출, 주식 시세차익/배당, 사업, 카지노를 강하게 전면화;
- quick start가 intent-specific pre-auth preview가 아니라 로그인→지갑부터 시작.

따라서 `유용한 답 → contextual preview → authored choice → contextual signup → meaningful activation`은 현재 runtime에서 확인되지 않았다.

## 조사 내용
조사일: 2026-09-14.

### 직접 채택
1. Google Search Central — Helpful, Reliable, People-First Content.
   - 검색 유입 자체보다 실제 사용자에게 독창적이고 충분한 가치 제공.
   - answer-first, fewer/substantial intent page 원칙 채택.
2. Google Search Central — Site Reputation Policy update, 2026-08-28.
   - Moneyverse domain ranking signal을 빌리는 third-party/sponsor SEO inventory 금지.
3. Google Search Central — Prevent User-Generated Spam.
   - 신고, spam account 탐지, trust/noindex 경계 채택.
4. Naver Search Advisor — SEO 기본 가이드 및 웹 콘텐츠 스팸사례.
   - 정확하고 고유한 title/description, 사용자 도움 중심, 낚시/스크래핑/저품질 대량 템플릿 금지.
5. Discord — New Tools to Power Game Discovery and Social Play, 2026-08-20.
   - discovery는 노출이 아니라 실제 gameplay/retention으로 평가.
6. Discord Official, 2026-03-12.
   - discovery와 공유링크의 공식 profile/domain 신뢰 신호.
7. FTC Shutterstock settlement, 2026-05.
   - 구독 중요조건 명확 고지, express informed consent, simple cancellation.

### 참고만 함
1. Spotify — New Music Friday editor-led video, 2026-06-12.
   - 설명/큐레이션이 discovery engagement를 깊게 만들 수 있다는 참고. 성과 수치는 Moneyverse 예측에 사용하지 않음.
2. FTC Negative Option ANPRM, 2026-03.
   - 미국 negative-option 정책 출시 전 재검토 trigger.

## 기획 결정
- 초보 학습, 가상기업/world, collection/identity, profession/progression, season/event archive 5개 검색의도 cluster 정의.
- 인증 전에 검색의도를 먼저 충족.
- 전체 product grid 대신 contextual pre-auth preview 하나.
- signup 이후에도 entry intent를 보존해 D1/D7까지 연결.
- login, wallet view, ad click은 activation에서 제외.
- organic click부터 D30/LTV까지 intent cohort KPI 추가.
- private/economy/security page는 검색 acquisition에서 제외.
- scaled template/doorway page 금지.
- 수익화는 answer/preview/first authored choice 뒤에 배치.

## 보안·개인정보·악용
### High — public/private leakage
최소조건: public-safe allowlist, personalized state 기본 비공개, URL/metadata/analytics/share payload에 secret/session/recovery 금지.
Personalized public landing 전 별도 QA 필요.

### High — SEO/UGC spam 및 악성링크
최소조건: raw post/signup/view 경제보상 금지, 신고/삭제, indexing trust threshold, safe outbound-link policy, low-trust/thin 콘텐츠 noindex/unlisted.
Broad public UGC indexing 전 별도 trust/security QA 필요.

### High — 공식 콘텐츠 사칭/phishing/ATO
최소조건: official domain 일관성, 콘텐츠 내부 credential/OAuth code 요청 금지, 알림에 민감 계정값 금지, 자산손실 긴급성 금지.
Email/push/deep-link 전 별도 보안 QA 필요.

### High — fake signup/referral manipulation
최소조건: raw visit/click/signup에 WLD/WDX 경제보상 금지, fraud-adjusted funnel, 향후 referral은 검증된 downstream milestone 기반.

### Medium — tracking/privacy 과수집
Attribution을 위해 민감/비공개 economy/account field를 analytics/ad vendor에 전달하지 않는다. Youth-facing personalization/tracking은 한국+미국 최신 legal/privacy review 필요.

## 추가 실험
- answer-first vs auth-first;
- contextual signup CTA vs generic signup;
- one preview vs feature grid;
- substantial original page vs scaled template;
- value-before-ad vs early ad.

각 실험의 hypothesis, cohort, entry, control/treatment, primary, guardrail, 최소관찰기간, 후속행동은 canonical 명세에 기록.

## KPI 추가
- qualified organic sessions;
- organic→contextual preview→authored choice;
- contextual signup, signup→meaningful activation;
- content-assisted time-to-first-value;
- auth 전후 intent preservation;
- D1 exact-intent recognition;
- D3 adjacent continuation;
- D7 original-thread continuation/resolution;
- D30 durable-record;
- intent별 retention/LTV;
- thin/duplicate ratio, spam signal, trust guardrail.

## 추가 파일
- `docs/planning/SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md`
- `docs/planning/SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-seo-intent-to-play-activation-v2026.09.14.63.md`
- `docs/changelog/2026-09-14-seo-intent-to-play-activation-v2026.09.14.63.ko.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.63.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.63.ko.md`

## 검증 / 배포
- 문서-only이므로 이번 변경 자체의 Test/Production 배포 불필요.
- Runtime verification 비파괴적으로 수행.
- 보안코드 수정 없음.
- Git history로 문서 롤백 가능.

## 다음 우선순위
콘텐츠 재고를 늘리기 전에 다음 하나를 검증한다.

`깊이 있는 intent page 하나 → contextual preview 하나 → authored choice 하나 → contextual signup → meaningful activation → D1 exact-intent recognition → D7 continuation`.

이 루프 검증 전에는 mass SEO pages, doorway keyword variants, raw-signup referral reward, 공개 개인 finance/status page, search-intent behavioral ads, interruptive ad inventory 확대를 우선하지 않는다.