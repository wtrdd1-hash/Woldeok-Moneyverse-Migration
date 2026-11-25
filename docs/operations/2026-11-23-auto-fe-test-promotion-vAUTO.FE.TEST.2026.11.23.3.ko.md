# 프론트엔드 자동 개발·독립 Test 배포 규정 — vAUTO.FE.TEST.2026.11.23.3

상태: 기존 5개 예약 강화를 실제 저장하고 활성 상태 확인. QA2가 Test 배포 전담을 겸함. 이번 설정 변경만으로 새 프론트 코드나 Test 배포를 수행한 것은 아님. 운영 서버와 데이터는 변경 금지.

## 디자인 기준
매회 최신 GitHub 원격 main의 docs/planning/INTEGRATED_PLANNING_MASTER.md 우선 확인 후 AGENTS.md, 영문 PROJECT_PLAN.md와 한글판, 11월18일 원본 180개 시안, EN/KO 단일 UI 문서를 대조한다.
11월23일 수정 v2026.11.23.10 이미지 180개는 GitHub 불변 커밋 39888c7d26bdf688737a77b93a7da29e230b4168 에서 확인. PR #3400은 CLOSED/UNMERGED이므로 main에 합쳐졌다고 가정 금지. 해당 SHA의 docs/design/game-ui-v2026.11.23.10/README.ko.md 및 previews/*.png를 읽는다. 이후 확정 디자인이 있으면 최신 통합문서와 사용자 지시를 검토한다. PNG만으로 웹 구현 완료 판정 금지.

## 매시 예약 (한국 시간)
| 시간 | 업무 | 저장된 예약 ID |
| 05분 | FE A 공통 UI, 회원, OAuth/법적 동의, 파비콘 | 6afffac316ec81918ec3c109cb159e7a |
| 15분 | QA1 실제 API/DB/권한/금융원장 | 6afff8b85b5c8191bdc055ca6e5aec12 |
| 25분 | FE B 은행·주식·게임·커뮤니티 | 6afffac5d67081919b596522611af3cf |
| 45분 | FE C 관리자·채팅·5개 언어 | 6afff8be38688191ae6cdd022c8aecb1 |
| 55분 | QA2 실제 UI/E2E + 유일한 Test 자동 배포 담당 | 6afff8bb0a708191b7a219d351a4bfa3 |

계정 활성 예약 한도 5개로 6번째 배포 전용 예약 신규 생성은 거절됨. 기존 5개는 전부 유지하고 QA2만 종전 매시 35분에서 55분으로 변경, 배포 기능을 추가함. FE C가 아직 작업 중이면 완료된 불변 후보만 선별하고 미완료 작업은 다음 주기로 보류.

## 실제 코드부터 Test 승격까지
1. 미니PC홍 MCP 우선. 최신 main/두 GitHub 저장소/통합문서/Gemini·FE PR·QA 기록을 착수·중간·승격 직전 재조회. 작업별 신규 격리 브랜치와 worktree, 순차 버전/시작·중간·종료 로그, EN/KO 내부·GitHub 업데이트.
2. FE A/B/C는 11월23일 v10 게임형 디자인을 실제 Java Spring Boot MVC+Thymeleaf PC·모바일 브라우저로 구현. 네이비 #0C1020/보라 #9C83FF, 원래 favicon.ico, 영어 기본·한국어 둘째·JA/ZH/VI, 관리자 권한 보호, 전 페이지 지원/채팅, 실제 API/DB·금융 원장, 실제 기능별 화면을 확인. Next 목업·샘플 잔액·가짜 성공 금지. FE 개발자는 공유 Test 배포를 직접 전환하지 않고 exact SHA/PR/시험 근거 전달.
3. QA1은 Test 고유 DB와 백엔드 API에서 OAuth·세션/CSRF·RBAC·금융 거래·원장/감사·중복 실행 및 실패 롤백을 독립 검증. 운영 금융 데이터 쓰기 금지.
4. QA2는 PC/모바일 실제 Chromium/Playwright 캡처를 11월18일 원본 및 11월23일 수정 PNG와 비교(320/360/390/430/768/1024/1440/1920px, 5언어·200%확대, 접근성, 브라우저 콘솔/네트워크, 실제 채팅/게시/로그인). 못 돌린 테스트는 PASS라고 쓰지 말 것.
5. QA2 단독으로 배포 락 획득, 완료된 PR·불변 SHA·CI/QA 근거 확인. 현재 Test 릴리스/설정·롤백 타깃 백업하고 별도 로컬 Test 후보 포트에 먼저 기동. Spring JAR hash, frontend/backend SHA, Test/Prod DB 분리, 변경경로 브라우저·API/보안/금융 비회귀가 PASS이면 Test 서비스만 원자적 전환, 필요한 Test Nginx 변경은 nginx -t 통과 후. 실패·충돌·미확인 시 배포 중지. 신규 Test 실패 시 즉시 이전 Test로 복원.
6. 실제 외부 HTTPS https://test.easy-scraping.com/에서 새 배포 source SHA, 홈/변경 화면, 5언어, 로그인, 정적 자원, 실제 API, 채팅·권한 상태를 스모크. 로그·스크린샷·테스트 URL·새/이전 SHA·PR·롤백 영수증 기록. 테스트 서버의 검증된 부분 기능 배포는 허용하되 180개 전체/240개 브라우저 조건이 PASS 아니면 전체 Test 합격이라고 쓰지 말 것.

## 결함 및 서버 경계
11월23일 QA PR #3409 기준 180개 기획경로 중 동적 33개 미검사·고정147 GET (200=17,302=16,403=114). 권한상 정상403과 공개경로 차단을 개별 분류한다. /terms, /privacy, /socket.io.min.js 403; null 제목·영어 기본 제목 미번역·블로그 상세·모바일 겹침 우선 수정. 실제 OAuth/관리자/2계정 금융 E2E 미합격.
관측된 Test 구성은 test.easy-scraping.com / 프론트 55440 / 백엔드 55438 / 분리 PostgreSQL 55436이며 매 실행 새 확인 필요. 운영 Spring 4550 또는 다른 DB 5433으로 Test 쓰기/fallback 절대 금지. 운영 승격은 이번 지시 범위에서 제외.

## 판정 코드
TEST_DEPLOYED_SCOPED = 해당 범위의 새 후보가 Test HTTPS에 실제 반영·SHA 확인. TEST_HOLD = 배포 안 함/필수 증거 미충족. TEST_ROLLED_BACK = 신규 Test 실패 후 이전 Test 복구. FULL_TEST_ACCEPTED = 180경로·240브라우저·보안·금융 전체 증거 통과 전 사용 금지.