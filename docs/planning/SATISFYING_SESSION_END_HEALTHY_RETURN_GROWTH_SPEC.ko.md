# Woldeok Moneyverse — 만족스러운 세션 종료와 건강한 복귀 성장 명세

> 버전: v2026.09.14.85
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> 영문 기준 문서: [SATISFYING_SESSION_END_HEALTHY_RETURN_GROWTH_SPEC.md](SATISFYING_SESSION_END_HEALTHY_RETURN_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임·DB·API·인증·migration·scheduler·인프라·보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 이미 유입, 가입 전 가치, 가입 의도 복구, 첫 주 복잡도 조절, 사용자 선택 priority, 보이는 숙련도, D1-D30 연속성, comeback, social bond, 장기 identity 기획이 존재합니다. 남은 중요한 리텐션 공백은 **사용자가 만족스럽고 이해 가능한 지점에서 세션을 끝낼 수 있는가**입니다.

현재 성장 문서는 `다음에 무엇을 할까`를 잘 만들지만 `오늘은 여기까지 해도 된다`는 계약은 상대적으로 약합니다. 이 상태가 계속되면 더 많은 행동을 만들기 위해 끝없는 추천, 금융성 긴급성, streak 압박, 광고 inventory 확대에 의존할 위험이 있습니다.

이번 핵심 루프는 다음과 같습니다.

`의미 행동 → 결과 이해 → 진행 안전 보존 → 선택적 다음 행동 → 계속/나중에/오늘 종료 선택 → 만족스러운 종료 → D1 인식 → D7 자발적 복귀 → D30 건강한 습관`

새 scheduler, cooldown, state machine, notification 구현 상세를 추가하지 않습니다.

## 2. 소비자 약속

**“의미 있는 진전을 만들고, 그 진전이 안전하게 남는다는 것을 확인한 뒤, 불이익 없이 멈추고 다시 오고 싶을 때 이어갈 수 있다.”**

좋은 세션은 가능한 행동을 전부 소진해야 끝나는 세션이 아닙니다.

금지 방향:
- punitive streak reset;
- 가짜 `곧 소멸` 보상;
- 자산이 뒤처진다는 압박;
- 부채·손실·카지노 손실 복구 긴급성;
- 자연스러운 종료를 숨기는 endless recommendation;
- 매 세션 마지막을 광고/구독 prompt로 만드는 구조;
- `오늘은 종료`, `나중에`, mute/hide/알림거부에 대한 보상·status 불이익.

## 3. 세션 종료 계약

의미 있는 세션은 마지막에 네 가지를 이해할 수 있어야 합니다.
1. 내가 무엇을 했는가.
2. 무엇이 달라졌는가.
3. 무엇이 안전하게 남았는가.
4. 다음에 무엇을 할 수 있는가, 또는 오늘 멈춰도 되는가.

기본 종료 선택은 관련된 primary continuation 하나와 `오늘은 여기까지` 또는 `나중에`를 함께 제공합니다. 종료 선택을 시각적으로 열등한 선택지처럼 만들지 않습니다.

실제 변화가 없다면 변화가 없다고 말합니다. 이탈을 막기 위해 가짜 progress·인기·pending reward·긴급성을 만들지 않습니다.

## 4. 첫 30초·3분·첫 세션

첫 30초에는 제품 약속 하나와 가치 proof/sample 하나를 전달합니다. notification permission, streak, 사용 빈도 commitment는 첫 가치의 필수조건이 아닙니다.

첫 3분에는 직업 방향, 컬렉션 테마, 학습/world thread, 시즌/project 등 하나의 authored state를 만듭니다.

첫 의미 결과 뒤에는 결과를 먼저 이해시키고 다음 세 가지를 허용합니다.
- 같은 thread 계속하기;
- 저장하고 나중에 이어가기;
- 오늘은 종료하기.

Activation은 여전히 실제 meaningful action입니다. 체류시간, notification 허용, 광고 노출, 지갑 열기, signup 완료, continue 클릭만으로 activation으로 세지 않습니다.

## 5. D1-D30 복귀 사다리

### D1
사용자가 떠난 것을 실패처럼 표현하지 않습니다. 선택했던 thread와 남아 있는 상태, 지금 가능한 한 가지 행동을 보여줍니다.

### D3
실제 진전, 인접 context 또는 `변화 없음 + 다음 행동` 하나를 제공합니다. 3일이 지났다는 이유만으로 기능 breadth를 확대하지 않습니다.

### D7
`처음 선택 → 완료/학습한 것 → 남은 것 → 유지/보관/교체`의 주간 resolution을 제공합니다. 보관·교체도 건강한 성공입니다.

### D14
더 깊은 mastery·curation·community/project·season content를 선택적으로 제안합니다. `나중에`를 눌러도 status나 기본 보상이 줄지 않습니다.

### D30
profession, collection, project, learning, season, social history 중 하나 이상의 durable record가 남고 사용자가 자발적으로 돌아오는지 봅니다. 연속 출석 streak를 성공의 정의로 쓰지 않습니다.

## 6. 세션 길이별 원칙

1~3분 quick check는 답 하나, 선택적 행동 하나, 종료 하나로 충분해야 합니다.

5~15분 meaningful session은 하나의 coherent loop와 결과 이해를 갖고 자연스럽게 끝나야 합니다.

30분 이상 deep session은 building, curation, strategy replay, exploration, collaboration을 지원하지만 긴 세션이라는 이유만으로 광고 압박을 비례 확대하지 않습니다.

## 7. 경제·LiveOps 가드레일

복귀 이유를 경제적 손실 공포에 의존시키지 않습니다. 세션 종료 문구를 WLD 감소, 놓친 복리이자, loan urgency, WDX loss recovery, casino loss recovery, 가짜 제한재고/카운트다운 중심으로 만들지 않습니다.

실제로 예정된 시즌 이벤트는 기대감을 만들 수 있지만 일반적인 부재 때문에 기존 identity/history가 사라지는 것처럼 표현하지 않습니다. 중도진입/복귀 catch-up 원칙을 유지합니다.

`unlimited-by-default`는 유지합니다. 계속 플레이할 자유는 열어 두되 멈출 지점을 숨기지 않습니다.

## 8. Social/Viral/Notification

공유는 종료를 막는 의무가 아니라 완성된 결과물이 자랑할 만할 때 선택하는 행동입니다. 후보는 collection/exhibit 완료, profession/learning milestone, project contribution, season/world recap, public-safe collaborative outcome입니다.

`share to continue` 같은 패턴은 금지합니다.

Notification permission은 session completion 조건이 아닙니다. 사용자가 구체적인 future value category를 이해할 때만 요청하고 category control, quiet hours, opt-out을 쉽게 유지합니다.

알림·공유에는 민감한 balance, debt, exact portfolio, casino state, recovery/security state, private membership을 넣지 않습니다. 성장 메시지는 password·OAuth code·recovery code를 요구하지 않습니다.

## 9. Acquisition·Brand·SEO

브랜드 약속은 `짧게 와도 유용하고, 멈춰도 벌이 없다`가 될 수 있습니다.

공개 콘텐츠는 substantial guide, explainer, world/season archive, useful simulation 중심입니다. `오늘 미완료`, 개인 unfinished state, daily completion 같은 페이지를 SEO용으로 대량 생성하지 않습니다.

SEO funnel:
`유용한 공개콘텐츠 → sample/action → authored thread → meaningful activation → 만족스러운 종료 → D1/D7 → D30 retained value`.

네이버 서치어드바이저 최신 가이드는 사용자에게 도움되는 콘텐츠와 사용자 경험을 우선하고, 저품질 대량생성·트래픽 조작·피싱성 피해 콘텐츠를 경고합니다. comeback/세션종료 SEO도 template 양산보다 독립적인 콘텐츠 가치가 있어야 합니다.

## 10. 수익화

`결과 → 이해 → 상태 보존 → 계속/종료 선택` 구간은 monetization 보호구간입니다.

이 사이에 interruptive ad, sponsor interstitial, subscription gate를 넣지 않습니다. 이후에도 원래 광고 허용 surface에서 자연스러운 boundary 뒤에만 테스트합니다.

광고제거 구독은 제거되는 eligible advertising을 명확히 설명하고, 결제가 progress/streak/economic outcome 또는 기본 safety 기능을 보호해 주는 것처럼 표현하지 않습니다.

세션 시간이 길어졌다는 이유만으로 광고 빈도를 선형적으로 늘리지 않습니다. impressions/minute보다 retained contribution을 봅니다.

## 11. KPI

기존 KPI에 추가:
- meaningful action → result comprehension;
- result comprehension → natural boundary reach;
- continue/save-later/finish 선택 분포;
- `오늘은 종료` 이후 만족도 signal;
- forced continuation 없이 next-step 이해율;
- voluntary finish 이후 D1/D3 복귀;
- D7 healthy resolution(`complete/archive/replace/continue`);
- streak 의존 없는 D30 durable-history coverage;
- 가치 확인 뒤 category별 notification opt-in;
- result comprehension 이전 abandonment;
- monetization 직후 exit/ad-induced churn.

평균 session length, actions/session, notification opt-in, streak length를 단독 성공 KPI로 삼지 않습니다.

## 12. 실험 backlog

### A. 명시적 satisfying closure vs endless next-action
가설: 한 loop 뒤 `결과 + 상태보존 + next 하나 + finish`가 반복 추천보다 D7과 만족도를 높인다.
Primary: D7 retention.
Guardrail: first-session completion, meaningful actions/session, pressure complaint.
최소 D7 cohort, broad rollout 전 D30 확인.

### B. neutral finish vs loss/FOMO copy
가설: 중립적 continuity 문구가 긴급성 문구보다 trust-adjusted D30을 유지 또는 개선한다.
Loss/debt/casino urgency는 unsafe treatment로 최적화하지 않고 제외합니다.

### C. closure 이후 monetization
가설: result와 stop/continue 사이가 아니라 closure 뒤에 monetization을 배치하면 D30 retained contribution이 개선된다.

### D. contextual notification invitation
가설: repeat value를 경험한 뒤 구체 category만 제안하면 첫 세션 즉시 요청보다 유효 opt-in과 낮은 opt-out을 만든다.

### E. weekly resolution vs attendance streak
가설: `무엇이 변함/남음/다음 선택` recap이 punitive attendance framing 없이 D30 만족도를 높인다.

## 13. 보안·악용·개인정보

### HIGH — unfinished progress 사칭 phishing/ATO
`세션 완료`, `저장된 보상`, `진행 보호` 링크로 자격증명을 탈취할 수 있습니다.
최소조건: canonical domain/brand, password/OAuth/recovery code 요구 금지, URL에 secret/session/recovery 금지, fake pending reward 금지.
새 push/email/deep-link는 별도 QA 필요.

### HIGH — 종료/comeback summary 민감정보 노출
WLD/WDX, debt, casino, portfolio, private membership, moderation/security state가 외부화될 수 있습니다.
최소조건: private-by-default, public-safe allowlist, notification/share metadata 및 analytics payload에서 민감정보 제외.

### HIGH — session completion reward farming
bot/multi-account가 exit/return/open/notification opt-in/share를 반복해 보상을 얻을 수 있습니다.
최소조건: 이런 raw event에 의미 있는 WLD/WDX 지급 금지, 기존 ledger/eligibility/anomaly 경계 유지.

### HIGH — finance/casino pressure retention
loss/debt/missed interest/casino outcome을 복귀 압박으로 사용할 수 있습니다.
최소조건: game-only disclosure, loss chasing/debt urgency를 generic return copy로 사용 금지, 기존 market-integrity/probability 경계 유지.

### MEDIUM — analytics/notification overcollection
exit reason, interest, return timing이 무제한 광고 profile이 될 수 있습니다.
최소조건: 목적 제한, 최소수집, 동의/법적 경계, private economy/social history의 광고 파트너 자유 전송 금지.

## 14. 최신 research note — 2026-09-14

직접 채택:
- Discord, 2026-05-18, `Player's Guide and Wellbeing Principles`: 온라인 시간과 연결·커뮤니티의 질을 wellbeing 관점에서 다루는 방향. Moneyverse에서는 engagement time 최대화보다 건강한 세션 품질을 우선하는 근거로 채택.
- Roblox, 2026-05-20, `Well-Being Partnerships and Resources`: 특히 젊은 사용자를 포함한 건강하고 긍정적인 경험 및 보호장치의 중요성을 참고.
- KISA, 2026-03-04, 불법스팸 방지 안내서 제7차 개정: 모호한 광고동의 표현과 앱푸시 광고 거부의 과도한 절차를 피하는 원칙을 notification UX에 반영.
- Naver Search Advisor, 현재 가이드: 사용자에게 실질적 가치가 있는 콘텐츠를 우선하고 저품질 대량생성·조작·피싱 피해를 피하는 원칙을 SEO에 반영.
- FTC, 2026-05-13 Shutterstock: informed consent 및 쉬운 cancellation을 optional paid plan guardrail로 유지.

참고만:
- Discord/Roblox wellbeing 사례는 특정 Moneyverse UI가 retention을 높인다는 성과 근거로 사용하지 않습니다.
- FTC 사례는 미국 consumer-protection 참고선이며 한국/미국 launch-time 법률검토를 대체하지 않습니다.

## 15. Runtime Product Reality Audit — 2026-09-14

검증 가능: 공개 홈, 시작 가이드, 운영 소식.

관찰:
- 홈은 WLD/보상이 game-only virtual data라고 명확히 표시합니다.
- 홈은 지갑, 미니게임 5종, 거래소, 상점, 퀘스트, 로비 등 많은 즉시 next surface와 여러 sponsored placement를 동시에 보여줍니다.
- 가이드는 `처음에는 하나만`이라고 안내하지만 전체 journey는 예금·국채·대출·사업·주식·상점·카지노까지 빠르게 확장합니다.
- 첫날 체크리스트의 마지막은 남은 WLD를 복리 정기예금에 넣는 행동입니다.
- 운영소식은 아직 quiet state이며 sponsored placement가 존재합니다.

결론: 현재 public runtime은 `계속할 이유`는 많이 보여주지만 제품 전체에 걸친 `오늘은 여기까지 / 진행은 남아 있음 / 원할 때 돌아오기` 계약은 확인되지 않았습니다. 따라서 이 명세는 미검증 retention 가설입니다.

## 16. 법규/정책 주의

- WLD/WDX는 virtual/simulated/game-only이며 실제 투자·예금·보장수익·현금환전·도박 손실복구를 암시하지 않습니다.
- 상업적 push/email은 최신 한국 광고·스팸 동의 규칙을 따라야 하며 service/transactional 동의를 일반 광고동의로 확대하지 않습니다.
- 청소년 대상 personalized ads, open social, probability prompt 확대는 한국/미국 최신 검토가 필요합니다.
- subscription 가격·갱신·환불·취소 조건은 명확하고 쉽게 이해·취소 가능해야 합니다.

## 17. 버전 기록

### v2026.09.14.85 — 만족스러운 세션 종료와 건강한 복귀
- 첫 세션부터 D30까지 voluntary session-end contract 추가.
- `오늘은 여기까지`를 streak/status/economy penalty 없는 정상 성공 outcome으로 정의.
- healthy-return/satisfaction KPI와 5개 실험 추가.
- result comprehension/closure 구간 monetization 보호.
- notification, phishing, privacy, reward farming, finance pressure, youth-safety guardrail 추가.
- 최신 시장/정책 조사와 runtime audit 반영.

이번 버전에는 런타임 구현 변경이 없습니다.