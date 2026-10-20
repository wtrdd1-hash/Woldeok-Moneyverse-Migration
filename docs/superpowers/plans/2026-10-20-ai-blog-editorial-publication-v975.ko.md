# 내부 AI 금융 블로그 검증·편집·발행 엔진 구현 실행계획 — v2026.10.20.975

**한국어 요약 실행계획** | [English canonical / task-by-task file contracts](2026-10-20-ai-blog-editorial-publication-v975.md)
**상태:** 설계 및 개발계획만 작성. 이 문서 자체는 코드 구현·데이터베이스 적용·Test/운영승격을 승인하지 않는다. 상세 권위는 [국문 시스템 명세](../../planning/AI_BLOG_EDITORIAL_PUBLICATION_ENGINE_SPEC_v2026.10.20.975.ko.md).

## 시작 전 조건

- 각 단계 전 최신 origin/main의 SHA와 통합기획 마스터·국문 우선 번역을 재확인한다.
- 미니PC 별도 worktree와 기능별 PR 사용. Gemini·다른 작업자 작업트리와 공용 릴리스 폴더 직접수정 금지.
- 운영 blog-posts.json 파일 0444 유지, 구버전 생성 API 403/503 유지, 원장·예금·지갑·국고 데이터 변경 금지.
- 기능 구현 전 해당 설계와 실행계획 승인 필요. 새 SQL은 구현 당시 미사용 마이그레이션 번호 할당 및 기존 마이그레이션 불변.
- 각 기능은 실패 테스트 RED → 구현 GREEN → 코드품질·보안 검토 → GitHub CI → 해당 SHA 테스트 서버 검증으로 진행.
- 프론트는 Next.js 같은 출처 BFF만 활용하고, 백엔드와 PostgreSQL 권한은 SECURITY DEFINER + 최소 EXECUTE로 제한한다.

## 단계별 작업

| 버전 | 파일 위치 (기존/예정) | 개발/수용 조건 |
|---|---|---|
| v975.1 운영진단 | docs/findings/, docs/worklog/ 및 기존 파일 읽기전용 | 공개 6편·과거 AI 171편·구버전 작성자·각 사이트 SHA 확인, 원본 해시 보존 |
| v975.2 DB 모델 | packages/database/migrations/NEXT-blog-editorial-lifecycle.sql 및 backend/src/blog-editorial/blog-editorial.repository.ts | 신규 승인·리비전·소스·게시·작업·감사 테이블; 앱 계정 원시 DML 거부, PUBLIC EXECUTE 회수 |
| v975.3 출처/수치 검증 | backend/src/blog-editorial/blog-evidence.service.ts 및 blog-claim-checker.ts | 출처 HTTPS/allowlist/SSRF 검사, 금리·환율·세법 기준일, 자료 오류시 발행 차단 |
| v975.4 내부 AI와 중복검사 | blog-ai-drafter.service.ts / blog-duplicate-review.ts | 모델 응답은 초안만, 과거 80·51·37회 제목 검출, 404/timeout 모델 실패시 게시 0 |
| v975.5 관리자 초안/승인 | frontend/src/app/admin/blog 및 components/blog-editorial, backend blog-editorial.controller.ts | 편집/검수/반려/수정/승인, CSRF/권한/해시/If-Match, 승인 후 글 수정 시 무효 |
| v975.6 원자적 발행 | blog-publisher.service.ts, frontend/src/app/blog/blog-data.ts | 승인 영수증과 내용 해시 일치, 중복 워커 발행 0, 기존 미승인글 sitemap 제외 |
| v975.7 다국어 SEO | blog-seo.ts, blog-page-server.tsx, sitemap-blog.xml/route.ts | 언어·법역별 검증, hreflang/canonical reciprocity, 적절한 datePublished/dateModified |
| v975.8 예약·정정·철회 | blog-scheduler.service.ts / 운영 알림 | 명시 승인 예약글만 실행, Test 자동제출 0, 실패 재시도 최대 3회·데드레터 |
| v975.9 계산기 연계 | 기존 blog-inline-calculator.tsx + v931 레지스트리 초안 승인 후 | 공식 계산 fixture와 같은 숫자, 개인정보 분석 데이터 유출 금지, 중복 레지스트리 개발 금지 |
| v975.10 릴리스 | docs/releases, ops/실제 배포 절차 | CI→정식 exact-SHA Test frontend/backend/DB→로그인 세션/166페이지·관리자 5회→금융 원장 조건→무중단 운영 승격 |

## 필수 적대적 테스트

- 로그인·권한 없는 사용자 및 CSRF 우회 요청이 403으로 차단되는가?
- 내부 AI 또는 자동 작업 계정이 게시 승인에 접근하지 못하는가?
- 관리자 승인한 리비전 본문을 수정한 뒤에도 이전 승인을 재사용하지 못하는가?
- 공식 출처 날짜가 없거나 환율 1,385.5원 같은 구식 수치를 ‘실시간’이라고 주장하면 차단되는가?
- 사설 IP, 클라우드 메타데이터, 악성 URL 리다이렉트 및 프롬프트 삽입은 안전하게 거부되는가?
- 중복제목/같은 slug/같은 Idempotency-Key와 워커 2대 병행 시 최종 공개물은 하나뿐인가?
- DB 기록 직후 응답 연결이 끊겨도 성공을 지어내거나 두 번째 게시를 만들지 않는가?
- 한글 제도 문장을 영어 번역했을 때 미국 세제로 오해되면 별도 국가판이 보류되는가?
- 미검증 과거 AI 글에 canonical/사이트맵/구조화 데이터가 추가로 노출되지 않는가?
- 모바일 320/375px에서 표·검토버튼·승인사유·자료링크가 잘리지 않는가?
- 내부 모델 중단/출처 장애 중에도 기존 승인된 공개 글 6편을 읽을 수 있는가?

## 착수/운영 판정

1. 기획 승인 후 v975.1 읽기전용 운영진단과 별도 개발 PR 수행.
2. v975.2~v975.5는 실제 공개 발행과 격리된 상태로 개발/테스트한다.
3. v975.6은 안전한 게시 영수증과 미검증 글 제외를 입증한다.
4. v975.7~v975.9은 언어별 정확성/인입 효용을 수용한다.
5. 운영에는 **플랫폼 전체 기존 재무 원장 권한·기초잔액 대사·전수 UI·세션·정식 Test 및 롤백**이 통과한 SHA만 올린다. 한 가지라도 미해결이면 차단 사유를 기록하고 해결 후 다시 시험한다.
6. 초기에 주 2편 유용한 검증 글을 목표로 검토할 수 있으나, 출처가 부족하면 0편도 정상이다. ‘하루 1건 무조건 발행’, ‘Google 즉시 색인’은 제품 보장으로 만들지 않는다.

## 문서 승인 기준

- 영문 정본/국문 상세기획 및 이 실행계획의 상태·API·권한·법역·수치 검증 정책 일치.
- v931 미통합 초안과의 충돌검토 표시.
- 새 코드·DB·운영환경에 대한 무단 변경 0.
- GitHub 작업 브랜치·PR·시작/중간/종료·내부/공개 업데이트 이력 보존.
