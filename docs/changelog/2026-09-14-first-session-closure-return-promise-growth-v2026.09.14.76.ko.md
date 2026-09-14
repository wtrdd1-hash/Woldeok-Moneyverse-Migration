# 변경 기록 — v2026.09.14.76 첫 세션 종료·복귀 약속 성장

기준일: 2026-09-14
변경 유형: 문서 전용
런타임/코드 변경: 없음

## 추가
- `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`와 한국어 대응본을 추가했습니다.
- 첫 의미 가치 이후 사용자가 직접 복귀 이유를 만들지 못한 채 세션이 끝날 수 있는 공백을 정의했습니다.
- `첫 결과 → continuation 하나 선택 → 세션 종료 → D1 exact-thread recognition → D7 resolve/renew → D30 durable history` 루프를 추가했습니다.
- DB/API/scheduler 구현 상세를 늘리지 않고 첫 30초·첫 3분·첫 세션 종료 소비자 원칙을 추가했습니다.
- D1/D3/D7/D14/D30, 세션 길이, social/share, LiveOps 연계를 정리했습니다.
- return-promise 선택, exact-thread return, D7 완료/갱신, D30 지속기록, retained CAC/LTV 및 신뢰 guardrail 실험·KPI를 추가했습니다.
- 첫 세션 closure를 interruptive ad/subscription gate로부터 보호했습니다.

## 보안 / 개인정보 / 악용
- HIGH: 미완료 목표/대기 보상 사칭 phishing·ATO.
- HIGH: personalized continuation에서 private WLD/WDX/debt/casino/social/security 상태 노출.
- HIGH: save/return event에 경제보상을 붙일 경우 multi-account/reward farming.
- HIGH: 손실·부채·카지노 결과를 이용한 finance-like comeback manipulation.
- MEDIUM: analytics 과수집.
- 기존 OAuth/session/RBAC/admin/ledger/privacy/community 경계를 유지했으며 보안 코드는 수정하지 않았습니다.

## 런타임 근거
- Production 시작 가이드는 현재 첫날 체크리스트의 마지막을 남은 WLD 복리예금 예치로 끝내며, user-authored next-return promise는 공개 화면에서 확인되지 않습니다.
- 홈의 game-only 고지, Monthly Notes 준비 상태, 로비/운영소식 quiet state는 계속 확인됩니다.

## 외부 근거
- Supercell, 2026-05-13: 다음 목표가 명확하게 보이는 progression 방향.
- Xbox, 2026-04-30: 사용자가 고정한 Jump back in 대상의 지속 노출.
- Clash Royale, 2026-09-07: 현재 시즌의 구체 활동 묶음.
- Google Search 현재 people-first 콘텐츠 가이드.
- FTC 2026년 5~6월 구독 집행, 9월 personalized-pricing 제안은 정책 신호로만 참고.

## 통합
- 작업 시작·중간 `main`: `00d4468b4ea499f9e273a70d431bae1ca0c3d026` (v2026.09.14.75).
- 직접 반영 직전 `main`을 다시 확인합니다.
- 문서-only 변경이므로 별도 PR을 만들지 않습니다.