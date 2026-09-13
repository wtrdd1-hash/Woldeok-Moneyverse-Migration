# 월덕 머니버스 — 컬렉션 쇼케이스 바이럴 웨지 기획

> 버전: v2026.09.14.59
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`, `ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.md`
> 영문 기준 문서: [COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md](COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md)

## 1. 이번 회차에서 선택한 공백

가장 큰 바이럴 성장 공백은 이제 “공유할 수 있는가”가 아닙니다. 직전 기획에서 공유 아티팩트→수신자 루프를 이미 정의했습니다. 남은 공백은 후보 아티팩트가 너무 많고, **첫 번째로 좁게 검증할 아티팩트가 정해지지 않았다는 점**입니다.

첫 검증 후보는 자산·수익률·카지노·부채·포트폴리오 인증이 아니라 **사용자가 직접 큐레이션한 컬렉션 쇼케이스**로 둡니다.

선정 이유:
- 컬렉션은 이미 장기 정체성·열망 구조와 잘 맞습니다.
- 완성 후에도 큐레이션·전시·아카이브로 이어져 리텐션을 만들 수 있습니다.
- 경제적 우위를 드러내지 않고 취향과 역사를 표현할 수 있습니다.
- Moneyverse를 모르는 수신자도 시각적인 세트/테마를 먼저 이해할 수 있습니다.
- 수신자 CTA를 전체 기능 그리드가 아니라 작은 starter collection path로 좁힐 수 있습니다.
- 향후 박물관·공간·시즌·아카이브·프레스티지와 연결해도 P2W가 될 필요가 없습니다.

이 문서는 소비자 성장 기획 전용입니다. 공개프로필 DB, 공유 API, deep-link 계약, 추천 보상 서비스, moderation backend, 신규 인증 흐름은 추가하지 않습니다.

## 2. 제품 약속

**“얼마나 부자인지가 아니라, 무엇을 모았고 왜 의미 있는지를 보여준다.”**

좋은 컬렉션 쇼케이스는 로그인 전에 다음 세 가지가 보여야 합니다.
1. 어떤 세트/테마를 완성하거나 큐레이션했는가
2. 그 컬렉션이 세계관 또는 사용자 정체성 안에서 왜 흥미로운가
3. 수신자가 계정을 만들기 전에 무엇을 더 볼 수 있는가

## 3. 첫 아티팩트 계약

첫 바이럴 웨지는 하나의 bounded showcase object에 집중합니다.

`컬렉션 진척/완성 → 사용자가 public-safe 쇼케이스를 큐레이션 → 수신자가 세트를 이해 → 관련 아이템/테마 탐색 → 작은 starter preview → 연속성 저장이 필요할 때만 가입 → 첫 의미 있는 컬렉션 행동 → D1/D7 → 수신자도 자기 쇼케이스 생성`

쇼케이스에 허용할 후보:
- 사용자가 선택한 공개 표시 이름
- 컬렉션/세트 이름
- 완성 또는 큐레이션 마일스톤
- 사용자가 고른 아이템/시각 슬롯
- 안전한 범위의 짧은 캡션 또는 preset 설명
- 독립적으로 이해 가능한 시즌/세계관 lore
- `세트 보기`, `입문 컬렉션 체험` 같은 주 CTA 하나
- 경제·시장 개념이 섞이면 virtual/game-only 고지

기본 제외:
- WLD 잔액·누적 부
- WDX 보유량·매입단가·실현/미실현 수익률
- 부채/대출 상태
- 카지노 베팅·승리·손실
- 비공개 친구/클럽 관계
- 계정·보안·복구 상태
- 실명·정밀 위치 등 불필요한 개인정보

## 4. 사용자가 왜 만들고 공유하는가

### 완성의 자부심
일관된 세트를 완성했다는 이야기는 계정 레벨 숫자보다 이해하기 쉽습니다.

### 취향과 정체성
무엇을 보여줄지, 어떤 순서로 놓을지를 사용자가 고르게 합니다. 불투명한 점수표보다 “내가 만든 전시”에 가깝게 합니다.

### 기억
시즌/세계 컬렉션은 이벤트 종료 뒤에도 개인 역사의 한 챕터로 남길 수 있습니다.

### 완성 이후의 목표
완성 직후 다시 구매를 압박하기보다 배열·설명·복원·전시·테마 비교·박물관/아카이브 연결을 다음 목표로 둘 수 있습니다.

### 낮은 압박의 소셜 증거
친구는 사용자의 부·도박·고위험 수익을 보지 않아도 “이 세트를 완성했구나”를 이해할 수 있습니다.

## 5. 수신자 첫 30초 / 3분 / 첫 세션

### 첫 30초
- 어떤 컬렉션인지
- 공유자가 무엇을 골라 보여줬는지
- 완성/큐레이션/시즌 챕터 중 무엇인지
- 관련 경제가 game-only 가상경제라는 점
- 로그인 없이 볼 수 있는 기본 맥락

### 첫 3분
다음 중 하나만 제공합니다.
- 세트와 lore 보기
- 안전한 공개 예시 하나 보기
- 입문 세트 preview 체험
- 관련 시즌/세계 이야기 보기

지갑·은행·대출·카지노·거래소·전체 기능 디렉터리로 먼저 보내지 않습니다.

### 첫 세션
share-assisted activation은 실제 의미 상태가 생겨야 합니다.
- 입문 컬렉션 테마 선택
- 컬렉션 스레드 저장
- 샘플/lore 상호작용 완료
- 정상 제품 흐름에서 첫 비경쟁 starter piece 획득/선택
- 다음 컬렉션 목표 설정

페이지 열기, 로그인, WLD 조회, 광고 클릭은 activation이 아닙니다.

## 6. D1/D3/D7/D14/D30

- **D1:** 들어온 컬렉션/테마와 자신의 선택이 그대로 남아 있음을 보여줌
- **D3:** 관련 세트, lore, 공간 전시, 직업/시즌 연결 하나 제안
- **D7:** 자신의 컬렉션 진전 또는 관련 시즌/세계 변화 표시. “놓치면 손해” 금지
- **D14:** 배열·주석·복원·전시·역사 연결 같은 큐레이션 심화
- **D30:** 보관하고 선택적으로 공유할 수 있는 컬렉션 챕터/박물관·아카이브 요소 형성

## 7. Acquisition / Viral loop

`컬렉션 진척 → 완성/큐레이션 순간 → 공유 의도 → 안전한 쇼케이스 → 수신자 이해 → 맥락 탐색 → 필요 시 가입 → 컬렉션 activation → D1 → D7 → 자기 쇼케이스`

추천 보상보다 1:1 관련성·정체성 표현을 우선합니다.

다음 행동에는 의미 있는 WLD/WDX 보상을 주지 않습니다.
- 링크 열기
- 쇼케이스 게시
- 조회수
- 단순 가입
- 긍정적 캡션/추천

향후 referral 보상을 시험한다면 실제 downstream milestone, cap, fraud-adjusted CAC를 사용합니다.

## 8. SEO / 공개 발견

개인 1회성 공유카드는 충분한 독립 가치가 있고 사용자가 공개검색에 명시적으로 동의하지 않는 한 기본적으로 unlisted/private 또는 `noindex` 후보입니다.

색인 후보:
- lore/설명이 충분한 컬렉션 가이드
- 시즌 컬렉션 아카이브
- 의미 있는 맥락을 가진 박물관형 공개 전시
- 소유자를 몰라도 유용한 에디토리얼 컬렉션 spotlight

금지:
- 사용자마다 얇은 쇼케이스 페이지 대량생성
- 아이템 조합마다 검색 페이지 생성
- Moneyverse 도메인 권위를 빌리기 위한 제3자/사용자 페이지 확장

SEO 퍼널:
`적합한 검색/소셜 발견 → 유용한 컬렉션 맥락 → starter 탐색 → 가입/복귀 → activation → D7 → D30 → retention-adjusted contribution`

## 9. 수익화

가치를 이해한 뒤에만 수익화를 붙입니다.

후보:
- 비-P2W 쇼케이스 프레임/테마
- 박물관·공간 전시 꾸미기
- 프로필/아카이브 표현 확장
- 반복가치 이후 광고제거 구독
- 명확히 표시된 sponsor/editorial 컬렉션 콘텐츠

판매 금지:
- 컬렉션 완성 자체
- 프레스티지로 위장한 경제/랭킹 우위
- WDX·은행·대출·카지노 결과 우위
- 광고인데 자연 추천처럼 보이는 노출 순위

공유 아티팩트와 `세트 보기`/starter CTA 사이에 광고를 제품 내비게이션처럼 보이게 배치하지 않습니다.

## 10. 보안·개인정보·악용 검토

### High — 공개/비공개 경계 누출
영향: 스토킹, 수치심, 표적사기, 계정표적화.
시나리오: 쇼케이스 생성 시 잔액·보유·부채·비공개 관계·정밀 개인정보·보안상태가 섞여 나감.
최소조건: public-safe allowlist, 기본 비공개, 공개 전 사용자 preview, URL/analytics에 secret/session/recovery 금지, 숨김/삭제 경로.
별도 개발/QA: 필요.

### High — 피싱/가짜 보상 쇼케이스
영향: credential theft, ATO.
시나리오: 공격자가 컬렉션 페이지를 복제하고 아이템/보상 수령을 위해 로그인을 요구.
최소조건: 공식 도메인/브랜딩 일관성, auth 전 공개 맥락 확인, 자산손실 긴급성 금지, 공유물 내부 credential/auth-code 요구 금지, 외부링크 정책.
별도 개발/QA: 외부 deep-link·메시징 캠페인 전 필요.

### High — 봇/다계정 사회적 증거 조작
영향: 발견면 오염, 가짜 인기, 잘못된 CAC 판단.
시나리오: 자동화 계정이 컬렉션·조회·공유를 조작해 prestige를 만듦.
최소조건: raw view/share에 spendable reward 금지, 의심 활동을 성장판단에서 제외, 공개 spotlight eligibility 제한.
별도 개발/QA: 보상/랭킹형 공개 발견 전 필요.

### High — UGC 악용·사칭·doxxing
영향: 괴롭힘, 사기, 개인정보 피해.
시나리오: 캡션/링크에 개인정보·악성링크·사칭 내용 삽입.
최소조건: 첫 파일럿에서는 제한 텍스트/preset 우선, 신고·삭제, 공개정체성 통제, 실명 강제 금지, moderation 정책.
별도 개발/QA: 자유 텍스트·대규모 UGC 발견 전 필요.

### Medium — 미성년자/연령 민감 발견
성장을 위해 민감한 연령 특성을 추론하지 않습니다. 미성년자의 stranger interaction, 행동광고, 금융유사 추천 확대는 별도 privacy/legal/safety review 없이 진행하지 않습니다.

## 11. 실험 backlog

### A. 컬렉션 쇼케이스 vs 일반 초대
가설: 의미 있는 컬렉션 아티팩트가 일반 “Moneyverse 가입” 링크보다 recipient activation→D7을 높인다.
대상: 실제 컬렉션 milestone 도달 사용자.
진입점: milestone 직후 공유 선택.
Control: 일반 초대.
Treatment: 큐레이션 컬렉션 쇼케이스.
Primary: share recipient→activation→D7.
Guardrail: spam/report, privacy complaint, fake signup, phishing report.
관찰: 최소 D7 성숙 cohort 1개 이상, 충분한 recipient 표본.
후속: open/CTR만 늘고 D7이 안 늘면 확대하지 않음.

### B. 사용자 큐레이션 vs 자동 scorecard
가설: 표시 아이템·순서를 사용자가 고르면 share intent가 높아지고 privacy complaint는 늘지 않는다.
Primary: share-send, engaged view.
Guardrail: hide/delete, privacy complaint, sensitive leakage.

### C. preview-before-auth vs auth-first
가설: 30~90초 collection preview가 qualified signup→activation을 높인다.
Primary: recipient signup→activation.
Guardrail: fake signup, abuse, public/private incident.

### D. collection/identity artifact vs wealth/status artifact
가설: 컬렉션 정체성이 raw WLD/수익 인증보다 D7·신뢰를 높인다.
Primary: recipient D7, D30 artifact creation.
Guardrail: finance-like complaint, status pressure/harassment, privacy complaint.

### E. 가치 후 광고 vs 조기 광고
가설: artifact 이해와 starter 탐색 뒤 광고를 배치하는 편이 retention-adjusted contribution이 높다.
Primary: activation/D7, secondary contribution margin.
Guardrail: accidental-ad-click, bounce, ad-induced churn, CWV regression.

## 12. KPI / cohort

생성:
- collection milestone reach
- showcase creation
- public/unlisted opt-in
- share intent / share-send
- repeat showcase

수신자 품질:
- engaged showcase view
- set/lore exploration
- preview completion
- share→signup→activation
- share-assisted time-to-first-value

리텐션:
- share-recipient D1/D3/D7/D14/D30
- collection-thread continuation
- D7 collection progress
- D30 own-showcase creation
- second-generation share

사업:
- fraud-adjusted CAC
- share-assisted LTV
- cohort revenue
- retention-adjusted contribution
- 충분한 가치 경험 이후의 ad-induced churn / subscription conversion

신뢰 guardrail:
- privacy complaint
- spam/report
- phishing/ATO signal
- fake-signup/referral-fraud
- suspicious view/share inflation
- accidental-ad-click
- finance-like claim complaint

## 13. Runtime Product Reality Audit — 2026-09-14

공개 서비스 접근 가능 상태에서 비파괴적으로 확인했습니다.

관찰:
- 홈은 WLD와 보상이 game-only 가상 데이터임을 반복 고지함
- 홈에 지갑·게임·거래소·상점·퀘스트·로비·로그인/시작 링크가 있음
- sponsored advertisement 영역이 이미 여러 곳에 존재함
- `월간 소식`은 여전히 공개 운영 소식을 준비 중이라고 표시됨
- 로비는 실제로 조용하거나 비어 보일 수 있음
- 시작 가이드는 여전히 복리예금·국채·대출·주식 시세차익/배당·패시브소득·“대표 자본가”를 강하게 전면화함

시사점: 현재 메인 공개면에서 **컬렉션 쇼케이스→수신자** 루프는 눈에 띄게 검증된 상태가 아닙니다. 따라서 referral payout, 개인 공개피드, 광고 인벤토리를 더 확대하기 전에 이 한 가지 아티팩트가 recipient understanding과 D7 품질을 만드는지 먼저 검증합니다.

## 14. Research note — 2026-09-14

| 출처 | 날짜 | 핵심 시사점 | 반영 |
|---|---|---|---|
| Discord Profile Widgets FAQ | 2026-09-08 | 사용자가 프로필 위젯을 선택·재배치·삭제하며 관심사와 게임 진전을 표현 | **직접채택:** 사용자가 통제하고 제거 가능한 정체성 큐레이션 |
| Xbox Wire, New Improvements to Achievements | 2026-04-08 | 프로필에서 게임을 숨길 수 있고 100% 완성을 시각적으로 강조 | **직접채택:** 완성 milestone + 표현 통제 |
| Xbox Wire, X25 Community Designs | 2026-08-24 | 커뮤니티 제작 디자인을 gamerpic/background/theme 등 정체성 표면으로 큐레이션 | **참고:** raw wealth 없이도 커뮤니티 정체성이 브랜드/콘텐츠 자산이 됨 |
| Google Search profiles | 2026-06-04 | 출처가 자신의 콘텐츠를 큐레이션한 shareable profile로 보여주고 팔로우 연결 | **참고:** 큐레이션 정체성이 발견→반복방문을 연결 가능 |
| Google Site Reputation Policy update | 2026-08-28 | 호스트 권위를 빌리기 위한 제3자 콘텐츠에 대한 정책 유지/명확화 | **직접 guardrail:** 얇은 사용자 쇼케이스 SEO 대량생성 금지 |
| Spotify artist identity transparency | 2026-08-11 | AI persona 표시 등 공개 정체성의 출처·투명성 강화 | **참고:** public identity에는 provenance/trust cue 필요 |
| FTC Publishing.com final order | 2026-07 | 수익 주장 근거와 인센티브/이해관계 공개를 강조 | **직접 guardrail:** 공유를 숨은 광고·수익주장으로 만들지 않음 |
| FTC Consumer Reviews/Testimonial Rule Q&A | 현행 | fake review/social influence, sentiment-conditioned incentive 제한 | **직접 guardrail:** 가짜 사회적 증거·긍정 평가 조건 보상 금지 |
| 개인정보보호위원회 COPPA 2.0 국외동향 | 2026-04-01 | 미국의 청소년 개인정보·맞춤광고 제한 강화 논의를 소개. 현행 한국법 자체는 아님 | **법적 재검토 trigger:** 미성년자 개인화/광고 보수 운영 |

## 15. 법·정책 유의점

- WLD/WDX는 virtual/simulated/game-only이며 공유물이 실제 투자성과·예금 안전성·현금가치·보장수익을 암시하면 안 됩니다.
- 보상을 받은 creator/member showcase는 광고/추천으로 평가될 수 있으므로 해당되는 경우 material connection을 명확히 표시합니다.
- 가짜 조회·팔로워·추천·긍정 후기 같은 허위 사회적 증거를 구매/조성하지 않습니다.
- 공개/개인화 컬렉션은 최소 데이터와 opt-in/public-safe 표현을 사용합니다.
- 미성년자 대상 발견·맞춤광고는 별도 연령/개인정보/법률 검토를 거칩니다.
- 출시 직전 한국·미국의 개인정보·미성년자·광고·소비자보호 기준을 다시 확인합니다.

## 16. 결정

첫 artifact-to-recipient 바이럴 웨지는 **큐레이션 컬렉션 쇼케이스**로 검증합니다.

아직 확대하지 않는 것:
- wealth card
- portfolio performance card
- casino outcome card
- referral payout
- broad public activity feed
- mass-indexed personal page

다음 성장 질문:

**하나의 컬렉션 milestone이 `사용자 자부심 → 수신자 이해 → 첫 컬렉션 행동 → D7 진전 → 수신자의 자기 쇼케이스`까지 신뢰 가능하게 이어지는가?**
