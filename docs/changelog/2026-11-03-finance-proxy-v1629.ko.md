# v2026.11.03.1629 — 금융 POST 공개 HTTPS 출처 검사 복구

**상태: 소스 검사 완료 / 배포 미검증.** [영문](2026-11-03-finance-proxy-v1629.md)

- 정상 공개 HTTPS Origin을 가진 비로그인 국고 기부·신규 연금 납입·환급이 운영에서 모두 403으로 원천 차단되는 장애 확인. Next 내부 HTTP 루프백 주소와 Origin을 잘못 비교함.
- 국고·연금 금융 POST에 공개 Host/Origin 일치와 실제 루프백 URL만 허용, 교차 사이트·위조 Host/포트/Forwarded-Host 거부. Nest 세션·일회용 CSRF·멱등키·원장 영수증 검증 유지.
- TDD RED → 35건 GREEN, 타입·린트 통과. 운영 회원 돈 이동 **0건**. 기존 중앙은행/조폐·연금 일괄 지급·KDIC·공기업 지급 보류 유지.
- [작업 기록](../worklog/2026-11-03-finance-proxy-csrf-v1629.ko.md).
