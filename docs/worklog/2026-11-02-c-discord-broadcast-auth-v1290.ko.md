# 개발 C v1290 — 디스코드 브로드캐스트 인증·전달 증빙
## 시작 — 2026-11-02 08:45 KST
- 상태: 진행 중. 공식 Test/Production 배포 금지.
- 기준 main: a8541927c3a351d980454c66e95a3356c47e0722.
- Debian 13 미니PC 연결 및 7개 서비스·개발 PostgreSQL 확인.
- AGENTS.md, README 영문·국문, 통합기획 영문 정본·국문 보조, 열린 A/B/C/QA PR 및 CI 확인.
- P0: Next 디스코드 발송 API가 환경설정 부재 시 코드에 포함된 기본 비밀값으로 내부 요청을 승인할 수 있음. 성공 응답의 실제 전달 근거 확인도 부족하며 관리자 브라우저 요청의 Origin 검증도 없음.
- 범위: 기본 비밀값 제거, 강한 설정값만 인정, 관리자 요청 동일 출처 검증, 요청 크기·형식 검증, 봇 응답 증빙 확인. DB·원장·서비스 변경 없음.
## 진행 — 08:50 KST
- RED: 원본에서 집중 테스트 21건 중 20건 실패 재현.
- GREEN: 구현 후 23/23 통과. 프론트엔드 TypeScript 검사 통과.
- 환경 변수 기반 32~512바이트 비밀값, 상수시간 비교, 관리자 동일 출처, JSON 크기·형식 제한, 비공개 응답 헤더, 봇 수락 증빙 검증 적용.
- main 재조회 결과 변경 없음. 운영 비밀값·서비스·DB·원장 변경 없음.
- 전체 게이트 및 원격 CI 확인 대기. 운영 보류.
## 2차 수정 — 08:58 KST
- 독립 Next.js 실제 HTTP에서 과거 기본 비밀값·외부 Origin POST는 403 확인.
- 실제 응답에서 전역 SEO 정책이 API의 noindex/no-referrer를 덮는 문제 발견. RED 1건 실패 후 경로별 헤더 설정으로 GREEN 33/33 통과.
- 관리자 콘솔 잠금 상태에서도 발송 가능한 문제 RED 재현. 백엔드 /api/v1/admin/security의 실제 open 상태 확인 추가 후 GREEN.
- 1차 SHA: Lint·Typecheck·Build PASS, 프론트 2945 PASS, 백엔드 2978 PASS/2 FAIL(기존 프로필 HTTP), DB 패키지 62 PASS/5 SKIP, app-api 184 PASS, 보안 11 PASS. 전체 감사 9건 취약점, 전체 경로 QA 증빙 누락. 봇 테스트 의존성 링크 후 11 PASS.
- 격리 PostgreSQL 17.11 322개 마이그레이션 및 실 DB 테스트 27건 통과. 컨테이너 제거.
- 2차 수정 HEAD에서 전체 게이트 및 실제 HTTP 재검증 필요.
## 종료 — 2026-11-02 09:06 KST (운영 보류 판정)
- 코드 후보 SHA 04ac83fa64e682b80e64b5c84cd20803b5377a5d; 본 종료 기록 커밋 후 HEAD는 변경되므로 해당 SHA의 별도 게이트를 기록한다. Draft PR #2449.
- 코드 SHA: Lint PASS(오류 0/경고 1,027), Typecheck·Build PASS, 프론트엔드 2,947 PASS, 백엔드 2,978 PASS/2 FAIL/518 SKIP(기존 프로필 HTTP 401/200 불일치), 계약 PASS, DB 패키지 62 PASS/5 SKIP, app-api 184 PASS, 보안 11 PASS, 봇 11 PASS, 운영 High 이상 감사 PASS. 전체 감사 9건(보통 8/낮음 1), 전체 경로 QA 증빙 파일 누락으로 FAIL.
- 격리 PostgreSQL 17.11 322/322 마이그레이션, 실제 DB 테스트 27건 PASS, 앱 계정의 outbox 쓰기·감사 삭제 권한 차단 확인. 컨테이너 제거.
- 독립 Next.js 실제 HTTP에서 과거 기본 비밀값 POST 403 및 private/no-store, noindex/nofollow, no-referrer 확인. 실제 디스코드 메시지 전송은 하지 않음.
- 원격 CI 일부 PASS, runtime-check 대기. 공식 Test/Production 버전 510dbe6bf4d5c2a8089fc06b480776053da7a2e3으로 후보와 다름. 정확 SHA 공식 Test, 로그인 브라우저/Android E2E, 실제 디스코드 전송 및 세션 연속성 BLOCKED.
- main 시작·중간·종료 재조회 a8541927c3a351d980454c66e95a3356c47e0722 동일. 영문 정본/국문 보조 통합기획 변경 없음. A/B/QA/Gemini 작업 보호.
- 최종: PARTIAL / RELEASE BLOCKED. PR 병합·Test/Production 배포·GitOps·원장·DB 변경 없음. 롤백 불필요. #2446의 Next 설정 변경과 향후 의미 단위 통합 필요.
- 남은 과제: 봇의 sendLog가 채널 전송 실패를 삼키므로 봇 수락과 실제 Discord 게시 완료는 다름. 독립 전달 영수증 확인 전 발송 완료로 주장하지 않는다.
