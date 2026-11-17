# v2026.11.17.16 — 국부펀드 자동투자 허위 성공 방지

상태: 개발 후보 / 운영 승격 보류. 영어 정본에 대응하는 한국어 문서. 실제 WLD 투자 없음.

## 작업 시작 (2026-11-17)
AGENTS.md, PROJECT_PLAN/INTEGRATED_PLANNING_MASTER 영문·국문 통합문서 및 SWF 금융·마이그레이션 규칙을 우선 확인. 시작 main dcc47a0b55. 격리 브랜치와 별도 worktree를 만들고 다른 에이전트 파일은 수정하지 않았다.

검출: Nest 국부펀드가 SWF 환경변수와 관리자 조회만으로 executed=true를 반환할 수 있었고 금융 보류 함수에도 동일한 우회가 있었다. Nest 관리자 및 Next BFF는 원장 영수증 없이 성공 HTTP 응답 가능. Spring은 DB 실패 시 가짜 SWF 설정값, 정책 변경 허위 성공, 고정 관리자 UUID 사용 및 전역 permitAll로 인한 미인증 SWF 경로 노출 문제가 있었다. Spring 실거래 실행은 이미 503 차단 상태였다.

## 중간 기록
수정 전 RED 테스트로 Spring 허위 조회/설정 2건과 Next 미증빙 200 2건 실패를 재현. Nest의 환경변수 성공 우회와 컨트롤러 미증빙 성공을 차단하고 Next BFF 503 및 UI 오류 안내로 변경. Spring의 미검증 SWF 조회/정책 변경을 503으로, 4개 SWF API 호환 경로군을 실제 관리자 세션·CSRF·OTP 도입 전 403으로 제한하며 SWF 설정 요청 본문 로그를 삭제했다.

작업 중 origin/main이 무관한 SEO 병합 b8e6b6c5852db9484d0170a481a4c4bd0278a2b5로 전진한 것을 감지했고, 충돌 없이 새 main을 fast-forward하여 작업을 복원했다.

## 검증
- Nest 금융 관련 시험 21개 통과/실패 0.
- 프론트 SWF 시험 6개 통과/실패 0.
- Spring SWF 집중 서비스/MockMvc 시험 통과.
- 독립 Spring 내장 HTTP 테스트 서버(H2 메모리 DB) 실제 실행: health 200, SWF 4종 호환 경로 GET/PUT/리밸런싱 POST 각각 403 통과.
- 전체 Spring 시험·타입검사·GitHub CI는 실제 종료 결과를 별도 최종 기록. H2 테스트를 실제 PostgreSQL 검증으로 간주하지 않는다.
- 영수증 UUID 형식은 최소 거부 기준이며 실거래 및 정산 증빙이 아니다.

## 운영 판정
HOLD. 실제 자동투자·유가증권 매매·WLD 이동·DB/원장 변경·기능/스케줄 활성화·공식 Test 또는 Production 배포 없음. 정본 SQL 거래/영수증, 단일 금융 쓰기 주체·멱등성, Spring 인증 세션/OTP/CSRF, PG17 실제 권한·경합, SWF/MINT/국고 재원 대사, 전체 CI 및 공식 정확 SHA Test, 독립 백업 복원/롤백 검증을 통과해야 승격 가능. Spring 전역 permitAll P0는 이번 국부펀드 국소 차단으로 해결되지 않았다.

## 최종 후보 검증 (2026-11-17 13:10 KST)
Spring 전체 Gradle 테스트 XML 31개 스위트, **130개 통과·실패 0·오류 0·건너뜀 0**. Nest 백엔드 및 Next 프론트 TypeScript noEmit 모두 종료 코드 0. 집중 Nest 21/21, Next 6/6 및 실제 내장 HTTP H2 시험 통과. 최종 Git 검토 전 origin/main b8e6b6c5852db9484d0170a481a4c4bd0278a2b5로 정합화했고 diff --check 정상. 이는 격리 후보 로컬 증거이며 공식 운영 동등 PostgreSQL 금융 검증은 아니다. 운영 판정 HOLD 유지, 운영 승격을 주장하지 않는다.
