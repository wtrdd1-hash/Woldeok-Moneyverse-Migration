# 2026-10-15 — v2026.10.15.638 — 시스템·기능 오류 검증

- 미니PC 서비스·Nginx·공개 URL·API 인증·DB 원장 읽기 전용 점검, 버전 API unknown, 카나리 별도 확인.
- 운영 GET 145개 중 200×138·401×1·**404×6**, 과거 Nginx 500/502/503, 캔들 백엔드 오류상태 프론트 503 왜곡 재현.
- 동일 main 격리 프론트 1,206 PASS, 백엔드 비DB 1,185 PASS/29 skipped, 빌드·타입·모바일 계약 PASS. 봇 기본 4 PASS/부가 QA 문법 실패.
- 전체 라우트 QA 명령 고장 및 시간제 QA 기능 경로 미검사. 실운영 변경 없이 기능 수용 BLOCKED.
- [한국어 보고서](../findings/MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.ko.md) · [영문 정본](../findings/MONEYVERSE_RUNTIME_SYSTEM_FUNCTION_VERIFICATION_v2026.10.15.638.md).
