# 프론트엔드 전환 작업 기록 — 관리자 디자인·전역 문의 v2026.11.18.17

상태: 시작 / 별도 개발 브랜치 / 공식 Test·운영 검증 전 승격 보류
사용자 승인: 2026-11-18 KST — “프론트엔드 전환진행승인”
저장소: wtrdd1-hash/Woldeok-Moneyverse-Migration
브랜치: feat/spring-frontend-admin-chat-v20261118-17
시작 기준 SHA: a43b70d477fbb17d6c42d4e36a46d4e7ca3fc7c2 (Spring 복구 #3267 및 Spring 라우팅 #3264 위에 스택)
작업 시작 main SHA: 0590fac4e8a82bc986ba1b8c64f014d18daca9e9

## 시작 — 코드 수정 전
- 권위 통합 기획서, 프로젝트 정책, AGENTS, 디자인·반응형·플로팅 충돌 방지 규정, 이전 전체 디자인 PR #3268 및 관리자 채팅 시안 #3270를 재확인.
- 이번 승인은 독립 미리보기에서 **실제 프론트엔드 소스 개발로 전환**하는 승인으로 해석. 운영 화면의 즉시 교체 또는 보안 검증 생략 승인은 아님.
- Spring 라우팅 PR #3264의 SpaWebMvcConfig는 Next 정적 출력물을 Spring Boot가 제공하도록 설계. 즉 실제 전환 확인에는 동일 SHA의 프론트 빌드·Spring 연동·실제 Test 검증이 필요.
- 회원 화면용 고객지원·1:1 쪽지 위젯은 이미 있으나 /admin 경로에서는 숨김. Spring 채팅/문의 컨트롤러에 헤더 기반 신원·고정 UUID 대체 및 서비스의 DB 실패 후 허위 성공 위험 존재.
- 기존 관리자 관제탑은 실제 API 근거·조회 불가(UNKNOWN) 상태를 사용 중이므로 데모 데이터를 실제 수치처럼 바꾸지 않는다.
- 이번 UI 구현: 관리자 화면 공통 다크·퍼플 디자인, **전 관리자 페이지의 안전한 문의 안내 팝오버**, 비관리자 화면의 기존 지원/채팅 단일 동그란 위젯 개선(56px, 세이프에어리어, 접근성).
- 관리자 문의 팝오버는 FAQ/문의 경로를 안내하는 읽기 기능만 제공. 보안 게이트 통과 전 실제 쪽지·문의 전송 API 호출을 연결하지 않는다.
- Gemini/Spring 보안 PR과 파일 충돌을 막기 위해 frontend의 제한된 소스와 단위 테스트 및 버전 문서만 변경. 직접 DB·Nginx·운영 변경 금지.

## 중간 — UI 구현 및 단계별 검증
- 최신 GitHub main 0590fac4e8a82bc986ba1b8c64f014d18daca9e9 재확인, Spring 보안 복구 SHA a43b70d477 유지. 다른 작업자의 서버 코드는 수정하지 않음.
- 의존성 기존 링크 단절이 있어 격리 작업 폴더에서 pnpm install --offline 로 복구. 원본 미니PC 작업 폴더 변경 없음.
- TDD RED: 신규 관리자 지원/라우트 분기 테스트 실패; 관리자 테마/버튼 3개 실패 확인. GREEN: 집중 4파일 20개 PASS.
- 관리자 공통 네이비/보라 쉘 적용, 원천 기반 상태 유지. /admin* 읽기전용 문의 팝오버, 비관리자 기존 위젯 56px·ARIA·모바일 safe-area 개선.
- Contract 빌드, 프론트 TS typecheck, Next 전체 빌드(603개 정적 생성 단계), Spring bootJar PASS. Spring 관리자 인증 경계 단위 테스트 3/3 PASS. ESLint 오류 0, 기존 컴포넌트 경고 9.
- 전체 프론트 테스트 105초 타임아웃(exit 124), 광고/검색색인 영역의 실패 최소 3개 관찰. 전체 통과 주장 불가.
- Spring 정적 서빙 구조에서는 Next 신규 /admin·/support 동적 SSR 출력이 JAR에 포함되지 않음. 기존 static/admin.html이 잔존, Test/운영 승격 차단.


## 종료 — 코드 및 검증
- 원격 main 및 Spring 복구 브랜치 최신 SHA를 재확인한 독립 개발 폴더 유지.
- 관리자 공통 테마·관리자 읽기 전용 문의창·일반 회원 원형 문의 버튼 및 접근성 적용.
- UI 집중 테스트 4파일 20 PASS, Contract/TS/Next 빌드/Spring bootJar PASS, Spring 관리자 경계 3 PASS, 별도 랜덤포트 실 HTTP 1 PASS.
- 전체 프론트 테스트는 105초 타임아웃 및 광고/검색 실패로 미통과. 새로운 Next 동적 관리자/고객센터 페이지는 Spring 정적 JAR에 반영되지 않아 운영 승격 차단.
- Spring 문의 신원/허위 성공 P0 미해결로 실제 관리자 메시지 미연결. Nginx/DB/원장/운영 미변경.
- 내부 업데이트 파일은 GitHub 차단 정책을 준수해 미니PC에만 유지. 별도 Draft PR 후보로 검토.
