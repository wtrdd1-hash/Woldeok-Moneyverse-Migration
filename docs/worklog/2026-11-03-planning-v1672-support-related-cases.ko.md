# 기획 v1672 — F675-224 관리자 전용 관련 문의 연결

**일자:** 2026-11-03 KST. **주기:** 이전 Feature Improvement v1670 / 현재 Feature Addition v1672 / 다음 Feature Improvement v1674(잠정). **상태:** 초안 / 운영 보류 / 미구현.

## 소스 확인 및 중복 방지
- miniPC Debian 13.6 서비스 정상, 개발 PostgreSQL 17.11 읽기 전용 문의 3건/메시지 6건/public 테이블 268개, 앱 잔액 직접 UPDATE 허용. 마이그레이션 196, Nest support controller/repository, Next 관리자 화면 확인. 관련 문의 관계 스키마/API/UI 없음.
- GitHub 이슈 #1493은 이미 관리자 내부 메모 F675-143을 다룬다. 이를 중복 기획하지 않고 기존 기본 답변 문구도 재기획하지 않았다. 신규 관련 문의 연결은 병합하지 않는 별도 기능이다.
- GitHub main `9cade11af53db9f27c2b9f0ea9d39005ea8d0387` 시작·중간 확인. 선행 미병합 Draft #2544 및 head b4c54c7d2ffcb55bebeb817c247946cb7352ec85 보존, 독립 분기 사용. 최신 QA v1475(23:46 KST) FAILED/P0, 운영 보류. 루트 디스크 89%, 다른 작업 폴더 삭제 없음.

## 기능 명세·개발·수용 기준
PROJECT_PLAN/INTEGRATED_PLANNING_MASTER 영문·한국어 동일 의미로 기록: 관리자 전용 같은 회원 문의 연결, 최대 20개, 최근 후보 제한 조회, 비파괴 연결/해제, SQL 역할/소유권, 정규화된 쌍 PK, CAS/불변 영수증, 감사·역할 회수/삭제 잠금, 개인정보·noindex/no-store, 회원 Android 차단, 접근성, k>=20 익명 KPI, 기능 OFF, 합성 10,001건 및 100회 경합/악용 시험. P0 4/P1 6 개발 인계 [이슈 #2548](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/2548).

## 증거 게이트와 배포
- QA v1475: 운영 다국어 16/28 HTTP500, 앱 TRUNCATE 213/264, UPDATE 195/264, DELETE 194/264, 체크섬 불일치 5건, Test DB 불일치, 운영 모드 백엔드 2 FAIL, 의존성 경고 9건. 공식 Test exact-SHA 인증 E2E·외부 독립 복원 미완료.
- 외부 독립 근거: **이번 회차 신규 승인 0건**, 누적 검증·중복 제거·분류 승인 **UNKNOWN / 10,000건**, **BLOCKED / IN PROGRESS**.
- 기획 문서 전용: 런타임·DB 스키마/데이터·아이템·WLD·원장·Test/Production 배포·main 병합·서비스 재시작·예약 변경 없음. 최종 검증/원격 CI/GitHub 기록은 실행 후 추가.

## Local verification / 로컬 검증
- 2026-11-03 KST: read-only documentation/policy suite **188/188 PASS**, release classifier **24/24 PASS**, repository security scan **PASS**, EN/KO plan-master exact paired sections **PASS**, git diff --check **PASS**. Runtime and acceptance E2E **NOT RUN**; official Test and Production **NOT DEPLOYED**.
