# 작업 기록 — v2026.09.14.87

## 선택한 런타임 기능
경제/이벤트 캘린더에 서버 기준 상점 판매 종료 일정을 노출해 회원이 상점을 별도로 확인하지 않아도 기간 한정 일정을 볼 수 있게 했다.

## 기준선과 동시 작업
- 최근 브랜치/PR을 감사한 뒤 `origin/main` `def9782`에서 시작했다.
- 최신 앱 작업 PR #304는 주식 알림 영역이라 캘린더/상점 파일과 겹치지 않았다.
- 작업 중 main이 PR #304 병합 뒤 frontend Node 이미지/기획 변경을 포함한 `d66e247`까지 전진해 최종 전체 검증 전에 최신 main으로 다시 동기화했다.
- Dependabot 브랜치는 활성 의존성 작업으로 보존하고 이번 기능에 섞지 않았다.

## 범위
- 프론트엔드: `/calendar`가 기존 `/api/v1/shop/catalog`을 읽어 `sale_ends_at` 기반 판매 종료 일정을 표시한다.
- 백엔드/API/DB: 변경 없음. 기존 상점 read model과 경제 계약을 그대로 재사용한다.
- 기획: Living Project Plan 영문 기준본과 한국어 대응본을 구현 상태에 맞게 갱신했다.

## 검증
- secret scan, control-byte guard, lint(오류 0/기존 경고 11), 전체 typecheck: PASS
- contract 23, database 정적/마이그레이션 7, backend 856, frontend 580 tests PASS
- 로컬 PostgreSQL 부재로 DB 의존 backend 354 tests는 skip됐으며 CI 실제 PostgreSQL 서비스에서 검증한다.
- production build, Prisma mutation guard, `git diff --check`: PASS

## 배포 상태
공개 Test 런타임이 여전히 오래된 `2bb84e2b...` SHA를 제공해 운영 승격은 주장하지 않는다. CI 실제 PostgreSQL과 exact-SHA Test 검증을 통과한 뒤에만 main/Production 승격한다.
