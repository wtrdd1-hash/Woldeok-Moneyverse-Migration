# v2026.11.18.0718.1 — 관리자 로딩 화면 P0 장애: 변경 이력·작업 실행자 추적

[English](2026-11-18-admin-ui-loading-incident-attribution-v2026.11.18.0718.1.md) | 상태: 증거 기록만 수행 / 장애 미해결 / 운영 승격 보류.

## 작업 전 — 2026-11-18 07:08 KST
- 제보 스크린샷: https://easy-scraping.com/admin/ 에서 “페이지를 불러오는 중입니다...” 문구만 표시되고 관리자 UI가 없음.
- AGENTS.md, 영문·국문 통합 기획 마스터, 통합 개발 기준, 프론트엔드 화면 규격, Spring 전환 상세 재검토를 확인. 기존 기획은 백엔드 Spring 전환과 별개로 Next.js/React 프론트엔드 유지, 단계별 검증·복귀를 요구.
- 미니PC MCP로 Debian 13 서버 조회. Nginx/Docker, Spring Java :4550 활성; 이전 명칭의 Next.js 서비스는 비활성, DEV DB 접속 확인. 이 사실만으로 운영 API·금융 원장 전체 정상이라고 인증할 수 없음.
- 기존 복구 담당 브랜치 fix/p0-admin-ui-recovery-v2026.11.18.1 및 병행 Gemini/GPT 작업 폴더는 수정하지 않음. 이번 범위는 사고 조사·기록이며 운영·DB 변경은 하지 않음.

## 진행 중 — 07:08~07:18 KST
### 직접 재현한 장애
- 외부 /admin/은 HTTP 200이나 응답은 475바이트의 JS 연결 없는 임시 HTML. 최상위 / 도 같은 응답. 07:07 이후 Nginx 기록의 200은 관리자 UI 정상 작동 증거가 아님.
- Spring localhost :4550/admin/ 및 /_next/static/ 요청에도 똑같은 대기 HTML 응답.
- 현재 실행 중 Spring JAR의 BOOT-INF/classes/static/index.html에 정확히 동일 문구가 있으며, 관리자 화면·Next.js JS 번들은 JAR에 포함되지 않음. Spring 기동 로그는 static/index.html 웰컴 페이지 매핑을 확인.
- 반면 /srv/moneyverse-data/frontend-static/admin/index.html에 약 214KiB 완전한 Next.js HTML과 /_next/static 리소스 참조가 있으며 03:13에 생성됨.
- 현재 Nginx prod_frontend가 종전 Next.js :4501 대신 Spring Boot :4550으로 연결. 사용자에게 제공할 화면이 운영 라우팅에서 제외된 것이 직접 원인.

### 시간별 운영 증거 — KST
| 시각 | 확인된 행위 | 의미 |
| --- | --- | --- |
| 11월 17일 22:28:57 | Git 커밋 3715775c53에서 Spring 정적 index.html에 임시 로딩 문구 추가, Git 작성자 wtrdd1-hash | 문구를 넣은 코드 변경자 계정, 운영 배포자 확정 아님 |
| 11월 18일 02:41:15 | debian 계정이 B v1108 작업 폴더의 JAR 복사 및 Spring 재시작 | 선행 백엔드 교체 |
| 02:42:42 | Nginx 설정 백업 63,522바이트, 1,477줄 | 변경 전 기준 파일 |
| 02:44:05~27 | debian SSH 세션에서 /tmp/moneyverse_patched.conf를 활성 Nginx 설정에 복사·검사·재적용 | 이후 7,207바이트, 195줄로 축소된 설정 확인 |
| 03:11:18 | SSH 세션 3093: 운영·복구·Test Next.js 서비스 정지·비활성화, dist/index.js 종료 | UI 서비스 정지 |
| 03:12:09 | 관리자 로그 Next canary 종료 | Test 화면 경로 추가 종료 |
| 03:13:48 | frontend-static 내 관리자 Next.js HTML 생성 | 화면 파일은 디스크에 남아 있음 |
| 03:14:51 | B v1108 작업 폴더의 JAR 재복사 후 Spring 재시작 | :4550 백엔드 구동 |
| 03:20:34~03:21:01 | Nginx prod_frontend :4501 → :4550 설정 변경 후 reload | 화면 경로가 Spring 임시 페이지로 향한 주요 전환점 |
| 03:21:01 | v1546 불변 릴리스 Next.js 프론트 중지·비활성화 | 정상 화면의 대체 경로 제거 |
| 03:36:05~19 | b-v1118-migrator-guard 작업 폴더에서 Spring 재시작·SEO 업스트림 :4550 변경·Next/SEO 서비스 마스킹 및 유닛 이전 | Spring 단독 라우팅 추가 강화 |
| 07:07~09 | /admin/ 반복 200이지만 임시 페이지, /admin/seo 503 및 인증 서브요청 404 | 실제 장애 지속 확인 |

### 원인 및 영향
- **직접 원인 확인:** 운영 Nginx가 Spring Boot에 프론트엔드 요청까지 전달하도록 바뀌고 Next.js 프론트 서비스를 중지했으나, Spring JAR은 관리자 화면 구현이 아닌 임시 정적 HTML만 제공.
- 02:44 Nginx 1,477줄 → 195줄 대폭 축소는 별도의 위험 변경. 인증·SEO·API 예외 라우팅까지 손실됐을 가능성이 있으나 전수 검증하지 않았음. 과거 설정을 검증 없이 통째로 복원하는 것도 위험.
- 기존 통합 기획은 Next.js/React 유지, 실제 Test SHA, 관리자 세션·MFA·CSRF, 단일 금융 기록자와 복귀 시험을 요구. 현재 화면 장애는 이 검증을 통과한 전환이 아님. 뒤이은 Test :3101 연결 거부 기록도 확인.
- 03:36 Spring 종료 시 Logback NoClassDefFoundError도 있으나 화면 로딩 문제의 직접 원인으로 입증되지는 않음.

### 작업자 추적과 귀속 한계
- **확인된 명령 실행 운영체제 계정:** debian(UID 1000). SSH 인증 접속 출발지는 내부 게이트웨이 192.168.100.1. 02:44 세션 3073, 03:11 세션 3093, 03:21 세션 3116이 주요 증거.
- **확인된 코드 작성자 Git 계정:** wtrdd1-hash, 커밋 https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/commit/3715775c53184d5bc2f5e5507141a10f92b8ab6f.
- **배포에 사용된 산출물:** tasks/mv-b-v1108-20261117-1130/worktree의 Spring JAR. 후속 실행 작업경로: agent-worktrees/b-v1118-migrator-guard-20261117.
- **중요한 반증:** 원래 B v1108 작업 종료 기록은 “verification-only / No deployment / Production HOLD”라고 명시. JAR이 나중에 재사용됐다고 최초 B 작업자가 배포했다고 단정할 수 없음.
- 미니PC MCP 감사 이력으로 해당 직접 SSH 명령을 특정 GPT·Gemini·Codex·사람 세션에 연결하는 증거를 찾지 못함. 여러 세션이 동일 내부 게이트웨이를 사용. **실제 개별 실행자/AI 도구는 미확정(UNKNOWN)**. Git 작성 계정과 운영 실행자를 혼동하지 말 것.

## 조사 종료 기록 — 07:18 KST
- 판정: 재현되는 P0 운영 프론트엔드 전달 장애. 실제 노출된 임시 HTML의 직접 기술 원인을 특정했으며, sudo 명령·Git·라우팅·JAR의 근거 연결 완료. 실명·개별 AI 실행자 특정은 불가.
- 본 조사에서는 코드·DB·금액·Nginx·서비스·테스트 서버·운영 배포·메인 브랜치를 수정하지 않음. 별도 복구 담당 작업을 방해하지 않음.
- 복구 담당자는 Next.js 화면과 Spring API 역할 분리, 실제 HTML+JS+CSS 로딩, 로그인 관리자 세션·OTP·CSRF, SEO, 모바일 레이아웃, 정확한 Test SHA·API·금융 조회 정합성·롤백 검증 후에만 승격. HTTP 200만으로 성공 판정 금지.
- 원격 main e96e8f81f4d6b99b221392a2b6fe46356361b145를 시작·중간 재확인했으며, 병행 작업으로 11커밋 앞선 로컬 main은 수정하지 않음.
