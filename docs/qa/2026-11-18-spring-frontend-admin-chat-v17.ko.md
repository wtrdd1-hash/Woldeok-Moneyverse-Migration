# Spring 프론트엔드 전환 QA — 관리자·채팅 v2026.11.18.17

일자: 2026-11-18 KST
상태: 실제 UI 소스 개발 후보 / 보안·Spring 정적 자산 연결로 릴리스 보류
브랜치: feat/spring-frontend-admin-chat-v20261118-17
작업 기준: a43b70d477fbb17d6c42d4e36a46d4e7ca3fc7c2 (복구 PR #3267 및 Spring 라우팅 PR #3264)
최초 main SHA: 0590fac4e8a82bc986ba1b8c64f014d18daca9e9

## 실측 검증

| 점검 | 결과 | 한계 |
|---|---|---|
| TDD RED | 관리자 UI/분기 신규 2개 파일 실패, 관리자 테마/버튼 3개 사례 실패 후 구현 | 정상적인 구현 전 실패 확보 |
| 집중 Vitest | **4파일, 20 PASS, 0 FAIL** | React/jsdom 실제 컴포넌트·관리자 분기/문의창/비관리자 채팅 회귀 |
| Contract 빌드 | PASS | 작업 폴더만 |
| 프론트 TypeScript 검사 | PASS | 0 오류 |
| Next.js 전체 빌드 | PASS: 컴파일, 603개 정적 생성 단계 완료 | Next standalone 구성, Spring 정적 export와 다름 |
| Spring bootJar | PASS | 기존 classpath 정적 HTML만 포함, 갱신 UI 반영 아님 |
| Spring 관리자 인증 경계 단위시험 | PASS 3/3 | 실제 로그인된 Spring 백엔드 HTTP E2E 아님 |
| 전체 프론트엔드 테스트 | **미통과/미완료**, 105초 타임아웃(exit 124), 진행 중 adsense-ad 2개·search-indexing 1개 실패 관찰 | 변경 유발 여부 확정 불가; 전체 통과 주장 금지 |
| 실 브라우저 시각 QA | 미실시 | 크기별 실제 렌더링·접근성/위젯 겹침 미검증 |
| Spring에서 새 관리자 화면 실제 제공 | **BLOCKED** | /admin, /support는 Next 동적 렌더링(ƒ). 새 HTML 정적 출력 없음. Spring jar는 기존 admin.html 및 구 CSS 포함 |
| 실제 채팅 API 인증·운영 승격 | 미실시 | Spring 고객지원 신원/오류 성공 P0 보안 게이트 |

## Spring과 Next 정적 프론트엔드 연결 문제
`frontend/next.config.ts`는 `output: 'standalone'`이다. 빌드에서 `/admin`과 `/support`가 동적 서버 렌더링(ƒ)으로 표시되어 이번 코드의 새로운 정적 HTML이 생성되지 않는다. Spring `SpaWebMvcConfig`는 `/srv/moneyverse-data/frontend-static/` 또는 `classpath:/static/`의 파일을 제공한다. 새로 빌드한 Spring jar에도 기존 `static/admin.html`과 과거 CSS 해시가 포함돼 있다. **Next 빌드 통과만으로 Spring UI 전환 완료가 아니다.**

운영 전환 전, (A) 별도 Node SSR 유지 허용(과거 전체 Spring 지시와 충돌) 또는 (B) 실제 관리자/지원 동적 페이지를 Spring API 기반 정적/하이드레이션 화면으로 단계별 이전하는 공식 아키텍처 결정·작업이 필요하다. 구 HTML을 새 UI라고 배포 금지.

## 보안
Spring 문의/채팅 컨트롤러의 조작 가능 신원 헤더 및 고정 UUID 대체, 문의 DB 쓰기 실패의 허위 성공 문제가 아직 소스에 존재한다. 따라서 새 관리자 둥근 문의창은 **읽기 전용 링크/안내**이며 회원간 대화/API를 연결하지 않았다. 원장/금융/DB 수정 없음.

## 판단
**운영 승격 및 main 병합 보류.** 독립 소스 개발·컴파일/집중 테스트는 수행했지만 전체 회귀/실 로그인 API·Spring static handoff/롤백 점검이 미완료. 별도 개발 브랜치에서만 유지한다.

Spring H2 독립 랜덤포트 실 HTTP 테스트: EngagementWireSecurityTest 1 PASS. 출석 API의 신원 위조 헤더 익명 거부를 확인했으며 고객지원 API와 새 관리자 정적 HTML 검증은 아님.
