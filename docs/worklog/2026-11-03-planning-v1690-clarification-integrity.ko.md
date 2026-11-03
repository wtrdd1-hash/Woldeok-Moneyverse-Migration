# 기획 v1690 — F675-228 추가 정보 요청 카드 생명주기·근거 정합성

**2026-11-03 09:00–09:07 KST · 기능 보완 · 초안 / 운영 출시 보류**

## 시작
- miniPC에 설치된 Superpowers using-superpowers 및 brainstorming, using-git-worktrees, writing-plans, verification-before-completion을 읽었다. 커넥터 skills__list가 []라 skills__read URI는 사용 불가였으며 설치된 스킬을 적용했다.
- Debian 13 주요 서비스 활성, 09:00 루트/데이터 디스크 각각 79%. 원격 main 00a770ed7dadfd70f57189afe05b14d08f30f62f, 선행 초안 #2592 head 5d701172ed8b97903d617874ee1475f728b94a1b. 다른 개발자의 변경 중인 공용 작업 폴더를 건드리지 않고 격리 워크트리 사용.
- 최신 main의 AGENTS.md/README.md, 영문 정본·한국어 기획서, 실제 frontend/backend/app-api, 마이그레이션 196, QA v1484, v1626.6 운영 금융 초기화, v1627 QA 운영 배포를 조사했다. GitHub 커넥터로 열린 PR·main 문서·이슈 #2591 확인.

## 중간
- support_add_message=open, admin_support_reply=waiting_user, admin_support_set_status=요청 상태를 기록한다. v1688 카드 자동 상태 변경은 취소·만료 시 잘못된 대기열 상태를 남길 수 있어 카드 상태를 문의 상태와 분리했다. 실제 회원 답변만 공통 DB 권한을 통해 상태 전이, 해결 시 대기 카드 superseded, 저장 전 만료도 ETag 변화, 버전 관리 HMAC 불변 영수증을 명세했다.
- 09:02 운영 /en/tools HTTP500, Test HTTP200; 양쪽 공개 /api/version f5c3fbed... vs main 00a770ed... (실행 이미지 증빙 아님). QA v1484 FAILED/P0, 운영 24/28 HTTP500, Test 0/28; 개발 DB 테이블 266개·마이그레이션 327개, 앱 UPDATE195/DELETE194/TRUNCATE213, 비표준 실행 함수 19개. 디스크 루트/데이터 79%, 잔여 21G/41G는 별도 캐시 정리 결과로 기획 작업의 성과로 귀속하지 않는다.
- v1626.6 운영 과거 금융 모델 초기화와 원장 보존은 기록됐지만 과거 지급은 보류다. 외부 독립 복원·정확 SHA 인증 Test E2E·운영 게이트 미승인. 외부 독립 근거 신규 0, 누적 UNKNOWN/10000 BLOCKED.

## 개발 인계·검증
- 영문 PROJECT_PLAN.md 정본·한국어 대응, 영문/한국어 통합기획, UPDATE_LOG 각 언어, 쌍 작업일지 반영. 새 분산기획 문서 없음. P0 4/P1 6을 이슈 #2591에 연계하고 실제 코드는 별도 개발 브랜치·정확 SHA Test 검증 후 승격.
- 최종 영문·국문 동등성, 8개 기획 문서, git diff --check, 보안·제어문자 검사, 집중 릴리스 테스트 결과는 PR/이슈에 따로 기록한다. 기능 테스트 PASS 주장 금지. 런타임·SQL·금융·Test/Production 배포·병합·예약 변경·삭제 없음.

## Verified checks / 검증 결과 (09:07 KST)
- Focused release/backup tests: 32/32 PASS, 0 FAIL, 0 SKIP. Repository security and control-byte scans PASS; security scanner tests 4/4 PASS. EN/KR canonical-to-integrated section parity PASS; git diff --check PASS; eight documentation files changed.
- Latest remote main rechecked 00a770ed7dadfd70f57189afe05b14d08f30f62f; no main merge, and prior Draft #2592 remains independent. No feature acceptance, exact-SHA Test E2E, independent off-host restore or Production release certification.
