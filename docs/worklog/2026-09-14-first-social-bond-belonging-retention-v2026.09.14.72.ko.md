# 작업 기록 — 첫 사회적 연결·소속감 리텐션 v2026.09.14.72

기준일: 2026-09-14
변경 유형: 문서 전용

## 검토 입력
- 작업 시작·중간 `main`: `2bb84e2b1272ee40c373aa9bd8ee89ab08b286ea`.
- `PROJECT_PLAN.md` Living Project Plan.
- `PRODUCT_GROWTH_PLAN.md`.
- `CLUBHOUSE_UX_OPERATIONS_SPEC.md`.
- `COMMUNITY_MARKET_INTEGRITY_SPEC.md`.
- `WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md` 및 최근 소비자 성장 명세.
- 제안하는 social/deep-link 개념이 현재 인증 경계를 약화시키지 않는지 확인하기 위해 최근 native OAuth prelogin isolation v2026.09.14.71 변경.
- Production 공개 홈, `/guide`, `/lobby`.

## 선택한 공백
프로젝트에는 클럽 운영·moderation·여러 리텐션 시스템이 이미 정의되어 있지만 개인 activation을 안전하고 지속 가능한 사회적 bond 하나로 바꾸는 단일 소비자 성장 계약은 부족하다. Production은 일회성 로비가 있고 onboarding 가이드는 경제·직업 중심이다.

## 조사
직접 채택:
- Discord Community Onboarding(2026-06-25 갱신): newcomer가 role/channel을 직접 선택하고 이후 변경 가능.
- Discord Community Onboarding Examples(2026-05-15 갱신): 선택지 과다로 인한 압도 방지.
- Discord social layer/game growth(2026-03-09, 2026-08-20): social connection을 friend/join 수가 아니라 downstream play/retention으로 평가.
- Roblox chat safety update(2026-01-07): 연령 민감 communication, privacy, proactive filtering, report를 안전 신호로 참고.
- KISA 2026 스팸·사칭 자료: 명확한 동의와 invite/return message의 credential-phishing 패턴 방지.

법규·참고:
- FTC COPPA age-verification policy statement(2026년 2월).
- 개인정보위 COPPA 2.0 국외동향(2026-04-01): 한국 현행법으로 취급하지 않음.

## 제품 결정
- 개인 첫 가치 전에 사회 참여를 강제하지 않음.
- generic lobby/거대 discovery grid 대신 맥락형 social preview 하나.
- observe-before-join과 비금전 첫 기여 우선.
- D1 인식, D3 상호 진전, D7 공동 결과, D14 자발적 소속 표현, D30 공동 역사를 정의.
- 공동 결과를 우선 viral artifact로 사용하고 raw invite는 보조 수단으로 취급.
- raw join/message/reaction/share에 의미 있는 WLD/WDX 지급 금지.
- private messaging, 경제적 referral reward, 공개 social ranking은 별도 안전/fraud/privacy 검토 전 범위 밖.

## 보안·개인정보 검토
High:
1. 괴롭힘/grooming/doxxing/원치 않는 접촉;
2. social-invite phishing/ATO;
3. 다계정/referral/reward farming;
4. 비공개 사회·경제 상태 유출;
5. coordinated community/WDX manipulation.

Medium:
- 사칭/가짜 사회적 증거;
- analytics 과수집.

보안 코드는 수정하지 않음.

## Runtime Reality Audit
가능.
- `/`: 커뮤니티 가상경제 포지셔닝, WLD game-only 고지, community lobby 진입 존재.
- `/lobby`: ephemeral message, 현재 접속자, empty-state 인사, password/auth code/실제 금융정보/주소·연락처 금지 안내.
- `/guide`: 첫날 흐름은 여전히 로그인 → 지갑 → 퀘스트/직업 → 은행/상점 중심이며 주식/사업/카지노도 강하게 소개.

결론: 검토한 공개 surface에서는 관심사 기반의 지속형 first-social-bond 경로가 확인되지 않았다.

## 준비한 파일
- `docs/planning/FIRST_SOCIAL_BOND_BELONGING_RETENTION_GROWTH_SPEC.md`
- `docs/planning/FIRST_SOCIAL_BOND_BELONGING_RETENTION_GROWTH_SPEC.ko.md`
- 영문/한국어 changelog.
- 영문/한국어 worklog.

## 다음 우선순위
다음 하나를 검증한다.
`개인 첫 가치 → 관련 social preview → 비금전 제한 기여 → D1 인식 → D3 상호 진전 → D7 공동 결과 → D30 공동 역사`.
