# 개발 C v1229 — 실제 출처를 사용하는 공개 시작 가이드 (초안 / 배포 보류)

**2026-10-31 18:16 KST.** 시작·중간 최신 main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`. Debian 13.6 미니PC 독립 `auto/hourly-c-roadmap-source-truth-v1229-20261031-1815` 작업공간. 주요 서비스 7개 정상, 개발 PostgreSQL 연결 확인. AGENTS, README 영문·한국어, 통합기획서 영문 정본·한국어 보조, 활성 PR 94개, QA v1417 및 A/B/C 작업 확인. 공유 브랜치 수정 없음.

## 검증된 P1 결함과 수정
공개 `/roadmap`은 3분 내 10만 WLD, 룰렛 무조건 당첨, 연 7.2% 복리, 30일 후 부동산 소유를 확정된 것처럼 안내하고 SEO 구조화 데이터에도 반복했습니다. 기존 Nest `GET /api/v1/stocks`는 `stock_market_overview()` 읽기 함수에 연결됩니다.

실제 서버의 상장 종목 응답을 검증하는 공개 시작 가이드로 교체했습니다. 가입·직업·가상 주식 3단계 탐색, 확인된 빈 목록/비정상 응답/장애 구분, 시세 최신성 미인증 안내, UUID·종목 코드 중복 및 금액 형식 검증, 320px 모바일·44px 키보드 접근·스크린리더 상태 안내·정확한 공개 SEO를 적용했습니다. 기존 시뮬레이터 파일은 보존하되 실제 라우트에서는 사용하지 않습니다. 금융 원장·DB 변경 없음.

## TDD 및 검증
- RED: 구현 전 신규 화면 테스트 3건 실패, 파서 모듈 없음 확인.
- GREEN: 집중 테스트 19/19 PASS(파서 9, 서버 렌더링 3, 기존 시뮬레이터 7).
- 전체 Lint PASS(오류 0, 경고 1,050), Typecheck PASS, Backend/Contract/Database 빌드 PASS.
- Next 최초 빌드 1GB 힙 OOM 실패 → 2GB 힙 재실행 PASS. app-api 184 엔드포인트 PASS, Contract 41 PASS, DB 패키지 62 PASS/4 SKIP, 보안·백업·릴리스 26 PASS.
- 운영 의존성 High 이상 감사 PASS, 전체 의존성 감사 FAIL(낮음 3·보통 10).
- 전체 Frontend/Backend 회귀, 신규 격리 PostgreSQL, 공식 exact-SHA 인증 E2E, 원격 CI, 독립 복원은 아직 인증되지 않았습니다. 필수 게이트 전부 PASS 전 배포 금지.

## 보존
Test/Production/금융 원장·DB·main 변경 없음. PR은 Draft/HOLD 유지하고 타 개발 A/B/Gemini/QA와 핵심 예약 5개를 보호합니다. 최종 SHA 및 결과는 별도 내부/GitHub 증빙에 남깁니다.
