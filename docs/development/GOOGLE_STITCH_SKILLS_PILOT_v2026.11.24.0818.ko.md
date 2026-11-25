# Google Stitch Skills — 소스 전용 적용 시험 (v2026.11.24.0818)

## 출처와 적용 범위
- 사용자 영상: https://www.youtube.com/shorts/T5qdrYS7znc. 유튜브 실제 제목·설명에서 https://github.com/google-labs-code/stitch-skills 확인.
- 공식 Google Labs Code 소스 SHA: `9f4e828e77634e230978be45fec5501554dbe4b2`. Apache-2.0 LICENSE 원본 보존.
- 프로젝트 내 `.agents/skills/stitch-extract-design-md/`에 소스 전용 스킬 설치. 호환을 위한 스킬 frontmatter 이름만 kebab-case로 조정. 외부 `npx` 설치기를 실행하지 않았으며 외부 디자인 API 호출 없음.
- `.stitch/DESIGN.md`(영어 정본) 및 `.stitch/DESIGN.ko.md`(한국어): 11월 18일 네이비/보라 기준과 Spring CSS를 근거로 제작. 새로운 색상 테마나 런타임 도입 아님.

## 활용 절차
1. 새 격리 브랜치에서 `.agents/skills/stitch-extract-design-md/SKILL.md` 및 `references/plain-css.md`를 참고해 Spring Thymeleaf/HTML/CSS를 분석.
2. `.stitch/DESIGN.md`를 공통 디자인 계약으로 사용. 공식 로고·색상·5개 언어·PC/모바일·실데이터·관리자 권한 준수.
3. 변경 시 `python3 scripts/verify_stitch_design_contract.py` 실행. 현재 정적 **CSS 11/11개 토큰 및 문서 계약 PASS**. 실제 브라우저/화면 180개 검증을 뜻하지 않음.
4. Stitch 클라우드 시안 생성은 https://stitch.withgoogle.com/docs/mcp/setup/ 에 따른 별도 Stitch MCP/계정 설정과 **비식별 시안 외부 업로드 별도 승인**을 받은 뒤 시행. 현재 연결/업로드하지 않음.
5. 승인된 결과는 기존 Java Spring Boot MVC + Thymeleaf UI에서만 구현하고, 독립 Test 서버에서 실제 API/DB·언어·권한·접근성·롤백 QA 통과 후 운영 승격 여부 판단.

## 보안·수용 현황
- 시크릿·실제 사용자/잔액·운영 화면·민감 소스 외부 업로드 금지. 원본 스킬의 자의적인 팔레트보다 승인된 11월18일 네이비/보라가 우선.
- **완료:** 격리 브랜치 로컬 스킬 설치, 출처·라이선스 점검, 한영 디자인 계약, 재현 가능한 정적 검사 및 문서.
- **미완료:** Stitch MCP 인증, 클라우드 화면 생성, 실제 브라우저 비교, 180경로 검수, 독립 Test 배포, 운영 변경. 이 작업만으로 전체 UI가 구현되었다고 판단 금지.
- 작업 브랜치 `feat/stitch-design-skill-v2026.11.24.0818`, 기준 main `9876c09888` (병합 전 재조회 필수).
