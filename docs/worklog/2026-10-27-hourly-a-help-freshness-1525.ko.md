# 머니버스 개발 A — 검증 도움말 근거 유효기한 공개 (2026-10-27 15:25)
상태: 개발 후보 / DRAFT·HOLD / Production RELEASE HOLD.

- Debian 13.6 미니PC 직접 접속, 주요 서비스와 PostgreSQL 정상. 시작 루트/데이터 디스크 78%/69%, 기준 main c2a9306ddc0424438bc0ab297ea9543bb167aee6.
- AGENTS, README, 영문 정본·국문 프로젝트/통합기획, QA v1318, 이전 A v1425 확인. 최신 기획 #1541은 미병합 Draft/HOLD로 구현 승인 아님.
- 최신 main에서 별도 auto/hourly-a-help-freshness-20261027-1525 작업공간 생성. 기존 A 전용 미통합 도움말 4개 커밋만 재적용; 다른 예약 Worktree/PR 변경 없음.
- P1 근거 유효기한: 아직 적용되지 않은 신규 280번 SQL 공개 검색/상세 SECURITY DEFINER 함수, Backend 저장소, Android 호환 app-api JSON에 reviewed_until을 전달. 국문·영문 검색/상세에서 UTC 검증 유효기한을 표시하고 잘못되거나 만료된 근거는 검증됨으로 표시하지 않음. noindex/no-store, 기본 OFF, 관리자 권한과 테이블 직접 접근 금지 유지.
- RED: Backend 저장소 2건, DB 계약 1건, Frontend 2건 실패 재현. GREEN: Backend 2, DB 계약 4, Frontend 6 PASS. 네트워크 차단 격리 PostgreSQL 17.11 bootstrap/280/admin/positive/negative PASS; PUBLIC·앱 권한 거부, 과거 요청 재전송, 독립 승인, 만료 비공개, 불변 감사 검증.
- 전체 pnpm test PASS: Backend 1339/398 SKIP, Frontend 1433, DB 19/3 SKIP, API 계약 38. Typecheck·Lint PASS. 다른 게이트 및 최종 SHA는 내부 QA 보고서/PR 기록 참조.
- 시작 감사: 원격 브랜치 354(비-main 353), 열린 PR 346(Draft 331), 충돌 26, 실패·취소 체크 205, 중복 Head SHA 0. 열린 PR 346개의 각 Head에는 main에 없는 커밋이 최소 1개 존재함(상호 배타적 고유 변경을 뜻하지 않음). 미통합 PR 11개가 280번 마이그레이션 사용. 로컬 Git 객체 미확보 20개, 타 개발 C의 병합 브랜치 1개 보존. 삭제 0.
- Test 버전 6f697e74b7bf0cd1e4521d36534cfd9c140f8010, 운영 6a989b5ac0c6155587d43426d64f6def6b62c917: 최신 main/후보 불일치. 정확 SHA Test·인증 E2E·운영 DB 변경·배포·롤백 없음.
- 기능 OFF. 보안·정확 SHA Test/인증·백업 복원·릴리스 게이트 미충족 시 main 병합/운영 승격 금지. 미병합 후보 롤백은 배포하지 않고 PR 보존/종결; 적용된 마이그레이션 수정·되돌리기 금지.

## 최종 검증 및 차단
- Frontend Webpack 빌드 PASS(정적 페이지 608개 생성), Backend 빌드·전체 타입검사·린트 PASS(린트 경고는 기존 누적). Bot 최초 실행은 격리 작업공간의 youtube-dl-exec 미설치로 FAIL, 독립 bot npm ci --offline 후 8 PASS.
- 전체 의존성 보안 감사 **FAIL: Critical 2 / High 8**, Bot 보안 감사 **FAIL: Critical 1 / High 5**. 저장소 보안/제어문자/Prisma 변경 차단 스크립트 PASS. 정적 noindex·접근성 검사 PASS이나 실제 브라우저 WCAG/인증 E2E는 미검증.
- 280번을 사용하는 다른 열린 PR 11개와 번호 충돌 가능성 지속. Draft/hold, main 병합·Test/Production 배포 금지.
