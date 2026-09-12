# 월덕 머니버스 — 수익화·한국/미국 준수·검색 성장 명세

> 버전: v2026.09.12.27
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-12
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> 영문 기준 문서: [MONETIZATION_COMPLIANCE_SEO_SPEC.md](MONETIZATION_COMPLIANCE_SEO_SPEC.md)

## 1. 목적

이 문서는 수익화, 한국/미국 규제 준수, 개인정보, 광고, 검색 유입을 출시 직전 부가작업이 아니라 제품의 핵심 요구사항으로 만든다.

목표는 가상경제 서비스의 수익성을 확보하면서 금융상품 오인, 기만광고, 다크패턴, 불명확한 구독조건, 불필요한 개인정보 처리, 검색 스팸을 만들지 않는 것이다.

이 문서는 제품/개발 명세이며 법률자문이 아니다. 국가별 해석이 필요한 항목은 `legal review required`로 표시하고, 검토가 끝나기 전 해당 기능의 상용 출시를 차단한다.

## 2. 제품 분류와 필수 고지

Moneyverse는 가상 게임/커뮤니티 경제 서비스로 유지한다.

- WLD는 현금 상환이 보장되지 않는 서비스 내부 가상재화다.
- WDX는 허구/시뮬레이션 게임 종목이며 실제 증권 또는 투자상품이 아니다.
- 은행, 대출, 사업, 시장 기능은 게임 시스템이며 예금·신용·브로커리지·투자자문이 아니다.
- 보상은 현실 수익을 보장하는 것처럼 표현하지 않는다.
- 광고주가 WDX 가격, 순위 또는 사용자 경제성과를 움직일 수 있다는 인상을 주지 않는다.

필수 고지군:

- `게임 전용 가상재화이며 현금 환전이 보장되지 않습니다.`
- `가상 시장 시뮬레이션이며 실제 증권 또는 투자상품이 아닙니다.`
- `게임플레이 및 학습용이며 투자수익을 보장하지 않습니다.`

화면별 문구는 달라도 되지만 영문/한국어에서 의미는 동일해야 한다.

## 3. 수익화 포트폴리오

Moneyverse는 하나의 수익원에만 의존하지 않는다.

### 3.1 P0 수익 채널

1. **공개 콘텐츠 디스플레이 광고**
   - 허용된 저위험 공개 페이지에서만 노출;
   - 핵심 콘텐츠 및 조작 버튼과 명확히 분리;
   - 로그인, 지갑, 송금, 대출, WDX 주문, 민감 계정, 관리자, 오류/점검 화면에는 광고 금지.

2. **네이티브 스폰서 모듈**
   - `광고`, `스폰서`, `Advertisement`, `Sponsored` 등 명확한 표기;
   - 고지는 푸터가 아니라 광고 모듈 가까이에 표시;
   - 스폰서 콘텐츠를 Moneyverse의 중립 분석처럼 위장하지 않는다.

3. **광고 제거 구독**
   - 광고를 제거한다;
   - 편의/표현 기능은 제공할 수 있으나 WLD 수익, WDX 체결우위, 대출 우대, 랭킹점수, 확률상 이점은 제공하지 않는다.

4. **비-P2W 꾸미기·정체성 상품**
   - 프로필, 프레임, 이름표, 대시보드 테마, 방/오피스 꾸미기, 클럽 시각효과, 아카이브 표현, 시즌 외형 상품;
   - 실제결제 상품과 WLD sink 상품은 회계·상품 도메인을 분리한다.

### 3.2 P1 수익 채널

- 스폰서 시즌 외형 테마;
- 스폰서 표시가 명확한 교육/세계관 이벤트;
- 경쟁성과 분리된 도시/커뮤니티 B2B/B2B2C 후원;
- 핵심 계정정보를 유료벽 뒤에 숨기지 않는 선택형 아카이브/내보내기/표현 편의 기능.

### 3.3 금지 수익화

다음은 판매하지 않는다.

- WDX 가격 영향력;
- 랭킹/리그 점수 우위;
- 숨은 확률 또는 유료 확률 상승;
- 모더레이션 제재 삭제;
- 돈을 내면 신고가 빨라지는 기능;
- 비구매자에게 없는 중대한 시장정보;
- 금융 유사 핵심 행동을 완료하기 위한 강제 광고 클릭;
- 별도 법률/제품 검토 없는 현금화·현금성 교환·외부 경품 루프;
- 가짜 희소성과 조작된 카운트다운.

## 4. 수익 KPI

수익성과 사용자 피해 지표를 함께 본다.

최소 지표:

- DAU / WAU / MAU;
- ARPDAU / ARPU;
- 활성사용자당 광고노출;
- eCPM, fill rate, viewability, CTR;
- 광고 후 세션 이탈률;
- 구독 전환율과 해지율;
- 코호트/유입별 결제전환;
- 총매출, 결제수수료, 환불/차지백 비용;
- 활성사용자당 인프라비와 운영/모더레이션 비용;
- 콘텐츠 제작비;
- contribution margin;
- 채널별 LTV/CAC;
- 유료 유입 7/30/90일 회수기간;
- 광고 숨김/신고율과 민원율;
- 광고량 코호트별 리텐션.

CTR이나 광고노출만 단독 최적화하지 않는다. D1/D7 리텐션, 페이지 성능, Core Web Vitals, 오클릭 민원, 지원부담, 신뢰지표를 guardrail로 둔다.

## 5. 광고 인벤토리 정책

### 허용 후보

- 공개 홈/랜딩의 핵심 제품 설명 이후;
- 공개 가이드/교육 콘텐츠;
- 공개 가상기업 세계관 페이지;
- 공개 시즌 안내;
- UGC와 광고가 분명히 구분되는 공개 커뮤니티 목록;
- 주요 행동을 방해하지 않는 하단/섹션 사이 영역.

### 금지 영역

- 로그인/OAuth 콜백;
- 온보딩 의사결정 단계;
- 지갑/원장;
- 송금;
- 은행·대출 신청/상환/곤란지원 화면;
- WDX 매수/매도/주문확인;
- 포트폴리오 의사결정 CTA;
- 카지노/확률형 플레이;
- 관리자;
- 보안/세션 설정;
- 법적 동의 화면;
- 오류/오프라인/점검/결제실패 화면.

각 슬롯은 `slot_code`, 허용 route, breakpoint, 크기, 광고표시, CLS 예산, 동의의존성, contextual/personalized 모드, no-fill 처리, 분석이벤트, 접근성 label, 정책 owner, emergency disable을 갖는다.

## 6. 구독 UX

광고제거/편의 구독을 출시할 경우:

- 결제 전 총 정기요금과 주기를 보여준다;
- 세금 포함/추가 여부를 표시한다;
- 자동갱신을 명시한다;
- 무료체험이 있으면 유료전환 날짜와 금액을 표시한다;
- 청구 전에 명시적 동의를 얻는다;
- 계정 설정에서 단순한 해지 경로를 제공한다;
- 해지완료 및 효력발생일을 표시한다;
- 동의/약관/가격 버전을 저장한다;
- 중요한 가격·조건 변경은 필요한 고지를 수행한다;
- 유료 옵션을 미리 체크하지 않는다;
- 가입보다 해지를 의도적으로 어렵게 만들지 않는다.

권장 테이블: `subscription_plans`, `subscription_price_versions`, `user_subscriptions`, `subscription_consents`, `subscription_events`, `refund_requests`.

## 7. 한국 준수 요구

### 개인정보와 맞춤형 광고

한국 사용자의 맞춤형 광고/프로파일링은 개인정보보호법과 개인정보위 최신 가이드를 확인한 뒤 켠다.

초기 출시 기본값:

- contextual/non-personalized 광고 우선;
- personalized 광고는 별도 승인 feature flag 뒤에 둔다;
- 데이터 종류, 목적, 동의/처리 근거, 보유기간, 처리자/제공자, 거부권을 문서화한다;
- 광고수익을 위해 정밀·민감 행동정보를 불필요하게 수집하지 않는다;
- 민감특성을 추론하여 타게팅하지 않는다;
- 삭제/철회 경로를 실제 데이터구조와 일치시킨다.

개인화 광고 상용화 전 `legal review required`.

### 추천·보증·스폰서

크리에이터, 제휴, 유료 리뷰, 후원 추천은 경제적 이해관계를 콘텐츠 가까이에 명확하게 공개한다. 작은 아이콘, 애매한 해시태그, 프로필 페이지에만 표시, hover-only 방식은 사용하지 않는다.

### 전자상거래/유료상품

실결제 상품 출시 전 사업자 정보, 상품 설명, 총가격/정기조건, 결제시점, 청약철회/환불, 고객지원, 디지털콘텐츠 사용 후 철회정책, 미성년자 구매처리를 정의한다.

한국 실결제 출시 전 `legal review required`.

## 8. 미국 준수 요구

### 광고

광고 주장은 사실이어야 하고 기만적이어서는 안 되며 필요한 근거를 갖춘다. 네이티브 광고와 스폰서 콘텐츠는 광고임을 분명하게 식별할 수 있어야 한다. 인플루언서/추천인의 경제적 연결관계를 공개한다.

WDX/WLD에는 `guaranteed profit`, `risk-free returns`, `beat the market` 같은 표현을 쓰지 않는다.

### COPPA

2025년 개정 COPPA 기준을 검토한다.

기본 정책:

- 전용 아동 개인정보/안전 설계가 준비되기 전 13세 미만을 의도적으로 타깃하지 않는다;
- 알려진 13세 미만 사용자에게 행동맞춤광고를 켜지 않는다;
- 연령/지역 정책 hook을 둔다;
- 연령우회 다크패턴을 쓰지 않는다;
- 향후 13세 미만 지원은 부모고지/동의·최소수집을 포함한 별도 프로젝트로 진행한다.

아동지향/13세 미만 상용화는 `legal review required`.

### 캘리포니아 개인정보

CCPA/CPRA 적용 가능성이 있다면 정책문구가 아니라 실제 기능으로 권리를 지원할 수 있게 설계한다.

- 열람/know;
- 삭제;
- 정정(해당 시);
- sale/sharing opt-out;
- 적용 시 Global Privacy Control;
- 권리행사 비차별;
- 민감정보와 보유기간 관리;
- 적용되는 위험평가 workflow.

### 정기결제

명확한 조건, 명시적 동의, 간단한 해지를 제품정책으로 채택한다. 규정 변동이 있더라도 사용자가 쉽게 해지할 수 있는 기준을 유지한다.

## 9. 개인정보 아키텍처

테이블 단위가 아니라 목적 단위 데이터 인벤토리를 유지한다.

필드 예시:

`data_category`, `source`, `purpose`, `required_or_optional`, `jurisdiction_scope`, `legal_basis_or_consent_type`, `processor_or_recipient`, `retention_policy`, `delete_behavior`, `user_control`, `sensitive_flag`, `ads_eligible`, `analytics_eligible`.

동의는 버전 관리한다. 개인정보처리방침 문구 변경이 과거 동의를 전혀 다른 신규 목적의 처리 동의로 자동 해석되면 안 된다.

## 10. Cookie / SDK 정책

광고·분석 SDK 도입 전 반드시:

1. 공급자와 버전을 기록;
2. 수집데이터와 전송대상을 기록;
3. 필수/선택 목적 분류;
4. 지역별 동의의존성 정의;
5. 처리계약 검토;
6. 보유/삭제 지원 확인;
7. 미성년자 정책 확인;
8. 성능/레이아웃 영향 측정;
9. feature flag 및 emergency disable 설계;
10. 필요한 공개 고지 갱신.

광고수익 향상만을 이유로 검토 없이 SDK를 추가하지 않는다.

## 11. SEO 정보구조

SEO는 메타태그 작업이 아니라 사용자 획득 시스템이다.

색인 후보:

- `/en/`, `/ko/`
- `/en/guide/*`, `/ko/guide/*`
- `/en/market/companies/{ticker}`, `/ko/market/companies/{ticker}`
- `/en/seasons/{season-slug}`, `/ko/seasons/{season-slug}`
- `/en/glossary/*`, `/ko/glossary/*`
- 정책 검토된 공개 커뮤니티 index

비색인:

- `/account/*`
- `/wallet/*`
- private portfolio
- `/admin/*`
- `/auth/*`
- security settings
- checkout/private payment state

테스트/스테이징은 `noindex`이며 운영 canonical과 경쟁하지 않도록 한다.

## 12. 기술 SEO 계약

모든 색인 페이지는 canonical, hreflang/localized alternate, deterministic title, meta description, 올바른 heading hierarchy, crawl 가능한 본문, 내부링크, 올바른 상태코드, Open Graph/share metadata, 이미지 메타정보, 실제 보이는 내용과 일치하는 structured data를 정의한다.

삭제된 페이지는 true 404/410을 사용하고 soft-404를 피한다.

## 13. Google 2026 변화 반영

현재 Google 공식자료 기준:

- Search Essentials와 유용하고 신뢰할 수 있는 콘텐츠가 기본이다;
- 2026년 생성형 AI 검색 가이드도 독창적이고 비범용적인 유용한 콘텐츠를 강조하며 별도 꼼수형 `AEO/GEO`가 기본 SEO를 대체하지 않는다;
- `llms.txt`는 Google Search 노출에 필요하지 않다;
- FAQ rich result 문서는 2026년에 제거됐으므로 FAQ rich result 획득을 핵심 성장전략으로 잡지 않는다;
- 지역별 Search experience 차이를 별도 문서화하기 시작했으므로 EN/KO 성과를 따로 관측한다.

## 14. 콘텐츠 전략

검색 콘텐츠 클러스터:

1. 가상경제 기본;
2. 가상주식/분산/복기 학습;
3. WDX 가상기업 세계관·이벤트 아카이브;
4. 직업/사업/운영 가이드;
5. 시즌 가이드/아카이브;
6. 수집/제작/공간 가이드;
7. 계정/보안/개인정보 도움말;
8. 금융·게임 용어집.

로그인 후 이어지는 명확한 다음 행동은 제공하되 기만적 긴급성을 사용하지 않는다.

금지: 키워드 스터핑, doorway page, 근소하게만 다른 대량 자동페이지, 스팸 링크 구매, 숨은 텍스트, 저가치 AI 대량문서, 허위 전문가/리뷰.

## 15. Core Web Vitals와 광고 예산

가능한 경우 75 percentile 기준 good 목표:

- LCP ≤ 2.5초;
- INP < 200ms;
- CLS < 0.1.

광고 슬롯 공간은 미리 확보해 CLS를 줄이고, 광고가 성능을 크게 악화시키면 수익 실험을 롤백 또는 재설계한다.

## 16. Search Console 운영

- production property 확인;
- canonical sitemap 제출;
- 대표 EN/KO URL 검사;
- crawl/index error 모니터링;
- Core Web Vitals 모니터링;
- structured data 오류 확인;
- manual action/security issue 확인;
- 브랜드/비브랜드 성과 분리;
- 배포/콘텐츠 출시와 검색 트래픽 변화 연결 기록.

## 17. 관리자 콘솔

`Monetization & Compliance` 영역을 추가하는 방향으로 기획한다.

모듈:

- 광고 슬롯 및 상태;
- contextual/personalized mode;
- 지역별 허용 여부;
- 스폰서 고지 preview;
- 구독 플랜/가격 버전;
- 개인정보/동의 버전;
- SEO 색인 registry;
- sitemap 상태;
- canonical/hreflang 검증;
- 향후 Search Console read-only 연동;
- legal-review checklist;
- 광고/개인화광고/스폰서/결제 kill switch.

관리자 입력 폼은 자동 새로고침을 금지하고 stale 표시 + 명시적 갱신/merge를 사용한다.

## 18. Config

권장 키:

```text
ads.enabled
ads.personalized.enabled
ads.allowed_routes
ads.blocked_routes
ads.minor_personalization.enabled = false
ads.slot.*
subscriptions.enabled
subscriptions.plan.*
privacy.region.KR.*
privacy.region.US.*
privacy.gpc.enabled
seo.indexing.enabled
seo.staging_noindex = true
seo.canonical_origin
seo.locale.en.enabled
seo.locale.ko.enabled
seo.sitemap.enabled
seo.structured_data.enabled
legal.feature_gate.*
```

법규/준수 gate 미승인 시 fail-closed 한다.

## 19. 광고 완료조건

- route allowlist/blocklist 완료;
- 민감 화면 제외;
- EN/KO 광고표시 명확;
- layout space 예약;
- 접근성 식별 가능;
- CTA 혼동 없음;
- 지역별 동의모드 정확;
- 광고 analytics에 불필요한 자산/계정정보 미노출;
- 정책/법률 검토상태 기록;
- disable switch 검증;
- 런타임 구현은 테스트환경 검증 통과.

## 20. 구독 완료조건

- 결제 전 가격/주기/갱신 공개;
- 동의증거 저장;
- 간단한 해지;
- 환불/해지 상태 결정적 처리;
- 결제 재시도 멱등성;
- 중복구매 방지;
- 결제상태와 권한 부여/회수 대사;
- EN/KO 약관·도움말;
- 국가별 출시 gate 승인.

## 21. SEO 완료조건

- 올바른 status code;
- canonical/hreflang 정확;
- index/noindex 정확;
- metadata와 실제 heading 일치;
- crawl 가능한 핵심본문;
- 내부링크;
- sitemap 일치;
- structured data가 실제 콘텐츠와 일치;
- 모바일 사용성;
- 성능예산 확인;
- metadata/markup/analytics에 개인정보 미노출.

## 22. 상용 출시 준수 체크리스트

출시 전 확인:

- 개인정보처리방침이 실제 telemetry/광고/SDK와 일치;
- 약관에서 WLD/WDX 가상·게임전용 성격 명확;
- 광고/스폰서 고지 구현;
- 크리에이터/후원 공개 절차;
- 유료상품 가격/환불/해지 고지;
- 연령/미성년자 정책;
- COPPA 적용 검토;
- CCPA/CPRA 적용 및 권리처리 검토;
- 한국 개인정보/맞춤광고 검토;
- 한국 전자상거래/소비자보호 검토;
- PG/결제사 약관 준수;
- 커뮤니티 신고/삭제 의무 검토;
- 접근성 리스크 검토;
- 데이터 보유/삭제가 문서가 아니라 실제 동작;
- `legal review required` 미완료 기능은 off.

## 23. v2026.09.12.27 외부 근거

이번 버전은 다음 최신/공식 자료를 검토했다.

- 2026-09-08까지의 Google Search Central 문서 업데이트;
- Google Search Essentials, Core Web Vitals, 2026 생성형 AI 검색 가이드;
- FTC 광고/마케팅, 네이티브 광고, 추천/리뷰 가이드;
- 2025 개정사항을 반영한 FTC COPPA 가이드;
- 2026 FTC 구독/negative-option 정책 및 집행 자료;
- California AG/CPPA CCPA 및 2026 시행 규정;
- 한국 개인정보보호위원회 행태정보/맞춤형광고 자료와 2026 가명정보 자료;
- 한국 공정거래위원회 추천·보증 경제적 이해관계 공개 관련 개정자료.

규제해석이 필요한 부분은 최종 상용화 전에 `legal review required`로 남긴다.

## 24. 우선순위

### P0

- 공개 route 광고 allowlist/blocklist;
- contextual 광고 baseline;
- 광고/스폰서 공통 disclosure component;
- 광고 kill switch;
- 운영/스테이징 SEO 분리;
- canonical/hreflang/sitemap 계약;
- 공개 guide/company/season SEO template;
- 개인정보 data inventory;
- 한국/미국 출시 checklist;
- 수익 KPI dashboard schema.

### P1

- 광고제거 구독 + 간단해지;
- sponsor campaign registry;
- Search Console 운영 read-model;
- privacy preference center/GPC 지원(해당 시);
- consent/version registry;
- EN/KO 콘텐츠 publishing workflow.

### P2

- 법률/개인정보 승인 후 personalized ads;
- jurisdiction-aware consent;
- B2B sponsorship tooling;
- advanced LTV/CAC attribution;
- CI SEO regression checks.

## 25. 배포 메모

이번 버전은 문서-only다. 테스트 서버 배포는 필요하지 않다.

이 문서를 실제 구현할 때는 별도 개발 브랜치에서 CI·개인정보·보안 검토를 수행하고, 정확한 후보 SHA를 격리 테스트환경에 먼저 배포해 backend/API/UI/indexing control을 검증한 뒤 운영 배포 절차를 따른다.