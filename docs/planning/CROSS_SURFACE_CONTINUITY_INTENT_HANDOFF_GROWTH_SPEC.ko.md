# 월덕 머니버스 — 크로스 서피스 연속성·의도 인계 성장 기획

> 버전: v2026.09.14.77
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `FIRST_SOCIAL_BOND_BELONGING_RETENTION_GROWTH_SPEC.md`, `PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`, `AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`
> 영문 기준 문서: [CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.md](CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임·DB·API·인증·migration·scheduler·인프라·보안코드 변경 없음.

## 1. 이번 회차에서 선택한 공백
Moneyverse는 첫 가치, 첫 세션 종료, D1/D7 복귀 약속, social belonging, 알림, World Pulse, SEO, creator acquisition, retention-safe monetization까지 상당히 구체화되어 있다. 남은 큰 소비자 공백은 **surface fragmentation**이다. 사용자는 공개 웹에서 발견하고 Discord에서 관계를 만들고 이후 모바일/네이티브 surface를 이용할 수 있지만, surface를 바꿀 때마다 처음부터 다시 시작하는 느낌을 받을 수 있다.

최근 저장소는 앱용 모바일 계약을 강화하면서 기존 인증·세션·동의 모델을 그대로 보존했다. 따라서 성장 관점의 핵심 질문은 **기기를 바꾸는가가 아니라, 사용자가 고른 목적이 함께 이동하는가**이다.

핵심 루프:

`한 surface에서 qualified entry → 가치 이해 → authored intent → 안전한 handoff → 목적 surface에서 같은 intent 인식 → meaningful action → D1 동일 스레드 인식 → D7 연속성 → D30 통합 기록`

소비자 약속:

**“어디에서 다시 들어오더라도 기기나 채널보다 내가 고른 길이 먼저 이어진다.”**

이 문서는 API·deep-link·session·OAuth·모바일클라이언트·Discord bot 구현명세가 아니다.

## 2. surface별 역할
모든 surface가 모든 기능을 복제하지 않는다.

- **공개 웹:** 검색·SEO·설명·가이드·세계관/시즌 공개 콘텐츠·안전한 preview·계정 진입.
- **로그인 웹/네이티브 앱:** 개인 진행, quick check, 의미 행동, 컬렉션·직업·프로젝트 연속성, 긴 세션.
- **Discord/커뮤니티:** 사회적 조율, 프로젝트/커뮤니티 대화, 안전한 초대, 관련 Moneyverse 스레드로의 discovery.

사용자는 어느 surface에서 시작해도 된다. 다른 surface로 보낼 때는 generic home이 아니라 **왜 이동했는지**를 보존해야 한다.

## 3. 첫 30초·3분·첫 세션
### 첫 30초
모든 surface가 동일한 제품 진실을 전달한다.
- Moneyverse는 지속형 커뮤니티 가상경제/게임 경험이다.
- WLD/WDX와 관련 경제 데이터는 virtual/game-only이다.
- 지금 할 행동 하나가 명확하다.
- 기본 가치를 이해하기 위해 Discord 연결이나 앱 설치가 필수는 아니다.

### 첫 3분
사용자가 다음 중 하나의 portable intent를 직접 만든다.
- 직업/프로젝트 경로 하나 이어가기;
- 가상기업/세계 스레드 하나 follow;
- 컬렉션 테마 하나 저장;
- 학습/replay 경로 하나 이어가기;
- bounded community/project context 하나 참여.

### 첫 세션 종료
다른 surface가 실제로 더 적합할 때만 “앱에서 이 프로젝트 이어하기”, “Discord에서 이 커뮤니티 스레드 열기”, “웹에서 전체 가이드 보기”처럼 이유를 설명한다. 앱 설치나 계정 연결 자체를 activation gate로 사용하지 않는다.

## 4. intent-preserving handoff
성공한 handoff는 사용자가 다시 방향을 찾지 않아도 되게 한다.

좋은 destination:
1. 사용자가 고른 exact thread 인식;
2. 필요하면 어디에서 왔는지 짧게 설명;
3. 관련 next action 하나;
4. 안전한 돌아가기;
5. 이미 끝낸 onboarding 반복 금지.

피해야 할 경험:
- contextual invite 뒤 generic home;
- 같은 기업/프로젝트/컬렉션을 다시 검색하게 함;
- 불필요한 재가입/재동의;
- 의도한 행동 전에 광고/paywall;
- account linking 자체를 제품가치처럼 취급.

## 5. D1/D3/D7/D14/D30
- **D1:** 기기가 아니라 exact chosen thread를 먼저 인식한다.
- **D3:** 실제 진행, 관련 새 맥락, 안전한 social response, 또는 정직한 unchanged 상태를 보여준다.
- **D7:** 첫 cross-surface thread가 진행·완료·교체 중 하나로 명확히 정리된다. surface 수 자체는 성공지표가 아니다.
- **D14:** 반복가치가 검증된 뒤에만 편의/사회적 깊이를 위한 두 번째 surface를 제안한다. 한 surface만 쓰는 사용자를 낮은 품질로 보지 않는다.
- **D30:** collection chapter, profession/project history, world/company follow, learning replay, season memory, shared project chapter가 하나의 기록으로 이어진다.

## 6. acquisition/viral funnel
업데이트 funnel:

`qualified impression → contextual public value → authored intent → optional handoff → intent preserved → 필요한 경우에만 signup/linking → meaningful activation → D1/D7 continuity → D30 retained contribution`

paid acquisition은 install당 비용이나 account-link 수가 아니라 **D30 retained user당 fraud-adjusted CAC**로 본다.

공유/초대 수신자는 로그인하지 않아도 무엇이 공유되었는지 이해해야 한다. 흐름은 `artifact/invite 이해 → safe preview → own choice → 저장/참여 시 인증 → exact context 복귀 → meaningful action → D7`이다.

raw install/link/click/invite acceptance에는 의미 있는 WLD/WDX를 지급하지 않는다.

## 7. UX 원칙
- context가 있으면 generic dashboard보다 “하던 것 이어하기”를 먼저 보여준다.
- context를 복구하지 못하면 무작위 프로모션 대신 사용자가 저장한 priority로 fallback한다.
- valid consent를 성장지표를 위해 반복해서 요구하지 않는다.
- notification permission·Discord linking·앱 설치를 강제처럼 보이게 하지 않는다.
- error·URL·share에는 token, internal route, private identifier, security state를 노출하지 않는다.

## 8. SEO
개인 continuation state, private deep-link state, referral code, account-link status, 개인 진행, surface별 중복페이지는 검색자산이 아니다.

색인 후보는 충분한 공개 가이드, 가상기업/세계 페이지, 시즌 아카이브, 용어집·교육, 검토된 프로젝트 회고/커뮤니티 콘텐츠다. 공개 콘텐츠는 하나의 canonical identity를 유지한다.

## 9. 수익화
handoff 경계를 captive ad inventory로 취급하지 않는다.

보호 순서:
`context → destination recognition → intended action`.

신규/복귀 사용자에게 이 사이 interruptive ad·subscription gate·sponsor interstitial을 넣지 않는다. 가치 전달 후 자연스러운 경계에서 기존 retention-first 정책에 따라 수익화를 검토한다.

surface별 행동을 이용해 숨은 willingness-to-pay 가격차등을 하지 않는다. 구독 가격·갱신·취소 조건은 surface가 달라도 명확하고 일관돼야 한다.

## 10. 보안·개인정보·악용 검토
### HIGH — 악성/탈취 deep-link·invite 피싱
영향: credential/session 탈취, ATO, 가짜 Moneyverse 이동.
시나리오: 가짜 Discord invite·QR·“앱에서 이어하기”·“진행도 받기” 링크가 비밀번호/복구코드를 요구.
최소조건: canonical domain/브랜드 일관성, 가능한 platform verified link, 성장 콘텐츠에서 password/OAuth/recovery code 요구 금지, URL에 auth/session secret 금지, 민감행동 전 서버 권한 재검증.
별도 개발/QA: 신규 native/Discord/external deep-link 도입 전 필요.

### HIGH — account-link hijacking / unintended identity merge
영향: 다른 사람이 진행·사회적 정체성·가상자산에 접근.
최소조건: 기존 authenticated linking 규칙 보존, email/display-name 일치만으로 자동 merge 금지, 연결할 계정을 명확히 표시, linking은 실제 필요할 때만.
별도 QA: 신규 linking surface 전 필요.

### HIGH — surface 간 private-state leakage
영향: WLD/WDX·부채·casino·비공개 membership·moderation/security state 노출.
최소조건: public-safe allowlist, continuation 기본 private, 공개 preview/광고 analytics에 민감 경제·보안정보 금지.

### HIGH — referral/install/link farming
최소조건: raw handoff/install/link에 WLD/WDX 지급 금지, fraud-adjust KPI, 향후 보상은 verified downstream participation 기준.

### MEDIUM — analytics overcollection
cross-surface identity를 광고 추적 그래프로 만들지 않는다. 가능한 최소한의 pseudonymous lifecycle 지표만 사용하고 private economy/social history를 광고벤더에 전달하지 않는다.

기존 OAuth/session/RBAC/admin/ledger/privacy/community 경계는 그대로 유지한다.

## 11. 실험 backlog
| 실험 | 가설 | 대상 | Control | Treatment | Primary | Guardrail | 최소관찰 | 후속 |
|---|---|---|---|---|---|---|---|---|
| E1 contextual handoff | exact intent가 activation을 높인다 | web/Discord 유입 | generic home | exact-thread destination | handoff 후 meaningful action | bounce, ATO report | D7 | D7 개선 시 확대 |
| E2 optional linking | value-before-linking이 신뢰를 높인다 | Discord/native 후보 | preview 전 link | preview 후 필요 시 link | activation+link quality | duplicate account, abandon | D14 | 불필요한 강제 연결 제거 |
| E3 install vs browser | install 압박은 retained conversion을 낮출 수 있다 | mobile web | install-first | browser value+optional app | D7 retained conversion | install rate, complaint | D30 | retained value 기준 선택 |
| E4 unified recent | 하나의 history가 재탐색을 줄인다 | multi-surface | surface-local recent | chosen-thread first | time-to-meaningful-action | wrong-context reversal | D14 | 명확성 개선 시 유지 |
| E5 protected handoff | handoff 중 광고 제거가 D7을 지킨다 | eligible handoff | action 전 ad | action 후 수익화 | D7 retained quality | revenue/user, churn | D30 | retention-adjusted contribution 판단 |

## 12. KPI
Activation: authored-intent rate, handoff→intent recognition, handoff→meaningful action, switch 후 TTFV, 필요한 signup/link completion.

Retention: D1 same-thread recognition, D3 same-thread progress, D7 completion/renewal, D14 voluntary multi-surface use, D30 unified durable-history, WAU/MAU, returning-user share, meaningful actions/session.

Growth/revenue: SEO/creator/referral/Discord→intent-preserved activation→D7/D30, fraud-adjusted CAC, D30 retained CAC, LTV, ARPU/ARPDAU, subscription conversion, cohort revenue, ad-induced churn, retention-adjusted contribution.

Trust/safety: duplicate-account/linking-confusion, fake-signup/referral fraud, ATO/phishing signal, privacy complaint, suspicious reward duplication, deep-link destination mismatch.

## 13. 최신 레퍼런스
- **Xbox 2026-03-11 / 2026-04-30 — 직접채택 원칙:** Xbox Play Anywhere는 progress가 device를 따라가고 사용자가 이어서 플레이하는 것을 강조한다. 상업모델이 아니라 progress portability 원칙만 채택.
- **Discord GDC 2026 — 직접채택 원칙:** contextual account linking, persistent social presence, mobile-native linking으로 조율 마찰을 낮춘다. 공개한 partner lift 수치는 Moneyverse 예상치로 사용하지 않는다.
- **Discord Social Layer/SDK — 직접참고:** invite가 지원 platform의 relevant session/context로 이어지는 구조. Moneyverse에는 privacy/auth gate를 추가 전제로 사용.
- **Android Developers App Links — 보안 guardrail:** verified HTTPS app link는 deep-link hijacking을 줄이는 구현 QA trigger다. 이번 회차는 코드 변경 없음.
- **KISA 2026-05-19 — 위협 근거:** 공식기관처럼 보이는 링크를 이용해 비밀번호를 탈취하는 피싱 사례. Moneyverse handoff 메시지는 credential/recovery 정보를 요구하지 않는다.
- **개인정보위 2026-07-27 — privacy guardrail:** 타사 행태정보 관련 제재는 cross-app/surface 추적과 광고 analytics 최소화 필요성을 강화한다.
- **FTC 2026-05/06 — monetization guardrail:** surface와 무관하게 구독 중요조건·명시적 동의·쉬운 취소가 필요하다.

## 14. Runtime Product Reality Audit — 2026-09-14
검증: **부분 가능**.

Production 웹에서 확인한 내용:
- 홈은 WLD/보상이 game-only임을 명확히 표시하고 Moneyverse가 Discord와 연결된다고 설명한다.
- 공개 홈에는 Discord/Google 시작, 가이드, 지갑·게임·거래소·상점·퀘스트 shortcut, quiet lobby, 여러 sponsored placement가 존재한다.
- 시작 가이드는 현재 웹 중심이며 Discord 또는 Google 로그인 후 지갑→퀘스트→직업→보상→은행 흐름이 강하다.
- 운영소식은 아직 게시물이 없고 sponsored placement가 존재한다.

저장소 reality:
- 최신 모바일/external app 계약은 versioned app gateway를 강화하면서 기존 session·consent·OAuth 보안모델을 그대로 사용하도록 명시한다.
- native app의 실제 UX와 Discord→web/app end-to-end intent handoff는 이번 회차에서 독립적으로 검증하지 못했다.

따라서 `web/Discord/native entry → 동일 authored intent → exact destination context → D1/D7 continuity`는 **미검증 성장 가설**로 기록한다.

## 15. 결정과 다음 우선순위
먼저 하나의 좁은 경로만 검증한다.

`public/Discord context → authored thread 하나 → optional safe handoff → destination exact-thread recognition → meaningful action 하나 → D1 same-thread → D7 continuity → D30 unified history`

효과가 검증되기 전에는 mandatory app install, mandatory Discord linking, raw link/install reward, generic-home deep link, duplicate onboarding, cross-surface behavioral overcollection, intended action 전 monetization interstitial을 확대하지 않는다.