# 월덕 머니버스 — 웹 기능 오류 및 서비스 안정성 시정 v2026.10.15.654

**상태: 소스 수정 후보, Test 전체 수용·운영 승격 차단(BLOCKED)**. [영어 정본](MONEYVERSE_WEB_FUNCTIONAL_REMEDIATION_v2026.10.15.654.md).

## 기준 및 다른 작업자 보호
최우선 통합 기획서 PROJECT_PLAN.md 및 INTEGRATED_PLANNING_MASTER.md, AGENTS.md, 배포/문서 표준을 확인했습니다. v530 전체 UI 차단은 유효합니다. 시작 시 origin/main bf55b057, 중간 v652 문서 병합으로 57b37a38 진전(앱 소스 변경 없음). 다른 에이전트 작업공간을 건드리지 않았습니다. 기존 v639 PR #844의 테스트된 소스/QA 수정 34개 파일을 버전 기록 중복 없이 격리 브랜치로 이식했습니다.

## 실제 코드 수정
1. **페이지 기능:** 계산기 4곳의 잘못된 가입 주소를 /register로 변경. 백엔드 지급 기록 없는 10,000 WLD 허위 획득 안내·클릭 성공 상태 제거. 디스코드·도움말·진로·펫 링크를 실제 존재하는 페이지에 연결하고 6개 과거 URL을 307/308 호환 전환. /pet은 실제 기능이 아니라 준비 중이라는 로드맵으로 이동.
2. **주식 캔들 API:** 비정상 UUID를 400으로 차단하고 백엔드의 400/401/403/404/429를 유지. 알 수 없는 오류는 민감정보를 숨긴 503 유지.
3. **관리자 보호:** 백업 API 관리자 권한/관제 개방 검증, 쓰기 시 CSRF·재인증; IndexNow는 동일 출처·관리자 인증·자체 HTTPS 호스트 URL·100개 제한.
4. **QA 및 배포 출처:** 실제 5회 증거 파일을 요구하도록 전체 UI QA 명령 수정; 증거 없으면 실패 유지. 봇 QA 스크립트 구문, 백엔드 버전 BUILD_ID/불변 manifest SHA 판독 정정.
5. **금융 일부 안전장치:** PvP/암시장 단일 DB 연결 트랜잭션과 잠금, 경제 스케줄러 자동실행 기본 차단을 v639에서 반영. 신규 v654 변경은 BEGIN/ROLLBACK 실패 시 불확실한 DB 연결을 정상 풀에 돌려주지 않고 **강제 폐기**하여 후속 금융 처리 오염을 막는 것. 신규 부정 테스트를 먼저 실패시킨 후 수정해 총 5건 통과.
6. **프론트 테스트 안정성:** Debian 운영 환경 NODE_ENV=production 때문에 React.act() 누락으로 다수 테스트가 허위 실패하던 문제를 Vitest 실행 명령에서 NODE_ENV=test 강제로 시정. 프로덕션 변수가 설정된 셸에서도 회귀 테스트 통과.
7. **격리 DB 안전:** V654_DB_ISOLATED=yes 및 127.0.0.1:5580/wdmv_fix_v654만 허용하는 명시 가드 추가, 기존 v639 경로도 지원. 테스트 전용 synthetic DB에서 4건 통과, 운영 DB 미수정.

## 실제 검증
수정 빌드의 로컬 127.0.0.1:3164에서 / 및 /register HTTP 200, 과거 경로 6개는 지정된 307/308, 비정상 캔들 UUID는 400 확인. 공개 주소·Test alias는 변경하지 않았으며 이 로컬 서버는 검사 후 종료했습니다. PostgreSQL 합성 테스트 4건 통과, DB 연결 실패·롤백 실패 신규 테스트 포함 트랜잭션 공통 검사 5건 통과. React 테스트환경 1건 통과. 첫 종합 검사에서는 NODE_ENV 오염으로 프론트 허위 실패를 확인했고 바로잡아 전체 테스트/타입/빌드/lint 결과를 재검증했습니다. 봇은 설치되지 않았던 별도 npm 의존성 설치 후 4건 통과. 최종 수정 소스 전체 회귀에서 **프론트 1,229/1,229 통과, 백엔드 비DB 1,201 통과(DB 관련 395건 제외), 타입 검사·Next 최적화 빌드 통과, lint 오류 0/기존 경고 1,088건**. 전체 QA 대장은 실제 증거 파일이 없어 올바르게 차단되었습니다.

**남은 P0:** DB 앱 계정이 개발 DB 245개 public 테이블 중 241개 직접 쓰기 가능, PUBLIC 권한 SECURITY DEFINER 함수 11개. 테스트 제외 8개 서비스의 잔액 직접 UPDATE 24개 구문과 원장/복식부기·멱등성 미해결. 이번 PvP·경매 트랜잭션 개선이 원장 전환을 뜻하지 않습니다. 격리 DB는 157개 테이블을 가진 합성 스키마로 전체 DB 동등성도 검증하지 못했습니다.

**운영 승격 차단:** 로그인 회원/관리자 UI 전체 164개(관리자 34개) ×5 실증, Test 동일 SHA/백엔드/DB/권한/세션, 백업 복구·롤백 및 진정한 무중단 수용 미완료. 운영 prod-v600, Test test-v618 유지. 실제 사용자 금액, DB 권한, 기능 스위치, 서버 별칭·main 미변경.

## 공식 참조 및 향후 순서
node-postgres 단일 연결 트랜잭션 및 pool release(true): https://node-postgres.com/features/transactions / https://node-postgres.com/apis/pool ; React act: https://react.dev/reference/react/act ; Next 리다이렉트: https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects ; PostgreSQL 함수 보안: https://www.postgresql.org/docs/17/sql-createfunction.html ; SRE 계측: https://sre.google/sre-book/monitoring-distributed-systems/ .

순서: 완전 격리 DB 복구 → 모든 금액변동 canonical ledger 정산/멱등성 → DB 권한 부정시험 → 로그인/관리자 포함 UI 5회 → 정확 SHA Test/CI → 백업·세션·롤백 → 무중단 운영 승격. 검증 전 운영 배포 불가.
