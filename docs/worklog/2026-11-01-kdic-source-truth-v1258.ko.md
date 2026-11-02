# C v1258 — KDIC 가상 보호금액 원본 검증 (한국어 보조)

**상태:** DRAFT / RELEASE HOLD. **기준:** `f13bbce273ffc65e8576170992d82ea00c27a1c9` (2026-11-01). 원장·DB 스키마 변경 없음.

## 확인된 문제

공개 `/kdic` 화면과 SEO 구조화 데이터가 실제 API 실패 시에도 500,000 WLD 법적 보호, 기금 10,000,000 WLD, 부보 기관 2곳을 확정 사실로 표시했다. 기존 Nest 공개 API는 보험 전용 테이블 집계값을 반환했으나 관리자 보험료·유동성·대위변제 쓰기 API는 원장 정산 미검증으로 차단 중이다. 회원별 보호금액 API도 실제 원장 정산·법적 보호 근거 없이 성공형 응답을 제공했다. 서비스 내부 가상 WLD는 실제 원화 예금이 아니다.

## 변경 내용

Nest 공개 포털 및 인증 회원 보호금액 조회는 검증 전 `503 KDIC_COVERAGE_UNVERIFIED`로 차단한다. 회원 인증 가드는 유지한다. Android app-api도 구형 서버가 성공형 응답을 보내더라도 같은 코드로 차단하고 `private,no-store,noindex,no-referrer` 정책을 적용한다. 웹은 가짜 수치·법적 보장·계산기·검색용 구조화 데이터를 제거하고 모바일·키보드·스크린리더 대응 상태 안내를 표시한다. 관리자 읽기 전용 진단은 지급 승인 증거가 아니며 변경하지 않는다.

## 배포 조건

최종 SHA의 빌드·Lint·타입검사·단위·통합·app-api·격리 PostgreSQL·보안·공식 Test/E2E·원격 필수 CI가 모두 통과해야 병합 가능하다. 공통 HTTP 헤더 #2225, 전체 경로 QA 원장, 독립 복원 및 전체 의존성 취약점은 별도 릴리스 차단 요소다. main·Test·Production은 변경하지 않는다.

## 검증 결과 (2026-11-01, Debian 13.6)

- TDD RED: Nest 2건·웹 2건·Android 2건 실패 재현(프론트 합동 실행은 일시적인 워커 시간 초과 동반). GREEN: Nest 2, 웹 2, Android 2 PASS.
- 전체 타입검사·Lint(오류 0/기존 경고 1,020)·Backend/Frontend 빌드 PASS. app-api 계약 184개, Contract 41 PASS, DB 패키지 62 PASS/4 SKIP, 보안 스크립트 11 PASS.
- Backend 전체 2,952 PASS/517 SKIP. Frontend 전체 2,903 PASS/**2 FAIL**: 11월 1일 만료된 관리자 콘솔 세션 테스트 데이터, QA Draft #2303 별도 담당.
- 독립 PostgreSQL 17.11: 마이그레이션 316/316 PASS, 앱 역할 원장 직접 INSERT=false, 검증 원장 거래 0건, 컨테이너 제거. 인증 회원 전체 흐름 통과 증거는 아님.
- 운영 의존성 High 이상 취약점 0건 PASS. 전체 감사 9건(낮음 1/보통 8) FAIL. 전체 경로 QA 필수 증빙 파일 누락 FAIL.
- 독립 Next HTTP: `/kdic` 200, 가짜 금액 제거 및 검증 보류 안내 확인; Android KDIC API 503/private,no-store PASS. 실제 HTTP 공통 헤더가 `X-Robots-Tag: index,follow`와 `Referrer-Policy: strict-origin-when-cross-origin`을 반환하여 SEO/개인정보 게이트 FAIL(기존 #2225 담당).
- 공식 정확 SHA Test 인증 E2E·독립 복원·운영 배포 검증은 BLOCKED. main/운영 DB/Test/Production 변경 없음. 실제 지급 기능 완성을 의미하지 않음.
