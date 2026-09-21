# Woldeok Moneyverse — AI 시나리오 사용자 신문 명세

> 버전: v2026.09.21.325
> 상태: Living 구현 지향 기획 명세
> 기준일: 2026-09-21
> 상위 문서: `PROJECT_PLAN.ko.md`, `AI_ECONOMY_CONTROLLER_SPEC.ko.md`, `WEEKLY_WORLD_BRIEF_GROWTH_SPEC.ko.md`, `WEEKLY_WORLD_BRIEF_PILOT_SPEC.ko.md`
> 영문 기준 문서: [AI_SCENARIO_USER_NEWSPAPER_SPEC.md](AI_SCENARIO_USER_NEWSPAPER_SPEC.md)

## 1. 목적과 현재 사실

Moneyverse의 기존 AI 주식 뉴스룸은 이미 서버에서 시장상태와 최근 이벤트를 입력으로 받아 한국어 가상시장 뉴스 시나리오를 생성할 수 있다. 현재 구현은 `backend/src/admin/ai-news.service.ts`의 구조화 출력, `AI_NEWS_AUTO_*` 무인 실행 설정, scheduler 연계, 기존 결정론적 market-event 가격 권위를 기반으로 한다.

기존 권위 통합기획서에는 `v2026.09.19.261 — AI 주식 시나리오 자동 생성·게시`가 있으며, 시간별 opt-in 자동 뉴스룸과 bounded auto-publish가 이미 기획되어 있다.

이번 명세의 공백은 **자동생성 그 자체가 아니라 일반 유저가 이를 신문처럼 읽을 수 있는 소비자 제품 계층**이다.

## 2. 제품 약속

사용자는 로그인 여부와 관계없이 공개 허용된 가상시장 사건을 **신문형 지면**으로 읽고, 사건의 맥락·관련 종목·영향 기간·불확실성을 이해할 수 있어야 한다.

이 지면은 실제 투자 뉴스가 아니라 **게임 내 가상기업·가상경제 사건 피드**다. 모든 기사에는 사용자가 실제 금융정보로 오해하지 않도록 game-only 문맥을 유지한다.

## 3. 정보구조

### 3.1 신문 홈

권장 경로:
- `/news` 또는 기존 공개 소식 IA와 충돌하지 않는 canonical route;
- 모바일 우선 단일 컬럼, 데스크톱에서는 대표기사 + 최신기사 + 시장요약의 2~3단 편집 레이아웃;
- 최신 발행시각, AI 생성 표시, game-only 표시를 첫 화면에서 확인 가능.

필수 블록:
1. 오늘의 대표 기사 1개;
2. 최신 AI 시나리오 기사 목록;
3. 현재 진행 중 사건;
4. 최근 종료 사건/후속 기사;
5. 가상시장 요약;
6. 기사 아카이브;
7. 안전한 설명 링크: “이 뉴스가 가격에 어떻게 반영되나요?”

### 3.2 기사 카드

카드에는 최소:
- headline;
- 1~2문장 deck/summary;
- 발행시각;
- 영향 대상 종목 최대 4개;
- 상승/하락/중립 방향;
- 영향 예상기간;
- `AI 생성 가상뉴스` 표시;
- `게임 내 가상시장 정보` 표시;
- 상세기사 CTA.

강도 1/2/3을 사용하더라도 “매수/매도 신호”처럼 보이지 않게 표현한다.

### 3.3 상세 기사

상세 화면은:
- 제목;
- 본문;
- “왜 지금 이 이야기가 나왔는가” 맥락;
- 연결된 이전 기사/진행 사건;
- 영향을 받는 종목과 방향;
- 예상 영향기간;
- 생성시각/발행시각;
- 생성 모델/정책 버전은 관리자 감사용으로 분리하되 사용자에게 AI 생성 사실은 표시;
- 정정/철회 상태;
- 공유 가능한 public-safe URL;
- 관련 기사 2~4개.

## 4. 자동생성·자동발행 계약

### 4.1 생성

기존 AI 뉴스 생성기의 구조화 출력인 `headline`, `body`, `rationale`, `effects[]`, `hours`를 신문 콘텐츠 원천으로 사용한다.

자동 생성 시 다음을 유지한다.
- 정확히 등록된 가상 종목만 참조;
- 최근 진행/종료 사건과 연속성 유지;
- 실제 기업·실제 인물·현실 세계 사건을 기사 소재로 쓰지 않음;
- 최소 1개 moving effect 필요;
- 유효하지 않은 모델 출력은 fail-closed 또는 안전한 정규화;
- 생성 실패가 빈 기사/깨진 기사 공개로 이어지지 않음.

### 4.2 자동발행

기존 `v2026.09.19.261` bounded auto-publish 제한을 그대로 계승한다.
- 전체시장 shock 자동게시 제외;
- strength 3 자동게시 제외;
- 한 기사에서 실제 변동 종목 최대 2개;
- 자동게시 영향기간 최대 24시간;
- credential/감사 actor/안전 후보 부재 시 게시하지 않음.

추가 사용자 신문 게이트:
- 제목/본문 존재;
- 금지어·실제 금융 권유 표현 검사;
- 실제 인물·실제 기업명 탐지;
- 중복/유사기사 억제;
- 같은 종목 연속 과다노출 cooldown;
- AI 생성 및 game-only 표시 강제;
- publish record에 generator version, prompt policy version, source context hash, moderation result, publication actor 저장.

### 4.3 인간 검수

아래는 자동게시 대상이 아니다.
- strength 3;
- 전체시장 충격;
- 24시간 초과 영향;
- 현실 사건과 혼동 가능성이 높은 소재;
- 법률/정책/민감 주제와 유사한 표현;
- 모델 confidence/validator가 임계 미달인 결과;
- 반복 중복 또는 서사 충돌.

관리자는 preview → edit → approve → publish/reject 흐름을 가진다. 사람이 수정한 경우 원문 생성본과 수정본을 모두 감사로그에 보존한다.

## 5. 데이터 모델 제안

기존 AI news/scenario 테이블을 재사용하되 사용자 지면을 위해 다음 publication projection을 둔다.

`AiNewsPublication`
- `id`
- `scenarioId`
- `slug`
- `headline`
- `deck`
- `body`
- `rationalePublic`
- `effectsJson`
- `publishedAt`
- `expiresAt`
- `status: draft|scheduled|published|corrected|retracted|archived`
- `generationMode: manual|ai_manual|ai_auto`
- `aiDisclosure=true`
- `gameOnlyDisclosure=true`
- `generatorVersion`
- `promptPolicyVersion`
- `sourceContextHash`
- `moderationVersion`
- `publishedByActorId`
- `correctedFromId?`

가격권위는 기존 market-event 시스템에 남는다. publication row는 가격을 직접 계산하거나 변경하지 않는다.

## 6. API 계약

공개 읽기:
- `GET /api/news?cursor=&limit=&stock=&status=published`
- `GET /api/news/:slug`
- `GET /api/news/archive?month=YYYY-MM`

관리:
- 기존 AI-news 생성/preview API를 재사용 또는 확장;
- `POST /api/admin/ai-news/:scenarioId/publish`;
- `POST /api/admin/ai-news/:publicationId/correct`;
- `POST /api/admin/ai-news/:publicationId/retract`.

공개 API는 secret, raw prompt, API key, private model error, 관리자 메모, 비공개 사용자정보를 반환하지 않는다.

## 7. UX / 편집 스타일

신문처럼 보이되 실제 언론사 사칭 스타일은 쓰지 않는다.
- masthead는 Moneyverse 고유 브랜드;
- 명확한 날짜·판/edition 표현;
- serif 계열은 제목에 선택적으로 사용할 수 있으나 본문 가독성 우선;
- 모바일 360px에서도 제목·종목·방향·시간이 깨지지 않음;
- 색상만으로 상승/하락을 전달하지 않고 아이콘/텍스트 병행;
- skeleton/error/empty/offline 상태를 명시;
- 무한스크롤만 강제하지 않고 아카이브·페이지네이션 제공.

## 8. 검색/SEO 정책

자동생성된 모든 기사를 무조건 색인하지 않는다.
- 독립적인 사용자 가치와 충분한 맥락이 있는 published 기사만 canonical index 후보;
- thin/중복/짧은 자동생성 변형은 `noindex` 또는 archive-only;
- 대량 페이지 생성으로 검색 노출을 늘리는 목적의 파생 페이지 금지;
- 제목/description은 기사 실제 내용을 반영;
- sitemap에는 공개·검수된 canonical 기사만 포함;
- 삭제/철회 기사는 상태에 맞는 HTTP/robots/canonical 정책 적용.

## 9. 보안·신뢰·컴플라이언스

- 생성형 AI가 만든 기사임을 사용자에게 명확히 표시한다.
- WLD/WDX/가상주식은 virtual/simulated/game-only임을 관련 화면에 표시한다.
- 실제 매수/매도/수익보장/손실회복 권유 문구 금지.
- prompt injection이 가능한 외부 입력을 raw system prompt 권한으로 전달하지 않는다.
- admin RBAC, CSRF, rate-limit, audit, idempotency 유지.
- raw API key와 provider error detail은 공개면으로 누출하지 않는다.
- 정정/철회는 삭제보다 상태변경+감사로그를 우선한다.
- 기사 공유 URL에는 session/recovery/private portfolio 식별자 금지.

## 10. 텔레메트리

최소:
- generated_count;
- auto_publish_eligible_count;
- published_count;
- rejected_count/reason;
- generation_failure_rate;
- duplicate_suppression_rate;
- article_open_rate;
- article_completion proxy;
- related-story continuation;
- archive return rate;
- correction/retraction rate;
- finance-confusion complaint rate;
- AI-disclosure visibility/accessibility checks;
- scenario-to-price-event linkage integrity.

조회수만으로 성공을 판단하지 않는다.

## 11. QA 수용 기준

1. scheduler 자동생성 성공/실패/fail-closed 검증;
2. 안전 후보만 자동게시되는지 검증;
3. 실제 기업/실제 인물/투자권유 문구 차단 테스트;
4. 생성 기사와 market-event 연결 무결성;
5. 공개 API에서 secret/private field 미노출;
6. 모바일/데스크톱/키보드/스크린리더 접근성;
7. 중복 기사/cooldown;
8. 정정/철회/아카이브;
9. SEO canonical/noindex/sitemap;
10. AI 생성 표시 + game-only 표시;
11. exact-SHA Test 환경 회귀;
12. 운영 승격 전 최종 기획 재확인.

## 12. 레퍼런스 조사와 채택

조사일: 2026-09-21.

1. **Reuters Institute, Digital News Report 2026.**
   - 48개 시장에서 소셜/비디오/AI 경유 뉴스 소비가 증가하고, 신뢰·오정보 우려도 함께 커짐.
   - 채택: 모바일 우선, 짧은 카드+상세기사, 명확한 출처/AI 표시, 후속 설명/관련기사.
   - https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026

2. **Reuters Institute — South Korea, Digital News Report 2026.**
   - 한국에서 포털 뉴스 이용 감소와 영상/AI 이용 확대, AI 생성 콘텐츠의 구분 가능성 필요성을 설명.
   - 채택: 한국 사용자에게 AI 생성 사실을 지면에서 즉시 식별 가능하게 함.
   - https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2026/south-korea

3. **Google Search Central — Guidance on generative AI content.**
   - 생성형 AI는 구조화에 유용하지만 사용자 가치 없는 대량생성은 scaled content abuse가 될 수 있음.
   - 채택: 모든 AI 기사를 색인하지 않고 가치·중복·검수 게이트를 통과한 canonical 기사만 색인 후보.
   - https://developers.google.com/search/docs/fundamentals/using-gen-ai-content

4. **Google Search Central — Spam policies / scaled content abuse.**
   - 검색순위 조작 목적의 대량·저가치 자동생성 페이지를 금지.
   - 채택: 종목×시간×방향 조합별 얇은 파생 URL 생성 금지.
   - https://developers.google.com/search/docs/essentials/spam-policies

5. **과학기술정보통신부, 2026-01-21 — 인공지능기본법 시행 안내.**
   - 2026-01-22 시행 및 생성형 AI 결과물 표시 관련 투명성 의무를 안내.
   - 채택: 사용자-facing AI 생성 표시를 제품 요구사항으로 고정.
   - https://www.korea.kr/news/policyNewsView.do?newsId=148958380

6. **개인정보보호위원회, 2026-03-04 — AI 판단과 투명성.**
   - 생성형 AI 분야 개인정보 처리의 투명성 강화를 강조.
   - 채택: 공개 뉴스 생성에 private user state를 사용하지 않고, 생성 provenance와 audit를 저장.
   - https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&nttId=11856

## 13. 구현 우선순위

### P0
- 기존 AI news 자동생성 경로의 실제 scheduler/e2e 검증;
- publication projection/API;
- 사용자 신문 홈/상세;
- AI/game-only 표시;
- bounded auto-publish gate 재사용;
- 정정/철회/감사.

### P1
- 종목 필터/아카이브/관련기사;
- duplicate/cooldown;
- SEO canonical/noindex/sitemap;
- KPI dashboard.

### P2
- edition/주간 digest;
- 개인화는 public-safe/consent 경계가 별도 승인된 뒤 검토.

## 14. 버전 기록

### v2026.09.21.325 — AI 시나리오 사용자 신문
- 기존 자동 AI 주식 시나리오 기획과 실제 `ai-news` 구현 존재를 재확인;
- 일반 유저가 읽는 신문형 홈/기사/아카이브 제품 계약 추가;
- bounded auto-publish를 사용자 발행 게이트로 확장;
- AI 생성·game-only 표시, 정정/철회, provenance/audit 정의;
- SEO 대량생성 방지와 모바일/접근성 요구 추가;
- 2026 Reuters Institute, Google Search Central, 한국 AI 투명성/개인정보 공식 자료 반영.
