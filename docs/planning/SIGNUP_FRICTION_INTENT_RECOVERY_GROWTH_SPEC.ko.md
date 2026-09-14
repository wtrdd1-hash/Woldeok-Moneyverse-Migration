# Woldeok Moneyverse — 가입 마찰 및 의도 복구 성장 기획

> 버전: v2026.09.14.81
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.md`, `AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`
> 영문 기준 문서: [SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md](SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임·DB·API·인증·migration·scheduler·인프라·보안코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 이미 가입 전 가치, 맥락형 가입, 첫 세션 종료, surface 간 의도 연속성 기획이 존재합니다. 남은 공백은 **가입과 인증 절차 자체를 통과할 때 사용자의 목적이 보존되는가**입니다.

사용자는 서비스 가치를 이해하고 직업·컬렉션·세계 스레드 등을 선택한 뒤 저장하려고 가입했지만 OAuth, 자체 이메일 인증, 이용동의, 잘못 입력한 주소, 인증메일 지연, 탭 종료 등의 중단을 만날 수 있습니다. 인증 완료 뒤 generic home으로 돌아가면 사용자는 가입 비용을 치렀지만 가입 이유를 잃습니다.

이번 회차의 성장 계약은 다음입니다.

`qualified visit → useful sample → authored intent → contextual signup → verification/consent interruption → safe intent recovery → exact continuation → meaningful activation → D1 recognition → D7 continuation → D30 durable history`

가입 완료, 이메일 인증, OAuth 완료, 계정 연결, 앱 설치, 약관 동의 자체는 activation으로 보지 않습니다.

## 2. 소비자 약속

가입의 핵심 약속은 다음과 같습니다.

**“머니버스가 내가 고른 것을 기억하고 정확히 그 다음 단계로 이어주길 원할 때 계정을 만든다.”**

기본적인 공개 가치를 보기 위해 무조건 가입시키지 않습니다. 가입은 사용자가 이미 경험한 가치를 보존하기 위한 수단이어야 합니다. 예: 선택한 직업 방향, 컬렉션 테마, 가상기업/세계 스레드, 학습 경로, 시즌 follow, 안전한 커뮤니티 프로젝트.

## 3. 첫 30초와 첫 3분

### 첫 30초
사용자는 다음을 이해해야 합니다.
- Moneyverse는 game-only 지속형 커뮤니티 가상경제다.
- 안전한 범위에서는 가입 전에 유용한 preview/action을 볼 수 있다.
- WLD/WDX는 현금·실제 투자상품이 아니다.
- CTA는 무엇을 저장하고 이어가는지 설명한다.

`지금 가입`만 보여주기보다 실제 맥락이 있을 때 `이 경로 저장하고 계속하기`, `이 컬렉션 이어가기`, `이 프로젝트 계속하기` 같은 표현을 우선합니다.

### 첫 3분
보안/개인정보 경계를 침해하지 않는 범위에서 인증 전에 하나의 **사용자 선택 의도**를 만들 수 있어야 합니다. 이 의도에는 잔액, 자격증명, 보안상태, 대출/카지노 내역, 비공개 관계 같은 민감정보를 넣지 않습니다.

`context → preview → authored choice → 저장 이유 → signup`

## 4. 가입·인증 중단 소비자 모델

중단은 실패가 아니라 정상적인 소비자 상태로 봅니다.

1. **가입 선택** — 계정이 무엇을 보존하는지 설명.
2. **인증 대기** — 다른 계정 존재 여부를 노출하지 않으면서 남은 행동 안내.
3. **전달 실패/오타 교정** — 진행상태가 사라진다는 압박 없이 차분한 수정 경로 제공.
4. **사용자 이탈** — 불이익·가짜 만료보상 없음.
5. **정상 verification/login 경로로 복귀** — 최소한의 안전한 continuation context만 복구.
6. **인증 완료** — 정확한 원래 스레드로 돌아가거나, 유효하지 않다면 가장 가까운 안전한 대안 제시.
7. **의미 있는 행동** — 이 시점부터 activation으로 계산.

정확한 continuation을 안전하게 복원할 수 없다면 그 사실을 설명하고 가까운 다음 행동 하나를 제안합니다. 고위험 금융·카지노·광고 surface로 임의 대체하지 않습니다.

## 5. D0~D30

### D0
성공은 계정 생성이 아니라 다음입니다.
- 인증된 사용자가 가입할 때 약속한 맥락에 도달함;
- 의미 행동 하나 수행;
- 다음 세션에서 무엇을 이어갈지 이해함.

### D1
지갑 잔액, generic novelty, 광고보다 가입할 때 보존하려던 exact thread를 먼저 인식시킵니다.

### D3
실제 진전, 관련 세계/콘텐츠 변화, 사회적 반응, 또는 정직한 unchanged 상태 + evergreen next step 중 하나를 제공합니다.

### D7
원래 가입 약속이 실제 outcome/milestone 또는 `continue / archive / replace` 선택으로 이어져야 합니다.

### D14/D30
컬렉션 챕터, 직업/프로젝트 기록, 학습 replay, 세계/시즌 follow, 공간, 공동 프로젝트 기록처럼 “가입해서 남은 것”이 보여야 합니다. 장기 리텐션은 반복 로그인 자체가 아니라 정체성과 기록에 기대야 합니다.

## 6. Funnel과 cohort KPI

핵심 funnel:

`qualified visit → sample value → authored intent → signup start → verified/authenticated → intent recovered → meaningful activation → D1 exact-intent continuation → D7 outcome/renewal → D30 durable history`

추가 KPI:
- sample → authored intent;
- authored intent → contextual signup start;
- signup start → verified/authenticated;
- verified/authenticated → intent recovered;
- intent recovered → meaningful action;
- 인증 완료 후 first meaningful value까지 시간;
- D1 exact-intent recognition/continuation;
- D3 same-thread progress;
- D7 original-promise outcome/renewal;
- D30 durable-history coverage;
- 가입 방식·유입소스별 중단률;
- interrupted verification 이후 recovery 성공률;
- 가입 혼란 관련 문의/지원율.

신뢰 guardrail:
- fake-signup rate;
- credential stuffing/ATO signal;
- verification abuse/bot rate;
- phishing/사칭 신고;
- spam 신고;
- privacy complaint;
- 의심스러운 referral/reward 중복;
- 정상 사용자의 과도한 가입 차단.

가입 전환율이 높아져도 D7/D30 품질이나 신뢰가 나빠지면 성공이 아닙니다.

## 7. 실험 backlog

### 실험 A — contextual preservation vs generic signup
- 가설: 무엇을 저장하는지 명확하게 설명하면 generic signup CTA보다 인증 후 의미 행동률이 높다.
- 대상: 공개 sample을 완료한 신규 비회원.
- Control: 일반 로그인/가입 CTA.
- Treatment: intent별 `저장하고 계속하기` CTA.
- Primary: verified/authenticated → meaningful action.
- Guardrail: phishing 혼동, privacy complaint, bounce/support rate.
- 관찰: 최소 D7 성숙 cohort, 대규모 acquisition 확대 전 D30.

### 실험 B — exact intent recovery vs generic home
- 가설: 인증 후 원래 선택한 스레드로 돌아가면 post-auth time-to-value가 줄어든다.
- Primary: post-auth TTFV, meaningful-action rate.
- Guardrail: 권한 오류, 민감정보 노출, dead-link/error rate.

### 실험 C — 차분한 interrupted-verification recovery vs urgency
- Treatment: 상태 설명 + 안전한 수정/재시도 + “보상이 사라지지 않는다”는 정직한 안내.
- Primary: verification→activation.
- Guardrail: resend abuse, spam complaint, phishing report.

### 실험 D — raw signup reward 없음 유지
가입·인증 자체에 의미 있는 WLD/WDX를 주지 않는 것을 기본값으로 유지합니다. 경제보상 실험은 별도 fraud/security review 없이는 진행하지 않습니다.

### 실험 E — intent recovery 이후 monetization
`인증 완료 → 원래 맥락 인식 → 첫 의미 행동` 구간에서는 interruptive ad/paywall을 보호합니다.

## 8. Acquisition·SEO·바이럴 영향

paid/creator/SEO traffic은 싼 가입자 수로 평가하지 않습니다.

`CAC → verified/authenticated → intent recovered → meaningful activation → D7 → D30 → LTV/contribution`

공개 검색 페이지는 가입 전에도 독립적 가치를 가져야 합니다. verification-pending, login callback, account-link state, referral claim, recovery/security, 개인 continuation state는 SEO 자산이 아닙니다.

공유·초대 링크는 공개 맥락을 제안할 수 있지만 session token, verification token, 이메일 주소, 비공개 잔액, 민감 계정식별자, recovery 정보는 포함하지 않습니다.

## 9. 수익화 영향

가입·인증은 가치 전달 보호구간입니다.

`auth/verification completion → intent recovery → first meaningful action` 사이에 interruptive ad, sponsor interstitial, subscription gate, casino/loan prompt를 넣지 않습니다.

광고·구독은 반복가치가 증명된 이후에만 기존 retention-first 원칙으로 연결합니다. 더 빠른 인증, 계정복구, moderation priority, 인증 우대를 유료 판매하지 않습니다.

## 10. 보안·악용·개인정보 교차검토

### HIGH — verification/login 사칭 및 피싱
- 영향: 자격증명 탈취, 세션 탈취, 계정탈취.
- 시나리오: `머니버스 계정 인증`, `저장된 진행도 계속`, `대기 보상`을 사칭한 링크가 credential-harvesting 페이지로 연결.
- 최소조건: canonical domain/브랜드 일관성, growth 메시지에서 password/OAuth code/recovery code 요구 금지, 공개/공유 URL에 auth/session/verification secret 금지, 서비스 메시지와 상업 메시지 구분.
- 별도 개발/QA: 새로운 이메일·push·deep-link recovery 구현 시 필수.

### HIGH — intent payload가 민감상태 노출
WLD/WDX 포지션, 부채, 카지노 활동, 비공개 membership/social graph, security/recovery 상태를 continuation에 담지 않습니다. public-safe allowlist, private-by-default, 최소 context만 보존합니다.

### HIGH — fake signup / verification / referral farming
raw signup, verification, resend, login, invite acceptance에 의미 있는 WLD/WDX를 지급하지 않습니다. 향후 보상은 retained/fraud-adjusted milestone을 별도 검토합니다.

### HIGH — account enumeration / 잘못된 account merge
기존 인증 계약을 그대로 유지합니다. public response는 generic하게 유지하고 동일 이메일만으로 계정을 자동 병합하지 않으며, linking은 인증·재인증 규칙을 우회하지 않습니다.

### MEDIUM — analytics 과수집
가입 의도를 무제한 광고 profile로 전환하지 않습니다. credential, verification state, private economy state, security event, hidden social data는 growth analytics payload에서 제외합니다.

## 11. 미성년자 및 Trust & Safety

청소년을 대상으로 실제 금융수익, casino jackpot, debt recovery를 가입 유도문구로 쓰지 않습니다. 기존 연령·개인정보·커뮤니티안전·광고 gate는 성장 실험보다 우선합니다.

## 12. 법규/정책 주의점

- 한국: KISA 2026-05-19 정부기관 사칭 메일 사례는 링크 뒤 비밀번호 입력을 유도해 정보를 탈취하는 패턴을 경고합니다. Moneyverse verification/continuation 메시지가 이런 패턴을 정상화하지 않도록 합니다.
- 한국: KISA 2026-03-04 불법스팸 안내서 개정은 모호한 광고동의 표현과 어려운 수신거부를 경계합니다. verification/transactional 메시지 동의를 marketing 동의로 확대하지 않습니다.
- 미국: FTC 소비자 피싱 가이드는 예상하지 못한 인증·보안 링크를 계정탈취 위험으로 다룹니다. 긴급성을 과도하게 사용하지 않습니다.
- 개인정보: 기존 최소수집 원칙을 유지하며 가입전환을 위해 불필요한 인구통계·실제 금융정보를 추가수집하지 않습니다.

출시 시점에는 별도 법률 검토가 필요합니다.

## 13. Research note — 2026-09-14

직접 채택:
- Discord, “Building on the Social Layer of Games: What’s New from GDC 2026” — contextual account-link prompt와 낮은 coordination friction을 방향성 근거로만 채택. https://discord.com/blog/building-on-the-social-layer-of-games-whats-new-from-gdc-2026
- Google, “World Password Day 2026” — passkey의 낮은 마찰·피싱 저항성을 trust/friction 방향성 근거로 참고. 이번 문서-only 회차에서 passkey 구현을 요구하지 않음. https://blog.google/innovation-and-ai/technology/safety-security/world-password-day-2026/
- KISA, 2026-05-19 정부기관 사칭 피싱 주의 — verification/continuation link 신뢰 guardrail에 직접 반영. https://spam.kisa.or.kr/spam/main.do
- KISA, 2026-03-04 불법스팸 안내서 제7차 개정 — 서비스/인증 메시지와 광고동의 분리 guardrail에 직접 반영. https://spam.kisa.or.kr/spam/main.do
- Google Search Central `noindex` / control-what-you-share — auth/verification/private continuation page SEO 제외 근거로 직접 반영. https://developers.google.com/search/docs/crawling-indexing/block-indexing

참고만 함:
- Discord account-linking 성과 수치. Discord/파트너 내부 데이터이므로 Moneyverse 예상 성과로 사용하지 않음.

## 14. Runtime Product Reality Audit — 2026-09-14

검증: **부분 가능**.

확인된 공개 surface:
- Production 홈은 접근 가능하며 WLD/보상이 game-only 가상 데이터임을 명확히 표시함.
- 홈에는 Discord/Google 시작과 공개 시작가이드/preview가 존재함.
- 시작 가이드는 접근 가능하며 로그인 → 지갑 → 퀘스트/직업 → 금융/상점 progression을 제시함. 최신 identity/continuity 성장기획에 비해 금융/자산 서사가 여전히 강함.
- 실제 login/registration/verification UI는 이번 audit에서 독립적으로 가져오지 못했으므로 인증 통과 중 intent 보존은 **검증되지 않음**.

저장소 현실:
- 현재 인증 기획은 하나의 공통 session/security 모델과 email verification의 고위험 경계를 유지함.
- 최신 main에는 고확률 이메일 도메인 오타와 안전한 전달 진단을 보강한 email-verification delivery hardening 변경이 이미 있음. 이는 전달 안정화이지 소비자 intent가 인증 후 복구된다는 증거는 아님.

따라서 `intent → signup → verification → exact continuation`은 실제 실험이 필요한 성장 가설로 유지합니다.

## 15. 결정 및 다음 우선순위

다음 좁은 growth contract를 채택합니다.

`public value → authored intent → contextual signup → safe verification/recovery → exact intent continuation → meaningful action → D1 → D7 → D30`

이 루프가 retained quality와 trust를 개선하기 전에는 **raw signup 보상, urgency verification copy, generic-home post-auth routing, finance/casino comeback 압박, auth-page 광고, cross-surface tracking 확대**를 진행하지 않습니다.
