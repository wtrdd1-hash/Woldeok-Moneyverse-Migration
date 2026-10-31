# 개발 C v1247 — 회원 주식 거래내역 원본 검증 (초안 / 배포 보류)

## 시작 — 2026-11-01 05:15 KST
- Debian 13.6 미니PC 서비스 7개 정상, 개발 PostgreSQL 연결 확인. 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`.
- AGENTS, README 영문/한국어, 통합 기획서 영문 정본/한국어 보조, 활성 PR/CI, A/B/QA 독립 작업을 확인. 주식 리그 #2250, 비교 #2245, 회원 비공개 HTTP 헤더 #2225 등과 중복하지 않도록 거래내역 화면만 선택.
- 독립 브랜치 `auto/hourly-c-stock-history-source-v1247-20261101-0515`. 공유 main의 기존 `implementation_plan.md` 수정은 건드리지 않음.

## 확인된 결함과 구현
- 기존 `/stocks/history`는 최소 거래금액 필터가 있을 때만 API 거래 행을 검증하고, 기본 조회에서는 잘못된 문자열이 BigInt 합계 계산으로 직접 전달되어 SSR 오류 또는 검증되지 않은 거래금액 표시 가능.
- 기존 인증된 Nest 주식 거래내역 API와 본인 전용 PostgreSQL `stock_my_trades` 읽기 함수 유지. 모든 조회에서 거래 ID/종목/유형/금액/날짜/중복/건수 검증. 정상 빈 거래와 오류 구분, 키보드 재조회, 스크린리더 오류 안내, 비색인 메타데이터, 모바일 화면 유지. DB/금융 원장 쓰기 없음.

## TDD·중간 점검
- 수정 전 신규 테스트 13건 실패 재현. 실제 SSR `Cannot convert undefined to a BigInt` 오류 확인.
- 수정 후 집중 테스트 37건 PASS. 2^53 초과 정수 금액 표시와 오류 거부 검증.
- 중간 main 변경 없음. 공통 HTTP `X-Robots-Tag` 오류는 #2225와 연계하고 중복 수정하지 않음.

## 배포 보류
- 최종 HEAD 전체 빌드·테스트·보안·실제 PostgreSQL·app-api·공식 Test 인증 E2E·CI·운영 근거가 모두 통과하기 전 PR 병합 및 운영 승격 금지. 미실행·실패를 PASS로 기록하지 않음. A/B/QA/Gemini 작업 및 핵심 예약 보호.

- **Android app-api 연계:** 모바일 프록시도 기본 조회에서 검증을 건너뛰는 결함 확인(잘못된 `quantity=NaN`에 HTTP 200). 수정 후 필터 유무 모두 검증하며 기본 조회 오류는 HTTP 503 `stock_history_source_unverified` 반환, 검증된 빈 목록은 200 유지. 비공개·비캐시·비색인·참조 차단 헤더 적용. 기존 API 계약 유지.
