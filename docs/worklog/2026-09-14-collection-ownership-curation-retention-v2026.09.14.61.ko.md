# 작업기록 — 컬렉션 소유감→큐레이션 리텐션 v2026.09.14.61

날짜: 2026-09-14
범위: 소비자 획득/활성화/리텐션/바이럴/브랜드/콘텐츠/SEO/수익화 기획만

## main 및 문서 확인
- 작업 시작 시 `main`: `748fb3519430bd2bbe3f43793c68ee926d14c30b`.
- 문서 작성 직전 `main` 재확인: `748fb3519430bd2bbe3f43793c68ee926d14c30b`; 동시 변경 없음.
- `PROJECT_PLAN.md`의 최신 auth/session/RBAC/ledger/ads/privacy/search 경계를 확인했습니다.
- `PRODUCT_GROWTH_PLAN.md`를 확인했습니다.
- `COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.md` v2026.09.14.60을 확인했습니다.
- `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, 특히 Acquire → Understand → Complete → Curate → Reinterpret 루프를 확인했습니다.
- 현재 planning 검색 결과에서 collection/showcase/season/economy 관련 문맥을 교차확인했습니다.

## 선택한 가장 큰 공백
직전 회차는 첫 owned collection state를 정의했습니다. 남은 공백은 그 상태가 또 다른 보상/체크리스트 없이도 D1/D7의 자발적 소유감 리텐션을 만드는지 여부입니다.

결정:
`첫 의미 컬렉션 상태 → D1 인식 → D3 같은 스레드 심화 → D7 진전 증명 → 큐레이션 → D30 durable chapter`.

## Runtime Product Reality Audit
2026-09-14 공개 런타임 접근 가능.

관찰:
- 홈은 game-only WLD 고지를 반복 표시;
- 빠른 바로가기는 지갑, 게임, 거래소, 상점, 퀘스트 중심;
- sponsored advertisement placement가 여러 곳 존재;
- 월간 운영소식은 아직 준비 중;
- 로비는 조용하게 보일 수 있음;
- `/guide`는 여전히 경제/금융 중심이며 예금, 국채, 대출, 주식 시세차익/배당, passive income, 사업, 카지노를 크게 다룸;
- `/announcements`는 접근 가능하지만 성숙한 반복콘텐츠/컬렉션 경로는 없음;
- public first-piece → D1 recognition → D7 curation 여정은 확인되지 않음.

Runtime verification 상태: **가능**.

## 최신 외부 조사
최근 12개월 내 공식/최신 자료를 우선했습니다.

직접채택:
1. Supercell `New Collection Levels & Mastery Changes`, 2026-05-13 — 모든 컬렉션 업그레이드가 의미 있고 다음 진전이 명확해야 함.
2. FIFA Collect `Dynamic Collectibles`, 2026-06-26 — collectible이 이벤트와 함께 변하며 살아 있는 역사 기록이 될 수 있음.
3. Discord Profile Widgets FAQ, 2026-09-08 업데이트 — 사용자가 무엇을 보여줄지 선택·재배치·삭제 가능.
4. Xbox Wire Achievement improvements, 2026-04-08 — completion은 축하하되 profile visibility는 사용자가 통제.

가드레일/참고:
5. Google Search Central UGC spam 가이드 — abuse policy, 신고, spam account 탐지, 저신뢰/신규 콘텐츠 `noindex` 고려.
6. FTC Shutterstock 합의, 2026-05-13 — 중요조건 명확화, express informed consent, 쉬운 해지.
7. FTC Genesis Tech 사건, 2026-06 — 숨은 반복결제조건, 무단청구, 해지방해가 계속 집행 이슈임.
8. 개인정보보호위원회 COPPA 2.0 국외동향, 2026-04-01 — 청소년 privacy/targeted-ad 강화 동향을 출시 시 재검토 trigger로 사용하며 현행 한국법으로 취급하지 않음.

## 기획 변경
- D1은 novelty보다 recognition을 먼저 보여주도록 정의했습니다.
- D3는 전체 경제 cross-sell이 아니라 인접 심화 경로 하나로 정의했습니다.
- D7은 `그때 → 지금 → 다음`과 첫 자기주도 큐레이션 행동으로 정의했습니다.
- 7단계 ownership ladder를 추가했습니다.
- D14 authored display, D30 durable chapter를 추가했습니다.
- complete / learn / curate / display intention cohort를 추가했습니다.
- 5개 통제 실험과 관찰기간을 추가했습니다.
- collection-specific retention, long-term, business, trust KPI를 추가했습니다.
- 수익화는 attachment 이후 value-first로 유지했습니다.
- 개인/비공개 collection state는 mass SEO 색인에서 제외했습니다.

## 보안·악용·개인정보 검토
High 위험:
1. personalized collection continuity에서 private inventory/economy/security state 누출;
2. collection-progress phishing/ATO;
3. 다계정/bot prestige·reward farming;
4. public annotation/exhibit의 doxxing, 사칭, 악성링크, 괴롭힘.

최소 보호조건:
- public-safe allowlist;
- personalized state 기본 비공개;
- 명시적 공개선택;
- URL/analytics/share payload에 secret/session/recovery 금지;
- raw view/share/open에 의미 있는 WLD/WDX 지급 금지;
- 공식 도메인 일관성;
- 첫 public-UGC pilot의 bounded/preset text;
- 신고/삭제와 external-link policy.

personalized public continuity, push/deep-link messaging, public prestige, open-ended public annotation 전 별도 개발/보안/fraud/privacy QA가 필요합니다. 이번 회차에서 보안 코드는 변경하지 않았습니다.

## 추가 파일
- `docs/planning/COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.md`
- `docs/planning/COLLECTION_OWNERSHIP_TO_CURATION_RETENTION_SPEC.ko.md`
- `docs/changelog/2026-09-14-collection-ownership-curation-retention-v2026.09.14.61.md`
- `docs/changelog/2026-09-14-collection-ownership-curation-retention-v2026.09.14.61.ko.md`
- `docs/worklog/2026-09-14-collection-ownership-curation-retention-v2026.09.14.61.md`
- `docs/worklog/2026-09-14-collection-ownership-curation-retention-v2026.09.14.61.ko.md`

## 변경하지 않음
런타임 코드, DB, API, 인증, 인프라, 보안코드, 배포설정은 변경하지 않았습니다. 기존 auth/session/RBAC/ledger/privacy/ad 경계를 유지합니다.

## 반영/배포 정책
문서-only 변경입니다. 현재 사용자 지시에 따라 문서 PR을 만들지 않고 최종 current-`main` 재확인 후 문서 커밋을 `main`에 직접 반영합니다. 문서 변경 자체에는 Test/Production 배포가 필요하지 않습니다.