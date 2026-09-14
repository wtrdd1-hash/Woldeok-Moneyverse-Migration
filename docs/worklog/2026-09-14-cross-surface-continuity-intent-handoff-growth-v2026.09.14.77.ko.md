# 작업기록 — v2026.09.14.77 크로스 서피스 연속성·의도 인계 성장

기준일: 2026-09-14
변경 유형: 문서-only

## 검토 입력
- 작업 시작·중간 최신 `main`: `9630bdb47f7b12a21f17097f197b01f8ae541c40`;
- `docs/planning/PROJECT_PLAN.md` Living Project Plan;
- `docs/planning/PRODUCT_GROWTH_PLAN.md`;
- `docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.md`;
- `docs/planning/FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`;
- `docs/mobile-api.md` 및 최신 mobile compatibility commit;
- Production 공개 홈·시작 가이드·운영소식;
- 최신 Xbox, Discord, Android, KISA, 개인정보위, FTC 자료.

## 가장 큰 공백
공개 웹에서 유입되고 Discord에서 사회적 연결을 만들고 웹/네이티브 surface를 이용할 수 있지만, surface 전환 시 사용자가 직접 만든 목적과 맥락이 끊겨 다시 방향을 찾아야 할 수 있다.

선택한 loop:
`qualified entry → authored intent → optional safe handoff → exact destination recognition → meaningful action → D1/D7 continuation → D30 unified history`.

## 주요 결정
- surface 이동은 선택사항이며 앱 설치·Discord 연결 자체를 activation으로 보지 않음.
- 공개 웹, 로그인 웹/네이티브 앱, Discord/커뮤니티의 역할을 구분하고 모든 기능을 중복 구현하는 방향을 피함.
- generic-home deep link보다 exact-context destination을 우선.
- 기존 account linking/auth/session 경계를 유지하고 암묵적 account merge나 별도 인증체계를 성장 편의를 위해 만들지 않음.
- handoff 중 intended action 전에 interruptive monetization을 넣지 않음.
- raw link/install/account-link 행동에는 의미 있는 WLD/WDX를 지급하지 않음.

## 최신 레퍼런스 요약
- Xbox 2026: progress가 device를 따라가고 이어서 플레이하는 cross-device 원칙 참고.
- Discord GDC 2026/Social Layer: contextual account/social handoff와 persistent context 참고. 공개 partner lift는 Moneyverse 예상치로 사용하지 않음.
- Android App Links: deep-link hijacking 방지를 위한 향후 security QA trigger.
- KISA 2026-05-19: 공식기관 사칭 링크로 비밀번호를 탈취하는 피싱 사례를 직접 threat reference로 사용.
- 개인정보위 2026-07-27: cross-app 행태정보/광고 analytics 최소화 guardrail.
- FTC 2026 구독 집행: 중요조건·명시적 동의·쉬운 취소 guardrail 유지.

## Runtime Product Reality Audit
검증: 부분 가능.

Production 공개 웹에서 확인:
- WLD/보상 game-only 고지;
- Discord와 연결된 서비스라는 설명;
- Discord/Google 진입 및 시작 가이드;
- 지갑·게임·거래소·상점·퀘스트 중심 shortcut;
- Monthly Notes/운영소식 quiet state와 sponsored placement;
- 웹 중심이며 금융·경제 서사가 강한 시작 가이드.

독립 검증 불가:
- native app 실제 UX;
- Discord→web/app exact-context end-to-end handoff;
- cross-surface D1/D7 state recognition.

## 보안 검토
HIGH:
1. 악성/탈취 deep-link·invite phishing;
2. account-link hijacking/unintended identity merge;
3. web/app/Discord/public preview 간 private-state leakage;
4. referral/install/link farming.

MEDIUM:
- cross-surface tracking graph를 만드는 analytics overcollection.

최소 보호조건과 별도 QA trigger는 canonical spec에 기록했다. 보안 코드 수정은 수행하지 않았다.

## 변경 파일
- `docs/planning/CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.md`
- `docs/planning/CROSS_SURFACE_CONTINUITY_INTENT_HANDOFF_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-cross-surface-continuity-intent-handoff-growth-v2026.09.14.77.md`
- `docs/changelog/2026-09-14-cross-surface-continuity-intent-handoff-growth-v2026.09.14.77.ko.md`
- `docs/worklog/2026-09-14-cross-surface-continuity-intent-handoff-growth-v2026.09.14.77.md`
- `docs/worklog/2026-09-14-cross-surface-continuity-intent-handoff-growth-v2026.09.14.77.ko.md`

## 검증·반영
- 문서 일관성 검토 완료;
- 런타임 코드 변경 없음;
- DB/API/인증/migration/scheduler/인프라 변경 없음;
- commit/ref 반영 직전 최신 `main` 최종 재확인 필요;
- 별도 문서 PR 없이 non-forced fast-forward 방식으로 `main` 직접 반영.