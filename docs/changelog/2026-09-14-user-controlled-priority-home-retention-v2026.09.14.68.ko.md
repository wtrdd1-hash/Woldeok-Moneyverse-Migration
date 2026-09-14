# 변경 기록 — v2026.09.14.68 사용자 통제형 우선순위 홈·리텐션

기준일: 2026-09-14
변경 유형: 문서 전용
런타임/코드 변경: 없음

## 추가
- `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md`와 한국어 대응본 추가.
- 다음 retained-quality loop를 `meaningful choice → priority 1~3개 pin → D1 recognition → D3 progress → D7 outcome → 재선택 → D30 durable record`로 정의.
- pin/unpin/reorder/pause 같은 명시적 사용자 통제를 우선 개인화 모델로 추가.
- 생애주기, 짧은/중간/긴 세션, 유입→priority activation continuity, season, SEO 경계, retention-safe monetization을 정리.
- D1 exact-priority continuation, D7 priority outcome, D30 durable record 중심 실험/KPI 추가.
- sensitive inference, phishing/ATO, finance-like manipulation, 다계정 farming, personalization data overcollection 보안·개인정보 검토 추가.

## 채택한 최신 자료
- Meta/Threads `Your Algo` (2026-06-16/17): topic preference와 기간의 private 사용자 통제.
- Xbox April Update (2026-04-30): Home에 최대 3개 favorite pin.
- Discord Profile Widgets (2026-09-08 갱신): 관심모듈 add/reorder/remove.
- 개인정보위 TikTok·Apple 제재 요약 (2026-07-27): behavioral data 활용의 적법근거/privacy guardrail.
- FTC personalized-pricing policy statement 제안 (2026-08-19): 확정 보편금지가 아닌 의견수렴 중 정책임을 명확히 하고 제품 guardrail로만 채택.

## Runtime audit
- Production 접근 가능.
- 홈은 지갑/미니게임/거래소/상점/퀘스트와 여러 광고를 여전히 전면 배치.
- 운영/월간 소식은 여전히 준비 중.
- 시작가이드는 finance/wealth 중심.
- user-controlled persistent priority는 실제 동작으로 확인되지 않아 기획 가설로 기록.

## 저장소 정책
- 문서 tree 생성 직전 최신 `main` 재확인.
- DB/API/auth/security architecture/migration/state machine/scheduler/admin API 확대 없음.
- 런타임/인프라/보안코드 변경 없음.