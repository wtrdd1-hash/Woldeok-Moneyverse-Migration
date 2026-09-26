# Moneyverse 수익화·수익 리서치 재검토 — v2026.09.25.444

날짜: 2026-09-25
상태: PLANNING / RESEARCH
권위 반영 대상: `PROJECT_PLAN.md` + `MONETIZATION_COMPLIANCE_SEO_SPEC.md`
코퍼스: `MONEYVERSE_MONETIZATION_REFERENCE_CORPUS_v2026.09.25.444.csv`

## 1. 코퍼스 구축

이번 사이클은 구독, 광고, 디지털 상품, 인앱 구매, 프리미엄, 마켓/플랫폼 수수료, 스폰서십/크리에이터 경제, 가격정책, 반복매출을 중심으로 추적 가능한 탐색 코퍼스를 구축했다.

- OpenAlex 1차 수집: 후보 13,231건 -> 고유 후보 11,429건.
- Crossref 확장: 후보 24,000건.
- 결합 원시 행: 35,429건.
- DOI 우선 + 정규화 제목 보조 중복 제거 후: **고유 탐색 후보 33,341건**.
- 소스 구성: Crossref 21,912 / OpenAlex 11,429.
- 최근 연도: 2026년 851, 2025년 1,175, 2024년 932, 2023년 1,003, 2022년 875.

이 코퍼스는 탐색 인덱스이며 33,341건 전부를 원문 전수 검토했거나 모두 직접 적용 가능하다는 뜻이 아니다. 넓은 서지 검색에는 오탐이 포함될 수 있으므로 실제 기획 결정은 아래 공식·규범·동료심사 중심의 집중 검토를 사용한다.

## 2. 근거 계층

Tier A: 최신 스토어 공식 정책, 법령/규제기관 자료, 상장사 공식 공시·실적, Moneyverse 실제 텔레메트리.
Tier B: 동료심사 연구, 현장실험, 체계적/메타분석 연구, 방법을 평가할 수 있는 고품질 워킹페이퍼.

Tier C: 주제·연관 연구를 찾기 위한 탐색 코퍼스 후보. 코퍼스 포함만으로 가격, 출시, 법적 판단을 승인하지 않는다.

## 3. 고신뢰 결론

### M444-01 — 단일 수익원보다 혼합 수익화가 제품에 더 적합
디지털 플랫폼은 무료 접근, 광고, 구독, 직접 디지털 상품 판매를 혼합하는 경우가 많다. 적절한 조합은 이용자 성향, 광고 거부감, 프리미엄 가치, 거래비용에 따라 달라지며 하나의 보편적 정답은 없다.

상장사 사례도 중심축이 서로 다르다. Reddit은 2026년 2분기 총매출 8.05억 달러 중 광고매출 7.62억 달러를 보고했다. Duolingo의 2025년 10-K는 구독매출 8.734억 달러와 기타매출 1.641억 달러를 보고하면서도 대규모 무료 경험을 유지한다. Roblox는 예약매출의 대부분이 가상화폐 판매에서 발생한다고 설명한다.

Moneyverse는 이를 매출 예측값이 아니라 모델 사례로만 사용한다. 금융 시뮬레이션, 가상화폐, 카지노 경계 때문에 직접적인 유료 경제력 판매보다 광고 제거 구독, 비P2W 코스메틱 직접구매, 저위험 스폰서십이 더 적합하다.

### M444-02 — 무료 핵심 가치는 강하게 유지하고 프리미엄의 추가 가치를 체험시켜야 한다
2024년 IJIM 메타분석 연구는 55개 연구를 통합해 기능·즐거움·사회적·가격 가치가 프리미엄 서비스 지불의향과 연결되며, 신뢰가 가상상품 지불의향을 매개한다고 보고했다. 2026년 9월 JAMS 현장연구는 무료 사용 습관이 전환에 도움을 주면서도 무료 고착을 만들 수 있고, 프리미엄에서 실제 체험한 효익과 습관은 일반적으로 전환·유지에 도움을 준다고 보고한다.

따라서 무료 티어를 의도적으로 불편하게 만들지 않는다. 프리미엄 미리보기/체험은 편의·표현·정리 가치가 실제로 느껴지게 설계한다.

### M444-03 — 광고 수익에는 유지율·신뢰 가드레일이 필수
광고는 대규모 무료 이용자를 지원할 수 있지만 광고량 증가는 무비용 수익이 아니다. Better Ads Standards는 방해적 경험을 금지하고, 실증연구는 일부 환경에서 광고가 참여나 IAP를 잠식할 수 있음을 보여준다.
2026년 한국 시뮬레이션 모바일 게임 A/B 연구는 배너 광고가 단기 총수익을 높인 반면 온보딩·잔존 지표에는 약화 신호가 나타났다고 보고했다. 별도의 대규모 게임 연구도 광고 배치에서 IAP 잠식 효과를 핵심 변수로 다룬다.

따라서 Moneyverse는 맥락형 광고를 저위험 공개 콘텐츠 화면에만 허용하고, 지갑·송금·대출·WDX 주문·카지노·계정보안·관리자 의사결정 화면에는 광고를 넣지 않는다. 광고 실험은 홀드아웃과 D1/D7/D30, 핵심 작업 완료율, 불만/오클릭, 지연시간, 전환 가드레일을 함께 측정한다.

### M444-04 — 비기능성 코스메틱 직접 판매가 가장 안전한 유료 상품 축
2026년 Journal of Business Research 연구는 유료 비기능성 가상상품이 심리적 소유감을 통해 즐거움을 높일 수 있다고 보고한다. 이는 프로필 테마, 프레임, 네임플레이트, 방/사무실 장식, 대시보드 테마, 아카이브 표현팩, 시즌 비주얼과 잘 맞는다.

유료 코스메틱은 가격이 명확한 직접 entitlement 상품으로 판매한다. **WLD를 먼저 현금 구매하게 만들지 않는다.** 실화폐 결제 entitlement 회계는 WLD 원장과 분리한다.

### M444-05 — 유료 확률형 보상은 계속 차단
최근 연구는 루트박스 지출과 도박 유사 위험의 연관성을 계속 보고하고, 실험연구는 불투명한 확률·선별 피드백이 지불의향을 높일 수 있음을 보인다. FTC의 Genshin Impact 및 Epic/Fortnite 집행 사례는 미성년자, 고지, 의도치 않은 구매 위험을 보여준다. Apple은 유료 무작위 가상아이템의 확률 공개를 요구하고 한국도 확률형 아이템 공개 규칙을 운영한다.

Moneyverse는 `PAID_RANDOM_ITEM = BLOCK`, 유료 확률 증가, 유료→카지노 베팅 가치 경로 차단을 유지한다.

### M444-06 — 스토어/결제 단가는 시행일·채널별로 계산해야 한다
2026-09-25 기준 Google Play의 한국 신규 수수료 일정은 **2026-12-31** 시행 예정이므로 9월 한국 예측에 미래 요율을 선반영하면 안 된다. 한국 대체결제는 프로그램 조건에 따라 해당 Play 서비스 수수료에서 4%p 감소한다.

Apple은 표준 자동갱신 구독의 첫 유료 1년 개발자 순수익을 70%, 1년 이후 85%로 설명하며, Small Business Program은 처음부터 85%를 적용한다. 한국 외부결제 entitlement에는 별도 바이너리·권한 요구사항이 있다.

따라서 단위경제는 시장, 채널, 시행일, 적용 시 설치 코호트, 거래유형, 결제경로, 프로그램을 키로 저장한다.
### M444-07 — 구독 해지는 법적 최소선이 아니라 제품 요구사항
한국의 현행 전자상거래 규칙은 정기결제 가격 인상 또는 무료→유료 전환에 사전 통지·동의 요건을 둔다. 미국에서는 2024 FTC Click-to-Cancel 규칙을 현재 유효한 구속 규칙으로 간주하지 않으며, FTC는 2026년 3월 네거티브옵션 규칙 제정을 다시 진행하면서 ROSCA/FTC Act 집행을 계속하고 있다.

Moneyverse는 법적 최소선과 무관하게 온라인 셀프 해지, 반복가격·주기·갱신의 명확한 고지, 영구적 동의 증거, 해지 방해 금지를 유지한다.

### M444-08 — 스폰서십/B2B는 플레이어 경제력을 건드리지 않고 수익원을 분산할 수 있다
2026년 크리에이터 경제 연구는 구독매출, 스폰서십, 광고가 서로 대체·보완될 수 있음을 보여준다. Moneyverse는 명확히 표시된 스폰서 시즌 비주얼, 교육/세계관 모듈, 커뮤니티 프로젝트, 향후 비즈니스/API 서비스를 검토할 수 있다. 단 스폰서는 WDX 가격, 랭킹, 모더레이션, 대출조건, 보상률, 비공개 사용자 데이터에 영향을 줄 수 없다.

## 4. 채택 수익화 포트폴리오

1. **무료 핵심:** 필수 경제·게임·커뮤니티 기능은 결제 없이 사용 가능해야 한다.
2. **맥락형 공개 광고:** 저위험 공개 탐색/콘텐츠 화면만 허용하고 민감 경제·행동 화면은 제외한다.
3. **Moneyverse Plus:** 광고 제거 + 테마, 아카이브/내보내기 표현, 비경쟁적 추가 저장 레이아웃/관심목록, 선택적 프리미엄 리캡 등 편의·표현 가치.
4. **직접 코스메틱 SKU:** 프로필/공간/클럽/대시보드/시즌 비주얼을 WLD가 아닌 별도 entitlement로 직접 판매.
5. **스폰서 모듈:** 경제 권위와 완전히 분리된 명확한 스폰서 표시의 세계관/교육/시즌 비주얼.
6. **후기 크리에이터/B2B/API:** 권리·모더레이션·개인정보·수익배분·사용량계측·지원 체계가 갖춰진 뒤 검토.

차단: WLD 현금구매, 유료 확률형 아이템, 유료 카지노 가치/베팅, P2W 경제 우위, 돈을 낸 이용자의 빠른 모더레이션, 유료 우월 WDX 정보, Moneyverse 모의금융 판단과 혼동될 수 있는 금융상품 제휴광고.

## 5. 수익 회계와 실험 게이트
1차 수익성 지표는 총매출이 아니라 기여이익으로 둔다.
`총수취액 - 스토어/플랫폼 수수료 - PSP 수수료 - 세금/VAT 비용 - 환불/차지백 - 크리에이터/수익배분 - 광고판매비 - 증분 인프라 - 지원/모더레이션 - 현지화/콘텐츠 - 컴플라이언스/법무 운영비`.

ARPU/ARPDAU/ARPPU, 구독 전환/해지, 광고 eCPM/fill/viewability, 코스메틱 attach/repeat, 스폰서 수익, 환불/차지백률, 지원비용, 수익화 코호트별 D1/D7/D30, 신뢰/불만 신호, 시장/채널/SKU별 기여이익을 추적한다.

가격, 전환율, eCPM, churn, CAC, LTV 및 매출예측은 Moneyverse 실측 전까지 모두 `HYPOTHESIS/TEST TARGET`으로 표시한다. 유지율·신뢰·지원·안전·경제 가드레일이 사전 등록 임계값보다 악화되면 수익화 실험을 중단하거나 롤백한다.

## 6. 집중 검토 레퍼런스

- Google Play 서비스 수수료/2026 지역 시행 일정: https://support.google.com/googleplay/android-developer/answer/112622
- Google Play 신규 저율 일정: https://support.google.com/googleplay/android-developer/answer/16954621
- Google Play 한국 대체결제: https://support.google.com/googleplay/android-developer/answer/11222040
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple 자동갱신 구독: https://developer.apple.com/app-store/subscriptions/
- Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/
- Apple 한국 외부결제 entitlement: https://developer.apple.com/support/storekit-external-entitlement-kr
- 한국 전자상거래법/정기결제 규칙: https://www.law.go.kr/
- 공정거래위원회 다크패턴 시행 가이드: https://www.ftc.go.kr/
- 개인정보보호위원회 맞춤형 광고 정책: https://www.pipc.go.kr/
- FTC Negative Option Rule / 2026 rulemaking: https://www.ftc.gov/legal-library/browse/rules/negative-option-rule
- FTC Genshin Impact 합의(2025): https://www.ftc.gov/news-events/news/press-releases/2025/01/genshin-impact-game-developer-will-be-banned-selling-lootboxes-teens-under-16-without-parental
- Google Better Ads Standards: https://support.google.com/publisherpolicies/answer/11127848
- Reddit 2026 Q2 실적: https://investor.redditinc.com/
- Duolingo 2025 Form 10-K: https://investors.duolingo.com/
- Roblox 투자자 실적/예약매출 공시: https://ir.roblox.com/
- Tyrväinen & Karjaluoto (2024), IJIM, DOI 10.1016/j.ijinfomgt.2024.102787.
- Kreimer et al. (2026), Journal of the Academy of Marketing Science, DOI 10.1007/s11747-026-01205-w.
- Zhang et al. (2026), Journal of Business Research, DOI 10.1016/j.jbusres.2026.116180.
- Li et al. (2024), European Journal of Operational Research, DOI 10.1016/j.ejor.2023.10.024.
- Acemoglu et al. (2024), NBER Working Paper 33017, DOI 10.3386/w33017.
- von Meduna et al. (2020), Technology in Society, DOI 10.1016/j.techsoc.2020.101395.
- What drives demand for loot boxes? (2024), JEBO, DOI 10.1016/j.jebo.2024.106755.

## 7. 런타임 주장

이번 사이클은 리서치/기획 문서만 변경한다. 결제 구현, Test 검증, Production 배포, 실제 매출 발생 또는 법적 승인 완료를 주장하지 않는다.
