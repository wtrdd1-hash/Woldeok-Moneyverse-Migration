# 월덕 머니버스 — 첫 사회적 연결·소속감 리텐션 성장 명세

> 버전: v2026.09.14.72
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `CLUBHOUSE_UX_OPERATIONS_SPEC.md`, `COMMUNITY_MARKET_INTEGRITY_SPEC.md`, `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md`, `WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md`
> 영문 기준 문서: [FIRST_SOCIAL_BOND_BELONGING_RETENTION_GROWTH_SPEC.md](FIRST_SOCIAL_BOND_BELONGING_RETENTION_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임·DB·API·인증·인프라·스케줄러·보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 클럽, 클럽하우스 UX, 커뮤니티 moderation, creator acquisition, 알림, 사용자 우선순위, 컬렉션, 시즌, World Pulse 기획이 이미 상세하게 있다. 남은 소비자 성장 공백은 더 좁다. **혼자서 첫 가치를 경험한 사용자가 안전하고 지속 가능한 사회적 연결 하나를 만들고, 그것이 다시 돌아올 이유가 되는 단일 성장 계약이 없다.**

현재 Production 홈은 Moneyverse를 커뮤니티 가상경제로 설명하지만, 공개 커뮤니티 로비는 현재 접속자에게만 보이는 짧은 인사 공간에 가깝고 메시지를 저장하지 않는다. 빈 로비에서는 연속성이 거의 느껴지지 않을 수 있다. 시작 가이드 역시 여전히 지갑·직업·금융 중심이다. 사용자가 시스템을 이해해도 “내 참여를 기억하고 이어갈 사람/그룹이 있다”는 감각은 아직 별개의 문제다.

이번 버전의 핵심 루프:

`혼자서 첫 가치 → 사회적 맥락 하나 선택 → 저위험 첫 기여 → 반응/인정 → 관계 또는 그룹 스레드 하나 저장 → D1 인식 → D3 상호 진전 → D7 공동 결과 → D14 소속감 표현 → D30 공동 역사`

소비자 약속:

**“나와 맞는 사람이나 그룹 하나를 찾고 부담 없이 기여하며, 우리가 시작한 일이 계속 움직이기 때문에 다시 올 수 있다.”**

이 문서는 친구 그래프 스키마, 채팅 프로토콜, 초대 API, moderation 상태머신, 클럽 백엔드 구현 명세가 아니다.

## 2. 사회적 활성화는 개인 가치 이후에 온다

모든 신규 방문자에게 `친구 찾기`나 `클럽 가입`을 첫 필수 행동으로 강제하지 않는다. 사용자는 먼저 Moneyverse에서 혼자서도 이해 가능한 가치 하나를 경험해야 한다. 사회적 연결은 기본 이해의 조건이 아니라 의미를 강화하는 다음 단계다.

권장 순서:
1. build/collect/explore/learn/직업/시즌 중 개인 스레드 하나 이해;
2. 의미 행동 하나 완료 또는 미리보기;
3. 정확히 그 관심사와 연결된 사회적 이어가기 하나 제안;
4. 참여 전 관찰 가능;
5. 제한된 기여 하나 허용;
6. 맥락을 이해한 뒤에만 save/follow/join 제안.

신규 사용자를 설명 없이 복잡한 피드, 거대한 멤버 목록, 익숙하지 않은 클럽 대시보드로 던지지 않는다.

## 3. 첫 30초·첫 3분·첫 사회 세션

### 첫 30초
신규 사용자가 답할 수 있어야 한다.
- Moneyverse가 무엇인가?
- 지금 혼자서 무엇을 할 수 있는가?
- 내 관심사와 연결된 커뮤니티 맥락이 있는가?
- 가입·게시 전에 안전하게 볼 수 있는가?

멤버 수, 부자 순위, WLD 기부액, 카지노 결과, `다들 이미 하고 있다`는 압박을 첫 사회적 증거로 사용하지 않는다.

### 첫 3분
개인 가치 하나 이후 사회적 다리 하나만 제안한다.
- 컬렉션 스레드 → 큐레이션된 클럽 전시 또는 공동 컬렉션 프로젝트 보기;
- 시즌/세계 스레드 → 해당 테마를 따라가는 newcomer-friendly 클럽/프로젝트 보기;
- 직업/build 스레드 → 비금전 행동이 필요한 협동 프로젝트 역할 보기;
- 교육적 시장 스레드 → private position을 노출하지 않는 moderated discussion/replay 읽기;
- creator/community 유입 → generic lobby가 아니라 같은 주제의 제한된 맥락으로 이어가기.

사용자는 사회적 참여 없이도 불이익 없이 나갈 수 있어야 한다.

### 첫 사회 세션
가장 건강한 첫 기여는 보통 비금전적이고 저위험이어야 한다.
- 제한된 prompt에 반응;
- 비금전 선호도 poll 참여;
- 프로젝트 역할/관심사 선택;
- preset 또는 제한된 기여 노트 작성;
- 협동 학습/컬렉션 단계 완료;
- moderation이 허용하는 범위에서 newcomer 환영/인정.

WLD 기부, WDX 거래, referral 모집, 개방형 개인정보 공개를 첫 소속감 조건으로 만들지 않는다.

## 4. 사회적 라이프사이클 계약

### D0 — 의무가 아니라 이해
개인 가치 하나를 경험하고 그와 맞는 사회적 맥락 하나를 본다. 성공은 `클럽 가입` 자체가 아니라 **왜 관련 있는지 이해하고 자발적 다음 행동 하나를 하거나 저장한 것**이다.

### D1 — 누군가/무언가가 기억한다
정확히 같은 공동 스레드로 돌아온다. 사용자의 제한된 기여가 반영·답변·인정됐는지, 또는 그대로 남아 있는지 보여준다. 가짜 답변이나 가짜 활동은 만들지 않는다.

### D3 — 상호 진전
같은 그룹/스레드의 실제 변화 하나를 보여준다. 프로젝트가 움직였거나, 누군가 반응했거나, 연관 기여가 생겼거나, 같은 주제를 더 깊게 볼 수 있다. 변화가 없다면 없다고 말하고 evergreen 이어가기를 제공한다.

### D7 — 공동 결과
순수 개인 결과가 아닌 것 하나를 보여줄 수 있어야 한다. 클럽 전시 진전, 학습 목표 완료, 프로젝트 milestone, 소규모 공동 challenge 종료, 공유 archive의 새 챕터 등이 후보다.

### D14 — lock-in 없는 소속감
클럽/프로젝트 badge, 큐레이션된 기여 기록, 선택적 프로필 표시, 반복 협동 역할 같은 정체성 표현을 제안할 수 있다. 모두 가역적이어야 하며 경제적 우월성을 암시하지 않는다.

### D30 — 공동 역사
프로젝트 챕터, 클럽 archive 항목, 시즌 협업, 학습 replay, 전시 기여, 회고 중 하나를 남긴다. 사용자가 나중에 클럽을 떠나거나 참여를 줄여도 안전·개인정보 정책 범위에서 기록의 의미는 보존한다.

### 휴면/복귀
`내가 없는 동안 그룹에서 달라진 점`은 실제 변화가 있을 때만 사용한다. 결석을 부끄럽게 만들거나 회원자격·가치 손실을 위협하거나 미접속 활동을 보충하라고 강요하지 않는다.

## 5. 소속감 사다리

돈이나 인기 없이도 올라갈 수 있어야 한다.

1. **Observe** — 그룹을 안전하게 이해한다.
2. **Choose** — 관심사/프로젝트/스레드를 선택한다.
3. **Contribute** — 제한된 유용한 행동 하나를 한다.
4. **Recognize** — 내 행동이 의미 있었거나 인정받았음을 본다.
5. **Collaborate** — 공동 목표에 참여한다.
6. **Curate** — 전시·가이드·archive·프로젝트 결과 형성에 참여한다.
7. **Represent** — 원할 때 소속/기여를 공개한다.
8. **Remember** — 여러 시즌을 지나도 공동 역사를 보존한다.

소속감을 멤버 수, WLD 기부액, 게시량, leaderboard 순위와 동일시하지 않는다.

## 6. newcomer-friendly 사회적 발견

규모보다 적합성과 안전을 우선한다.

유용한 발견 기준:
- 언어;
- 관심사/테마;
- newcomer-friendly 여부;
- 거칠게 표현된 최근 활동 여부;
- 현재 협동 프로젝트;
- 적절한 경우 참여 방식/커뮤니케이션 스타일;
- 공개 preview 가능 여부;
- moderation/rules 명확성.

멤버 자산, 전체 WLD, raw message volume, WDX 수익률로 클럽을 기본 정렬하지 않는다.

공개 커뮤니티는 가입 전 목적·규칙·안전한 최근 산출물 하나를 볼 수 있게 하는 것을 우선한다.

## 7. 바이럴·referral 경계

가장 강한 사회적 유입 산출물은 raw invite code가 아니라 **맥락이 있는 공동 결과**다.

좋은 후보:
- 클럽 프로젝트 전/후 결과;
- 큐레이션된 시즌 협업;
- 컬렉션 전시;
- 교육 replay/challenge 결과;
- `우리가 함께 만든 것` archive 카드;
- 안전한 sample 행동 하나가 있는 newcomer-friendly 공개 프로젝트 페이지.

수신자 경로:
`공동 결과 → 로그인 없이 맥락 이해 → preview/sample → 관심사 선택 → contextual signup → 개인 첫 가치 → 선택적 사회 이어가기`.

raw invite/join/message/reaction/share에 의미 있는 WLD/WDX를 지급하지 않는다. referral 보상이 있다면 유지된 참여 확인 뒤 제한적으로 지급하고, 경제력보다 꾸미기·명예·컬렉션·편의를 우선한다.

## 8. Habit/세션 설계

### 1~3분 quick social check
- 응답/프로젝트 변화 하나 확인;
- 행동 하나 또는 `중요한 변화 없음` 상태;
- 쉽게 종료.

### 5~15분 meaningful social session
- 프로젝트 하나 기여;
- 토론/replay 하나 검토;
- 공유 산출물 하나 큐레이션;
- 협동 학습/컬렉션 목표 하나 완료.

### 30분 이상 deep social session
- 프로젝트/전시 제작·큐레이션;
- 실질적인 클럽 이벤트 참여;
- 과거 기록 검토와 다음 단계 계획;
- 시즌/도시/커뮤니티 목표 협업.

오래 머문다고 광고량이나 WLD 기부 압박을 비례 증가시키지 않는다.

## 9. 수익화 경계

소속감을 `pay-to-belong`으로 만들지 않는다.

반복 가치 이후 후보:
- 클럽/공간 cosmetic theme;
- archive/gallery 표현 스타일;
- 비-P2W 프로필/소속 표현;
- 광고 제거;
- moderation/ranking을 좌우하지 않는 명확히 표시된 sponsor community content.

금지:
- moderation 우선권;
- organic 품질처럼 보이는 유료 club discovery 우대;
- WDX 체결/수익·대출 조건 우대;
- 프로젝트 투표권 강화;
- 돈으로 보장하는 리더십/지위;
- 기본 안전도구 유료화;
- 클럽 attachment/social graph 기반 숨은 personalized pricing.

## 10. SEO·공개 콘텐츠 경계

독립적인 공개 가치가 있는 페이지만 색인한다.
- 충분한 공개 club/project overview;
- editorial project retrospective;
- 시즌 협업 archive;
- 독창적인 학습/커뮤니티 guide;
- 충분한 맥락과 moderation을 갖춘 공개 exhibit.

기본 noindex/unlisted:
- join/invite/referral-code 페이지;
- private member list/social graph;
- 얇은 activity feed;
- private club page;
- 사용자가 명시적으로 공개하지 않은 개인 기여 기록;
- moderation/report/security/recovery 상태;
- 잔액·보유·부채·카지노 기록.

`club × interest × city × season` 조합의 doorway 페이지를 대량 생성하지 않는다.

## 11. 실험 backlog

### A — 관심사 연계 social bridge vs generic lobby CTA
가설: 첫 관심사와 연결된 사회적 이어가기가 모든 사용자를 generic lobby로 보내는 것보다 D7을 높인다.
대상: 신규 activated user.
Control: 일반 `커뮤니티 방문` CTA.
Treatment: 맥락에 맞는 클럽/프로젝트/스레드 preview 하나.
Primary: social-preview→meaningful-action, D7 retention.
Guardrail: report/block, 혼란, unwanted contact, privacy complaint.
최소 관찰: D7 성숙 cohort, 확대 전 D30 확인.

### B — observe-before-join vs join-first
가설: 안전한 공개 preview가 저품질 가입을 줄이고 첫 기여 품질을 높인다.
Primary: 가입당 첫 유용 기여, D7 club/thread continuation.
Guardrail: public-data leakage, abuse scraping, bounce.

### C — 비금전 첫 기여 vs WLD 기여 prompt
가설: 제한된 사회 행동이 WLD 요구보다 압박·악용 없이 소속감을 만든다.
Primary: D3 reciprocal progress, D7 shared outcome.
Guardrail: 경제 악용, 후회/support 문의, newcomer drop-off.

### D — shared-outcome card vs raw referral invite
가설: 그룹이 만든 실제 결과가 일반 초대 메시지보다 고품질 사용자를 유입한다.
Primary: recipient sample→activation→D7.
Guardrail: fake signup, referral fraud, spam/report, privacy leakage.

### E — weekly shared-progress recap vs generic daily community reminder
Primary: message→meaningful social action, D30 retention.
Guardrail: unsubscribe/mute, spam report, phishing confusion.

## 12. KPI 프레임워크

Acquisition/activation:
- qualified social/public visit;
- social-context comprehension;
- preview-before-join rate;
- preview→authored social choice;
- contextual signup;
- time-to-first-individual-value;
- first useful social contribution;
- time-to-first-safe-social-value.

Retention/belonging:
- D1 exact-thread recognition;
- D3 reciprocal-progress rate;
- D7 shared-outcome rate;
- D14 voluntary affiliation-expression rate;
- D30 durable shared-history rate;
- 첫 social bond 보유/미보유 cohort의 continuation 차이;
- returning-user share, WAU/MAU, sessions/user;
- meaningful social actions/session;
- material shared change 이후 comeback.

Viral/economics:
- outcome-card→recipient sample→activation→D7;
- referral fraud-adjusted CAC;
- social source별 D7/D30 retained CAC;
- cohort LTV/retained-user contribution;
- 반복 가치 이후 ad-induced churn/subscription conversion.

Trust/safety:
- block/mute/report;
- harassment/doxxing/impersonation/phishing;
- spam/bot;
- fake-signup/referral-fraud;
- suspicious reward duplication;
- ATO signal;
- privacy complaint;
- 가능한 경우 moderation appeal/reversal signal.

## 13. 보안·악용·개인정보 검토

### HIGH — 괴롭힘·grooming·doxxing·원치 않는 접촉
사용자 안전에 직접 피해를 주며 미성년자는 더 높은 위험이 있다.
시나리오: newcomer가 공개 접촉을 강요받거나 개인정보를 요구받거나 여러 공개/커뮤니티 surface에서 표적이 된다.
최소조건: 가능하면 참여 전 관찰; 명확한 block/report; 초반 newcomer 상호작용 제한; 실명/연락처 공개 요구 금지; 기존 moderation 정책 보존; 별도 안전검토 없이 신규 private-message growth flow 추가 금지.
별도 dev/QA: **open-ended/private communication 확대 전 필요**.

### HIGH — social invite/referral 피싱 및 ATO
시나리오: 가짜 club/project invite 또는 `멘션/보상 있음` 메시지가 위장 로그인으로 유도한다.
최소조건: canonical domain/브랜드 일관성; growth 메시지에서 password/OAuth/recovery code 요구 금지; 인증 전에 안전한 landing; 최근 mobile prelogin 격리를 포함한 기존 OAuth/session 경계 보존; 자산손실 긴급성 금지.
별도 dev/QA: **외부/deep-link social invite 전 필요**.

### HIGH — 다계정/referral/reward farming
시나리오: 연결된 계정이 서로 club join/reaction/post/invite를 반복해 보상이나 프로젝트 자격을 만든다.
최소조건: raw join/message/reaction/share에 의미 있는 WLD/WDX 금지; delayed/capped milestone reward; fraud-adjusted measurement; 의심 네트워크를 social proof로 사용 금지.
별도 dev/QA: **경제적 social/referral reward 전 필요**.

### HIGH — 비공개 사회·경제 상태 유출
잔액·보유종목·부채·카지노·private club membership·숨은 social graph·moderation/security/recovery가 노출될 수 있다.
최소조건: public-safe allowlist; 기본 비공개; 명시적·가역적 공개; URL/metadata/analytics에 secret/session/recovery 금지.
별도 dev/QA: **personalized public profile/contribution/share 전 필요**.

### HIGH — coordinated market/community manipulation
시나리오: club이 게시글·reaction·거래를 조직해 가상 종목 관심을 인위적으로 만든다.
최소조건: `COMMUNITY_MARKET_INTEGRITY_SPEC.md` 유지; community popularity가 WDX 가격/보상에 직접 영향 금지; 신고는 신호이지 투표가 아님; 공식 buy/sell 추천 금지; 명확한 game-only 표시.
별도 dev/QA: **stock-tagged club campaign/public ranking 전 필요**.

### MEDIUM — 사칭·가짜 사회적 증거
공식/operator/creator/member 콘텐츠를 명확히 구분하고 검증되지 않은 trending/참여자 수를 핵심 신뢰 신호로 사용하지 않는다. 구매·봇 engagement를 KPI에 포함하지 않는다.

### MEDIUM — analytics 과수집
social attribution을 최소화하고 private graph/economy/security 상태를 광고벤더로 보내지 않는다. social matching을 위해 민감 특성을 추론하지 않는다.

## 14. 미성년자·커뮤니티 안전

연령 민감 커뮤니티 설계는 사후 보완이 아니라 출시 gate로 취급한다. Roblox의 2026-01-07 글로벌 chat 변경은 대형 youth-facing 플랫폼이 chat에 연령 기반 경계와 더 강한 verification을 도입하고 있음을 보여주는 방향성 근거다. Moneyverse가 이를 자동으로 복제한다는 뜻은 아니며, open private messaging, 성인-미성년 접촉 확대 등 고위험 기능 전에는 별도 연령/안전/법률 검토가 필요하다는 조건으로 사용한다.

FTC의 2026년 2월 COPPA age-verification policy statement는 적용 대상 사업자의 notice·parental consent·아동 데이터 의무가 유지됨을 전제로 일부 age-verification-only processing에 제한적 집행 유예 방향을 제시한다. 개인정보위 2026-04-01 COPPA 2.0 국외동향은 정책 신호일 뿐 한국 현행법으로 취급하지 않으며, 청소년 대상 개인화·social discovery·광고 전에 재검토 trigger로 사용한다.

## 15. 외부 조사 노트 — 2026-09-14

### 직접 채택
- **Discord Community Onboarding, 2026-06-25 갱신.** 신규 사용자가 간단한 질문으로 관련 role/channel을 직접 선택하고 이후 수정 가능. Discord는 과도한 채널·역할로 인한 혼란이 이탈을 만든다고 명시. 채택: 작은 사용자 선택형 사회 시작점, 가역적 관심사, 모든 커뮤니티 surface를 한 번에 노출하지 않기.
- **Discord Community Onboarding Examples, 2026-05-15 갱신.** 옵션 과다로 newcomer가 압도되지 않게 하도록 권고. 채택: 거대한 discovery grid 대신 제한된 social bridge 하나.
- **Discord GDC 2026 / Social Layer, 2026-03-09 및 2026-08-20.** social connection과 gameplay 사이 마찰을 낮출 때 partner integration에서 retention/session 개선을 보고. 채택: friend/join 수가 아니라 downstream meaningful action과 D7/D30으로 평가. Discord 내부 수치는 Moneyverse 예측치로 사용하지 않음.
- **Roblox, 2026-01-07 chat age verification.** 채택: communication은 age-appropriate boundary, privacy, proactive filtering, 쉬운 report가 필요하다는 안전 신호. 구현 방식 자체는 복제하지 않음.
- **KISA 2026-03-04 스팸 안내서 및 2026년 5·8월 사칭 경고.** 채택: social invite/return 메시지가 광고동의를 숨기거나 링크에서 credential 입력 습관을 만들지 않도록 함.

### 법규·참고
- **FTC COPPA age-verification policy statement, 2026년 2월.** 미성년 대상 social 기능 전 실제 적용 재검토.
- **개인정보위, 2026-04-01 COPPA 2.0 국외동향.** 정책 신호만 사용하고 한국 현행법으로 간주하지 않음.

## 16. Runtime Product Reality Audit — 2026-09-14

검증 상태: **가능**.

공개 Production에서 확인한 내용:
- 홈은 WLD/보상이 game-only 가상 데이터라고 명확히 설명;
- 홈은 Moneyverse를 Discord와 이어지는 커뮤니티 가상경제로 포지셔닝;
- 커뮤니티 로비는 메시지를 저장하지 않고 현재 접속자에게만 전달한다고 설명하며 password, 인증코드, 실제 금융정보, 주소·연락처 게시 금지를 안내;
- 로비는 대화가 없을 때 empty state와 일반적인 `인사하기` 동작을 제공;
- 시작 가이드는 여전히 로그인, 지갑, 퀘스트/직업, 은행, 가상주식/사업, 카지노 중심이며 지속되는 첫 사회적 bond 경로는 핵심 시작흐름에 보이지 않음.

소비자 결론: 런타임에는 기본적인 안전 커뮤니티 진입과 강한 가상재화 고지는 존재하지만 **관심사와 맞는 지속형 `첫 social bond → D1/D7 공동 연속성` 경로는 이번 공개 surface 검토에서 확인되지 않았다.** 따라서 이번 문서는 아직 성장 가설이며 런타임은 수정하지 않는다.

## 17. 다음 성장 사이클 결정

피드·DM·referral 경제·공개 ranking을 확대하기 전에 하나의 좁은 social-retention loop를 검증한다.

`개인 첫 가치 → 관련 social preview 하나 → 비금전 제한 기여 하나 → D1 인식 → D3 상호 진전 → D7 공동 결과 → D30 공동 역사`

이 루프가 안전·개인정보·fraud·moderation guardrail을 악화시키지 않으면서 retained quality를 높이기 전에는 open DM, 경제적 invite reward, 공개 wealth/status leaderboard, finance-linked club campaign, mass community SEO, 고빈도 알림을 확대하지 않는다.
