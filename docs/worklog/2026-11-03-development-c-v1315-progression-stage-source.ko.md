# 개발 C v1315 — 회원 성장 단계 원본 검증 (초안 / 운영 보류)

- 기준: origin/main f5c3fbedae1c3b3ec2374882b049aac43a655eb4 (2026-11-03 02:00 KST).
- 범위: 로그인 회원 /progression 조회. 기존 Nest GET /api/v1/progression 및 PostgreSQL SECURITY DEFINER progression_my_status가 원본이며 신규 SQL·금융 쓰기·권한 부여·세션 의미 변경 없음.
- P1 결함: API 타입 선언만 믿어 잘못된 HTTP 200을 실제 달성 단계로 표시하거나 비정상 요구조건에서 오류가 발생할 수 있었음. 장애와 미계산 단계를 혼동할 수 있었음.
- 수정: 응답 구조·단계 코드·시각 및 실제 달력 날짜·안전한 정수 요구조건 검증. 명시적 null만 미계산으로 인정하고, 장애에는 접근 가능한 재조회 링크 제공. 향후 신규 단계 코드는 임의 순위를 부여하지 않고 보존. 기존 반응형·회원 인증·noindex 유지.
- TDD: 파서 부재 RED, 달력 오류 RED, 집중 파서·화면 테스트 23건 GREEN 및 기존 단계 테스트 9건 GREEN. 전체 CI·실제 PostgreSQL·인증 E2E는 별도 결과로 기록하며 단위 테스트만으로 PASS 선언 금지.
- 충돌 회피: PR #2217은 신용 등급 영역을 다루며 이번 변경은 성장 단계 파서에 한정. A/B/QA 변경 미수정. QA v1477 P0 운영 보류, 운영 HTTP 500 17건, 앱 계정 과다 권한, 운영 마이그레이션 323/327 및 체크섬 불일치 5건.
- 배포: main·Test·Production·GitOps 미변경. 필수 게이트 전체 PASS 전 병합·운영 승격 금지.
