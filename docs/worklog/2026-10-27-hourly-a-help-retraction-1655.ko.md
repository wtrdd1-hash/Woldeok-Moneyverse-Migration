# 개발 A v2026.10.27.1655 — 검증 도움말 게시 철회 재확인 (초안 / 운영 보류)

## 작업 전
- Debian 13.6 미니PC 서비스(Backend·Frontend·Bot·MCP·Nginx·Docker) 가동, PostgreSQL 연결 확인. 루트 사용률 78%, 데이터 72%. 운영 연결 DB 변경 없음.
- main `c2a9306ddc0424438bc0ab297ea9543bb167aee6`, AGENTS/README, 영문 정본·국문 보조 기획, 이전 QA v1625, 열린 PR·CI 및 최신 통합기획 v1364 Draft #1549 검토. 고객지원 운영시간 기획과 중복하지 않음.
- 시작 원격 브랜치 362개, 열린 PR 354개(초안 339개), 충돌 26개, 실패·취소 체크 205개, 중복 SHA 0건. 분기 351개·main 앞선 8개·main 포함 2개 모두 보존.
- 최신 main에서 `auto/hourly-a-help-retraction-20261027-1655` 독립 worktree 생성, 선행 도움말 PR #1551의 미통합 커밋 6개 안전 재적용. 다른 예약 작업공간 변경 없음.

## 진행 중
- P1 재현: 관리자가 게시를 철회해도 이미 열린 도움말 상세 화면은 검토 만료 전까지 검증된 글로 남음. 이번 범위는 열린 상세 화면이며 검색 결과의 즉시 철회·푸시 통지는 포함하지 않음.
- RED→GREEN: 미적용 280 SQL의 본문 없는 게시상태 조회 함수, NestJS 공개 API, Next 동일 출처 no-store 검증, Android 공개 경로, 30초/포커스/가시성 재확인 및 404·503·영수증 불일치 시 비공개 처리를 구현.
- 추가 RED→GREEN: 다른 도움말로 화면을 전환할 때 이전 글의 검증 상태를 재사용하지 않도록 게시 식별자 기반 상태 검증과 회귀테스트를 추가.
- 별도 PostgreSQL 17.11 tmpfs에서 초안·승인·철회·권한 거부·감사 불변성·재시도와 공개 철회 상태 확인 PASS. 운영 DB·원장 쓰기 없음.
- 중간 main SHA 불변, 통합기획 #1549 여전히 Draft/HOLD. 다른 열린 PR 13개에 280 마이그레이션이 존재하며 임의 재번호 지정 금지.

## 최종 검증·배포
- 최종 전체 검증: typecheck PASS, Backend 1,344 PASS/398 SKIP, Frontend 1,444 PASS, DB 20 PASS/3 SKIP, Contract 38 PASS, lint PASS(기존 경고 1,132), Backend·Next Webpack Build PASS, Bot 8 PASS. Android app-api 계약 포함.
- 격리 PostgreSQL 17.11 권한·만료·철회·불변 감사 PASS. 전체 의존성 보안 FAIL(Critical 2/High 8), Bot 보안 FAIL(Critical 1/High 5). 공식 Test 정확 SHA 및 운영 승격 HOLD.
- 초기 중복 실행으로 Next 빌드 잠금 충돌, Bot 의존성 링크 누락이 있었으나 단일 최종 검증에서 코드 빌드·테스트·Bot PASS. 실패 로그 보존. 보안·배포 차단 해소 아님.
- 최종 커밋 SHA와 종료 PR·브랜치 수는 푸시 후 미니PC QA 및 PR에 기록. 이 커밋 문서에는 자기 자신의 SHA를 삽입하지 않음.
- 실제 테스트·보안·정확 SHA·CI 증거는 미니PC QA 및 PR에 기록. 모든 게이트 충족 전 main 병합·Test·Production 배포 금지.
- 기능 스위치 OFF. 운영 DB/원장·기능 활성화·브랜치 삭제·롤백 0건.
