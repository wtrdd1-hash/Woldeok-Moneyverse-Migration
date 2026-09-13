# 작업일지 — 컬렉션 쇼케이스 바이럴 웨지 v2026.09.14.59

날짜: 2026-09-14
범위: 문서-only 소비자 성장 기획
영문 대응본: `docs/worklog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.md`

## 검토한 입력
- 작업 시작 전 최신 `main`: `7c2f8bc265ec17172532cc36ad586a3491913bc3`
- `PROJECT_PLAN.md` Living Project Plan
- `PRODUCT_GROWTH_PLAN.md`
- `ARTIFACT_TO_RECIPIENT_VIRAL_GROWTH_SPEC.md`를 포함한 최신 바이럴·리텐션·정체성·수익화 기획
- 현재 인증/세션 경계를 우회하지 않도록 최신 모바일 OAuth 변경
- 실제 공개 홈·운영소식·시작 가이드
- 정체성 표현, 발견, 가짜 사회적 증거, 대가성 공유, 청소년 개인정보에 관한 최신 Google·Discord·Xbox·FTC·개인정보보호위원회 자료

## 중간 main 재확인
문서 작성 직전 `main`을 다시 확인했고 `7c2f8bc265ec17172532cc36ad586a3491913bc3` 그대로였습니다. 직전 `v2026.09.14.58` 성장문서와 이후 모바일 OAuth 브라우저 handoff merge를 모두 보존했습니다. 이 시점에는 조정해야 할 동시 변경이 없었습니다.

## 선택한 공백
직전 회차는 넓은 artifact-to-recipient 바이럴 계약을 만들었습니다. 다음 가장 큰 공백은 **선택 리스크**였습니다. 공유 후보가 여러 개인데 실제로 사용자 자부심→수신자 activation→D7까지 좁게 검증할 첫 아티팩트가 정해져 있지 않았습니다.

결정: 첫 후보를 **큐레이션 컬렉션 쇼케이스**로 정했습니다. 완성·취향·정체성·장기 큐레이션을 연결하면서 잔액·포트폴리오 수익률·대출·카지노 결과를 기본 공개하지 않을 수 있기 때문입니다.

## 문서화한 소비자 기획
- `컬렉션 milestone → 큐레이션 쇼케이스 → 수신자 이해 → starter 탐색 → 필요 시 가입 → 컬렉션 activation → D1/D7 → 자기 쇼케이스`로 바이럴 루프를 좁힘
- 수신자 첫 30초·3분·첫 세션 계약 정의
- share-entry cohort의 D1/D3/D7/D14/D30 연결
- 얇은 개인카드와 충분한 collection/lore/archive 페이지의 SEO 공개범위 분리
- 가치 경험 이후 비-P2W 표현 중심 수익화
- 신뢰·악용 guardrail이 붙은 5개 실험
- 쇼케이스 생성부터 2세대 공유, retention-adjusted contribution까지 KPI 연결

## Runtime 확인
공개 서비스 접근이 가능했습니다.
- 홈은 WLD/보상이 game-only 가상 데이터임을 명확히 고지
- 지갑·미니게임·거래소·상점·퀘스트·로비·온보딩 링크 제공
- sponsored advertisement가 여러 영역에 이미 존재
- 월간 공개소식은 여전히 준비/비어 있음
- 로비는 조용하거나 비어 보일 수 있음
- 시작 가이드는 여전히 복리예금·국채·대출·주식 시세차익/배당·패시브소득·자산 중심 “대표 자본가” 성장서사를 전면화

따라서 첫 바이럴 웨지는 wealth/status artifact보다 저위험 identity artifact가 적합하다는 판단을 강화했습니다.

## 최신 참고자료
- **Discord Profile Widgets FAQ — 2026-09-08 — 직접채택:** 사용자가 위젯을 선택·재배치·삭제하는 구조를 member-authored curation 원칙에 반영
- **Xbox Achievement 개선 — 2026-04-08 — 직접채택:** 프로필 기록 숨김과 100% 완료 강조를 completion celebration + 사용자 통제 원칙에 반영
- **Xbox X25 커뮤니티 디자인 — 2026-08-24 — 참고:** wealth ranking 없이도 커뮤니티 정체성이 브랜드/콘텐츠 자산이 될 수 있음
- **Google Search profiles — 2026-06-04 — 참고:** 큐레이션된 shareable identity가 발견→반복관심을 연결할 수 있음
- **Google Site Reputation Policy — 2026-08-28 — 직접 guardrail:** 호스트 권위를 이용한 얇은 사용자 페이지 대량생성 금지
- **Spotify artist identity transparency — 2026-08-11 — 참고:** public identity에는 출처/신뢰 cue가 필요
- **FTC Publishing.com final order — 2026-07 — 직접 guardrail:** 수익 주장은 근거가 필요하고 인센티브/이해관계를 숨기면 안 됨
- **FTC Consumer Reviews/Testimonial Rule — 현행 — 직접 guardrail:** 가짜 영향력 및 특정 긍정 감정 조건 인센티브 금지
- **개인정보보호위원회 COPPA 2.0 국외동향 — 2026-04-01 — 참고/법률 재검토 trigger:** 현행 한국법으로 취급하지 않고 청소년 개인화·광고를 보수적으로 유지하는 근거로만 사용

## 보안·악용 검토
High:
1. 쇼케이스를 통한 공개/비공개 정보 누출
2. 쇼케이스/보상 페이지를 복제한 피싱·ATO
3. 봇/다계정의 조회·공유·prestige 조작
4. UGC 사칭·악성링크·doxxing

최소조건: public-safe allowlist, 기본 비공개, 공개 전 사용자 preview, URL/analytics에 secret/session/recovery 금지, raw 조회·공유·가입에 spendable reward 금지, 공식도메인 식별, 신고/삭제, 첫 pilot에서는 제한 텍스트/preset 우선.

개인화 public showcase, 자유 텍스트 caption, 외부 deep-link, 경제적 referral reward, 대규모 public UGC discovery 구현 전에는 별도 개발/보안/fraud/privacy QA가 필요합니다.

## 준비한 파일
- `docs/planning/COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.md`
- `docs/planning/COLLECTION_SHOWCASE_VIRAL_WEDGE_SPEC.ko.md`
- `docs/changelog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.md`
- `docs/changelog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.ko.md`
- `docs/worklog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.md`
- `docs/worklog/2026-09-14-collection-showcase-viral-wedge-v2026.09.14.59.ko.md`

## 제외 범위
런타임, DB, API, 인증, 보안 코드, 인프라, 배포는 변경하지 않았습니다.
