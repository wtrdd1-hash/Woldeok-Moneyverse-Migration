# 승인 UI 이미지 → 실제 Spring 공통 프론트엔드 구현 v2026.11.19.38.1

**상태: 실제 Java UI 소스 구현·자동 QA 통과 / GitHub main·운영 배포 전 별도 검토 후보.** 사용자 최신 지시는 전체 180화면·관리자2종 디자인을 Java Spring Boot MVC+Thymeleaf로 구현하고 Node/Next 운영 런타임 없이 실데이터/권한을 유지한 뒤 무중단 운영 승격. 일부 빌드 성공을 전체 전환으로 말하지 않는다.

[영문 정본](SPRING_NATIVE_VISUAL_SHELL_v2026.11.19.38.1.md) · [180개 이미지별 구현 증거 행렬](../qa/SPRING_DESIGN_ROUTE_MATRIX_v2026.11.19.38.1.md) · [QA 한국어](../qa/2026-11-19-spring-violet-ui-v38.ko.md).

## 실제 기준 이미지 (운영 화면 캡처가 아닌 디자인 시안)

![관리자 PC 1660×980 기준 시안](../design/admin-chat-v2026.11.18.13/references/admin-console-desktop.png)

![관리자 모바일 470×1000 기준 시안](../design/admin-chat-v2026.11.18.13/references/admin-console-mobile.png)

![홈 PC/모바일 합본 디자인 시안](../design/all-pages-v2026.11.18.12/previews/home.png)

[전체 180개 화면 PC/모바일 디자인 인덱스](../design/all-pages-v2026.11.18.12/README.md)는 실제 페이지가 아닌 기획 이미지다. v31 복구본이 최초 대화 승인 원본과 픽셀 동일하다는 검증도 없다.

## 실제 Spring 코드 구현 범위

| 대상 | 이번 Java·Thymeleaf 실제 UI 변경 | 보존한 기능과 한계 |
| --- | --- | --- |
| /admin/users, /admin/market, /admin/economy, /admin/economy/scenario-lab, /admin/controls, /admin/enterprises | `LiveAdminUsersPage.renderPage` 공통 서버 HTML에 240px 데스크톱 사이드바/모바일 가로 메뉴, 네이비/보라 카드, 버전 CSS, 안전 문의 동그라미 | 기존 AdminAuthService 인증·재무 approver 권한·실 DB·XSS 이스케이프·503 오류 그대로. 임의 회원수/원장값/정상 배지 금지 |
| /calculators, /tools 개발 후보 | `mv30/hub.html`에 전역 56px 문의 동그라미와 공통 CSS | 17개 도구 실제/미검증 표기 유지, 원장 변경 없음. 운영 /tools 기존 기능은 별도 보호 |
| /tools/stock-calculator, /tools/compound-calculator | Thymeleaf `mv28/layout` 공통 footer를 JS 없는 `details/summary` 문의 패널로 구현 | 기존 Java GET 계산·정확한 결과 유지 |
| /status | 상태 페이지에도 공통 footer CSS 적용 | 실제 수집된 운영 상태/기록 만료·UNKNOWN 판단은 변경하지 않음 |

**적용되지 않은 곳:** `/admin` 루트 정적 대시보드, 현재 `/` 홈페이지, 나머지 회원/관리자/게임/금융/소셜 등은 이번 소스 변경만으로 적용되지 않는다. 특히 홈페이지 정적 파일은 동시 작업자 Gemini v37 소유이므로 건드리지 않는다.

## 시각/접근성·기능 계약

- `mv-spring/v38/shared-ui.css`: 전역 문의 버튼 56×56px, PC 하단 24px·모바일 하단 96px + safe-area, 팝업 화면 내 폭/최대높이, 키보드 포커스·모션 축소·320px 반응형.
- `mv-spring/v38/admin-ui.css`: 화면 981px 이상 왼쪽 240px 관리자 내비·진청/보라색 강조, 980px 이하 모바일 재배치, 320/390px 레이아웃·테이블 개별 스크롤.
- 전역 문의는 `<details><summary>`로 JavaScript 없이 열 수 있다. **보안 확인 전 채팅 전송 기능은 미연결**이며 실제 고객지원/도움말 페이지로 이동만 가능하다. 접수 완료·실시간 연결 정상이라고 표시하지 않음.
- 관리자 언어는 EN 기본/KO 전환, 동적 제목 HTML 이스케이프, noindex/no-store 유지.
- 최초 코드에서는 관리자 CSP가 `style-src 'unsafe-inline'`만 허용해 새 CSS를 차단함을 RED 테스트로 발견. Spring 자신이 서빙하는 CSS만 허용하도록 `style-src 'self' 'unsafe-inline'`으로 제한 보완. JS·외부 출처 허용 없음.
- 로그인/OTP/다른 사용자 조회/금융 원장/채팅 서버 헤더 신뢰·실제 DB 진실 규칙을 변경하지 않는다.

## 실제 검증 결과와 차단 조건

- 6개 신규 Java 단위 테스트 모두 구현 전 실패(RED), 구현 후 성공(GREEN). 추가 상태 페이지 CSS 누락과 관리자 CSP 2건도 의도적 실패→수정 후 성공.
- 최종 Java `clean test bootJar` **251개 PASS / 0 실패 / 0 건너뜀**. 격리 JAR SHA256 `ba94b7b999be97f59b2c13e40fd4618fb3859885aeb7d202bb54d616dafd09ef`.
- H2·임의 포트 실제 Spring HTTP: 영문/한국어 계산기 200, 새 CSS 200, 비로그인 관리자 302 리다이렉트 확인. 이는 운영 배포나 정상 관리자 로그인/재무 화면 기능 증거는 아니다.
- **운영 보류 사유:** 실제 Chrome 320/360/390/768/1440·200% 화면 및 승인 이미지 픽셀 대조 없음, 관리자 정상 로그인/MFA/타 회원/원장·채팅 E2E 없음, 공식 Nginx Test→운영 SHA·롤백 검증 없음. 운영·DB·Nginx 미변경.
- 공개 GitHub main c131ef1과 미니PC 통합 main ec22442가 서로 다른 이력이다. 이 추가 8개 통합 커밋을 몰래 main에 밀어 넣지 않고 별도 브랜치에 유지한다.

## 전체 180화면 후속 실행 기준

[180개 디자인↔실제 Spring URL 매핑표](../qa/SPRING_DESIGN_ROUTE_MATRIX_v2026.11.19.38.1.md)의 기본 판정은 전부 미인증이다. 동시 Gemini v37 홈, 본 v38 공통 쉘, 나머지 관리자·회원 금융(개인 자산 우선)·주식/거래·퀘스트/직업·커뮤니티·도구를 **각 페이지 Spring 컨트롤러+Thymeleaf+실 API+보안+모바일 시각회귀** 순서로 구현한다. 실제 회원금액/보상은 원장 영수증 없는 예시 수치로 대체 금지. 전 경로 소스/배포/사용자/권한/DB/오류 증거 없이는 180/180 완료 선언 금지.

**이번 소스 브랜치는 실제 디자인의 일부 구현이지만 전체 UI 구현 완료 및 운영 승격은 아니다.**
