# 기획 v1474 — 알림 검색 안전성 보완 (2026-10-29)

**상태:** 진행 중 → DRAFT / RELEASE HOLD. 이전 추가 v1472, 현재 보완 v1474, 다음 추가 v1476(잠정).

## 시작 전
- 2026-10-29T21:07:12+09:00: miniPC Debian 서비스·개발 PostgreSQL 연결 확인. skills 커넥터 URI 미반환으로 miniPC에 설치된 using-superpowers·brainstorming·writing-plans·using-git-worktrees·verification-before-completion을 읽음.
- GitHub 및 최신 main `f9fd777458b89b3c33593ae0cad46a37b216474b`, AGENTS/README/영문 PROJECT_PLAN/국문 대조 확인. #1888은 문서만 병합됐고 검색 기능은 미구현.
- 독립 브랜치·작업 폴더에서 진행. 다른 개발·QA 브랜치 미수정.

## 진행 중
- Nest 알림 DTO/서비스/컨트롤러 및 Next 화면/API 소스 확인. QA v1372 FAILED/P0(이전 main), 현 소스 SQL 304개 번호 중복 0, Test/Production 앱 SHA `c2129625aa6629c616fb31ce790950618b8d92b2` 확인.
- 조회 시각과 불변 스냅샷 차이, 읽음 변경 경합, 한글 2글자 검색 비용, HMAC 필터 정규화·마이크로초 시각, 접근 권한·오류 복구·개인정보 집계 보완.
- 중간 main `f9fd777458b89b3c33593ae0cad46a37b216474b` 재확인, 코드·DB·WLD·Test·운영 미변경.

## 완료·검증
- 영문 원본·국문 동등 통합 기획서와 프로젝트 계획서 갱신. P0/P1 10건 및 합성 10,001건 수용시험은 **기획이며 미실행**.
- 최종 diff/분류 테스트/한영 동등성/GitHub PR·이슈 반영 결과는 완료 기록에 추가. 외부 독립 승인 신규 0, 누적 UNKNOWN / 10,000, BLOCKED / IN PROGRESS. RELEASE HOLD.

### 완료 확인
- Draft PR #1892 OPEN / 미병합, 개발 이슈 #1887 댓글 업데이트. 첫 커밋은 최신 main `ba18116a0f94ee4c2018cbb37fc7e161b1cd97c5`에 충돌 없이 리베이스.
- 로컬 release 분류 테스트 17 PASS/0 FAIL, 한영 4개 문서에 10개 식별자 모두 존재, 소스 SQL 304개 번호 중복 0, diff 검사 PASS. GitHub CI policy/classify SUCCESS, runtime-check 문서 전용 SKIPPED.
- 실제 PG 수용시험·공식 Test 정확 SHA·인증 금융 E2E·외부 백업 복원은 미검증. 릴리스 HOLD, 런타임·DB·WLD·운영 미변경.
