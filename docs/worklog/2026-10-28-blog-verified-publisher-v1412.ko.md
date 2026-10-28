# v2026.10.28.1412 — 국가별 2시간 AI 블로그 실제 자동 발행기

## 작업 전
- 사용자 `구현래` 지시: 승인한 KR/US/JP/CN 2시간 경제·코딩·컴퓨터 순환을 실제 작성·독립검증·공개·관리자 수동 철회 가능한 게시 기능으로 구현. 별도 v1412 브랜치 생성. 시작 main b1cd54fda, 기준 통합 v1410 SHA 6ef79f56; 기존 PR #1644 병행 보존. 작업 중 메인 재조회.
- 통합 마스터 영/한, v1405 정책, 코드, AGENTS, DB 마이그레이션·릴리스 가이드 확인. 기존 사용자 철회 199편 복원 금지. 사람 사전/사후 검토 불필요, 시간 경과 자동 철회 금지. AI 원고에는 미검증 시세/현재 세제/임의 연구/수익 보장 금지, Google 광고 무검토 본문에는 OFF.
- 이전 소스 제약: v1410 `blog.rotation_2h`는 SKIP, 구형 Next JSON `/api/blog/generate` 503, `getAllBlogPosts`는 공유 JSON의 기존 글만 읽음, `isBlogDiscoverable`는 AI 생성 전부 숨김. 신규 공개는 반드시 DB 멱등 영수증과 독립 원어·공식 출처 검증을 요구. 공개/관리자 시스템은 인증·CSRF·감사 보존.
- 현재 Production 실제 3343 DB `woldeok_moneyverse_dev` 금융 DML 3개 때문에 BLOCKED, Test 공인 외부 업스트림 3363/3389와 test-main 불일치. 개발 코드 작성이 운영 배포 완료를 뜻하지 않음.

## 중간 기록: 실제 구현
- 백엔드 src/blog-editorial 새 파일: 국가·주제별 고정 공식 출처 URL을 HTTPS 직접 조회(리다이렉트/오류/본문 부족 차단) 및 SHA-256 영수증화, Ollama 로컬 원어 JSON 작성, 국가별 한글/영어/일본어/중국어 문자 수·본문 길이·인용 URL/미확인 수치/허위 수익 주장·SHA 중복 차단, 기존 단일리더 2시간 스케줄러에 연결. 재시작 중 해당 slot 존재 시 재작성·복구 금지. 검증 실패 시 게시 함수 호출 없음.
- DB: 별도 `blog_verified_articles`/불변 감사 테이블, 기간키 단일 게시 receipt 및 고유 content digest, SECURITY DEFINER 게시 함수 앱 역할에만 실행 허용, 직접 테이블 DML 불허. 관리자만 기존 세션·권한·CSRF 및 DB `admin_current_roles` 검사 뒤 `REVISE|WITHDRAW|DELETE` 실행, 실행 감사 기록. 기한 자동 비공개 없음. 기존 사용자 철회 199편 JSON 파일 건드리지 않음.
- 프론트: 읽기 전용 `BLOG_API_ORIGIN` 서버 변수로 새 DB API 수신, 문서 정규 slug, 국가별 원어 hreflang, 공개글/상세 API와 sitemap 등록. `verificationReceipt` 없는 기존 AI 글 계속 미노출, 무검토 신규 AI 글 광고 배너 OFF.
- 개발 소스: 프론트 전수 1,690/1,690 PASS, 백엔드 1,701 PASS/430 환경 의존 SKIP, DB 단위 38 PASS, 전체 TS·Next/Nest build·eslint 0 errors(1,109 warnings) PASS. 모델·공식 HTTPS 엔드포인트 작동은 미니PC에서 확인했지만 모든 4국가 콘텐츠가 검증/공개되었다는 뜻이 아님.

## 중간 메인 재조회/동시개발 충돌 대응
- 2026-10-28 KST 09:05 최신 origin/main이 b1cd54fda에서 `f396d009f41f421ca38f93ef2e7f8d26960dcae2`로 변경됨. 다른 에이전트의 286-privacy, 287-stock SQL이 메인에 새로 도입되어 처음 작성한 블로그 287~289와 충돌. **블로그 SQL을 288~290으로 번호 재배치하고 본 v1412 구현만 최신 메인으로 이식**. 구 v1410 finance 286은 PR #1644의 별도 독립 작업으로 보존하며 사용자의 이번 블로그 구현 PR에 중복 포함하지 않음. 이전 메인 기준 parity 오류는 이 충돌에서 발생하므로 최신 메인 병합 뒤 재검증해야 함.
- Test/Production DB에는 신규 SQL 미적용, scheduler flag 기본 OFF, `BLOG_API_ORIGIN` 아직 운영 연결되지 않음. 코드 구현을 실제 운영 자동 게시 성공이라고 보고하지 않음.
