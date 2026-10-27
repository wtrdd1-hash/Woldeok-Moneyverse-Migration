# v2026.10.27.1382 — 블로그 전 기능 통합기획·메인 코드·운영 증거 대조 보고서

**구분:** READ-ONLY AUDIT / CODE+OPERATIONS EVIDENCE / NOT DEPLOYED
**기준:** `origin/main` `cf56520b` (2026-10-27, 중간 재확인); 운영 HTTPS 2026-10-27 KST; 공유 블로그 저장소 읽기 전용 확인.
**권위:** `AGENTS.md` → `DOCS_INDEX.md` 및 통합 마스터 → v975 편집 원칙 → v1107 국가별 즉시 발행 → **v1108 미검토 기한 초과에 따른 자동 비공개 금지** → 실제 소스/운영 수용 증거.

## 결론

- 공개 블로그 목록과 사이트맵은 작동하지만 콘텐츠 자동 검증·원어 생성·DB 발행기는 아직 구현되지 않았다. HTTP 200은 게시 자동화의 성공 증명이 아니다.
- 주제별 위젯/추천/참고문헌이 잘못 연결되며, TECH 문서에 금융 복리 계산기·거시시장 단락·금융기관 출처가 강제로 들어간다. 임의의 조회수/검증되지 않은 실험치를 생성하는 레거시 함수가 남아 있다. 품질 사고는 CSS만으로 수정할 수 없다.
- **중간 메인 갱신:** 초기 확인 커밋 `59cdc2e0`에는 발행 우회(`publishBlogPost`의 `bypassEditorialReview`) 경로가 있었으나, 최신 `cf56520b`에는 C v1102 차단 코드가 병합됐다. 최신 메인 `POST /api/blog/generate`는 인증이 있더라도 503 `EDITORIAL_REVIEW_REQUIRED`, `addBlogPost()`도 비테스트 실행에서 차단한다. 이는 소스 수정의 증거이지 운영 배포 증거가 아니다.
- 기존 운영 파일 모드 `0664`는 구 문서의 `0444` 보호 상태와 불일치한다. **기존 글/파일/권한/DB/배포는 이번 감사에서 변경하지 않았다.**

## 관찰 증거 및 테스트

| 확인 대상 | 증거 / 실제 상태 | 해석 |
|---|---|---|
| 공개 API | `https://easy-scraping.com/api/blog` HTTP 200, 공개 6편, 게시일 전부 `2026-10-15T14:00:00Z` | 신규 발행·최신성 증명 안 됨 |
| 공개 사이트맵 | `/sitemap-blog.xml` HTTP 200, `<loc>` 28개(허브 4 + 6개 슬러그 × 4개 언어) | 공개 SEO 경로는 작동; 실제 색인/클릭 자료는 미확인 |
| 공유 저장소 | `/srv/moneyverse-data/shared/blog-posts.json` 211건, AI 표시 205, TECH 17, `PUBLISHED` 30 / 상태 미설정 180 / `WITHDRAWN` 1, 파일 모드 `0664`, 최종 수정 `2026-10-27 04:53:55 KST` | 원본 기록·승인 상태·공개 추론을 혼동 금지; 운영 쓰기 주체 확인 필요 |
| 기존 TECH 글 | TECH 17건, 서로 다른 제목 3개, 최빈 제목 12건. 본문 길이 중앙값 3,565자 | 제목·템플릿 중복/주제 본문 빈약, 단순 글자 수만으로 품질 합격 불가 |
| 구 AI 글 직접 조회 | `/api/blog/2026-10-14-compound-mv83xp86`는 `success:true`, `isAiGenerated:true`, 본문 반환 | `noindex`·목록 제외와 API 공개 범위는 별개. 기존 접근 계약/정정 이력 설계 필요 |
| 집중 단위 QA | `NODE_ENV=test pnpm --dir frontend exec vitest run ...` 최초 4파일 20/20 PASS, 중간 메인 반영 후 프런트 5파일 22/22 PASS + 백엔드 편집정책 3파일 34/34 PASS (`blog`, `blog-country`, `generate`, `admin`) | 품질·출처·수치 재현·편집 승인·실 운영 인증/모바일 E2E 증명 아님 |
| 인프라 | 백엔드·프런트엔드 서비스 active; 운영 API/robots/블로그 허브 HTTP 200 | 운영 건전성 일부. 코드 SHA가 운영과 같다는 확인 아님 |

## 코드별 결함/갭 — 위험도 순

| ID | 위험 | 기획 기대값 / 실제 메인 코드 | 원본 근거 | 상태·권고 |
|---|---|---|---|---|
| BLOG-P0-01 | P0 | 미검증 신규 글 차단. `generate`가 과거 우회 발행했으나 **최신 메인 v1102에서 503/편집 보류 수정** | `frontend/src/app/api/blog/generate/route.ts`, `frontend/src/app/blog/blog-data.ts` | SOURCE FIXED / **운영 동일 SHA·Cron 실제 차단 재증명 필요**; 이 기능을 검증 없이 재활성화 금지 |
| BLOG-P0-02 | P0 | TECH와 금융의 본문·증거·도구 구별. 현재 `blocks` 둘째 요소 뒤에 모든 기사에 복리 위젯 삽입 | `frontend/src/app/blog/[slug]/blog-post-client.tsx` | OPEN; TECH는 무관한 계산기·시뮬레이터 제거, 실제 관련 도구만 선택 |
| BLOG-P0-03 | P0 | TECH 기사에는 실험 환경/소스코드/재현 명령/실측 영수증, 금융 기사에는 관할기관·기준일·원문 링크 필요. 현재 공통 거시시장·FRED·BOK 문단이 TECH에도 삽입, 거래 처리량 수치 등 재현 링크 누락 | `frontend/src/app/blog/blog-data.ts` (`TOPIC_TEMPLATES`, `generateDailyAiBlogPost`) | OPEN; 증거 없는 정량 주장 차단, 기관명만 적힌 인용은 검증된 출처 아님 |
| BLOG-P0-04 | P0 | 중복·원어 독립·승인·원자 발행·불변 영수증 요구. 현재 프런트 JSON 영속 스토어, 백엔드 순수 `GREEN_CANDIDATE` 검사만 존재 | `backend/src/blog-editorial/*`, `frontend/src/app/blog/blog-data.ts`, `packages/database/migrations/278*`, `279*` | PARTIAL SOURCE ONLY; 새로운 DB 발행기·중복 체인·Outbox·수동 철회 영수증 미수용 |
| BLOG-P0-05 | P0 | 레거시 콘텐츠 공개 계약. `isBlogDiscoverable`는 미승인 AI를 목록/사이트맵에서 제외하나 상세 API는 본문을 반환하고 웹 상세 URL은 noindex 표시로 접근 가능 | `frontend/src/app/blog/blog-seo.ts`, `frontend/src/app/api/blog/[slug]/route.ts`, `frontend/src/app/blog/blog-page-server.tsx` | OPEN; 사용자 기존 글 자동 비공개 정책 금지 존중. 법적/보안 근거 없는 자동 삭제 없이 관리자 수동 정정·기존 공개정책을 명시하고 정보 노출·색인 예외 테스트 |
| BLOG-P0-06 | P0 | 권한 안전, 즉시 수동 철회 영수증. 관리자 DELETE `?purge=true` 파일 물리 삭제 지원, 불변 승인/감사영수증 없음 | `frontend/src/app/api/admin/blog/[slug]/route.ts`, `blog-data.ts` | OPEN; DB 버전/사유/역할/감사, 복구 정책. 운영 자료 임의 purge 금지 |
| BLOG-P1-07 | P1 | 국가 4개는 **KR/US/JP/CN**. 구 레거시 동적 엔진 타입과 옵션은 **KR/US/JP/VN**이고 본문은 주로 한국어 | `frontend/src/app/blog/blog.types.ts`, `frontend/src/app/blog/blog-data.ts`, `frontend/src/app/api/blog/generate/route.ts` | OPEN; 국가/언어/법역을 정규화, CN을 독립 구현하고 VN 자동발행 제외(과거 기록 보존) |
| BLOG-P1-08 | P1 | 실제 주제에 맞는 관련글/도구. 모든 기사에 계산기·가상종목·은행 카드를 강제하고 명시되지 않은 종목은 CHIPS 기본값 | `frontend/src/components/blog/blog-related-ecosystem.tsx` | OPEN; 도구/문서 registry와 기사별 편집 승인된 관계만 노출. TECH엔 코드·테스트·아키텍처 문서 링크 우선 |
| BLOG-P1-09 | P1 | 정확한 조회·완독·메타데이터. 구 글 생성 `Math.random()` 조회수, `readTimeMinutes:6`; 실제 측정 아님 | `frontend/src/app/blog/blog-data.ts` | OPEN; 이벤트 기반 독립 조회수 또는 미표시, 본문 언어/길이 기반 읽기시간 추정, 부정행위 집계 금지 |
| BLOG-P1-10 | P1 | 4개 국가의 현지 독립 검색의도와 동등한 `hreflang`만 연결. 현재 6개 정적 슬러그에 4국가 개별 원고가 붙고 `blogAlternateLanguages()`가 모두 연결 | `frontend/src/app/blog/blog-country-editorial.ts`, `blog-seo.ts` | PARTIAL; 실제 번역 동등성 검증과 독립 기사 캐노니컬/상호 hreflang 분리 |
| BLOG-P1-11 | P1 | 추천/광고가 글의 맥락 및 실제 혜택에 부합. 현재 모든 글에 가상 주식·금융 CTA, 금융 혜택 보장성 문구가 붙음 | `frontend/src/components/blog/blog-conversion-banner.tsx`, `blog-related-ecosystem.tsx` | OPEN; TECH에서는 기술 문서·실습 우선, 과장 수치/미검증 약속 금지 |
| BLOG-P1-12 | P1 | 모바일·자연어/SEO 수용. 현재 한글 고정 하위 카드 다수, 정적 read-time, 사용자 언어별 단위 불일치 | `blog-post-client.tsx`, `blog-related-ecosystem.tsx`, `blog-inline-calculator.tsx` | OPEN; 320/375/768/1024px 시각 QA + KO/EN/JA/ZH 실문장/단위·접근성/구조화데이터 QA |

## 타 브랜치 충돌 회피

- `docs/blog-tech-editorial-v1380-20261027`: **기술기사 상세 편집 품질/출처/깊이** 전담. 이 감사는 이 범위의 중복 코드를 수정하지 않고 교차 기능 수용 기준 및 운영 실증에 집중.
- `auto/hourly-c-blog-editorial-gate-v1102-20261027-1945`: 발행 긴급 차단 **최신 메인에 병합 확인**; 503 차단을 유지하고 새 GREEN 엔진은 별도 DB 계약을 만족한 뒤 구축.
- 다른 개발자/Gemini의 원본 브랜치·워크트리·운영을 변경하지 않음.

## 구현 우선순위 및 수용 계획

1. **v1382.1 P0 운영 격리 증빙:** 운영 발행 API가 403/503인지 인증·스케줄러 테스트 환경에서 검증, 활성 프로세스/쓰기 주체·파일 0664 원인 추적, 이중 워커 재발 차단. 운영 실자료 쓰기 없이 수행.
2. **v1382.2 P0 콘텐츠·출처 QA:** 카테고리별 위젯 allowlist, TECH/FINANCE 별도 구조, 신뢰 출처의 존재/내용/날짜/원문hash/숫자claim 검증, 벤치마크 재현 없으면 차단, 제목/문단·유사도 중복 평가. 기존 211건은 감사 대기열로 두며 자동 삭제 금지.
3. **v1382.3 P0 DB 편집권한:** 검증된 GREEN 저위험 글은 사전 사람승인 없이 원자적 발행, AMBER 사전 인간 검토, RED 차단. 편집자/게시자 역할 분리, 상태·리비전·멱등 영수증/Outbox/철회·정정의 감사; 24h 경과는 알림만, 공개유지.
4. **v1382.4 P1 국가별 독립 SEO:** KR/US/JP/CN의 고유 글·출처·통화·독자 의도; 상호 동등한 언어만 hreflang, 공개/철회/410/noindex/사이트맵/캐시 수용. 실 GSC 키워드·CTR 없으면 `NO_DATA`.
5. **v1382.5 P1 관련성·UI:** 금융 계산기/공식과 실제 연계되는 글에만 계산기, 개발기사엔 실행 가능한 아키텍처/코드/테스트/관찰증거; 모바일·모든 언어·광고 간격/CTA QA. 최신성, 정정일·작성자·AI 도움 표기.
6. **v1382.6 출시 게이트:** source unit/negative ACL, DB 이중발행 충돌, 4개국 독립 기사, SEO canonical/hreflang, 24/48h overdue PUBLIC 유지, 수동 철회 캐시/410, 웹·앱·관리자 로그인/모바일, 재해복구, 정확 SHA 분리 Test 백엔드 작동/CI 통과·백업 확인 후 무중단 운영 승격. 테스트/운영 결과와 발행 건수/GSC 수치는 사실대로 분리 기록.

**미실시:** 인증 운영 관리자 E2E, 전체 모바일 브라우저 실측, 전 출처 외부 원문 검증, DB 마이그레이션, 배포 및 운영 신규 자동 발행. 본 문서는 감사 및 다음 구현 계약이며 완료·배포를 주장하지 않는다.
