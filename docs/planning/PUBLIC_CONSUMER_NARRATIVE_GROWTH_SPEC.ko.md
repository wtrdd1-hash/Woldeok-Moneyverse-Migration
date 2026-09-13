# Woldeok Moneyverse — 공개 소비자 서사 및 첫 세션 성장 명세

> 버전: v2026.09.13.36
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.md`, `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md`, `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`
> 영문 canonical: [PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md](PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md)
> 변경 유형: 문서-only; 런타임/DB/API/인증/인프라/보안 코드 변경 없음

## 1. 이번 회차에서 선택한 가장 큰 공백

가장 큰 성장 공백은 **공개 유입부터 첫 장기 관계까지 소비자 서사가 끊기는 문제**다.

현재 운영 홈은 비회원도 먼저 둘러보고 로그인 뒤에는 한 번에 하나씩 시작할 수 있다고 안내한다. 반면 실제 시작 가이드는 복리예금, 국채, 대출, 시세차익, 배당, 패시브 소득, 8대 직업, 사업, 주식, 상점, 카지노를 초반부터 한꺼번에 보여주며 최종 성공상을 “대표 자본가”로 표현한다.

이 불일치는 다음 네 질문에 대한 답을 약하게 만든다.

1. 처음 방문한 사람이 가입 전 왜 관심을 가져야 하는가?
2. 첫 3분 안에 무엇 하나를 이해하고 해볼 수 있는가?
3. 왜 계정을 만들어야 하는가?
4. 내일과 다음 주에 이어서 할 개인적 이유가 무엇인가?

이번 버전의 소비자 약속은 다음과 같다.

**의미 있는 스레드 하나를 시작한다 → 내 것으로 만든다 → 변화가 쌓이는 것을 본다 → 다시 와서 이어간다.**

Moneyverse는 계속 커뮤니티 가상경제 게임이며 WLD/WDX는 `virtual/simulated/game-only`다. 실제 투자·예금·법정화폐·현금환전·수익보장처럼 표현하지 않는다.

## 2. Runtime Product Reality Audit — 서비스 복구 후 후속 점검

2026-09-13 실제 공개서비스를 다시 확인했다.

### 2.1 홈 — 유지할 좋은 기반

현재 홈에는 다음이 있다.
- WLD가 게임 안에서만 쓰는 가상 데이터라는 반복 고지;
- 이해하기 쉬운 커뮤니티 가상경제 설명;
- Discord/Google 로그인 진입;
- 가입 전에 활동을 확인하고 로그인 뒤 하나씩 시작하라는 Start here 영역;
- 개인정보/커뮤니티 링크.

이 방향은 낮은 진입장벽과 신뢰 형성에 적합하므로 유지한다.

### 2.2 시작 가이드 — 가장 큰 소비자 서사 충돌

현재 실제 가이드는 다음을 강조한다.
- 복리 정기예금, 만기 국채, 스마트 대출;
- 8대 직업과 사업/주식/상점/카지노를 첫 개요에 동시에 제시;
- 시세차익, 주주 배당, 패시브 소득;
- 시드머니→자본가/경영자→대표 자본가라는 성장 로드맵;
- 남는 WLD를 반복적으로 복리예금에 넣으라는 행동 지침;
- 저평가 우량주와 반복 배당을 강조하는 문구.

이 표현들은 현재 구현 기능을 설명할 수는 있어도 성장 기획의 canonical 신규유저 서사로 채택하지 않는다. Moneyverse의 핵심 성공상을 단순 자산 증식으로 만들지 않는다.

### 2.3 공개 복귀 콘텐츠

운영 소식 페이지는 여전히 “공개된 운영 소식을 준비하고 있어요” 상태다. 따라서 기존에 기획한 월드 브리프/콘텐츠 기반 정기 복귀 루프는 아직 실제 서비스에서 작동하지 않는다.

### 2.4 런타임 상태 분류

- 공개 홈 신뢰/고지: **구현됨 / 유용함**
- 가입 전 명확한 단일 체험: **부분 구현**
- 홈→가이드 메시지 일관성: **수정 필요**
- 첫 세션 정체성/연속성 서사: **기획됨 / 현재 명확히 보이지 않음**
- 공개 정기 콘텐츠 cadence: **기획됨 / 현재 비어 있음**
- 실제 문구 수정: **이번 문서 자동화에서는 수행하지 않음**

## 3. 공개 소비자 canonical 서사

### 1단계 — 한 문장

**일·학습·수집·공간·시즌·커뮤니티 선택이 나만의 기록으로 쌓이는 커뮤니티 가상경제 게임.**

### 2단계 — 세 가지 증거

첫 방문자에게 동일 우선순위 기능 수십 개를 보여주지 않는다.

1. **무언가 해보기:** 작은 작업·학습·수집 행동 하나.
2. **내 것으로 만들기:** 관심사·직업·컬렉션·공간 방향 하나 선택.
3. **다시 이어가기:** 내 스레드, 세계 변화, 다음 시즌 중 하나를 이어볼 이유 확인.

### 3단계 — 가입 전 공개 미리보기 하나

30~90초 안에 끝나는 안전한 예시:
- 가상기업 이야기 + 해석 질문 하나;
- 스타터 컬렉션 챕터 하나;
- 직업 이야기 + 예시 작업 하나;
- 시즌/세계 변화 카드 하나.

가입 전 실제 WLD/WDX 자산을 생성하거나 개인정보·인증 경계를 약화시키지 않는다.

### 4단계 — 맥락형 가입 이유

일반적인 “가입하기”보다 직전 행동을 보존하는 이유를 보여준다.
- “이 컬렉션 경로 저장”
- “이 직업 챕터 이어가기”
- “이 가상기업 관심사 기억하기”
- “이 학습 스레드 계속하기”

## 4. 첫 30초 / 첫 3분 / 첫 세션

### 첫 30초

사용자가 이해해야 할 것:
- WLD/WDX는 게임 전용;
- Moneyverse는 커뮤니티+성장+가상경제;
- 은행/주식/사업/카지노를 한 번에 배울 필요 없음;
- 가입 전에 하나를 미리 경험할 수 있음.

### 첫 3분

기본 경로는 하나만 보여준다.

`미리보기 → 관심사 하나 선택/확인 → 작은 의미 행동 → 이어질 내용 확인`

첫 가치 전에 복리·국채·대출·주식·사업·카지노를 모두 이해하도록 요구하지 않는다.

### 첫 세션

끝날 때 최소한 다음이 남아야 한다.
- 완료한 의미 행동 하나;
- 그것이 기억되었다는 증거 하나;
- 이어서 할 스레드 하나;
- 다시 올 이유 하나.

Activation은 로그인이나 지갑 조회만으로 정의하지 않고 **첫 의미 행동 + 연속성**으로 본다.

## 5. 기능별 소비자 서사 원칙

### 직업
정체성·숙련·기여를 먼저 보여주고 WLD는 보상 중 하나로 둔다.

### 컬렉션/상점
완성·큐레이션·표현 중심. 생산성 버프가 장기 목표 전체를 대표하지 않게 한다.

### 가상주식
가상기업 이해, 저널, 분산 복기, 리플레이 중심. “저평가 우량주”, 수익보장, 패시브 소득, 최대수익 추구 표현을 신규유저 핵심 메시지로 사용하지 않는다.

### 은행/대출
게임 시스템임을 분명히 한다. 복리예금·신용·부채를 기본 온보딩 경로로 두지 않는다.

### 사업
운영·공급수요 선택·정체성 중심. 반복 배당을 위험 없는 패시브 소득처럼 설명하지 않는다.

### 카지노/미니게임
확률과 game-only 고지는 유지한다. 대박·손실복구·위험추구를 acquisition/activation 핵심 훅으로 사용하지 않는다.

### 시즌/커뮤니티
강한 FOMO보다 예고·아카이브·수집·기여·개인 역사를 복귀 이유로 사용한다.

## 6. D1~D30 연결

- **D1 — 연속성:** 내가 선택한 것이 그대로 있다.
- **D3 — 취향:** 내 Moneyverse가 내가 좋아하는 방향을 닮기 시작한다.
- **D7 — 진전 이야기:** 이번 주 무엇을 배우고 만들고 수집했는지 보여준다.
- **D14 — 살아있는 세계:** 세계/시즌/클럽/프로젝트는 바뀌지만 내 스레드는 남는다.
- **D30 — 열망:** 다음에 깊게 만들고 싶은 방향을 직접 선택한다.

놓친 보상, 자산 손실, 순위 하락, streak 처벌을 기본 복귀 문구로 사용하지 않는다.

## 7. Acquisition·콘텐츠·SEO

독립적으로 유용한 공개 페이지를 우선한다.
- 초보 가상경제/금융학습 가이드;
- 가상기업 설명;
- 시즌/세계 아카이브;
- 컬렉션/lore;
- 직업 이야기;
- public-safe 커뮤니티/프로젝트 회고.

각 페이지의 CTA는 하나의 맥락형 이어하기로 연결한다. 개인 정체성·주간통계·referral 페이지를 검색용으로 대량 자동생성하지 않는다.

SEO funnel:

`검색/공유 유입 → 실제 이해 → 관련 미리보기 → 가입/복귀 → activation → D7 → D30 → contribution margin`

## 8. 바이럴·브랜드

공유 우선 산출물:
- 컬렉션 챕터 완성;
- 공간 변화;
- 직업 마일스톤;
- 시즌 챕터;
- 학습 복기;
- 커뮤니티/도시 기여.

잔액·부채·카지노 결과·단기 수익률을 Moneyverse 브랜드의 대표 공유물로 만들지 않는다.

## 9. 수익화

반복가치를 확인한 뒤 연결한다.

우선순위:
- 광고제거 구독;
- 비-P2W 프로필/아카이브/공간/컬렉션 표현;
- 충분한 공개 콘텐츠 주변의 명확한 스폰서십;
- 이해관계를 공개한 creator/community 협업.

구독 조건은 결제 전 명확히 보여주고 명시적 동의를 받고 쉽게 해지할 수 있어야 한다. 매수/매도/대출/상환/카지노 CTA와 광고·결제를 혼동시키지 않는다.

## 10. 보안·악용·개인정보

### High — 공개/비공개 경계 누출

공개 미리보기·공유·아카이브에서 잔액, 포트폴리오, 부채, 보안상태, 복구상태, 숨겨진 소셜그래프가 노출될 수 있다.

**최소조건:** public-safe 필드만 사용, 개인화 역사는 기본 비공개, 공개범위는 명시적·되돌릴 수 있게, 계정/보안 페이지는 인증+검색색인 제외.

새 공개 개인화 면은 별도 개발/보안 QA 필요.

### High — 추천/공유 피싱

Moneyverse 공유·복귀 링크를 사칭해 세션/자격증명을 탈취할 수 있다.

**최소조건:** 공유 URL·메시지에 secret/session/private asset 정보 금지, 공식 도메인/브랜드 명확화, “로그인하지 않으면 자산 손실” 같은 압박 금지.

### High — 금융상품처럼 보이는 문구 drift

가상예금/주식/사업 설명이 수익보장·실제 금융지식·패시브 소득 보장처럼 변질될 수 있다.

**최소조건:** 관련 문구 가까이에 game-only 고지, 보장수익 표현 금지, 학습/정체성 중심, 실제 현금/환전/금융상품 성격 변화 시 `legal review required`.

### Medium — 가짜 activation/referral farming

페이지 조회·공유·raw signup만으로 의미 있는 WLD/WDX를 지급하지 않는다. retained/fraud-adjusted milestone을 보고 코스메틱·명예·컬렉션 중심 보상을 우선한다.

## 11. 실험 backlog

### E1 — 정체성/역사 약속 vs 자산·금융 기능 약속
- 가설: “내 Moneyverse 역사를 만든다”가 finance-heavy 메시지보다 질 좋은 activation과 D7을 높인다.
- 대상: 신규 비회원.
- Control: 현재 기능/경제 중심 메시지.
- Treatment: 정체성/역사 + 하나의 스레드.
- Primary: 방문→첫 의미 행동.
- Guardrail: 가입률, 이탈, D1/D7, 금융상품 오인 피드백, 개인정보 불만.
- 관찰: 최소 1개 주간 사이클과 코호트 비교에 충분한 activated 표본.

### E2 — 단일 미리보기 vs 전체 기능 개요
Primary: time-to-first-value, preview→meaningful action. Guardrail: 탐색깊이, D7, 오류율.

### E3 — 맥락형 가입 CTA vs 일반 가입 CTA
Primary: signup→activation. Guardrail: fake signup, redirect/phishing signal, D7.

### E4 — D7 스토리 회고 vs 잔액/활동량 대시보드
Primary: D7 회고→meaningful continuation. Guardrail: opt-out, 압박감, 개인정보 불만.

### E5 — 반복가치 이후 수익화 vs 조기 수익화
Primary: D30 contribution margin. Guardrail: ARPU, ad-induced churn, 구독 불만/해지.

## 12. KPI 추가

기존 KPI에 다음을 추가한다.
- public promise→preview start;
- preview completion;
- preview→contextual signup;
- signup→first meaningful action;
- first meaningful action→saved/continued thread;
- first-thread D1/D7/D30;
- guide 유입 activation/D7 by narrative variant;
- 금융상품 오인/문의 신호;
- public artifact→engaged visit→activation→D7;
- monetization exposure→D7/D30 delta;
- fraud-adjusted referral CAC;
- privacy complaint / spam-report rate.

## 13. 최신 참고자료

2026-09-13 확인.

- **Discord Profile Widgets FAQ, 2026-09-08 업데이트 — 직접 채택.** 정체성을 서비스가 고정 추론하기보다 사용자가 선택·재배치·수정할 수 있게 하는 방향의 근거. https://support.discord.com/hc/en-us/articles/35344672307607-Profile-Widgets-FAQ
- **FTC Shutterstock 구독 합의, 2026-05 — 직접 채택.** 중요 구독조건 명확화, 명시적·충분한 동의, 단순한 해지를 수익화 신뢰 guardrail로 채택. https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-and-cancellation-practices
- **FTC negative-option rulemaking notice, 2026-03 — 참고.** 불충분한 고지, 비동의 가입, 해지 방해가 계속 규제·집행 관심사임을 확인. https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option
- **Moneyverse 운영 홈/가이드/운영소식, 2026-09-13 확인 — 런타임 직접 근거.** https://easy-scraping.com/ ; https://easy-scraping.com/guide ; https://easy-scraping.com/announcements

## 14. 완료 기준

모든 공개/신규유저 메시지를 다음 질문으로 평가할 수 있으면 이번 기획의 목적을 달성한다.

**이 메시지가 사용자가 시작할 의미 있는 이유 하나, 가입할 이유 하나, 다시 이어갈 개인 스레드 하나를 이해하게 하는가? 그리고 Moneyverse의 목적이 단순 자산 증식·패시브 소득·도박성 흥분이라고 오해하게 만들지는 않는가?**

실제 문구·라우팅·UI 변경은 별도 구현 작업이며 정상적인 제품/보안/QA 절차가 필요하다.