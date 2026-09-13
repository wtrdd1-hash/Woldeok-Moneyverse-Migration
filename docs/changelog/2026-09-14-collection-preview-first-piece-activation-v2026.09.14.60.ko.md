# 변경기록 — 컬렉션 프리뷰→첫 조각 활성화 v2026.09.14.60

날짜: 2026-09-14
범위: 소비자 성장 기획만
영문 대응본: `docs/changelog/2026-09-14-collection-preview-first-piece-activation-v2026.09.14.60.md`

## 추가
- 다음 Living 소비자 성장 기획으로 `COLLECTION_PREVIEW_TO_FIRST_PIECE_ACTIVATION_SPEC.ko.md`를 추가했습니다.
- 쇼케이스 이후 성장 문제를 `아티팩트 이해 → 프리뷰 → 내 선택 → 맥락형 가입 → 첫 컬렉션 행동 → D1/D7`로 좁혔습니다.
- 비회원 쇼케이스 수신자의 첫 30초·3분·첫 세션 경험을 정의했습니다.
- 가입을 보상 해금이 아니라 선택·진행의 연속성 저장 단계로 정의했습니다.
- OAuth/로그인, 지갑 조회, 광고 클릭은 activation에서 제외했습니다.
- 1~3분, 5~15분, 30분+ 세션 경험을 정의했습니다.
- D1/D3/D7/D14/D30 컬렉션 연속성·큐레이션 사다리를 추가했습니다.
- 가설·대상·진입점·control/treatment·primary/guardrail·최소 관찰기간·후속행동을 포함한 5개 실험을 추가했습니다.
- share-entry activation/retention/business/trust KPI를 추가했습니다.

## SEO·수익화
- 개인 preview state, draft, 계정/경제/보안 상태는 검색 inventory에서 제외했습니다.
- 충분한 컬렉션 가이드·lore·archive·editorial/public-safe 프로젝트만 색인 후보로 둡니다.
- 첫 가치 증명 뒤에 광고/구독을 배치하고 비-P2W 표현 중심 수익화를 유지합니다.

## 보안·개인정보·악용
- 비공개 데이터 누출, starter-item 피싱/ATO, 다계정/referral farming, open-ended UGC 악용을 High로 기록했습니다.
- public-safe allowlist, 기본 비공개, URL/analytics의 secret/session/recovery 금지, preview/raw signup에 의미 있는 spendable reward 금지, 공식도메인 신호, 첫 pilot의 bounded/preset text를 최소조건으로 기록했습니다.
- personalized public preview, 외부 deep-link 캠페인, 경제적 starter/referral 보상, open-ended public UGC는 별도 개발/보안/fraud/privacy QA가 필요합니다.

## 최신 참고자료
- Discord Profile Widgets(2026-09-08)와 Xbox achievement controls(2026-04-08)의 사용자 선택·표현통제 원칙을 직접 채택했습니다.
- Discord 2026-08-20 discovery/retention 사례를 share open이 아니라 activation/retention으로 평가하는 근거로 사용했습니다.
- Pokémon TCG Pocket community controls는 social collection action을 raw signup 보상보다 이용 성숙 이후에 두는 참고로 사용했습니다.
- Google UGC spam 가이드와 2026-08-28 Site Reputation Policy를 thin/mass personal SEO 방지 guardrail로 반영했습니다.
- FTC 2026 Shutterstock/Publishing.com 집행을 구독·endorsement guardrail로 반영했습니다.
- 개인정보보호위원회 2026-04-01 COPPA 2.0 국외동향은 현행 한국법이 아니라 청소년 privacy/legal 재검토 trigger로 기록했습니다.

## Runtime audit
- 공개 서비스 접근 가능.
- 홈은 지갑·게임·거래소·상점·퀘스트가 먼저 보이고 sponsored advertisement가 여러 곳 존재합니다.
- 월간 공개소식은 아직 준비 중이며 로비는 조용할 수 있습니다.
- 시작 가이드는 여전히 경제/금융 중심 성장서사를 강하게 전면화합니다.
- public collection showcase → preview → first-piece activation 경로는 확인되지 않았습니다.

## 변경하지 않음
- 런타임 코드, DB, API, 인증, 보안 아키텍처, 인프라, 배포 동작은 변경하지 않았습니다.
- 기존 보안·개인정보 경계를 그대로 유지합니다.
- 현재 정책에 따라 별도 문서 PR 없이 main 직접 반영을 전제로 합니다.
