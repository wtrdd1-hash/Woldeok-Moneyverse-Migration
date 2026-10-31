# 개발 C v1230 — 가상 예금보호 근거 검증 및 허위 보장 차단

## 시작 (2026-10-31 18:45 KST)
- 최신 origin/main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`에서 독립 작업 브랜치 생성.
- Debian 13.6 미니PC 7개 서비스와 개발 PostgreSQL 연결 확인. AGENTS, README, 영문 정본/국문 기획서, 활성 PR/CI/QA/A/B 확인.
- 공개 /kdic는 실제 법적 보장, 500,000 WLD 대위변제, 가상 BIS/기금 적립액을 사실처럼 표기. 백엔드는 직접 테이블 조회와 현금·에스크로를 예금보호액으로 합산해 신뢰할 수 없는 값을 제공할 수 있었음.

## 진행 (2026-10-31 18:47 KST)
- 실패 우선 테스트: 백엔드 2건 RED, 프론트엔드 2건 RED 확인.
- 공개/회원별 KDIC API를 안정적 오류 코드 `KDIC_COVERAGE_UNVERIFIED`의 HTTP 503으로 차단, 검증되지 않은 DB 조회 제거.
- 허위 법적 보장/정부 공식 명칭/가짜 적립금·BIS·지급 계산/SEO 구조화 데이터를 제거하고 반응형·접근성 있는 확인 불가 화면 제공.
- 집중 테스트: 백엔드 2건, 프론트엔드 2건 PASS. 전체 Lint 오류 0건(기존 경고 1,047건), Typecheck 및 Build PASS. 최종 SHA 전체 게이트는 아직 미확인.

## 종료 판정
- 릴리스 검증 미완료 시 Draft/HOLD. 금융 원장·DB 스키마·공유 DB·Test·Production 변경 없음.
- 최종 exact-SHA 테스트/CI/운영 상태는 연결된 Draft PR의 검증 기록을 기준으로 확인.

## SEO 실제 HTTP 헤더 보완 (18:54 KST)
- 독립 Next.js 서버에서 /kdic HTTP 200을 확인했지만 공통 X-Robots-Tag가 index, follow를 반환하는 문제를 발견.
- /kdic 경로에 한정한 noindex, nofollow 헤더 규칙을 추가. 테스트 1건 실패 재현 후 보안 헤더 9건 및 KDIC 화면 2건 통과. 다른 경로의 공통 정책은 변경하지 않음.
- 최종 SHA 재빌드 및 HTTP 확인 전까지 운영 반영 금지.
