# Spring 실제 관리자·전역 문의 디자인 — QA 결과 v2026.11.19.38.1

일자: 2026-11-19 KST
작업: 미니PC 독립 `feat/spring-violet-ui-shell-v20261119-38`
기준 SHA: 로컬 통합 main `ec22442819b986e190d5ba6d9fd2539d86efb2db`, 공개 GitHub main `c131ef1039fddbba064e04a9c07bbba06e0a38a2` **서로 다른 이력**.
상태: **실제 Java 단위·HTTP 테스트 통과 / Chrome·공식 Test·운영 미승격**.

## 실제 수행 QA

| 항목 | 수행 방법 | 결과 |
| --- | --- | --- |
| TDD 1차 RED | 관리자/Thymeleaf 새 테스트 6개 | 구현 전 **6개 전부 예상 실패**, 구현 후 GREEN |
| 상태 페이지 CSS 인계 | 공통 footer CSS 누락 검사 | 1개 실패→상태 템플릿 추가 후 GREEN |
| 관리자 외부 CSS 보안 차단 | 관리자 CSP 테스트 2개 | 2개 실패→`style-src 'self' 'unsafe-inline'`로 자사 CSS 한정 허용 후 GREEN |
| 관리자 실제 HTML | Java 공통 `renderPage` 영/한 레이블·제목 XSS·단일 문의·PC 240px 사이드바/모바일 980px | PASS |
| Spring 실제 Thymeleaf | /calculators, /status, /tools 후보 및 계산기 공통 레이아웃·CSS 경로 검사 | PASS |
| H2 랜덤 포트 HTTP | 영문 계산기 GET, 한국어 계산기 GET, CSS GET, 익명 /admin/users 차단 | **실제 HTTP 4/4 PASS**; 200/200/200/302 |
| 전체 Spring 소스·JAR | `./gradlew clean test bootJar --offline --no-daemon -Dorg.gradle.workers.max=2` | **JUnit 251 PASS / 실패0 / 건너뜀0, BUILD SUCCESSFUL (36초)** |
| 빌드 산출물 | JAR SHA256 | `ba94b7b999be97f59b2c13e40fd4618fb3859885aeb7d202bb54d616dafd09ef` (격리 빌드이며 운영 SHA 아님) |
| Java JAR 내부 | `unzip -l` | v38 admin/shared CSS 및 해당 템플릿·컨트롤러 클래스로 패키징 확인 |
| 인증·금융 기존 회귀 | 기존 관리자 보안/DB 원천 테스트 포함 전체 Java | PASS. 기존 세션/OTP/권한/원장/응답 상태코드 미변경 |
| 충돌 방지 | Gemini v37 작업트리의 `static/index.html` 변경 여부 재확인 | 해당 파일 미수정, Nginx·DB·실 운영 프로세스 조작 없음 |
| 이미지 참조 | [관리자 PC](../design/admin-chat-v2026.11.18.13/references/admin-console-desktop.png), [모바일](../design/admin-chat-v2026.11.18.13/references/admin-console-mobile.png), [180개 연결 행렬](SPRING_DESIGN_ROUTE_MATRIX_v2026.11.19.38.1.md) | 경로 존재. 최초 승인 원본 픽셀 일치·실 운영 반영은 **미검증** |

## 미검증·미완료 사항 (실제 장애 차단 기준)

- 미니PC에서 사용할 수 있는 headless Chrome 바이너리를 찾지 못하여 **320/360/390/768/1440/200% 실제 브라우저 캡처·이미지 시각회귀 미실시**. CSS·HTML 정적 검사나 Java 빌드만으로 동일 디자인이라고 주장 금지.
- 실제 운영 관리자 로그인·MFA·소유권·원장 영수증·고객지원/쪽지 정상 전송·오류 E2E 미실시. 문의 동그라미는 보안상 **안전한 링크 안내만** 제공.
- 새 JAR의 공식 Test Nginx 인입, 배포 아티팩트 SHA·암호화 인증·외부 DNS, Android API, 독립 복원/롤백 미실시.
- 180개 디자인 합본 이미지 전체의 Spring UI 전환 **미완료**. 행렬 기본 상태는 미인증.
- 운영 `/admin` 정적 대시보드와 `/` 홈은 별도 소유자가 작업 중. v38 Java 공통 쉘이 해당 페이지에 바로 반영되었다고 주장 불가.
- 로컬 main과 공개 main 이력 상이. 공동 작업 중인 보안/정적 홈페이지 커밋을 GitHub PR에 잘못 섞지 않도록 별도 정리 필요.

**릴리스 판정: HOLD / 운영 화면 미교체.** 현재 빌드·실 HTTP 성공은 Spring 화면 구현의 일부 증거이며 전 페이지 인증·반응형·금융·운영 승격 완료 증거가 아니다. 사용자 운영 승인은 수용했으나 미검증 운영 서비스 재시작·DB 변경·Nginx 재배포를 실행하지 않는다.

[상세 설계 한국어](../planning/SPRING_NATIVE_VISUAL_SHELL_v2026.11.19.38.1.ko.md) / [English](../planning/SPRING_NATIVE_VISUAL_SHELL_v2026.11.19.38.1.md).
