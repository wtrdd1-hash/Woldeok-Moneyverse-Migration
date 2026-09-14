# 변경 기록 — v2026.09.14.75 Zero-State 연속성·조용한 화면 성장

기준일: 2026-09-14
변경 유형: 문서 전용
런타임/코드 변경: 없음

## 추가
- `ZERO_STATE_CONTINUITY_QUIET_SURFACE_GROWTH_SPEC.md`와 한국어 대응본을 추가했습니다.
- 진짜 zero state, 조용한 커뮤니티, 콘텐츠 미게시, 필터 결과 없음, 실패/접근불가의 5개 상태를 분리했습니다.
- 신규 frontend/backend 구현 명세를 만들지 않고 legitimate zero/quiet state에 대한 `State → Reason → Continuity → Next` 소비자 계약을 추가했습니다.
- D0/D1/D3/D7/D14/D30 및 comeback에서 빈 순간을 막다른 길이 아니라 authored state와 복귀 이유로 전환하는 원칙을 추가했습니다.
- zero-state 이해도, time-to-first-value, first authored state, D1 recognition, D7 durable thread, D30 meaningful-history coverage, organic quality, ad-induced churn, 신뢰/안전 guardrail을 포함한 실험 backlog와 cohort KPI를 추가했습니다.
- 사용자별 empty state, empty 검색/필터 결과, private 경제/계정 상태, 얇은 coming-soon 페이지의 검색 색인을 제한하는 SEO 원칙을 추가했습니다.
- 조용하거나 비어 있는 화면을 남는 광고 inventory로 보지 않고 일반 광고 view/click에 WLD/WDX를 지급하지 않는 수익화 guardrail을 추가했습니다.

## 보안 / 개인정보 / 악용
- API/인증/서비스 실패가 legitimate empty state로 잘못 보이는 위험을 HIGH로 기록했습니다.
- 개인화 zero-state 추천을 통한 private 경제/social/security 상태 노출을 HIGH로 기록했습니다.
- 지갑/시즌/계정복구 zero-state를 사칭하는 phishing/ATO를 HIGH로 기록했습니다.
- 조용한 커뮤니티를 감추거나 referral/경제보상을 얻기 위해 가짜 post/reaction을 만드는 bot/fake activity를 HIGH로 기록했습니다.
- 기존 OAuth/session/RBAC/ledger/privacy/community 경계를 유지했으며 보안 코드는 수정하지 않았습니다.

## 런타임 근거
- Production 홈 Monthly Notes는 검토된 공개 소식을 준비 중인 상태입니다.
- 커뮤니티 로비는 대화 없음 zero state를 표시할 수 있습니다.
- 운영 소식 페이지에는 공개 공지가 없지만 sponsored advertisement가 표시됩니다.
- 시작 가이드는 신규 계정의 WLD 잔액 0과 빈 원장 기록이 정상일 수 있다고 명시합니다.

## 외부 근거
- Threads, 2026-06-16: 커뮤니티 progress와 사용자 직접 topic preference.
- Discord 현재 Community Onboarding: newcomer 채널 우선순위와 사용자 직접 role/channel 선택.
- Google Search 현재 people-first 및 noindex/private-content 가이드.
- Naver Search Advisor 현재 사용자 중심 콘텐츠/SEO 가이드.
- Google AdSense 현재 publisher content/deceptive placement 정책 가이드.
- FTC 2026년 5월 Shutterstock 합의: 구독조건 명확성, informed consent, 쉬운 취소.

## 통합
- 작업 시작·중간 `main`: `25844d21c862e06eed1018fb9ba897e4746c4ddd` (v2026.09.14.74).
- 직접 반영 직전 `main`을 다시 확인합니다.
- 문서-only 변경이므로 별도 PR을 만들지 않습니다.