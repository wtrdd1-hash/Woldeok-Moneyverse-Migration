# 개발 A — 회원 문의 메시지 발신자 필터 (2026-10-31)

**상태: 초안 / 배포 보류. 영문 문서가 원본이며 본 문서는 한국어 설명입니다.**

## 작업 전
- 승인된 미니PC Debian 13.6 연결 및 주요 서비스 가동 확인. AGENTS.md, README, 영문·국문 기획서, QA·작업일지, PR·브랜치·CI 확인.
- 기준 main `bf8d0d48f810932b43783d8605dce53954c60cff`; 신규 격리 브랜치/worktree에서만 변경. 개발 B의 은행 포켓, C의 인벤토리 및 최신 기획 #2080과 영역 분리.

## 진행 중
- 실패하는 회귀테스트를 먼저 작성한 후 기존 본인 소유 문의 메시지 API에 `sender=admin|user` 조건 추가. PostgreSQL 소유권 검사 함수 결과에만 발신자 조건 적용. Next.js 선택 화면과 Android app-api의 검증되지 않은 200 응답 차단 구현.
- **전체 대화가 아닌 처음 최대 200개 메시지** 안에서 필터링함을 명시. 잘못된 값·중복 파라미터 거부. 기존 필터 없는 동작 유지. 새 마이그레이션·권한 확대·원장 변경 없음.

## 검증·차단
- Backend 대상 7 PASS, Frontend·Android·UI 대상 7 PASS, Android 계약 55 PASS, Backend 계약·인가 11 PASS, DB 단위 62 PASS/4 SKIP. Typecheck·Backend/Frontend Build·변경 파일 Lint PASS. 알려진 운영 의존성 취약점 0건.
- 격리 PostgreSQL 17.11 **원본 함수 픽스처**에서 6개 항목 PASS, 롤백 확인. 단, 전체 클린 마이그레이션은 테스트 역할 구성과 017–020 권한 검증 충돌로 BLOCKED. 픽스처를 전체 DB 통합 성공으로 표시하지 않음.
- Backend 전체 2,656 PASS/**126 FAIL**/501 SKIP, Frontend 전체 2,708 PASS/**55 FAIL**. 실패 식별자는 직전 A와 일치하며 새 실패 식별자 0개. 전체 Lint 1 ERROR/1,043 WARNING(기존 구매 영수증 테스트 구문 오류, 별도 #2038).
- 기존 DEV 문의 테이블의 직접 DML 권한 문제, 공식 Test 정확 SHA 인증 E2E, 독립 백업 복원 및 Production 배포 출처 검증 미해결.

## 종료·릴리스
- main 재확인, Draft PR 상태 유지. 필수 게이트 PASS 전 병합·배포 금지. 롤백은 선택적 발신자 필터 코드 되돌리기이며 DB 롤백 불필요.
- 타 개발 브랜치 보존, 삭제 0건. main 병합·Test/Production 배포·운영 DB 변경·서비스 재시작 없음.
