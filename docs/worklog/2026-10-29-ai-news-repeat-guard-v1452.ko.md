# v2026.10.29.1452 AI 가상주식 뉴스 반복 차단 작업기록

## 0. 작업 시작 (2026-10-29 KST)
- 사용자 지시: 치무전자 뉴스 반복 해결, 서비스 지속·원장/기존 가격 데이터 불변.
- 기준 main: `b84d645a87e8fa0d544ca3ee17e785e737e477ea` (조회 완료). 기존 checkout의 타 개발자 변경은 유지하고 별도 branch/worktree에서만 작업.
- 표준 문서 우선 확인: `docs/planning/PROJECT_PLAN.ko.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`, `docs/planning/F675_02_AI_NEWS_USER_TRUST_RECOVERY_SPEC.ko.md`; 선행 진단 이슈 #1848.
- 운영 및 DB 읽기 확인: active 13건 중 치무전자 11건, 누적 204 중 143건, 제목 138회 동일. hourly 스케줄러 및 LLM fallback 레이블 오기록 확인.
- 변경 범위: 자동 뉴스 경로의 중복·최근 종목 쿨다운·모델 라벨·회귀시험. 금융 원장/시장 가격 수동 보정 없음.

## 1. 중간 기록 (2026-10-29 14:38 KST)
- TDD RED 4/55 실패 확인 후 GREEN 55/55, 후속 테스트 RED 3건·GREEN 59/59 확인. 추가 24개 창/5개 종목 순환 회귀 작성.
- 변경: 모델 오류 시 실제 fallback label 사용, 고정 fallback에서 상위 5개 기업 후보 생성, 기존 등록 기업·강도 제한 유지, 최근 7일 동명 헤드라인 및 24시간 종목 중복 거부, 후보 중 최근 7일 기사가 가장 적은 기업 우선, 이력 조회 실패 시 발행 중단.
- 동일 기사/기업 그룹의 자동 발행 멱등 UUID를 제목·효과 종목으로 유도. 기존 DB의 advisory transaction lock/UNIQUE idempotency를 재사용하므로 별도 SQL migration·신규 원장 쓰기 없음. 중복 초안은 남을 수 있지만 동일 가격 이벤트 재적용은 방지.
- 백엔드 1,961 PASS, 440 SKIP, 실패 0; 해당 소스 TypeScript 체크/빌드/ESLint PASS. 운영 DB app role 기존 200개 이벤트 읽기 함수 SELECT 성공; 실거래나 금융 DML 없음.
- main 재확인 (원격 main b84d645a8): 병합/작업 충돌 없음. 운영 exact-SHA 테스트 및 별도 환경 체크 지속.

## 2. 종료 기록
검증/승격 후 갱신.
