# 작업기록 — 장기 열망·정체성 성장 v2026.09.13.31

기준일: 2026-09-13
저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
범위: 소비자 성장 기획만 수행
변경 유형: 문서-only
브랜치/PR: 없음. 현재 문서 운영정책에 따라 최신 `main` 직접 반영
테스트 서버: 문서-only 변경이므로 불필요

## 검토 기준선

작업 시작 `main`: `6b6156f99eaf1a00b9c38e70b4404da49571e81a`.

다시 읽거나 확인한 문서:
- `docs/planning/PROJECT_PLAN.md`;
- `docs/planning/PRODUCT_GROWTH_PLAN.md`;
- `CONTENT_TO_HABIT_GROWTH_LOOP_SPEC.md` v2026.09.13.30;
- `RETENTION_RETURN_LADDER_GROWTH_SPEC.md`;
- `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`;
- `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`;
- 시즌/경제/수익화/보안 관련 최신 기획 및 최근 성장 worklog.

현재 지시를 준수하여 신규 DB 스키마, API 계약, 인증 구현, migration, backend 아키텍처, scheduler, state machine, 관리자 API 상세를 확장하지 않았다.

## 공백 분석

기존 성장 스택은 acquisition, 가입 전 가치, 첫 세션 이어가기, D1/D3/D7/D14/D30 복귀 이유, 소셜 공유, 반복 브랜드 콘텐츠까지 답하고 있다. 가장 큰 남은 문제는 D30 이후의 장기 애착이었다.

컬렉션, 개인공간, 직업, 사업, 시즌, 클럽/도시 프로젝트, 박물관, 아카이브, 복원, 각인, 프레스티지 같은 재료는 이미 존재했지만 하나의 소비자 열망 시스템으로 연결되지 않았다.

이번에 선택한 공백: **사용자가 몇 달 동안 무엇을 만들고 어떤 역사/정체성을 남기기 위해 계속하는가.**

## 기획 결정

영문 canonical과 한국어 대응 `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC` v2026.09.13.31 추가.

핵심 사다리:
`첫 의미있는 기억 → 선택한 정체성 → 눈에 보이는 축적물 → 큐레이션 → 공동체 기여 → 시즌 역사 → 프레스티지/유산 → 새 장`

핵심 소비자 원칙:
- 순자산 숫자 상승보다 장기 의미;
- 끝없는 재고축적보다 역사와 큐레이션;
- 재산 리더보드 압박보다 자기표현;
- 징벌적 FOMO 없는 영구 시즌 기억;
- 강제 자산제거보다 자발적 프레스티지/공간/수집 소비;
- pay-to-prestige 금지;
- 쉬었다 돌아와도 복귀 가능한 기존 원칙 유지.

## 최신 조사 — 2026-09-13

직접채택/방향 근거:
1. Spotify 2025 Wrapped 사용자 경험 (2025-12-03) — 개인 역사를 재방문·공유 가능한 스토리로 만드는 패턴.
2. Spotify Q4 2025 업데이트 (2026-02-10) — Wrapped 참여 3억 명+, 소셜 공유 6억3천만 회+ 보고. Moneyverse 예상치로 쓰지 않고 방향 근거로만 사용.
3. PlayStation 2025 Wrap-Up (2025-12-09) — 개인 역사·성과·마일스톤과 작은 기념 아바타 결합.
4. Spotify Wrapped Clubs (2025-12-03) — 활동 역사를 놀이형 정체성/역할로 변환. 고위험 불투명 프로파일링은 채택하지 않음.
5. Google Search Central people-first content — 독창적·유용·신뢰 가능한 콘텐츠 우선, 금융 인접 주제에서 신뢰 중요.
6. Naver Search Advisor 최신 콘텐츠/스팸 가이드 — 사용자 가치 우선, 얇은 대량생성·오해유발·피싱형 콘텐츠 배제.
7. FTC Shutterstock 구독 집행 (2026-05) — 명확한 조건, informed consent, 단순 해지를 구독 신뢰조건으로 반영.

참고만:
- 소셜 비교/파티형 회고는 개인역사가 소셜 경험이 될 수 있다는 근거지만 Moneyverse 리텐션에 라이브 경쟁·공개비교를 필수로 두지 않는다.

## 퍼널/KPI 변경

확장 퍼널:
`activation → D7 정체성 신호 → D30 열망 선택 → D60/D90 이어가기 → 다중시즌 역사 → 회고/공유 → 복귀/유입 → contribution margin`

추가/강화:
- 열망 선택 및 이어가기율;
- 표본이 허용될 때 D60/D90/다중시즌 리텐션;
- 아카이브/회고 재방문;
- 컬렉션 큐레이션율;
- 공간 재설계/재방문;
- 반복 클럽/도시 기여;
- retained user 공유, 회고 수신자 activation→D7;
- 열망 코호트별 D30/D90 LTV;
- public/private 노출, prestige fraud, privacy, ATO, subscription cancellation guardrail.

## 실험 backlog

1. 장기열망 선택 vs 일반 next action.
2. 큐레이션 스토리 회고 vs 활동량 통계 회고.
3. 컬렉션 완성 → 큐레이션 목표 vs 다음 획득 유도.
4. 영구 시즌 아카이브 프레이밍 vs 강한 만료보상 메시지.
5. 반복가치 형성 후 구독 제안 vs 조기 구독 제안.

모든 실험은 클릭/세션 수만이 아니라 downstream retention과 신뢰 guardrail을 함께 본다.

## 보안·악용·개인정보 검토

High:
- 공개 아카이브/프로필 정보누출;
- 봇/담합/다계정 프레스티지·공동체 조작;
- 회고/공유 피싱 및 사칭.

Medium:
- 장기 행동 프로파일링과 광고도구 과수집;
- 공개 UGC 확대 시 괴롭힘/doxxing/악성링크.

최소 기획조건:
- 명시적 opt-in, public-safe 필드만 공개;
- 공개물에 보안/복구/모더레이션/비공개 자산정보 금지;
- raw view/share/rank에 의미 있는 WLD/WDX 보상 금지;
- 명확한 1st-party 브랜드, secret 포함 공유 URL 금지;
- 개인화 공개면, 물질적 프레스티지 보상, 새 share/deep-link 인증 흐름 전 별도 개발·보안 QA.

기존 인증·세션·RBAC·원장·경제·개인정보·보안 경계는 그대로 유지. 보안 코드 변경 없음.

## SEO·바이럴·수익화

SEO:
- 충분한 시즌 아카이브/lore/가상기업 역사/교육/opt-in 쇼케이스는 색인 후보;
- 얇은 자동생성 회고카드·비공개 자산·referral 페이지 대량색인 금지.

바이럴:
- 추천보상보다 정체성/역사 산출물이 먼저 공유 이유를 만들게 한다.

수익:
- 비-P2W 아카이브/박물관/공간/표현 코스메틱과 반복가치 이후 광고제거 구독;
- WDX·대출·랭킹·모더레이션·경제 우위를 프레스티지 상품으로 판매하지 않음;
- 구독 해지 방해를 retention 전략으로 인정하지 않음.

## 법률·정책

- WLD/WDX는 계속 virtual/simulated/game-only.
- 실제 투자·예금·증권·현금환전·수익보장 암시 없음.
- 스폰서/크리에이터 이해관계는 명시.
- 공개 UGC 확대, 경제가치 prestige/referral, 맞춤광고, 신규 추적업체, 미성년자 타기팅은 별도 privacy/legal/trust review.
- 미국 negative-option/구독 정책이 변동 중이므로 중대한 구독 변경은 출시 시점 법률검토 필요.

## Runtime reality

`https://easy-scraping.com`은 HTTP 530. `runtime verification unavailable`로 기록.

아카이브, 회고, 박물관, 프레스티지, 공개 쇼케이스가 운영에 구현되어 있다고 주장하지 않는다.

## main 동시변경 확인

문서 쓰기 직전 `main`은 `6b6156f99eaf1a00b9c38e70b4404da49571e81a`였고 작업 시작 시점과 동일했다. 문서 반영을 무효화하는 외부 동시변경은 쓰기 시작 시점에 없었다.

모든 문서 생성 후 `main`을 다시 읽어 최종 SHA를 완료보고에 남긴다.

## 다음 성장 우선순위

소비자에게 보이는 **My Moneyverse 관계 모델**을 설계하여 D7, D30, 다중시즌 복귀에 보여줄 의미있는 정체성 신호를 2~3개로 제한한다. 허영지표 프로필·공개 재산리더보드·pay-to-prestige는 만들지 않는다.
