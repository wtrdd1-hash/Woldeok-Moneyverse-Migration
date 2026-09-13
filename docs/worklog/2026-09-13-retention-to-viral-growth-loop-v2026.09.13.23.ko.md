# 제품 성장 작업 기록 — v2026.09.13.23

날짜: 2026-09-13
초점: 리텐션→바이럴 루프, 브랜드/콘텐츠 발견, 추천 품질, 신뢰 guardrail

## 검토 입력

- 작업 시작 및 문서 쓰기 직전 `main`: `32c150ff5a4137b04ce53f28382ef8e24d21eb79`.
- `PROJECT_PLAN.md` Living Project Plan 및 현재 planning stack.
- `PRODUCT_GROWTH_PLAN.md`.
- `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`.
- `RETENTION_RETURN_LADDER_GROWTH_SPEC.md` v2026.09.13.22.
- referral/share가 abuse attribution과 기존 보안경계를 약화시키면 안 된다는 현재 인증/보안 기획.
- 저장소에서 확인한 최신 analytics/privacy/monetization 기획.

## 발견한 가장 큰 공백

리텐션 사용자가 공유할 만한 순간은 여러 곳에 있었지만, **의미있는 개인 산출물 → 수신자에게 유용한 공개 경험 → 활성화/잔존**까지 연결하는 완전한 소비자 루프가 아직 충분히 정의되지 않았다.

단순 referral program을 기본값으로 삼으면 genuine product understanding보다 invite volume, fake signup, 경제 보상을 최적화할 위험이 있다.

## 결정

영문/한국어 `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC` v2026.09.13.23을 추가했다.

기준 루프:

`의미있는 진전 → owner-first 산출물 → 선택적 공유 → value-first 수신자 랜딩 → 가입 전 가치 → 가입 → 첫 가치 → D1/D7`

공유는 소유자 가치보다 항상 뒤에 둔다. 공유하지 않더라도 산출물은 개인 아카이브로 유용해야 한다.

## 소비자 기획 변경

- D1–D3, D7, D14, D30+ 생애주기별 공유 산출물 추가.
- raw wealth/profit/leaderboard보다 성장, 컬렉션, 직업, 학습, 공간, 시즌, 커뮤니티 이야기를 우선.
- 비회원 recipient journey를 정의하고 공유 내용을 이해하기 전 가입 압박을 하지 않도록 함.
- referral은 raw signup이 아니라 실제 activation/retention milestone과 non-P2W 보상을 원칙으로 함.
- disclosure와 금융게임 오인 방지를 포함한 creator/community 포맷 추가.
- 모든 공유물을 자동 색인하지 않고 고품질 공개 아카이브만 SEO 후보로 삼는 기준 추가.
- 반복 가치 이후 표현/광고제거 중심 수익화를 연결하고 경제우위 판매를 금지.

## 최신 외부 조사

조사일: 2026-09-13.

### 직접 채택

1. Spotify 2026 Investor Day와 2025 Wrapped 공식 자료.
   - 2025 Wrapped 6.2억 회 이상 공유, 사용자에게 의미있는 개인화 경험과 “time well spent” 강조.
   - 개인 회고/산출물이 리텐션 가치이면서 획득/브랜드 표면이 될 수 있다는 패턴 채택.

2. Google Search Central 최신 Search Appearance/ProfilePage와 2026-08-28 Site Reputation Policy 업데이트.
   - creator/community 공개페이지는 visible content와 정확히 일치해야 하고 도메인 평판을 이용한 제3자 콘텐츠 양산을 피해야 함.
   - 충분한 공개 아카이브/쇼케이스만 색인하고 얇은 자동생성 공유 페이지는 색인하지 않는 원칙에 반영.

3. FTC Consumer Reviews/Testimonial Rule 가이드와 2025~2026 집행.
   - 인센티브가 특정 긍정/부정 sentiment를 요구하면 안 되며 material connection/incentive는 공개해야 함.
   - referral/creator 보상이 칭찬이나 긍정리뷰를 조건으로 하지 않도록 직접 반영.

### 참고

4. Discord GDC 2026 Social Layer와 2026년 8월 discovery/social-play 자료.
   - 연결 사용자의 active game days와 session duration 증가를 보고.
   - social context가 retention/discovery와 연결될 수 있다는 방향성 참고이며 Discord 계정연결이나 reward-ad를 기본 도입하지 않음.

5. TradingView 2026 community paper-trading contest.
   - 시뮬레이션 학습이 creator/community 참여로 확장될 수 있음을 참고.
   - 실제 현금상금이나 profit-only ranking은 채택하지 않음.

6. Naver Search Advisor sitemap/RSS 및 URL 검사.
   - URL 수보다 의도된 공개 콘텐츠와 실제 색인 품질 확인을 우선하는 근거로 사용.

## 퍼널/KPI 변경

신규 viral-quality 퍼널:

`retained eligible user → artifact viewed/saved → optional share → recipient engaged visit → pre-signup value action → signup → activation → D1 → D7 → D30`

추가/강화 KPI:
- artifact eligibility/view/save;
- artifact → meaningful next action;
- share → engaged visit;
- share → pre-signup value action;
- share → activation → D7;
- retained sharer 100명당 activated recipient;
- 바이럴 유입 D30과 다른 acquisition source 비교;
- fraud-adjusted referral CAC;
- public artifact hide/takedown 및 privacy complaint rate.

## 실험 backlog

A. 즉시 공유 CTA vs owner-first weekly artifact;
B. 즉시 가입벽 vs value-first story landing;
C. wealth/rank 카드 vs self-progress/identity artifact;
D. 첫 activation 보상 vs retained-milestone referral recognition;
E. 넓은 자동생성 색인 vs 고품질 공개 아카이브 선별색인.

모든 실험은 downstream retention과 trust/fraud/privacy guardrail을 함께 본다.

## 보안·악용·개인정보 검토

### High: public/private 데이터 경계 누출
영향: 스토킹, 피싱, 당혹감, 계정 표적화.
최소 보호: public-safe 데이터만, private-by-default, 명확한 공개 미리보기/의도, 의도된 공개면만 색인.
별도 개발/QA: 신규 공개 공유면 출시 전 필요.

### High: 공유/추천 목적지 사칭 피싱
영향: 계정탈취와 악성링크 신뢰.
최소 보호: 명확한 공식 목적지/브랜드, URL/메시지에 secret·민감자산 상세 금지, 자산손실 위협 금지.
별도 개발/QA: 구현 시 필요.

### High: referral farming/다계정
영향: CAC 증가, 경제/프레스티지 왜곡.
최소 보호: raw signup 보상 금지, retained milestone, 비-P2W 보상, fraud-adjusted economics.
별도 개발/QA: 경제 referral 보상 전 필요.

### Medium
- UGC 괴롭힘/사칭/doxxing;
- creator/sponsor disclosure 실패;
- analytics/ad 과수집 및 미성년자/privacy 위험.

이번 회차에서 런타임 보안 코드는 수정하지 않았다.

## 법규/수익/SEO 검토

- WLD/WDX는 계속 virtual/simulated/game-only.
- cash-out·실제 투자수익·수익보장 표현 추가 없음.
- 스폰서/보상 크리에이터 활동은 필요한 경우 명확한 공개가 필요.
- 맞춤광고, 미성년자, 주소록 수집, 신규 tracking vendor, 공개 UGC 확대는 별도 privacy/legal/trust gate.
- 수익화는 repeated value 이후 배치하며 D7/D30, LTV, ad-induced churn, contribution margin으로 평가.
- SEO는 충분한 opt-in 공개 콘텐츠를 우선하고 개인 금융게임/계정/보안/결제/복구 페이지와 얇은 recap/referral 페이지는 색인 대상에서 제외.

## 실제 서비스 검증

`https://easy-scraping.com`은 HTTP 530으로 확인됐다. `runtime verification unavailable`.

## 반영

- 버전: `v2026.09.13.23`
- 문서-only: 예
- 현재 지시: 문서 기획 변경은 `main` 직접 반영, 별도 문서 PR 없음.
- 추가 파일: 영/한 기획서, 영/한 changelog, 영/한 worklog.
- 테스트서버 배포: 불필요.
- 런타임 코드/DB/API/인프라: 변경 없음.

## 다음 우선순위

플레이하지 않는 날에도 비회원·휴면 사용자가 다시 찾아올 이유를 만드는 **정기 브랜드/콘텐츠 cadence**를 구체화한다. 주간 세계 변화, 시즌 editorial, 가상기업 스토리, 학습 콘텐츠, collection/lore, community spotlight를 impressions가 아니라 activation→D7/D30으로 평가한다.
