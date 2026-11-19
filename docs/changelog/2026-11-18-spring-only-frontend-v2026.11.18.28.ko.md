# v2026.11.18.28 → v2026.11.18.28.1 — 전체 Spring UI 지시·계산기 신디자인 변경이력

**2026-11-18 시작→2026-11-19 00:03 KST 일부 운영 승격 PASS, 전면 전환 보류.**

- **v28.0 기획:** 사용자 “프론트 전부 Spring/API 전체” 최신 지시가 구 Next 런타임 유지 지침을 대체함을 통합기획·PROJECT_PLAN 최상단/영한 ADR에 반영. 영상 Modern Web Guidance1.0 실제 제목·설명과 Chrome 공식 문서 확인, CLI1.0.1 국소 검사52규칙 매치0(전 앱 보증 아님), 네이티브 Form/접근성/모바일 CSS 가이드 활용. Gemini 공유 main 무변경 분리 브랜치.
- **v28.1 개발:** Java17 Spring Boot3.3.5+Thymeleaf, 복리·주식 계산기 2페이지 Spring SSR/네이비·보라 신디자인·영어→한국어·네이티브 HTML GET 폼/비JS 계산, 잘못된 값400, Next/React/Flight 의존 없음. TDD5 실패 후 수정+수학5, 최종 JUnit **226/226 PASS**, bootJar.
- **v28.1 Test·운영:** 불변 JAR SHA `e0f8ac8be500321efdfc8c60450e9a42f8205c37d04b58dcbd838e020b939f57`, Test read-only4652·Prod read-only4653·구4550 보존. 독립 Nginx4453, Chromium 두화면×EN/KO×320/390/1440 12/12, 비JS 계산2/2·400알림1·링크2/2, 외부 HTTPS33/33 PASS. 본 Nginx 문법·무중단 reload, 비공개600권한 백업, 나머지21정적 경로/금융·개인정보 P0 차단 보존. 운영 계정/원장 쓰기 없음.
- **미완료:** API503 28경로(14기능), Next180개 중 신UI Spring 검증 안 된177개, v17 관리자·회원/채팅, 동적5·실제 로그인/금융 거래·외부 Test403·전체 화면 접근성/복원. 전체 완료 주장 금지.
