# Spring 실제 공통 디자인·관리자 UI — 작업 기록 v2026.11.19.38.1

일자: 2026-11-19 KST. 사용자 ‘전체 Spring 프론트엔드 신규 디자인 구현 + 미니PC 개발 + 운영 승격’ 승인.

## 시작 (코드 수정 전)
- GitHub 공개 main c131ef1039fddbba064e04a9c07bbba06e0a38a2, 미니PC 로컬 통합 main ec22442819b986e190d5ba6d9fd2539d86efb2db으로 상이. 혼용 금지. 독립 브랜치 feat/spring-violet-ui-shell-v20261119-38.
- 권위 EN/KO 통합기획·프로젝트 기획, 사용자 최신 전체 Spring 지시(v28), G0~G6, 180개+관리자2 이미지, v31/v32 인계, AGENTS·Superpowers, 현행 Java 공통 템플릿 및 관리자 실제 서버 코드 확인.
- Gemini 병행 작업트리 v37에서 `spring-backend/src/main/resources/static/index.html`을 수정 중이므로 해당 파일·홈 라우트·Nginx·원장·DB·인증 소스는 **수정 금지**.
- 본 독립 단위: Spring MVC/Thymeleaf 실제 서버 공통 페이지에 56px 네이비·보라 문의 버튼(읽기 전용/실제 전송 미연결), 이미 인증된 관리자 UI는 실제 데이터·권한·UNKNOWN 유지하면서 승인 시안 공통 스타일/모바일 레이아웃 개선.
- 기존 서버 공통 mv28 footer는 긴 링크 버튼, 관리자 Java renderPage는 인라인 CSS. Spring이 실제 렌더하는 경로만 개선하며 Next/Node 런타임 사용 금지.
- 14:17 공용 홈페이지 GET에서는 기존 ‘홈 3안’ 제목이 사라지고 홈 대시보드 HTML로 제공됨. 이는 v37 병행 작업과 구분하며 본 브랜치의 성과로 주장하지 않음.
- 180개 전체 전환은 5개 네이티브/175개 미인증 상태에 가깝고, 전 경로 완료라 주장 금지.
- TDD RED→GREEN, Java/Thymeleaf·JAR, 격리 Test·실 브라우저/보안, 정확 SHA·롤백을 증빙한 변경만 운영 적용 가능.

## 중간
- Gemini v37 홈페이지 파일은 미수정, 로컬 통합 ec22442 기반 별도 브랜치 유지. 공개 GitHub main c131ef1 별도 재확인.
- 실제 Java 관리자 공통 화면에 사이드바·네이비/보라 2종 CSS, 안전 56px 문의 버튼, 영어/한국어 및 화면 980px 이하 모바일 재배치 구현. 기존 데이터·접근권한·에러 상태 변경 없음.
- Spring Thymeleaf calculator, hub, status에서 <details>/<summary> 도움 패널을 공통 사용하도록 변경. JS/채팅 전송/가짜 상태 없음.
- TDD: 6 RED→GREEN, 상태 CSS 한 화면 누락 1 RED→GREEN, 관리자 자사 스타일 CSP 차단 2 RED→GREEN. 동일출처 CSS만 CSP 허용.
- 최종 전체 Java clean test bootJar 251 PASS/실패0/skip0, JAR ba94b7...dafd09ef. 격리 Spring H2 실 HTTP 4건 성공. JAR 내부 CSS/Thymeleaf 포함 확인.
- 전체 180 PNG 이미지를 개별 URL과 연결한 증거 행렬 생성: 기본 미인증, 현재 v38 소스 후보 10경로만 식별.
- Chrome 브라우저 바이너리·정상 관리자/MFA/실 원장/운영 Test 검증 없음, 운영 승격은 보류.


## 종료
- 변경 범위: Java 관리자 서버 공통 HTML 및 CSP, v28/v29/v30 Thymeleaf 레이아웃·v38 CSS, 관련 Java JUnit, 180개 이미지-경로 표 및 영/한 기획·QA·업데이트/버전 작업 로그.
- 현재 로컬 main과 GitHub main 이력이 달라 8개 병행 커밋을 함께 PR에 밀어 넣지 않는다. 공개 Spring 라우팅 브랜치를 기준으로 별도 깨끗한 PR 후보 생성 후 실제 빌드 다시 검증 예정.
- 검증 통과한 건은 Spring 소스+격리 H2 HTTP뿐이며 실 Chrome 픽셀·로그인 재무·운영 무중단/롤백은 불합격이 아니라 **미검증**. 현 운영/DB/Nginx/Discord/Gemini v37 파일 미변경.
- 180/180 완료 또는 운영 승격 완료를 주장하지 않음. 실 Test·CI·QA 통과한 각 경로만 다음 승인 단계로 이동.
