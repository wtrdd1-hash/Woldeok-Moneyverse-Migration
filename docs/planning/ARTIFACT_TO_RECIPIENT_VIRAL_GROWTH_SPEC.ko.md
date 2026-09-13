# Woldeok Moneyverse — 아티팩트→수신자 바이럴 성장 기획

> 버전: v2026.09.14.58
> 상태: Living 소비자 성장 기획
> 날짜: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`, `COMMUNITY_PROOF_TO_PARTICIPATION_GROWTH_SPEC.md`, `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md`
> 영문 canonical: [ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.md](ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.md)

## 1. 이번에 선택한 가장 큰 공백

현재 가장 큰 성장 공백은 공유 버튼의 존재 여부가 아니다. 사용자가 **왜 자발적으로 공유하고 싶은가**, 공유받은 사람은 Moneyverse를 모르는 상태에서도 **왜 관심을 가져야 하는가**, 그리고 그 관심이 generic 가입벽에 막히지 않고 **첫 의미 행동까지 이어질 수 있는가**가 아직 충분히 구체화되지 않았다.

기존 문서에는 public-safe 아티팩트, 커뮤니티 증거, 컬렉션/정체성/시즌 역사, 리텐션→바이럴 방향이 이미 있다. 이번 문서는 그중 **수신자 측 루프**를 명확히 정의한다.

`사용자의 의미 있는 결과 → 보여주고 싶은 아티팩트 → 비회원 수신자가 내용을 이해 → 관련 주제 하나 탐색 → 연속성이 필요할 때만 가입 → 첫 의미 행동 → D1/D7 → 수신자도 자기만의 다른 아티팩트를 생성·공유`

이 문서는 신규 referral 지급 시스템, 공개 프로필 DB 계약, deep-link 구현 상세, UGC 인프라를 새로 설계하지 않는다.

## 2. 바이럴 약속

**“Moneyverse 광고를 공유하는 것이 아니라, 그 자체로 의미 있는 결과물을 공유한다.”**

좋은 공유물은 첫 화면에서 세 질문에 답해야 한다.
1. 이 사람이 무엇을 만들고, 배우고, 완성하거나 기여했는가?
2. Moneyverse를 몰라도 왜 흥미로운가?
3. 신원정보를 먼저 넘기지 않고 무엇을 안전하게 볼 수 있는가?

서비스는 인증을 요구하기 전에 수신자의 호기심을 먼저 얻어야 한다.

## 3. 사용자가 공유하는 이유

경제적 referral 압박보다 내재적 사회가치를 우선한다.

### 정체성
- 취향이 드러나는 컬렉션/세트;
- 꾸민 공간·본사·박물관;
- 직업 숙련 또는 선택한 장기 성장경로;
- opt-in 프로필 보드·아카이브 챕터.

### 성취
- 컬렉션 챕터 완성;
- 학습/리플레이 챌린지 해결;
- 시즌 마일스톤;
- 클럽·도시·커뮤니티 기여 완료.

### 해석
- 가상기업/세계에 대한 짧은 인사이트;
- 시뮬레이션 선택에서 무엇을 배웠는지 보여주는 리플레이;
- 이번 주 변화에 대한 개인 큐레이션.

### 기여
- public-safe 커뮤니티 프로젝트 결과;
- 박물관·아카이브 기여;
- 보상관계가 있다면 투명하게 표시된 크리에이터/커뮤니티 협업.

WLD 자산규모, 부채, 카지노 승리, 과도한 WDX 수익률, 비공개 포트폴리오는 기본 바이럴 객체로 사용하지 않는다.

## 4. 공유 아티팩트 기본 구조

각 공유물은 독립적으로 이해 가능해야 한다.
- 쉬운 제목;
- 사용자가 만든 결과를 보여주는 시각물 또는 짧은 요약;
- 비회원에게 필요한 세계/맥락 설명;
- 금융·시장 개념이 있으면 `virtual/simulated/game-only` 표시;
- 실명 강제가 아닌 사용자가 선택한 공개 표시명;
- 수신자용 주 CTA 하나;
- 대가관계가 있다면 명확한 광고/스폰서/크리에이터 표시.

CTA는 공유물과 연결돼야 한다.
- 컬렉션 → `세트 보기 / 스타터 컬렉션 경로 체험`;
- 학습 리플레이 → `같은 상황 직접 해보기`;
- 시즌 챕터 → `무엇이 바뀌었는지 보기`;
- 직업 마일스톤 → `이 직업 미리보기`;
- 커뮤니티 기여 → `프로젝트 보기 / 가입 후 기여`.

모든 공유물을 `지금 가입하기` 하나로 끝내지 않는다.

## 5. 수신자의 첫 30초·3분·첫 세션

### 첫 30초
수신자는 다음을 이해해야 한다.
1. 누가/무엇이 공유했는지 안전한 공개 정체성으로 확인;
2. 어떤 일이 있었는지;
3. 관련될 경우 Moneyverse가 game-only 가상경제라는 점;
4. 로그인 없이 어디까지 볼 수 있는지.

### 첫 3분
한 가지 저마찰 경로만 제공한다.
- 공유물/이야기 자세히 보기;
- 안전한 공개 예시와 비교;
- 작은 샘플·리플레이 체험;
- 연결된 가상기업·컬렉션·직업·시즌 탐색.

기능 그리드, 지갑 중심 onboarding, 무관한 금융게임 기능을 앞세우지 않는다.

### 첫 세션
관심이 생겼다면 인증 이후에도 그 관심을 유지한다. 성공적인 공유 유입 세션은 다음 중 하나를 만든다.
- 관련 스레드 저장;
- 샘플/학습 행동 하나 완료;
- 컬렉션/직업/시즌 경로 시작;
- 인증 후 관련 프로젝트에 첫 기여;
- 다음 목표 하나 설정.

랜딩 열기, 로그인, 지갑 보기, 광고 클릭은 activation으로 보지 않는다.

## 6. 바이럴 루프 유형

### A. 1:1 관련성 루프
특정 사람이 왜 좋아할지 알기 때문에 특정 아티팩트를 직접 공유한다.

학습 리플레이, 컬렉션 마일스톤, 직업 정체성, 프로젝트 기여에 적합하다.

### B. 정체성 브로드캐스트 루프
부의 크기보다 취향·역사·표현을 보여준다.

프로필, 공간, 박물관, 시즌 기록, 큐레이션 컬렉션에 적합하다.

### C. 협업 루프
공유받은 사람이 맥락을 이해한 뒤 프로젝트·챌린지·토론에 참여하도록 한다.

보상이 존재하더라도 WLD/WDX 경제적 우위보다 꾸미기·명예·프로젝트 기록·제한적 편의를 우선한다.

### D. 콘텐츠 발견 루프
아티팩트 자체가 독립적인 정보가치를 가져 검색/소셜에서 발견된다. 이 경우에도 generic 홈이 아니라 동일한 context-first 수신자 퍼널로 연결한다.

## 7. Referral 경계

Referral은 바이럴 성장의 일부이지 기반이 아니다.

다음에는 보상하지 않는다.
- 단순 링크 클릭;
- 단순 회원가입;
- 자기초대 반복;
- 단순 게시·공유·조회;
- 긍정적인 추천/후기 자체.

향후 referral 보상을 쓴다면 실제 하위 마일스톤, 예를 들어 여러 날에 걸친 검증된 참여 이후에만 eligibility를 두고 상한을 둔다. WLD/WDX 경쟁우위가 생기지 않게 한다. CAC에는 가짜가입·연결계정 악용 손실을 포함한다.

공유 대가, creator code, 할인, 경품응모 등 material benefit가 있다면 일반 공유가 광고/endorsement 맥락으로 바뀔 수 있으므로 해당되는 법적 기준에 맞게 명확히 표시한다.

## 8. 수신자 퍼널과 코호트

정식 퍼널:

`아티팩트 생성 → 공유 의도 → 공유/발행 → 수신자 오픈 → 내용 이해 → 맥락형 탐색 → 필요 시 가입/인증 → activation → D1 → D7 → D30 → 수신자의 자기 아티팩트 생성`

주요 코호트:
- DM 수신자;
- 공개 소셜 수신자;
- 검색으로 아티팩트/아카이브에 유입된 사용자;
- 크리에이터/커뮤니티 캠페인 수신자;
- 신규 vs 복귀 사용자;
- 모바일 vs 데스크톱;
- 아티팩트 유형;
- 대가성 공유 vs 비대가성 공유.

모든 share traffic을 하나의 전환율로 합치지 않는다.

## 9. 공유 유입 이후 D1/D3/D7/D14/D30

### D1 — 기억
가입 뒤 공유 맥락을 잃지 않고 처음 들어온 개념으로 다시 연결한다.

### D3 — 인접 관련성
관련 컬렉션·직업·가상기업·시즌·프로젝트 중 하나만 추가로 보여준다.

### D7 — 결과
처음 관심을 가졌던 아티팩트와 관련해 실제 변화나 자기 진전을 보여준다.

### D14 — 소셜 깊이
제품 맥락을 이해한 뒤에야 opt-in 커뮤니티/소셜 레이어를 제안한다.

### D30 — 정체성과 생성
사용자에게도 유지·큐레이션·공유할 만한 무언가가 생겨야 한다. 예: 컬렉션, 아카이브, 공간, 직업 역사, 학습기록, 시즌 챕터, 프로젝트 기여.

목표 루프는 `초대→보상→초대`가 아니라 **`의미를 받음→의미를 만듦→의미를 공유함`**이다.

## 10. 보안·개인정보·악용 검토

### High — 공유물의 비공개 데이터 유출
사용자 영향: 스토킹, 표적 사기, 당사자 곤란, 계정 타기팅.
악용 시나리오: 공유 카드에 잔액, 부채, 비공개 WDX 보유, 숨겨진 소셜관계, 보안/복구 상태, 세션 식별자, 정밀 개인정보가 포함됨.
최소 보호조건: public-safe allowlist, 개인화 비공개 기본값, 공개 전 사용자 preview, URL에 secret/session/recovery 데이터 금지, 삭제/숨김 경로.
별도 개발/QA: 개인화 공개 아티팩트 출시 전 필요.

### High — 피싱·가짜 공유페이지
사용자 영향: credential theft, 계정탈취.
악용 시나리오: 공격자가 Moneyverse 업적/보상 claim 공유페이지를 흉내 내 로그인 유도.
최소 보호조건: 공식 도메인·브랜드 일관성, 공유물 안에서 password/auth code 요구 금지, 자산손실 긴급문구 금지, 인증 전 공개 맥락 확인 가능, 외부링크 안전정책.
별도 개발/QA: 외부 deep-link·메시징·지속형 UGC 링크 전 필요.

### High — referral/share fraud·다계정 farming
사용자 영향: 커뮤니티 신뢰 저하, 경제 손실, 잘못된 CAC 의사결정.
악용 시나리오: 한 운영자가 계정/기기를 대량 생성해 공유·가입·보상 마일스톤 조작.
최소 보호조건: 클릭/공유/가입 자체의 의미 있는 경제보상 금지, 향후 보상은 지연된 실제 마일스톤, 상한·eligibility, fraud-adjusted reporting.
별도 개발/QA: 경제적 referral 도입 전 필요.

### High — 유해/불법 UGC·사칭
사용자 영향: 괴롭힘, doxxing, 사기, 평판손상.
악용 시나리오: 공개 아티팩트에 악성링크·개인정보·사칭·괴롭힘 콘텐츠 포함.
최소 보호조건: 신고/삭제 경로, 공개정체성 통제, 실명 강제 금지, moderation 규칙, 필요 시 저신뢰 UGC의 noindex/발견 억제.
별도 개발/QA: 대규모 공개 UGC 발견 기능 전 필요.

### Medium — 미성년자와 연령민감 공유
성장을 위해 민감한 연령특성을 추론하지 않는다. 필요한 age/privacy/safety 검토 없이 미성년자를 성인·금융 유사 콘텐츠나 무제한 낯선 사람 상호작용으로 유도하지 않는다.

## 11. SEO와 공개 발견

독립적·지속적 맥락이 있는 아티팩트만 색인 후보로 둔다.
- 충분한 컬렉션/시즌/프로젝트 쇼케이스;
- 공개 아티팩트와 연결된 가상기업/세계 설명;
- 교육형 리플레이 설명;
- 큐레이션 아카이브.

보통 비공개/noindex:
- 내용이 얇은 1회성 개인 공유카드;
- referral claim 페이지;
- raw activity feed;
- 실시간 로비 상태;
- 잔액·보유종목·부채·카지노 기록;
- 계정·보안·복구·신고 상태.

Google의 UGC 가이드는 명확한 abuse 정책, 신고, 스팸계정 통제, 필요한 경우 `ugc`/`nofollow`와 선택적 색인을 권장한다. 2026-08-28 Site Reputation Policy 업데이트 역시 제3자 콘텐츠가 도메인 권위를 이용한 순위조작 목적으로 존재하면 안 된다는 방향을 강화한다.

## 12. 수익화

수익화는 반드시 수신자 가치 뒤에 둔다.
1. 아티팩트가 무엇인지 설명;
2. 핵심 탐색/샘플 가능;
3. 다음 행동 CTA 유지;
4. 그 뒤에 검토된 광고/스폰서.

광고가 `컬렉션 보기`, `프로젝트 참여`, `계속하기`, `로그인` 같은 제품 CTA처럼 보이면 안 된다. 수신자의 금융게임 관심을 민감 타기팅에 사용하지 않는다.

크리에이터/스폰서 아티팩트는 material relationship을 놓치기 어렵게 표시한다. 공유·긍정노출에 대한 보상을 프로필이나 약관 깊숙한 곳에만 숨기지 않는다.

## 13. KPI

### 생성/공유
- eligible artifact 생성률;
- 공개 opt-in율;
- share-intent rate;
- 실제 공유/발행률;
- 아티팩트 유형별 반복 공유율.

### 수신자 품질
- 과도한 추적 없이 측정 가능한 recipient open;
- 내용 이해/engaged-read;
- recipient→맥락형 탐색;
- recipient→가입;
- 가입→activation;
- share-assisted time-to-first-value.

### 리텐션/바이럴 품질
- share recipient D1/D3/D7/D14/D30;
- recipient meaningful actions/session;
- recipient-created artifact rate;
- 2세대 share rate;
- share-assisted LTV;
- retention-adjusted contribution.

### 신뢰 guardrail
- fake-signup/referral-fraud;
- spam/report/block;
- malicious-link/phishing/ATO signal;
- privacy complaint/실수로 공개한 비율;
- impersonation/doxxing report;
- 금융상품 오인 불만;
- accidental ad click/ad-induced churn;
- suspicious reward duplication.

## 14. 실험 backlog

### 실험 A — 아티팩트 우선 vs 일반 초대
가설: 의미 있는 아티팩트가 generic `Moneyverse 가입` 초대보다 활성화된 수신자를 더 많이 만든다.
대상: 최초 공유 수신자.
Control: 일반 초대 문구.
Treatment: 맥락이 있는 아티팩트 + 관련 preview CTA 1개.
Primary: recipient→activation→D7.
Guardrail: bounce, spam report, privacy complaint, fake signup.
관찰: 최소 D7 성숙 코호트, 가능하면 여러 아티팩트 주기.
다음 행동: open만 증가하고 activation/D7이 개선되지 않으면 채택하지 않는다.

### 실험 B — 가입 전 preview vs auth-first
가설: 30~90초 public-safe preview가 가입품질과 time-to-first-value를 개선한다.
Primary: signup→meaningful action.
Guardrail: 비공개정보 노출, abuse traffic, 성능.

### 실험 C — 정체성 아티팩트 vs wealth 아티팩트
가설: 컬렉션·공간·직업·시즌 정체성이 WLD/수익률 상태보다 더 건강한 공유를 만든다.
Primary: recipient activation, D7.
Guardrail: 금융오인, 괴롭힘, privacy complaint.

### 실험 D — raw signup 보상 없음 vs signup 보상
가설: 내재적 공유는 양은 적어도 fraud-adjusted CAC·D30 품질이 높다.
Control: 이미 안전한 raw-signup reward가 존재할 때만 비교하고, 없다면 새로 도입하지 않고 과거 baseline 사용.
Treatment: raw signup에 spendable reward 없음, 명예/꾸미기 중심.
Primary: fraud-adjusted CAC, D30.
Guardrail: fake signup, multi-account, reward duplication, economy cost.

### 실험 E — 가치 뒤 광고 vs 조기 광고
가설: 아티팩트 맥락을 해결한 뒤 수익화하면 activation/D7을 보존한다.
Primary: retention-adjusted contribution.
Guardrail: accidental ad click, bounce, D7/D30, CWV.

## 15. Research note — 2026-09-14

직접 채택:
- **Discord Profile Widgets FAQ, 2026-09-08 업데이트:** 사용자가 관심사를 직접 추가·재배치하며 공개 정체성을 통제한다. 강제 public status 대신 user-controlled identity 원칙 채택.
- **Spotify Messages, 2026-01-07 및 2026-01-28 그룹공유 업데이트:** 이미 의미 있는 콘텐츠를 중심으로 공유하고 opt-in/차단 등 사용자인터랙션 통제가 존재한다. 콘텐츠 우선 공유와 사용자 통제 원칙 채택, 규모 수치는 예측치로 사용하지 않음.
- **Google Search Central — Prevent User-Generated Spam:** abuse policy·신고·스팸계정 통제·선택적 색인이 대규모 UGC 발견의 선행조건.
- **Google Search Central, 2026-08-28 Site Reputation Policy:** 제3자 콘텐츠가 호스트 도메인 권위를 이용하기 위한 SEO inventory가 되어서는 안 됨.
- **FTC current Endorsement Guides guidance:** 보상·대가가 있는 공유는 material connection을 명확하고 눈에 띄게 공개해야 할 수 있고, 조작된 사회적 증거·가짜후기는 deceptive할 수 있음.

참고만:
- **Discord, 2026-08-20 Game Discovery/Social Play:** discovery 성과를 downstream play/retention으로 연결하는 방향. Moneyverse에서도 share CTR이 아니라 activation→D7/D30을 중심으로 봄.

## 16. Runtime Product Reality Audit — 2026-09-14

실제 공개서비스 확인 가능.

홈에서 확인:
- WLD/game-only 고지 유지;
- Discord 연결 커뮤니티 가상경제라는 설명;
- Start Here에서 로그인 전 탐색 가능성을 설명;
- 로비가 실제로 조용하거나 비어 보일 수 있음;
- 월간 소식은 아직 공개 운영 소식을 준비 중인 상태;
- 여러 sponsored advertisement 영역은 이미 존재.

따라서 현재 Moneyverse 홈에는 **강한 public artifact→recipient 바이럴 루프가 아직 눈에 띄지 않는다.** 다음 우선순위는 referral 지급이나 공개 activity feed 확대가 아니라, 진짜 공유할 가치가 있는 결과물 하나와 context-first 수신자 랜딩을 검증하는 것이다.

## 17. 결정

다음 성장단계는 아래 좁은 루프를 우선한다.

`의미 있는 결과 → public-safe 아티팩트 → 수신자가 로그인 전에 이해 → 관련 preview → activation → D1/D7 → 수신자의 자기 아티팩트 생성`

이 루프가 qualified activation·D7/D30을 개선하고 abuse/privacy/trust guardrail을 악화시키지 않는 것이 확인되기 전에는 신규 referral 경제보상, 바이럴 스팸 prompt, 공개 wealth card, 대량 프로필 색인, 광고 중심 share landing을 우선하지 않는다.
