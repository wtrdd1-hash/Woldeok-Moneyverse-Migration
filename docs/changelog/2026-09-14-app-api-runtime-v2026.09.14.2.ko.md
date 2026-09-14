# 변경기록 — 앱 API 런타임 v2026.09.14.2

- loopback 전용 SMTP relay를 통한 운영 인증메일 발송 계약을 추가하고 원격 무인증 SMTP는 금지한다.
- v2026.09.14.1 OAuth 브라우저 복귀 수정에 이어 native OAuth `mobile_client` 저장을 회귀 테스트로 고정한다.
- Google Play 계정/데이터 삭제 공개 페이지 2개를 sitemap의 정식 공개 경로로 포함하고 회귀 검증한다.
- 앱 크래시 방지, 회원가입 503, OAuth completion/handoff, 정책 재동의, 삭제 API/보관기간, 릴리스 QA를 통합 API 명세에 상세 추가한다.
- v56 조회 budget 완화와 v57 회원가입→지갑 계약 수정까지 포함한 최신 main을 운영 승격 대상으로 한다.
