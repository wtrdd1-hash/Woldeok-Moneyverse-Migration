# 월덕 머니버스 — 월드 펄스·신선도 리텐션 성장 명세

> 버전: v2026.09.14.69
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `SEASON_SYSTEM_SPEC.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md`, `PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`
> 영문 기준 문서: [WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md](WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임·DB·API·인증·인프라·스케줄러·보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 브랜드 약속, 맥락형 유입, 사용자 우선순위, 알림 복귀, 시즌, 컬렉션 역사, 리텐션 안전 수익화 기획이 이미 있다. 남은 가장 큰 소비자 공백은 **신뢰 가능한 ‘살아 있음’**이다. 사용자가 자신이 고른 목표를 기억하더라도, 세계 자체가 실제로 달라지고 있다는 느낌이 약하면 서비스는 한 번 보고 끝난 정적 기능 모음처럼 느껴질 수 있다.

특히 운영소식이 비어 있거나 커뮤니티가 조용하고 홈이 정적인 기능 바로가기 중심이라면 기능 수와 관계없이 “지금 여기서 무슨 일이 일어나고 있는가?”에 답하지 못할 수 있다.

이번 버전의 핵심 루프:

`실제 세계 변화 → 간결한 World Pulse → 내가 고른 우선순위와 연결 → 안전한 다음 행동 하나 → 눈에 보이는 결과/기록 → D1/D3 복귀 → 주간 회고 → 시즌 기대 → 장기 아카이브`

소비자 약속:

**“Moneyverse에서 진짜 변화가 생기면 빠르게 이해하고, 나에게 왜 중요한지 알고, 행동할지 스스로 정할 수 있다.”**

이 문서는 피드 랭킹 엔진, 알림 스케줄러, 이벤트 스키마나 백엔드 구현 명세가 아니다.

## 2. 진짜 World Pulse의 조건

Pulse는 실제 사용자 경험 변화에 근거해야 한다.
- 신규/의미 있게 변경된 시즌·테마
- 명확한 game-only 설명이 붙은 가상기업·세계 이벤트
- 신규 컬렉션·직업·사업·공간 챕터
- 공개해도 안전한 클럽·도시·커뮤니티 프로젝트 이정표
- 실질적인 가이드·리플레이·회고·교육 콘텐츠
- 사용자가 할 수 있는 행동을 바꾸는 실제 서비스 변경
- 과거를 남기는 이벤트 결과·아카이브

시간이 지났다는 이유만으로 항목을 만들지 않는다. ‘속보’ 과장, 가짜 희소성, 가짜 활동수·인기수·사회적 증거를 금지한다.

## 3. 첫 30초·첫 3분

### 첫 30초
신규 방문자가 네 가지를 이해해야 한다.
1. Moneyverse가 무엇인지
2. 지금 무엇이 달라져 있어 세계가 현재 진행형인지
3. 가입 없이 무엇을 안전하게 볼 수 있는지
4. 지금 할 수 있는 다음 행동 하나가 무엇인지

대표적인 현재 변화 하나와 evergreen fallback 하나 정도만 우선한다. 지갑잔액·대출·카지노·WDX 손익·빈 공지·복잡한 기능 그리드를 첫 증거로 삼지 않는다.

### 첫 3분
`Pulse → preview → 내가 고르는 선택` 하나로 연결한다.
- 시즌 Pulse → 테마/스토리 미리보기 → 시즌 스레드 하나 선택
- 가상기업 Pulse → 이벤트 설명 → 해당 기업 스레드 저장/팔로우
- 컬렉션 Pulse → 세트/lore 변화 → starter 또는 연관 목표 선택
- 커뮤니티 프로젝트 Pulse → 목표·현재 이정표 이해 → 제한된 참여 경로 선택

가입 전에도 약속한 맥락을 먼저 제공한다. 가입은 답을 인질로 잡는 절차가 아니라 연속성을 저장하기 위한 절차다.

## 4. 라이프사이클별 신선도 계약

### D0
실제 변화 하나로 세계가 살아 있음을 증명한다. 첫 가치보다 빠르게 움직이는 피드를 앞세우지 않는다.

### D1
사용자가 고른 우선순위를 먼저 보여준다. 관련된 진짜 변화가 있으면 **“내가 없던 사이 무엇이 바뀌었는지”** 붙인다. 없다면 만들어내지 않는다.

### D3
같은 맥락의 인접 변화·결과 하나를 제안한다. 목표는 새로움의 양이 아니라 깊이다.

### D7
주간 World Recap을 `무엇이 바뀜 → 내 우선순위에 어떤 영향 → 내가 한 것 → 다음에 무엇이 흥미로운가`로 구성한다. 조용한 주는 항목이 적어도 된다.

### D14
사용자가 원하면 성숙한 우선순위를 더 큰 시즌·세계 이야기, 컬렉션 큐레이션, 커뮤니티 프로젝트와 연결한다.

### D30
컬렉션 챕터·회고·시즌 기억·프로젝트 기여·리플레이·아카이브 중 하나를 남긴다. 사용시간이 단순 거래량이 아니라 역사로 보이게 한다.

### 휴면/복귀
`그동안 달라진 점`은 의미 있는 변화에만 사용한다. 짧은 catch-up과 안전한 재시작 행동을 제공하고, 접속하지 않았다고 손해를 봤다는 압박을 주지 않는다.

## 5. World Pulse 우선순위

1. **내가 고른 스레드의 변화**
2. **중요한 세계·시즌 변화**
3. **맥락이 충분하고 개인정보가 안전한 커뮤니티 이정표**
4. **진짜 새 변화가 없을 때 evergreen 탐색**

빈 상태도 허용한다. 예: “저장한 스레드에는 아직 큰 변화가 없어요. 지금 목표를 계속하거나 새로운 이야기 하나를 둘러보세요.”

빈 공간을 가짜 긴급성, 임의 카지노 결과, 금융손실 압박, 광고성 콘텐츠로 채우지 않는다.

## 6. 세션 설계

### 1~3분
변화 하나 또는 정직한 quiet state 확인 → 왜 중요한지 이해 → 행동하거나 미루기 → 불이익 없이 종료.

### 5~15분
변화를 컬렉션·시즌·직업·가상기업/세계·학습·커뮤니티 스레드 하나로 깊게 따라가고 눈에 보이는 기록을 만든다.

### 30분 이상
연결 이벤트 탐색, 아카이브 큐레이션, 프로젝트 참여, 건설/수집/역사 검토를 할 수 있다. 오래 머문다는 이유로 광고를 비례해서 늘리지 않는다.

## 7. 유입·공개 콘텐츠

Freshness는 독립적으로 가치 있는 공개 콘텐츠일 때만 acquisition 자산이 된다.

색인 후보:
- 충분한 내용이 있는 시즌/이벤트 예고 및 종료 후 아카이브
- 독창적인 가상기업/세계 리포트
- 현재 업데이트와 연결된 컬렉션/직업 가이드
- 공개 안전성을 검토한 커뮤니티 프로젝트 회고
- 게임 이벤트를 일반 개념과 연결하되 실제 투자조언으로 오인시키지 않는 교육 콘텐츠

기본 noindex/unlisted:
- 얇은 자동생성 이벤트 페이지
- 개인별 Pulse
- referral/쿠폰 전용 페이지
- raw activity stream
- 독립 가치가 약한 저신뢰 UGC
- 잔액·WDX 보유·부채·카지노·보안·복구·moderation·신고 상태

Google의 2026-02-05 Discover core update는 더 독창적이고 시의성 있고 깊이 있는 콘텐츠, 덜 자극적인/clickbait 콘텐츠를 강조했다. 따라서 페이지 수보다 강한 이야기 수를 우선한다.

## 8. 소셜·바이럴·커뮤니티

공유 대상은 raw activity가 아니라 **결과와 이야기**다.
- 시즌이 내 컬렉션 챕터를 어떻게 바꿨는지
- 공간/프로젝트 before-after
- 큐레이션한 세계·가상기업 이벤트 설명
- 안전한 집계와 참여 동의가 있는 클럽/도시 이정표
- 사용자가 직접 고른 주간 회고

비공개 자산·부채·카지노·숨겨진 social graph·계정보안 상태는 기본 공유 대상이 아니다.

조회·리포스트·오픈·공유 자체에 의미 있는 WLD/WDX를 지급하지 않는다. 봇·다계정·referral fraud를 유발한다.

## 9. LiveOps·시즌 기대

World Pulse는 보상 캘린더가 아니라 LiveOps의 소비자 서사층이다.

D-14/D-7/D-3/D-1은 서로 다른 질문에 답한다.
- D-14: 왜 이 변화가 흥미로운가?
- D-7: 내 기존 스레드 중 무엇과 연결되는가?
- D-3: 어떤 새 선택이 열리는가?
- D-1: 시작 전에 무엇을 기억하면 되는가?

종료 후에는 결과를 archive/retrospective로 보존한다. 중도 진입·복귀 사용자는 catch-up을 제공하고 놓친 것에 대한 죄책감이나 불가능한 완주 압박을 주지 않는다.

Supercell의 2026년 9월 Clash Royale What's New는 신규 카드·영웅·앨범 수집·기간 모드를 하나의 월간 변화 패키지로 명확히 설명한다. Moneyverse는 명확성과 기대 구조만 참고하고 FOMO·보상경제를 복제하지 않는다.

Xbox의 2026-09-09 Tokyo Game Show 공지는 사전 날짜, hands-on preview, FanFest를 통해 콘텐츠 순간 이전에 기대를 만든다. 모든 업데이트를 대형 이벤트로 과장하지 않는다는 조건으로 참고한다.

## 10. 수익화 경계

Freshness는 광고를 늘리는 근거가 아니다.
- 대표 현재 변화가 위장 sponsor여서는 안 된다.
- sponsored content는 상호작용 전에 분명하게 표시한다.
- D0/D1의 `무엇이 바뀜 → 첫 의미 행동` 사이에 interruptive ad를 넣지 않는다.
- WLD/WDX·부채·카지노·보안·민감 추론을 광고 타기팅에 사용하지 않는다.
- 유료 노출을 organic world event/공식 시장신호처럼 보이게 팔지 않는다.
- 반복가치 이후 표현·archive 꾸미기·광고제거는 후보지만 기본 변화 정보 접근권 자체는 유료화하지 않는다.

FTC의 2026년 5월·6월 구독 관련 집행은 중요조건 고지, 명시적 동의, 쉬운 해지의 중요성을 다시 보여준다. `이야기 계속하기` CTA 뒤에 자동갱신 결제를 숨기지 않는다.

## 11. 실험 backlog

### A — World Pulse vs 정적 shortcut 홈
가설: 실제 변화 하나가 first-value 이해와 D1을 높인다.
대상: 신규/비회원.
Control: 정적 기능 shortcut.
Treatment: 현재 변화 1개 + sample CTA 1개.
Primary: time-to-first-value, authored choice, D1.
Guardrail: bounce, 금융상품 오인, 광고 이탈, complaint.
관찰: D7 성숙 코호트, 확대 전 D30.

### B — chosen-thread delta vs generic What's New
Primary: exact-thread meaningful action, D7 continuation.
Guardrail: unwanted personalization, hide/mute, privacy complaint.

### C — 정직한 quiet state vs filler freshness
Primary: D7 trust/satisfaction, meaningful action/session.
Guardrail: 단기 session length, discovery.

### D — weekly narrative recap vs daily generic reminder
Primary: comeback, message→meaningful action, D30 permission retention.
Guardrail: unsubscribe/mute, spam report, phishing confusion.

### E — original timely public story vs 얇은 event 페이지 대량생성
Primary: organic visit→sample→activation→D7, branded/direct return.
Guardrail: low-value indexed pages, bounce, spam/manual-action signal.
관찰: 여러 indexing cycle + D30.

## 12. KPI

Acquisition/Activation:
- qualified public-content visit
- world-pulse comprehension
- pulse→preview/sample
- sample→authored choice
- contextual signup
- signup→meaningful activation
- time-to-first-value

Retention:
- D1 chosen-thread delta recognition
- D3 relevant-change continuation
- D7 weekly-recap meaningful action
- D14 cross-thread/season continuation
- D30 durable history/archive
- material-change comeback
- returning-user share, WAU/MAU

Content quality:
- 실제 사용자 변화에 연결된 pulse 비율
- quiet-state 비율
- stale-item exposure
- unique/original public content 비율
- evergreen fallback engagement
- 사용자 relevance/trust 신호

Growth/Economics:
- organic/creator/share → D7/D30 retained CAC
- LTV/CAC
- retained-user contribution
- eligible retained user당 광고매출
- ad-induced churn
- 반복가치 후 subscription conversion

Trust/Security:
- fake-signup/referral fraud
- spam/report
- phishing/ATO signal
- privacy complaint
- suspicious reward duplication
- UGC abuse/removal

## 13. 보안·악용·개인정보 검토

### HIGH — 가짜 world update 피싱/ATO
공격자가 시즌/기업/업데이트 카드를 복제해 가짜 로그인·claim 페이지로 유도할 수 있다.
최소조건: canonical domain/브랜드 일관성, 성장 콘텐츠에서 비밀번호·OAuth code·복구정보 요구 금지, 정상 인증 경계 유지, 자산손실 긴급문구 금지.
별도 개발/QA: **필요** — 외부 캠페인/deep link 출시 전.

### HIGH — 공개/비공개 activity 유출
Pulse가 WDX 손익·대출·카지노·비공개 클럽·moderation·보안/복구·정밀 개인정보를 요약할 수 있다.
최소조건: public-safe allowlist, 개인 Pulse 기본 비공개, 명시적이고 되돌릴 수 있는 공개, URL/metadata/analytics에 secret/session/recovery 금지.
별도 개발/QA: **필요** — 개인화 공개/공유 surface 전.

### HIGH — 금융상품 오인·시장조작
‘기업 속보’가 매수 신호처럼 보이거나 담합 그룹이 Pulse/커뮤니티로 WDX를 pump할 수 있다.
최소조건: fictional/game-only 고지, 수익보장 금지, 공식 buy/sell 추천 금지, 담합·시장조작 moderation/fraud 검토, 현금가치 암시 금지.
별도 개발/QA: **필요** — finance-adjacent 공개/개인화 이벤트 전.

### HIGH — 가짜 activity/social proof
봇이나 운영자가 참여자수·반응수·이정표·trending을 부풀릴 수 있다.
최소조건: 검증되지 않은 숫자를 핵심 liveness 증거로 사용하지 않음, 공식/편집/sponsored 표시, view/share/open 경제보상 금지, fraud-adjusted KPI.
별도 개발/QA: **필요** — public ranking/trending/counts 도입 전.

### MEDIUM — UGC 괴롭힘·사칭·doxxing·악성링크
최소조건: 초기 공개 입력 제한, 신고/차단/삭제, 링크 안전성, 명확한 attribution, 저신뢰 UGC 자동 Pulse/SEO 승격 금지.

### MEDIUM — tracking/privacy 과수집
최소조건: attribution 최소화, 비공개 경제·보안 데이터를 외부 SDK로 보내지 않음, 콘텐츠 relevance와 민감상태를 분리.

## 14. 한국·미국 정책 메모

- 한국: KISA 2026-03-04 불법스팸 안내서는 광고 수신동의의 모호한 표현과 과도한 푸시광고 수신거부 절차를 경계한다. 시즌/콘텐츠 업데이트 동의를 상업광고 동의로 자동 확대하지 않는다.
- 한국 개인정보: 개인정보위 2026-07-23/27 틱톡·애플 제재는 행태정보의 적법근거·투명성·실질적 동의 중요성을 강조한다. 개인 Priority/Pulse 행동을 광고 타기팅 자유데이터로 취급하지 않는다.
- 미국: FTC 2026년 구독 집행은 중요조건, 명시적 동의, 간단한 해지를 계속 강조한다.
- WLD/WDX는 virtual/simulated/game-only이며 실제 증권·예금·현금환전·도박수익·수익보장을 암시하지 않는다.

구체적인 캠페인·대상연령·광고·결제 출시 시점에 최신 법률 적용성을 다시 확인한다.

## 15. 외부 조사 노트 — 2026-09-14

### 직접 채택
- **Discord, 2026-08-20 — 게임 discovery/social play 업데이트:** impressions보다 downstream gameplay/retention action이 중요. Pulse 조회가 아니라 meaningful action→D7/D30을 평가.
- **Google Search Central, 2026-02-05 — Discover core update:** 독창적·시의성·깊이 있는 콘텐츠 우선, 자극/clickbait 감소. 얇은 freshness 페이지 대량생성 금지.
- **Google Discover 현재 가이드:** clickbait·과장 대신 timely/unique/people-first 콘텐츠. 정직한 headline·quiet state 채택.
- **KISA, 2026-03-04 — 불법스팸 방지 안내서 7차:** 마케팅 동의 표현과 opt-out 명확성. 업데이트 동의와 광고 동의 분리.
- **개인정보위, 2026-07-23/27 — 틱톡·애플 제재:** 행태정보 광고활용의 적법근거·투명성·선택권. private Pulse 행동의 광고타기팅 자동 전용 금지.

### 참고만 사용
- **Supercell, 2026년 9월 Clash Royale What's New:** 하나의 명확한 월간 변화 패키지. FOMO·보상경제는 비채택.
- **Xbox, 2026-09-09 TGS 공지:** 사전예고·체험·커뮤니티 이벤트로 기대 형성.
- **FTC, 2026-05 Shutterstock / 2026-06 Genesis Tech:** recurring billing 조건·동의·해지 guardrail.

## 16. Runtime Product Reality Audit

이번 회차 상태: **verification unavailable**.

저장소상 canonical Production은 `https://easy-scraping.com`이지만 이번 웹 검증에서는 Moneyverse 런타임을 증명할 수 있는 응답을 얻지 못했다. 직접 fetch는 실패했고 검색 인덱스 결과만으로 현재 홈·가이드·운영소식 경험을 사실로 단정할 수 없었다. 따라서 World Pulse가 라이브에 구현되어 있거나 없다고 주장하지 않는다.

저장소 현실에서는 다음을 확인했다.
- Living Project Plan은 Moneyverse를 커뮤니티 가상경제/게임 플랫폼으로 정의하고 game-only 금융 경계를 유지한다.
- Product Growth Plan은 빠른 meaningful action, event calendar, recap, season cadence를 요구한다.
- v2026.09.14.68은 사용자 직접 priority 통제를 정의한다.
- 최신 `main`에는 앱 API 런타임 안정화와 계정/데이터 삭제 공개 sitemap 변경도 포함되어 있으며 이번 소비자 기획과 충돌하지 않는다.

canonical product page가 검증 가능해지면 비파괴 runtime audit을 다시 수행한다.

## 17. 결정·다음 우선순위

피드 양을 늘리지 않는다. 먼저 한 루프만 검증한다.

`진짜 세계/시즌 변화 1개 → 간결한 Pulse 1개 → 사용자가 고른 priority와 연결 → 의미 행동 1개 → D1/D3 인식 → D7 회고 → D30 기록`

이 루프가 리텐션·신뢰를 개선하면서 abuse/privacy/phishing 신호를 악화시키지 않는다는 증거 전에는 fake trending, 공개 활동수 확대, 고빈도 알림, event SEO 대량생성, WLD/WDX 공유보상, finance/profit 긴급문구, 추가 interruptive 광고 inventory를 확대하지 않는다.
