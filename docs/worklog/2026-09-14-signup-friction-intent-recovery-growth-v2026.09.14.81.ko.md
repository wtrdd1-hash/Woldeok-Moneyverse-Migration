# 작업기록 — 가입 마찰 및 의도 복구 성장 v2026.09.14.81

날짜: 2026-09-14

## 목표
가입 전에 이미 확인한 가치와 인증 후 첫 의미 행동 사이의 소비자 성장 공백을 닫되, 인증 구현 상세를 새로 늘리거나 기존 보안·개인정보 경계를 약화시키지 않습니다.

## 저장소 동기화
- 작업 시작 `main`: `bb06419d742d0fc39c6a52429493998fe771fd23`.
- 작업 중간 `main`: `bb06419d742d0fc39c6a52429493998fe771fd23`.
- `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`, 최근 성장 문서와 최신 저장소 변경을 읽었습니다.
- desktop dashboard 수정, restore QA hardening, 기존 email-verification delivery hardening 등 최근 런타임 작업을 보존합니다.

## 공백 분석
기존 기획에는 다음이 이미 존재합니다.
- 가입 전 가치 경험;
- contextual signup을 이미 경험한 가치의 보존으로 보는 원칙;
- 첫 세션 continuation/return promise;
- surface 간 intent handoff;
- 안전한 인증·세션·account-linking 경계.

남은 소비자 계약은 가입 과정 자체에 OAuth, 이메일 인증, 동의, 오타/반송, 탭 종료, 지연 복귀 같은 마찰이 들어왔을 때의 경험입니다. 인증을 끝낸 사용자가 generic home에 떨어져 가입한 정확한 이유를 잃어서는 안 됩니다.

선택한 loop:

`public value → authored intent → contextual signup → safe verification/recovery → exact intent continuation → meaningful action → D1 → D7 → D30`

## 기획 변경
- signup을 activation이 아니라 intent 보존 checkpoint로 재정의했습니다.
- 정상적인 중단 상태와 차분한 recovery 동작을 정의했습니다.
- 인증 완료부터 첫 의미 행동까지를 interruptive monetization 보호구간으로 지정했습니다.
- D30까지 lifecycle promise를 추가했습니다.
- intent recovery와 retained quality KPI를 추가했습니다.
- contextual signup, exact continuation, interrupted verification, raw-signup reward, monetization timing을 다루는 실험 5개를 추가했습니다.
- SEO/private-indexing 경계를 명확히 유지했습니다.
- WLD/WDX의 game-only 의미와 raw signup/verification 경제보상 금지를 유지했습니다.

## 검토한 자료
### 직접 채택
- Discord, “Building on the Social Layer of Games: What’s New from GDC 2026”: 사용자 맥락을 보존하는 contextual account-linking 방향을 참고했습니다. 성과 수치는 Moneyverse 예상치로 사용하지 않았습니다.
- KISA 2026-05-19 정부기관 사칭 피싱 주의: verification/continuation link가 credential-harvesting 행동을 정상화하지 않아야 한다는 guardrail에 반영했습니다.
- KISA 2026-03-04 불법스팸 안내서 개정: verification/service message 동의가 상업광고 동의로 확장되지 않도록 반영했습니다.
- Google Search Central noindex 가이드: auth, verification, recovery, private continuation 상태를 SEO 자산에서 제외했습니다.

### 참고만 함
- Google World Password Day 2026: 낮은 마찰과 피싱 저항성이 높은 인증은 유용한 방향이지만 이번 문서-only 회차에서 passkey 구현 요구를 추가하지 않았습니다.

## Runtime Product Reality Audit
상태: **부분 가능**.

확인됨:
- Production 홈 접근 가능, WLD/보상을 game-only 가상 데이터로 설명.
- 공개 시작 가이드 접근 가능.
- 가이드는 여전히 로그인, 지갑, 퀘스트/직업, 은행/상점 및 금융/자산 progression을 강하게 강조.

독립적으로 확인하지 못함:
- 실제 login/registration/email-verification UI;
- 가입 전 intent가 인증/verification을 통과해 정확히 복구되는지 여부.

저장소 근거:
- 현재 보안기획은 하나의 공유 authentication/session 모델과 엄격한 account-link 경계를 유지함.
- 최신 main에는 고확률 주소 오타와 안전한 진단을 다루는 email-verification delivery hardening 변경이 이미 존재함.

## 보안·개인정보·악용 검토
- HIGH: verification 또는 `저장된 진행 계속` 메시지 사칭 피싱.
- HIGH: continuation context에서 WLD/WDX·부채·카지노·비공개 social/security 상태 노출.
- HIGH: 봇·다계정 signup/verification/referral farming.
- HIGH: 전환율을 이유로 account enumeration 또는 unsafe merge 경계를 약화시키는 위험.
- MEDIUM: signup intent analytics가 무제한 광고 profile로 전환되는 위험.

최소 보호조건은 canonical domain 일관성, growth copy에서 credential/code 요구 금지, public-safe continuation allowlist, 개인화 상태 private-by-default, URL/analytics secret 금지, raw auth event에 의미 있는 WLD/WDX 보상 금지, 기존 enumeration/account-linking 계약 유지입니다.

## 변경 파일
- `docs/planning/SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md`
- `docs/planning/SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-signup-friction-intent-recovery-growth-v2026.09.14.81.md`
- `docs/changelog/2026-09-14-signup-friction-intent-recovery-growth-v2026.09.14.81.ko.md`
- `docs/worklog/2026-09-14-signup-friction-intent-recovery-growth-v2026.09.14.81.md`
- `docs/worklog/2026-09-14-signup-friction-intent-recovery-growth-v2026.09.14.81.ko.md`

## 검증
- 문서-only 범위.
- 영문 canonical과 한국어 대응본 parity 유지.
- 런타임, DB, API, auth, migration, scheduler, 인프라, 보안코드 변경 없음.
- commit/ref 갱신 직전에 최신 main을 다시 확인해야 합니다.

## 롤백
성장 가설이 대체되면 단일 문서 커밋을 revert합니다. 런타임/데이터 롤백은 필요하지 않습니다.

## 남은 위험
- 실제 auth/verification UX와 intent recovery 동작은 runtime 검증되지 않았습니다.
- contextual intent recovery가 D7/D30을 개선한다는 cohort 근거가 아직 없습니다.
- 향후 이메일/push/deep-link recovery를 구현할 경우 별도 security/privacy/fraud QA가 필요합니다.
