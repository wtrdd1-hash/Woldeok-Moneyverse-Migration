# 변경 기록 — 아티팩트→수신자 바이럴 성장 v2026.09.14.58

날짜: 2026-09-14
범위: 소비자 성장 기획만
영문 대응본: `docs/changelog/2026-09-14-artifact-to-recipient-viral-growth-v2026.09.14.58.md`

## 추가
- `ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.md`를 다음 Living 소비자 성장 기획으로 추가.
- 가장 큰 공백을 사용자가 무언가를 공유한 뒤 수신자 측 연속성이 약한 문제로 정의.
- 바이럴 성장을 `초대→보상→초대`에서 `의미를 받음→의미를 만듦→의미를 공유함`으로 재정의.
- 자산·수익 과시보다 정체성, 성취, 해석, 기여를 공유 동기로 우선.
- public-safe 공유 아티팩트 구조와 맥락형 수신자 CTA 정의.
- 수신자 첫 30초·첫 3분·첫 세션 목표 추가.
- 1:1 관련성, 정체성 브로드캐스트, 협업, 콘텐츠 발견의 4개 바이럴 루프 정의.
- 단순 클릭·공유·회원가입에 의미 있는 경제보상을 주지 않는 referral 경계 추가.
- 공유 유입 코호트와 D1/D3/D7/D14/D30 연속성 정의.
- 충분한 맥락이 있는 공개 아티팩트만 SEO 후보로 두고 얇은 개인/경제/보안 페이지는 비공개/noindex 유지.
- 리텐션 우선 수익화 순서와 5개 실험 추가.
- 비공개정보 유출, 피싱/가짜 공유페이지, referral fraud, 유해/사칭 UGC를 High 위험으로 기록.

## Research evidence
직접 채택:
- Discord Profile Widgets FAQ, 2026-09-08 업데이트: 사용자가 관심·정체성 공개를 직접 통제.
- Spotify Messages, 2026-01-07 및 2026-01-28 그룹공유 업데이트: 의미 있는 콘텐츠 중심 공유와 사용자 통제.
- Google Search Central UGC spam 가이드: abuse policy, 신고, 스팸계정 통제, 선택적 색인.
- Google Search Central Site Reputation Policy, 2026-08-28 업데이트: 제3자 콘텐츠를 호스트 권위 이용용 SEO inventory로 만들지 않음.
- FTC 현행 endorsement 가이드: 대가성/보상형 공유는 material connection을 명확히 공개해야 할 수 있으며 조작·가짜 사회적 증거는 deceptive할 수 있음.

참고만:
- Discord Game Discovery/Social Play, 2026-08-20: discovery를 노출량이 아니라 실제 downstream play/retention으로 평가하는 방향.

## Runtime audit
2026-09-14 실제 공개서비스 확인 가능.
홈에서 확인:
- WLD game-only 고지 유지;
- Discord 연결 커뮤니티 가상경제라는 설명;
- Start Here에서 로그인 전 탐색 가능성을 설명;
- 로비가 실제로 조용하거나 비어 보일 수 있음;
- 월간 소식은 아직 공개 운영소식이 없음;
- sponsored inventory는 이미 존재.

판단: 공개 홈에는 아직 강한 artifact→recipient 루프가 눈에 띄지 않는다. referral 지급·공개피드·광고 인벤토리 확대 전에 진짜 공유할 가치가 있는 결과물 하나와 context-first 수신자 랜딩을 우선 검증한다.

## 유지한 제약
- 런타임 코드, API, DB, 인증, 인프라, 보안아키텍처 변경 없음.
- 기존 auth/session/RBAC/ledger/economy/privacy 경계 유지.
- WLD/WDX는 virtual/simulated/game-only 유지.
- 개인화된 금융/보안/소셜 정보는 기본 비공개.
- 이 문서만으로 경제적 referral 보상, 공개 프로필 확대, 신규 UGC 시스템, deep-link 계약을 승인하지 않음.

## 다음 우선순위
`의미 있는 결과 → public-safe 아티팩트 → 수신자가 로그인 전에 이해 → 관련 preview → activation → D1/D7 → 수신자의 자기 아티팩트 생성`을 먼저 검증하고, 그 전에는 referral 인센티브·알림량·공개 wealth/status 카드·광고 중심 공유 랜딩을 확대하지 않는다.
