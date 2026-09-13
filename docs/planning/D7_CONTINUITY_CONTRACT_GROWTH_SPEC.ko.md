# Woldeok Moneyverse — D7 연속성 계약 성장 명세

> 버전: v2026.09.13.50
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `WEEKLY_WORLD_BRIEF_GROWTH_SPEC.md`, `WEEKLY_WORLD_BRIEF_PILOT_SPEC.md`, `PUBLIC_CONSUMER_NARRATIVE_GROWTH_SPEC.md`, `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_GROWTH_SPEC.md`
> 영문 기준 문서: [D7_CONTINUITY_CONTRACT_GROWTH_SPEC.md](D7_CONTINUITY_CONTRACT_GROWTH_SPEC.md)

## 1. 이번 회차에서 선택한 공백

가장 큰 리텐션 공백은 콘텐츠나 기능 부족이 아니라 **한 번의 의미 있는 방문과 다음 방문 사이의 약속**이 아직 약하다는 점이다.

Weekly World Brief 파일럿은 첫 회차와 비강압적 다음 주 약속까지 정의했다. 이번에는 그 약속을 실제 D7 복귀로 연결하되 클릭베이트, streak 위협, 보상 만료, 금융성 예측으로 변질되지 않도록 좁힌다.

2026-09-13 공개 서비스 재확인 결과:
- 홈은 정상 접근되고 여러 광고 영역이 이미 존재한다.
- 홈과 `/announcements`에는 아직 실제 반복 운영/세계 소식이 없다.
- `/guide`는 예금·국채·대출·주식 차익·배당·패시브 소득·카지노를 폭넓게 전면에 내세워 신규 사용자 인지부하가 크다.
- v2026.09.13.48~49에서 앱/자체/OAuth 인증 준비가 개선됐지만 로그인 성공만을 activation으로 간주해서는 안 된다.

핵심 루프:

`유용한 이야기/행동 → 명확한 다음 질문 → 관심 스레드 기억 → D1 연속성 → D3 관련 심화 → D7 답변/상태 변화 → 의미 행동 → 다음 질문`

## 2. D7 연속성 계약

주간 복귀 경험은 서비스가 실제로 지킬 수 있는 작고 진실한 약속이어야 한다.

구성 요소:
1. **스레드** — 가상기업, 직업, 컬렉션, 시즌, 도시/커뮤니티 프로젝트, 학습 주제 중 무엇을 따라가는지.
2. **열린 질문** — 실제로 아직 정해지지 않았거나 변화 가능성이 있는 무엇인지.
3. **복귀 시점** — 언제 의미 있는 업데이트가 예상되는지. 가짜 긴급성은 금지한다.
4. **해결** — 다음 방문에서는 새 이야기를 던지기 전에 이전 질문을 먼저 답하거나 갱신한다.

금지 예시:
- “내일 안 오면 보상을 잃습니다.”
- 의미 없는 countdown.
- 콘텐츠 열람 자체에 큰 보상 지급.
- 실제 변화가 없는데 만드는 가짜 cliffhanger.
- “다음 주 이 종목은 오른다/내린다.”
- 손실복구, 안전수익, 보장수익 표현.

## 3. 첫 30초 / 3분 / 첫 세션

### 첫 30초
사용자는 Moneyverse가 가상/game-only 경제라는 점, 이번에 따라볼 스레드 하나, 가입 전에 읽을 가치가 있다는 점, 다음 행동 하나를 이해해야 한다.

### 첫 3분
이야기/학습 블록 하나를 끝내고, 관심 여부를 선택하고, 맥락형 이어가기 하나와 다음에 답할 질문 하나를 볼 수 있어야 한다.

### 첫 세션
로그인/가입 뒤에도 안전한 범위에서 원래 관심 주제를 유지한다. 단순히 인증이 끝났다는 이유로 관계없는 기능 그리드로 떨어뜨리지 않는다.

Activation은 스레드 저장/팔로우, 직업·학습 행동 완료, 컬렉션/시즌 경로 시작, 시뮬레이션 복기 기록, 다음 목표 선택처럼 실제 사용자 가치가 발생한 행동으로 정의한다. 로그인, 지갑 조회, 광고 클릭은 activation이 아니다.

## 4. 코호트별 복귀 이유

- **D1 — 인식:** “내가 고른 것이 그대로 있다.” 놓친 보상보다 이전 관심을 먼저 보여준다.
- **D3 — 관련성:** “Moneyverse가 내 관심사를 반영하기 시작한다.” 민감한 현실 성향·신용·투자능력 추론은 하지 않는다.
- **D7 — 해결:** “지난번 질문에 답이나 의미 있는 변화가 생겼다.” 무엇이 바뀌고/안 바뀌었는지, 왜 중요한지, 무엇을 배울 수 있는지, 다음 행동은 무엇인지 보여준다.
- **D14 — 확장:** 같은 스레드를 시즌·세계·컬렉션·직업·도시/커뮤니티 아크로 넓힌다.
- **D30 — 역사:** 반복 스레드가 개인 아카이브·정체성·컬렉션·장기 열망으로 이어졌음을 보여준다.

## 5. 세션 설계

- **1~3분:** 질문 하나 해결, 변화 하나 확인, 다음 행동 하나 선택.
- **5~15분:** 관련 행동 하나 수행, 작은 마일스톤 완성, 복기나 수집 기록 저장.
- **30분+:** 직업/사업 계획, 컬렉션 큐레이션, lore/아카이브, 공간/박물관/본사 표현, 클럽/도시 프로젝트.

긴 세션을 하지 않았다는 이유로 일반 진행을 잃게 만들지 않는다.

## 6. Acquisition / SEO / 브랜드

퍼널:

`적합한 노출 → 유용한 답/이야기 → 관심 스레드 기억 → 맥락형 체험/가입 → activation → D7 해결 → D30 → retention-adjusted contribution`

원칙:
- 독립적으로 설명 가치가 있는 회차만 공개/색인 후보로 둔다.
- 제목은 실제 질문/변화를 정확히 설명한다.
- 실질 변화 없이 날짜만 바꿔 freshness를 연출하지 않는다.
- 얇은 AI 변형, doorway, 대량 개인 회고 URL, 키워드 페이지를 만들지 않는다.
- 금융학습 콘텐츠는 출처·신뢰·game-only 맥락을 더 강하게 한다.
- 잔액·포트폴리오·부채·보안·복구·신고·관리자 데이터는 공개/색인하지 않는다.

## 7. 소셜·바이럴

공유 대상은 해결된 이야기, 학습 인사이트, 컬렉션/세계 변화, public-safe 프로젝트 결과다. 비회원도 내용을 이해하고 같은 스레드를 선택적으로 따라갈 수 있어야 한다.

기본 제외: 잔액, 보유종목, 부채, 카지노 결과, 비공개 친구/클럽 관계, 계정 존재 여부, 보안/복구 상태, 세션/인증 식별자.

조회·공유·raw signup에는 의미 있는 WLD/WDX 보상을 주지 않는다. 초대 보상은 downstream retained milestone + fraud adjustment + non-P2W가 원칙이다.

## 8. 수익화

연속성 약속을 지키는 것이 조기 광고 1회보다 우선이다.

- 질문과 답 사이에 광고를 끼우지 않는다.
- 약속한 답을 제공한 뒤 수익화가 시각적으로 등장하도록 한다.
- 광고가 이어가기 CTA처럼 보이면 안 된다.
- 스폰서는 편집 결론, WDX 전망, 순위, 대출조건, 모더레이션 특혜를 구매할 수 없다.
- 광고제거 구독은 반복가치를 경험한 뒤 제안하며 불편함을 의도적으로 키워 판매하지 않는다.
- 반복결제 조건은 명확하게 고지하고 명시적 동의를 받은 뒤 결제하며 해지가 단순해야 한다.

핵심 비즈니스 지표는 **retention-adjusted contribution**이다.

## 9. KPI

핵심 퍼널:

`home/search/share → 유용한 스레드 → 연속성 질문 인지 → 맥락형 이어가기 → activation/comeback → D1 인식 → D3 관련성 → D7 해결 → 의미 행동 → 다음 질문 → D30`

Primary:
- 연속성 질문 이해율;
- 스레드 저장/팔로우율;
- D1 thread-recognition return;
- D3 관련 콘텐츠 이어가기율;
- D7 promised-question resolution return;
- D7 복귀→의미 행동 전환율;
- 3~4회 발행 반복 복귀율;
- content-assisted time-to-first-value;
- organic/share→activation→D7/D30;
- returning-user share;
- content-assisted LTV;
- retention-adjusted contribution.

Guardrail:
- 낚시성 teaser 불만;
- 금융성 오인 불만;
- 알림 opt-out/unsubscribe;
- spam/report;
- privacy complaint;
- ATO/phishing signal;
- fake signup/referral fraud;
- suspicious reward duplication;
- accidental ad click;
- FOMO/압박감 피드백.

## 10. 실험 backlog

### A. 이전 질문 해결 우선 vs 완전히 새로운 이야기
가설: 전주 질문을 먼저 해결하면 unrelated freshness보다 D7 의미 복귀가 증가한다.
Primary: D7 return→meaningful action.
Guardrail: 반복감, bounce, 불만.
최소 관찰: 4회 발행 + D7 성숙.

### B. 구체적 질문 하나 vs “다음 주에 다시 오세요”
가설: 선정적이지 않은 구체 질문이 D7 복귀 품질을 높인다.
Primary: D7 next-edition return + engaged read.
Guardrail: misleading teaser, 압박감.
최소 관찰: 4주기.

### C. 인증 후 원래 스레드 유지 vs 일반 홈
가설: 안전한 원래 스레드로 돌아가면 signup/login→activation과 time-to-first-value가 개선된다.
Primary: auth→meaningful action.
Guardrail: auth abandonment, unsafe redirect/deep-link signal, post-login bounce.
주의: 소비자 실험 기획이며 새로운 인증 구현 계약을 만드는 것이 아니다.

### D. 연속성 알림 vs 보상 만료 알림
가설: “따라보던 질문에 업데이트가 생겼습니다”가 “보상이 곧 만료됩니다”보다 건강한 복귀를 만든다.
Primary: notification-assisted comeback→meaningful action.
Guardrail: opt-out, phishing report, 압박감.
실제 알림/개인정보/법규 준비 후에만 시행.

### E. 답변 이후 광고 vs 답변 중간 광고
Primary: retention-adjusted contribution.
Guardrail: bounce, accidental click, CWV, D7/D30, 광고 불만.

## 11. 보안·악용·개인정보

### High — 연속성 링크 피싱/계정탈취
공격자가 “관심 스레드 업데이트”를 사칭해 로그인 탈취를 시도할 수 있다.
최소조건: 공식 도메인/브랜드 일관성, 자산손실 위협 금지, 민감 계정정보 알림 금지, secret/session/recovery 정보 URL 금지, 기존 인증 경계 우회 금지.
이메일·푸시·외부 deep-link 구현 전 별도 개발/보안 QA 필요.

### High — 공개/비공개 맥락 누출
연속성 페이지나 공유물에 잔액·보유·부채·숨겨진 소셜그래프·보안/복구 상태가 노출될 수 있다.
최소조건: public-safe 데이터만 사용, 개인화 공개는 opt-in, 숨김/삭제 경로, 민감 경제/보안 데이터를 URL/광고 analytics로 보내지 않음.

### High — 금융성 편집 문구 drift
주간 질문이 “다음 주 오를 종목”, “안전 수익”, “손실 복구”, “보장 패시브소득”으로 변질될 수 있다.
최소조건: 가까운 game-only 고지, 불확실성 표현, 편집 검토, 투자권유/보장수익 금지.

### Medium — 민감 성향 추론
관심 스레드로 현실 신용도, 자산수준, 투자위험성향, 건강, 정치 등 민감특성을 추론하지 않는다. 개인화는 설명 가능하고 수정·거절할 수 있어야 한다.

### Medium — engagement farming
읽기·복귀·공유·가입에 의미 있는 WLD/WDX를 직접 주지 않는다.

## 12. 법규/정책 메모

- WLD/WDX는 계속 virtual/simulated/game-only이며 현금환전·실제 예금·증권·도박 지급·수익보장을 암시하지 않는다.
- 미국 반복결제/negative option 정책은 2026년에도 집행·규칙 검토가 계속되고 있어 출시 시점 재검토가 필요하다.
- 아동·청소년 개인정보·맞춤광고 규제는 변화가 빠르므로 미성년자 맞춤광고를 기본 성장전략으로 삼지 않는다.
- 스폰서/native 콘텐츠는 편집 콘텐츠와 명확히 구분한다.

## 13. 리서치 노트 — 2026-09-13

### 직접 채택
1. **Spotify Newsroom — Release Radar 업데이트, 2026-07-10**
   - https://newsroom.spotify.com/2026-07-10/discovery-playlists-release-radar-control-updates/
   - 시사점: 예측 가능한 주간 갱신 + 사용자의 관심 제어가 반복 discovery destination을 만들 수 있음.
   - 채택: 주간 cadence와 관심 스레드 선택권. Spotify 규모 수치는 Moneyverse 목표치로 사용하지 않음.

2. **Google Search Central — Discover 가이드 및 2026년 2월 Discover core update**
   - https://developers.google.com/search/docs/appearance/google-discover
   - https://developers.google.com/search/blog/2026/02/discover-core-update
   - 시사점: people-first, 원본성, 시의성, 낚시성·과장 억제.
   - 채택: 연속성 질문은 실제로 답할 수 있어야 하며 비회원에게도 독립적 가치가 있어야 함.

3. **Discord — Discord Official, 2026-03-12**
   - https://discord.com/blog/claim-your-game
   - 시사점: 공식 게임/커뮤니티 정체성 표시는 링크 신뢰에 도움.
   - 채택: 복귀/공유 캠페인에서 공식 도메인·브랜드 일관성을 피싱 방어선으로 사용.

### 참고/방향성
4. **Discord — Game discovery/social play, 2026-08-20**
   - https://discord.com/press-releases/introducing-new-tools-to-power-game-discovery-and-social-play
   - 시사점: discovery를 노출 자체보다 실제 행동/retention에 연결.
   - 사용: KPI 방향성만 참고, Discord 공개 성과수치를 Moneyverse 예상치로 복사하지 않음.

5. **FTC — Shutterstock 합의(2026-05), Negative Option ANPRM(2026-03)**
   - https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices
   - https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option
   - 시사점: 중요조건 명확화, express informed consent, 쉬운 해지.
   - 사용: 구독 guardrail. 향후 최종 규정 내용을 미리 단정하지 않음.

6. **개인정보보호위원회 — COPPA 2.0 국외동향, 2026-04-01**
   - https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS105&mCode=D060030000&nttId=11938
   - 시사점: 청소년 개인정보·맞춤광고 제한이 국제적으로 강화되는 흐름.
   - 사용: 연령/privacy 검토 트리거이며 현행 한국 법률 자체로 간주하지 않음.

## 14. Runtime Product Reality Audit — 2026-09-13

공개 비회원 기준 **검증 가능**.

확인:
- 홈은 WLD/보상이 game-only임을 반복 고지하고 Discord/Google 시작 경로를 제공한다.
- 실제 반복 world-news 제품보다 광고 영역이 먼저 여러 곳 존재한다.
- 월간 소식은 여전히 “공개된 운영 소식을 준비하고 있어요” 상태다.
- `/announcements`도 게시 공지가 없고 광고 영역은 있다.
- `/guide`는 복리예금·국채·스마트 대출·주식 차익/배당/패시브소득과 “대표 자본가” 표현까지 포함해 여전히 넓고 자산 중심이다.

따라서 콘텐츠 카테고리·광고 인벤토리 확대보다 실제 continuity product를 먼저 검증한다. 향후 인증 후 원래 관심사 복귀 UX가 구현되더라도 현재 인증/보안 경계를 우회하지 않아야 한다.

## 15. 다음 성장 우선순위

다음에는 또 다른 콘텐츠 종류를 만들지 않는다. 여러 실제 회차에서 다음 좁은 루프가 작동하는지 검증한다.

`질문 기억 → D1 인식 → D7 진실한 답변 → 의미 행동 → 다음 질문`

D7/D30, 신뢰, retention-adjusted contribution이 개선되는 것이 확인된 뒤에만 발행 빈도·알림·스폰서십·공개 콘텐츠 인벤토리를 확대한다.
