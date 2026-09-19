# 계정 세션 상세 v2026.09.19.279

- 기준: `3b1dfdc27a8abfcfede57c05544c4c507d2bb269`.
- 브랜치: `auto/hourly-a-session-details-v2026.09.19.279`.
- 사용자 흐름: 계정 → 보안의 활성 세션에 개인정보를 최소화한 기기 분류와 최근 활동 시각을 표시하고 기존 개별/다른 세션 전체 종료 동작을 유지합니다.
- 백엔드/DB: migration 213이 기존 요청 활동에서 세션별 최근 활동을 계산하고 원본 User-Agent를 거친 기기 이름으로 변환합니다. 원본 User-Agent, IP, 토큰, CSRF 값은 반환하지 않습니다.
- 프론트엔드: 기기 분류, 최근 활동, 로그인, 만료 시각과 현재 세션/운영 콘솔 배지를 함께 표시합니다.
- push 전 검증: backend 집중 3/3, frontend 집중 3/3, backend/frontend typecheck, diff check. 전체 CI, exact-SHA isolated Test, Production 승격은 계속 필수입니다.
