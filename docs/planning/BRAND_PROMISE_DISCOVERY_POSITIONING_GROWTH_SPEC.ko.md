# 월덕 머니버스 — 브랜드 약속·발견 포지셔닝 성장 명세

> 버전: v2026.09.14.87
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md`, `VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.md`, `SATISFYING_SESSION_END_HEALTHY_RETURN_GROWTH_SPEC.md`
> 영문 기준 문서: [BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.md](BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임·DB·API·인증·migration·scheduler·인프라·보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse는 리텐션 기획이 점점 강해졌지만, 현재 가장 큰 획득/활성화 공백은 그보다 앞단이다. **첫 방문자가 지갑·미니게임·가상주식·상점·퀘스트·커뮤니티·광고를 동시에 보기 전에 ‘왜 이 서비스가 나에게 재미있는가’를 하나의 기억나는 약속으로 이해할 수 있는가**가 아직 충분히 명확하지 않다.

공개 홈은 `커뮤니티 가상경제 서비스`라고 정확히 설명하지만, 실제 화면 우선순위에서는 지갑·게임·거래소·상점·퀘스트 등이 강하게 경쟁한다. 이는 사실이지만 소비자에게는 아직 넓은 범주 설명에 가깝다.

선택한 루프:

`적합한 유입 → 명확한 약속 하나 → 증거/샘플 하나 → 사용자가 고른 관심사 → 맥락형 가입 → 의미 행동 → D1 약속 이행 → D7 일관된 정체성 → D30 지속 기록/공유`

이 문서는 포지셔닝·콘텐츠·퍼널 명세이며, 내비게이션 컴포넌트나 backend 구현 명세가 아니다.

## 2. 소비자용 카테고리 약속

기본 포지셔닝:

**“내가 한 행동이 성장·수집·이야기·공동 기록으로 남는 지속형 커뮤니티 세계 — 게임 전용 가상경제를 이용하는 서비스.”**

경제는 핵심 메커니즘 중 하나이지 전체 정체성이 아니다. 첫인상은 주도성·지속성·공동 세계의 진행을 먼저 보여주고, WLD/WDX는 명확한 game-only 고지와 함께 보조 시스템으로 다룬다.

다음처럼 보이면 안 된다:
- 실제 투자 서비스;
- 예금·수익률 상품;
- 도박 목적 서비스;
- 부자 되기 시뮬레이션;
- 단순 Discord 보상 봇;
- 서로 무관한 미니게임을 광고로 묶은 포털;
- 실제 증권사·은행·금융교육 대체재.

## 3. 첫 30초: 기능 목록보다 약속

첫 방문자는 빠르게 네 가지를 이해해야 한다.
1. **무엇인가:** 지속형 커뮤니티 가상경제 게임/세계.
2. **무엇을 할 수 있나:** 직업을 성장시키고, 수집·큐레이션하고, 가상기업/세계를 따라가고, 프로젝트나 시즌을 탐색할 수 있다.
3. **무엇이 남나:** 선택과 성취가 개인 기록으로 남는다.
4. **무엇이 아닌가:** WLD/WDX/보상은 게임 전용 가상 데이터이며 현금·예금·증권이 아니다.

첫 화면에서 전체 경제 시스템을 이해시키려 하지 않는다. 많은 바로가기가 존재할 수는 있지만, 그것이 대표 약속과 첫 행동을 대신해서는 안 된다.

## 4. 첫 3분: 약속의 증거

가능하면 가입 전에 public-safe 샘플 하나를 제공한다.
- 설명 가능한 이벤트가 있는 가상기업/세계 카드;
- 컬렉션/전시 preview;
- 직업 경로 preview;
- 시즌/프로젝트 archive;
- 짧은 교육형 simulation/replay;
- 공개 가능한 공동 프로젝트 결과.

샘플의 끝은 `이 세계 팔로우`, `이 경로 저장`, `이 컬렉션 시작`, `이 프로젝트 계속`처럼 사용자가 직접 고르는 상태 하나로 이어져야 한다.

가입은 그 의도를 보존해야 한다. 실제로 보존된다면 `회원가입`보다 `이 경로 저장하고 계속하기`가 더 강한 CTA다.

## 5. 유입 채널별 약속 규율

모든 유입 채널은 첫 세션에서 실제로 지킬 수 있는 약속을 해야 한다.

### 검색/SEO
검색 질문에 먼저 답한 뒤 하나의 플레이/팔로우 가능한 스레드로 연결한다. 실제 투자·예금·수익률·증권사를 찾는 사용자를 넓은 금융 키워드로 끌어오지 않는다.

### 소셜 공유
단순 자산보다 완료된 artifact와 이야기를 공유한다. 예: 컬렉션 chapter, 직업 milestone, 프로젝트 결과, 시즌 archive, educational replay, 공개 가능한 가상기업/세계 인사이트.

### 크리에이터/커뮤니티 협업
경제/WDX를 다루는 홍보는 game-only/simulated임을 정확히 설명한다. 금전·무료 제공 등 이해관계가 있다면 명확히 공개한다.

### 유료획득
CPI/CPC나 raw signup보다 `적합한 방문 → 의미 활성화 → D7/D30 retained user → 기여`로 평가한다. 클릭은 높고 D7/D30이 약한 creative는 실패한 약속이다.

## 6. 브랜드 4대 축

### 주도성
사용자가 무엇을 만들고, 모으고, 배우고, 따라갈지 고른다. 강제 feature tour를 브랜드 경험으로 만들지 않는다.

### 지속성
진행은 기록으로 남아야 한다. 첫 선택이 D1/D7/D30으로 이어진다.

### 공동 세계
커뮤니티와 live content가 맥락을 만들지만, 기본 진행을 위해 사회적 압박을 요구하지 않는다.

### 안전한 허구
가상주식·은행·대출·카지노형 메커니즘은 명확히 fictional/game-only이며 기존 market-integrity·확률·개인정보·연령/법적 gate를 유지한다.

## 7. D1/D3/D7/D14/D30 약속 사다리

### D1 — 기억을 증명
사용자가 관심을 보인 exact thread를 먼저 복원한다. 가입 다음 날 무관한 금융/feature grid로 보내면 첫 약속은 깨진다.

### D3 — 변화를 증명
같은 thread 안에서 실제 변화·적용·유용한 unchanged 상태 하나를 보여준다.

### D7 — 일관된 정체성을 증명
사용자는 `WLD를 번다`보다 더 구체적으로 `직업을 키운다`, `컬렉션을 큐레이션한다`, `가상기업을 따라간다`, `프로젝트를 만든다`, `전략을 배운다`라고 답할 수 있어야 한다.

### D14 — 자발적으로 확장
기존 정체성을 강화하는 관련 시스템 하나만 제안하고, 미루기에 불이익을 주지 않는다.

### D30 — 지속 기록을 증명
직업·컬렉션·프로젝트·학습·시즌 중 하나 이상의 chapter/artifact가 남아 다시 보거나 선택적으로 공유할 가치가 있어야 한다.

## 8. 콘텐츠·SEO 구조

같은 제품 정체성을 강화하는 콘텐츠를 우선한다.
- 가상경제/게임 시스템 초보자 가이드;
- 독창적인 가상기업/세계 lore와 이벤트 설명;
- 직업/컬렉션 가이드;
- 시즌/이벤트 archive·회고;
- 교육형 용어집·simulation 설명;
- 공개 가능한 project/community 결과.

`ticker × 날짜 × 키워드`, `사용자 × 잔액`, 대출/카지노 결과, private portfolio, recovery/security 상태, referral code 같은 doorway/thin page를 대량 생성하지 않는다.

Google의 people-first 지침은 사이트가 명확한 주목적을 갖는지, 사용자가 만족스러운 결과를 얻는지를 묻는다. Naver도 메인 title이 사이트 성격/브랜드를 명확히 표현하도록 권장한다. 따라서 SEO와 브랜드는 여러 키워드 정체성이 아니라 하나의 일관된 목적을 공유해야 한다.

## 9. 바이럴 루프

우선 루프:

`의미 결과 → public-safe artifact/story → 비회원도 맥락 이해 → 선택적 샘플 → 관심사 선택 → 필요할 때만 가입 → D7 retained thread`

금지/비권장:
- raw invite spam;
- wealth-flex 카드 기본값;
- 정확한 portfolio/debt/casino 결과 공유;
- 보상 중심 referral 문구;
- share-to-continue;
- URL/metadata의 session token·PII·private asset state.

Referral 보상은 필요 시 지연·상한·multi-day 조건을 유지하고 cosmetic/명예/편의 중심으로 설계한다. raw registration/share는 의미 있는 경제 행동이 아니다.

## 10. 수익화·스폰서 적합성

수익화가 브랜드를 다시 정의해서는 안 된다.

반복가치 이후 가능한 후보:
- 명확히 표시된 public-content/native sponsorship;
- 광고제거 구독;
- non-P2W 프로필/공간/전시/시즌 cosmetic;
- archive/gallery 표현;
- 이해관계 표시가 명확한 B2B2C·creator 협업.

첫 방문자가 제품 자체 약속보다 sponsor를 먼저 인식할 정도로 prominence를 키우지 않는다. 광고는 매수/매도/대출/상환 action이나 사실상 투자추천처럼 보이지 않아야 한다.

## 11. Funnel/KPI 추가

기존 KPI에 추가:
- 첫 화면 제품 목적 이해율;
- `Moneyverse가 무엇인가?` 비보조 이해도;
- promise → sample engagement;
- sample → authored-interest;
- authored-interest → contextual signup;
- signup → exact-intent recovery;
- 유입 약속별 time-to-first-value;
- D1 promise-kept;
- D7 coherent-identity;
- D30 durable-history;
- share recipient → context understood → meaningful activation;
- organic landing → D7/D30 retained conversion;
- paid CAC per D30 retained user;
- acquisition message별 retention-adjusted contribution.

Guardrail:
- finance-like misunderstanding;
- 첫 화면 bounce/backtracking;
- fake signup/referral fraud;
- spam/report;
- ATO/phishing signal;
- privacy complaint;
- ad-induced churn;
- youth-safety complaint.

## 12. 실험 backlog

### A — persistent-world promise vs feature inventory headline
가설: 하나의 세계/정체성 약속이 넓은 기능 목록보다 qualified activation과 D7을 높인다.
대상: 신규 익명 방문자.
Control: 현재 community-economy + shortcut 중심.
Treatment: promise → proof → one action.
Primary: meaningful activation + D7.
Guardrail: signup conversion, misunderstanding, bounce, complaint.
관찰: 최소 D7 성숙 cohort, 영구 표준화 전 D30.

### B — 가입 전 샘플 vs 즉시 로그인 CTA
가설: 유용한 public sample이 보안경계를 약화시키지 않으면서 qualified signup/post-auth activation을 높인다.
Primary: visit → meaningful activation.
Guardrail: public data exposure, bot traffic, TTFV.

### C — identity artifact 공유 vs wealth/status 공유
가설: collection/project/mastery artifact가 raw wealth card보다 고품질 referral activation과 낮은 abuse를 만든다.
Primary: recipient → D7 retained.
Guardrail: privacy report, referral fraud, spam, harassment.

### D — intent-matched SEO vs broad finance keyword
가설: 트래픽은 적어도 game/simulation/world 의도가 D30 품질은 더 높다.
Primary: organic D30 retained users / 1,000 visits.
Guardrail: misleading-finance query share, bounce, search quality.

### E — promise/sample 이후 sponsor vs 이해 전 sponsor
가설: sponsor prominence를 제품 이해 이후로 미루면 초기 impression이 줄어도 D30 retained contribution이 높아진다.
Primary: D30 retained contribution.
Guardrail: ad-induced churn, accidental clicks, revenue per eligible user.

## 13. 보안·악용·개인정보 검토

### HIGH — 실제 금융서비스 오인/사칭
시나리오: WDX/WLD가 실제 투자·예금·수익·도박처럼 보이는 acquisition copy 또는 이를 악용한 사칭.
영향: 소비자 피해, phishing susceptibility, 법적/신뢰 리스크.
최소조건: 금융처럼 보일 수 있는 surface의 game-only 고지, cash redemption/수익보장 금지, 실제 시장추천 표현 금지.
별도 QA/법률검토: finance-adjacent paid/creator campaign 전에 필요.

### HIGH — 브랜드 acquisition link를 이용한 phishing/ATO
시나리오: `Moneyverse 투자`, `WLD 보상`, `portfolio alert` 사칭 landing에서 credential 요구.
최소조건: canonical domain/brand 일관성, 성장 페이지/메시지에서 password·OAuth code·recovery code 요구 금지, URL에 secret/session/recovery 금지.
별도 QA: deep link, creator landing, email/push 신규 구현 시 필요.

### HIGH — 공개 artifact 개인정보 노출
시나리오: share/SEO 페이지가 balance, holdings, debt, casino history, private club/social graph, moderation/security state를 노출.
최소조건: public-safe allowlist, personalized page private-by-default, explicit share scope, private state는 인증/noindex.
별도 privacy/security QA: personalized public page 전에 필요.

### HIGH — referral/creator/bot acquisition abuse
시나리오: multi-account/automation이 signup/share/creator conversion을 조작해 보상 획득.
최소조건: raw visit/signup/share에 의미 있는 WLD/WDX 지급 금지, delayed/capped milestone reward, 기존 fraud/eligibility/anomaly control 유지.

### MEDIUM — acquisition analytics 과수집
시나리오: 광고/creator/SEO identifier와 private economy/social history를 목적 이상으로 결합.
최소조건: 목적제한, 최소수집, 필요한 동의/법적근거, 보유기간 제한, 민감/private state 무제한 export 금지.

## 14. 법규/정책 주의점

- WLD/WDX는 virtual/simulated/game-only이며 실제 증권·예금·현금환전·수익보장을 암시하지 않는다.
- creator/sponsor 이해관계는 소비자가 알아보기 쉽게 표시한다.
- 맞춤광고/분석에서 private economy, debt, casino, security, under-age 신호를 자유로운 targeting data로 보지 않는다.
- 청소년 대상 discovery/community 확대 전 연령·안전 검토가 필요하다.
- 한국/미국 개인정보·광고·구독·소비자보호 검토는 영향을 받는 campaign의 release gate로 유지한다.

## 15. Research note — 2026-09-14

직접 채택:
- Roblox, 2026-06-15 `Optimizing Discovery`: discovery 평가를 7일 proxy에서 28일 장기 retention 관점으로 확장. 유입 품질을 quick click이 아니라 retained value로 판단하는 원칙 채택.
- Discord, 2026-08-20 game discovery/social play 발표: discovery와 social context를 실제 게임/행동에 연결. generic traffic보다 downstream meaningful behavior를 우선하는 원칙 채택.
- Google Search Central people-first guidance: 명확한 primary purpose, original/substantial value, satisfying outcome.
- Google Discover core update, 2026-02-05: sensational/clickbait 감소와 original/timely/in-depth 콘텐츠 강조.
- Naver Search Advisor 2026 현재 가이드: main title은 사이트 성격/브랜드를 명확히 표현하고, 검색 품질은 유용·공신력 있는 문서를 우선하며 spam을 억제.
- FTC endorsement guidance: endorsement는 truthful/non-misleading이어야 하며 material connection을 공개해야 함.

참고만 함:
- Discord/Roblox 수치는 해당 플랫폼 내부자료이며 Moneyverse 성과 예측치로 사용하지 않는다.
- 검색/광고 가이드는 기획 근거이며 한국/미국 법률검토를 대체하지 않는다.

## 16. Runtime Product Reality Audit — 2026-09-14

검증: 공개 홈 가능.

`https://easy-scraping.com/` 관찰:
- WLD/보상이 game-only 가상 데이터라는 고지는 눈에 띄고 반복된다.
- title은 `Discord 커뮤니티 가상경제와 게임 보상`으로 설명된다.
- 첫 visible shortcut은 지갑, 미니게임 5종, 거래소, 상점, 퀘스트, 로비다.
- 여러 `SPONSORED ADVERTISEMENT` 배치가 존재한다.
- 이후 hero에서 `우리가 함께 만드는 작고 단단한 경제`와 Discord 연결 커뮤니티 가상경제 서비스라고 설명한다.
- 가입 전 활동 preview가 가능하다고 안내하지만, authored interest 하나가 만들어지기 전에 여러 제품 정체성이 동시에 노출된다.

결론: 현재 공개 제품은 virtual value 경계는 정직하게 설명하지만, **카테고리 명확성과 하나의 기억나는 첫 방문 약속은 아직 검증되지 않은 acquisition 가설**이다.

## 17. 이번 버전 결정

획득량을 확대하기 전에 다음 브랜드/discovery contract를 우선 검증한다.

`하나의 대표 약속 → 하나의 증거/샘플 → 하나의 authored interest → contextual signup → D1 약속 이행 → D7 coherent identity → D30 durable history`

이 루프가 신뢰·D7/D30을 개선한다는 증거가 생기기 전에는 broad finance-keyword acquisition, raw-signup referral reward, wealth-first sharing, sponsor-first landing, ambiguous investment-like creator messaging을 확대하지 않는다.
