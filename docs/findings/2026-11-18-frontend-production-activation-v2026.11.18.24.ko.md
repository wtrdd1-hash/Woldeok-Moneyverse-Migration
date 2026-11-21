# Spring 기반 프론트엔드 운영 실제 적용 — v2026.11.18.24

**일자:** 2026-11-18 KST. **판정:** 공식 내부 Test 검증 및 **운영 일부 화면 승격 완료**, 전체 동적 프론트 전환은 **미완료**. [영문 정본](2026-11-18-frontend-production-activation-v2026.11.18.24.md).

## 사용자 지적과 실제 원인
사용자 지적대로 이전 v23은 Spring 관리자 6개 HTML·API GET·SEO만 실제 운영 승격됐고, 나머지 사이트는 `/srv/moneyverse-data/frontend-static/`와 Spring JAR에 남은 **예전 HTML/JS**를 계속 제공했습니다. Next 빌드·Vitest 통과가 운영 브라우저 디자인 반영을 의미하지 않았습니다. 운영 옛 홈페이지 제목과 새 Next의 `토스 스타일 차세대 핀테크 가상경제` 제목을 비교해 확인했습니다.

## v24 코드 및 빌드 구현
1. 기존 v23 위의 독립 `repair/frontend-production-v20261118-v24` 브랜치 사용, 원격 main·공유 로컬 main·Gemini 공용 폴더 미수정. Spring `SpaWebMvcConfig`는 운영자가 지정한 버전 고정 `moneyverse.frontend.release-dir`의 HTML/JS/CSS를 우선 제공하고 없으면 기존 공유/내장 파일로 복귀합니다. 릴리스 디렉터리 범위를 통제해 임의 시스템 파일 노출 방지.
2. 초기 실패 테스트→수정 통과. 첫 격리 테스트에서 새 버전에 없는 `/inventory`를 새 홈페이지로 잘못 대체하는 문제를 추가 발견해 실제 기존 보관함·로그인·채팅 경로로 돌아가도록 수정. 없는 JS/CSS는 HTML200이 아니라 진짜 404.
3. 재현 가능한 공개 캡처 스크립트는 localhost 임시 Next 프리뷰에서 **익명 공개 페이지18개**, 브라우저 자산 **1,005개**만 검증해 버전 폴더(~30MB)에 저장. 실제 세션·금융 원장 쓰기 없음. 빌드 ID `1794990553432`, Spring JAR 소스 최종 `99a669b2`, 별도 Test4637·운영 DB 읽기 전용 Spring4638. 임시 Node 프리뷰는 작업 후 종료, 운영 Node 웹서버 신규 없음.

## 공식 Test와 실제 운영 검증
- Spring 전체 **195/195 JUnit 통과**, `clean test bootJar` 성공. 기존 동일 React 소스의 Vitest **590개 파일/3,084개 케이스** 및 타입검사·집중 ESLint·Next 빌드(603 생성 단계) 통과. 공식 내부 Test HTML **18/18 빌드 SHA256 일치**, JS/CSS 응답, `/login`·`/inventory`·`/chat` 기존 화면 유지, 관리자 비로그인 이동 302/위조 API401, 없는 JS404.
- 운영에는 **공개 읽기 화면13개만** 선별 승격: `/`, `/tools`, `/calculators`, `/guide`, `/features`, `/roadmap`, `/safety`, `/privacy`, `/terms`, 4개의 공개 계산기. 이전 실시간 블로그·갤러리·공지·신문·검색과 모든 인증·금전 변경 화면은 원래 경로 유지. Nginx 내부4400/공개80 두 진입점 무중단 전환, 전 자산에서 신규→기존 SEOv3→공용/구 백엔드 순으로 검색. 기존 설정 덮어쓰기 대신 새 snippet 및 원복 사본 사용. 최종 설정 SHA `4798588e49d03eadaf8d3f8abc6b6d77c05610aa6456d62223c39ae4035fdc55`.
- **실제 외부 HTTPS** `https://easy-scraping.com/`·`/tools`가 HTTP/2 200, `X-MV-Frontend-Release: v2026.11.18.24`, 새 홈페이지 제목 및 캡처 HTML 해시 일치. 외부 신규 JS/CSS 5개 HTTP200 및 해시 일치. 운영13/13 새 HTML 일치, Test18/18. 기존 로그인·보관함·채팅 200, 개인 정보 API401, 상점 API200·robots 정상. 예전 Spring 프로세스 및 v22 읽기 전용 서버는 원복용 유지.

## 아직 해결되지 않은 사항
- **전체 프론트 전환은 아님.** Next 서버 렌더링·Server Actions·실제 로그인/결제/채팅은 정적 HTML 저장만으로 Spring에 이식되지 않습니다. 실제 동작 가능한 Spring 기반 UI/API로 전환하기 전까지 기존 동적 경로를 보존했습니다. 임시 Next 프리뷰에서 내부 API 인증 구성 없이 일부 사적 화면 500이 발생해 새 정적 배포에서 제외했습니다.
- 새로운 공개 React 화면의 **브라우저 하이드레이션, 페이지 간 소프트 이동, 서버 액션, 모바일 320/390px 화면**은 실제 브라우저 QA 증거가 없습니다. HTTP200만으로 완전 기능 정상 판정 금지.
- 외부 HTTPS **`test.easy-scraping.com`은 403**으로 확인되어 외부 Test 접근성 별도 점검 필요. 내부 테스트 출처는 200이나 외부 공개 Test 가능하다고 주장 금지.
- 전체 903 API 양성 실기능·금융 영수증/복식부기·MFA/CSRF·Discord 음성·롤백 복원 훈련·모든 프론트 동적 화면은 여전히 미완료. **운영 일부 공개 UI 실제 전환 완료, 전 플랫폼 완료 아님.**
