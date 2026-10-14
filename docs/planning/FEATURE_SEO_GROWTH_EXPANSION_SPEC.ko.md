# Moneyverse 기능·SEO·성장 통합 상세 기획 — v2026.10.14.604

> 상태: PLANNING / 제안, 미채택. 운영·테스트·색인·수익 성과 미검증.
> 상위 권위: PROJECT_PLAN.md → INTEGRATED_PLANNING_MASTER.md. 기존 v530 UI 차단, v523 통화보존, v527 SEO 수요 게이트를 유지한다.
> 영문 정본: FEATURE_SEO_GROWTH_EXPANSION_SPEC.md

## 1. 목표와 제품 루프
검색 의도 → 신뢰 가능한 무료 계산·해설 → 개인화된 가상경제 체험 → 선택적 가입 → 최초 가치행동 → 7/30일 재방문 → 경제 시뮬레이션 지속 → 관찰된 광고/프리미엄 매출.
북극성 지표: 검색 유입자의 7일 내 유의미한 경제활동 완료율. 보조 지표: 유효 색인 URL, 비브랜드 노출/클릭, 검색 랜딩→계산완료, 계산→체험, 체험→가입, 가입→첫 원장거래, D1/D7/D30 유지, 사용자당 광고 수익, 서버비용, SEO 오류율. 수치는 실제 측정 전 목표/성과로 주장하지 않는다.

## 2. 기능 요구사항 및 SEO 결합
| ID | 우선 | 기능 | 사용자 시나리오 / 상태·데이터 | 검색 의도·콘텐츠 연결 | 수용 조건 |
|---|---|---|---|---|---|
| F01 | P0 | 5분 비회원 경제 인생 체험 | 직업·소득·지출·부채 입력→12개월 현금흐름·10년 시나리오→가입 후 명시적 저장; guest 시나리오 격리 | 연봉 실수령액·생활비·순자산 계산 페이지→시뮬레이션 | 개인정보 저장 동의, 모바일 완주, 게스트 잔액 발행 없음 |
| F02 | P0 | 경제 미션·성장 | 예산 작성·세금 이해·저축 목표·거래 교육 미션; 멱등 보상/중복 차단 | '예산 세우는 법'·저축 목표 도구→첫 미션 | 보상 원장 정합성, 악용 방지, D7 코호트 |
| F03 | P0 | 계산기 확장 | 복리·DCA·대출/DSR·FIRE·배당·순자산·손익분기·임대수익·세금; 가정/법역/적용일 표기 | 각 독립 과업 중심 랜딩; 기존 12개 도구와 중복이면 확장 | 공식·경계값·접근성 테스트, stale 시 경고/색인 제한 |
| F04 | P0 | 경제 공개 대시보드 | WLD 공급·국고 유입/지출·물가 지표의 출처/시점/정의와 원장 대사 | '가상 경제 통화량' 교육·방법론 페이지 | 허위 실시간 수치 금지, 관리자 권한 분리 |
| F05 | P1 | AI 개인 경제 비서 | 시뮬레이션 자산/소비 진단→설명 가능한 제안→사용자 승인 | 예산/부채/은퇴 설명 콘텐츠에서 체험 연결 | 조언과 집행 분리, 민감정보 최소화 |
| F06 | P1 | 기업·직업 경제 | 직업 승진·창업·재고·임금·세금·파산; 상태기계·계약 이벤트 | 창업 손익분기 계산기→가상 창업 | 기존 자금만 이전, 음수재고/중복정산 차단 |
| F07 | P1 | 부동산·임대 | 매입·대출·공실·수선·세금·임대 현금흐름 | 임대수익률·모기지 계산기→가상 부동산 | 수익 보장 금지, 공실/금리 스트레스 테스트 |
| F08 | P1 | 정책 실험실 | 샌드박스 금리·세율·통화량 시나리오 비교; 실제 경제에 자동 반영 금지 | 인플레이션/금리 교육→시나리오 | 샌드박스 완전 격리, 정책 변경 감사 |
| F09 | P1 | 경제 이벤트·위기 | 경기침체·실업·공급충격 시나리오와 대응 | 경기침체 시뮬레이터 교육 랜딩 | 재현 가능한 seed, 공정성/장애 복구 |
| F10 | P1 | 국가별 경제 비교 | 지역별 급여·세금·물가·통화 입력, 출처/법역/업데이트 분리 | 국가별 take-home pay, cost of living, FIRE | 단순 번역 URL 금지, 법역 검증 |
| F11 | P2 | 사용자 시장·계약 | 상품 거래·에스크로·분쟁·환불·세금 | 경제시장 설명·수수료 계산기 | 복식부기, 권한, 부정거래 통제 |
| F12 | P2 | 경제 교육·업적 | 학습 과정·퀴즈·직업 라이선스·업적 | 경제 용어집→퀴즈/실습 | 정확한 해설, 접근성, 스팸 보상 방지 |

## 3. 국내 SEO — 한국 시장
P0 클러스터: 연봉/실수령액/4대보험; 대출이자/DSR/원리금; 예적금/복리/목돈; 배당/평단가/양도세; ISA/연금/은퇴; 증여/부동산 임대; 생활비/가계부/순자산.
각 클러스터는 허브 1개 + 고유 계산과 설명이 있는 도구 + 검증된 FAQ/가이드로 설계. 법률·세금 요율은 출처, 시행일, 예외, 수정 검토일을 표시. 네이버 검색어·Search Advisor·DataLab은 서로 다른 증거로 취급한다.
예: /ko/tools/salary-calculator → 실수령액 결과 → 생활비 시나리오 → 가상 경제 체험. 기존 실제 경로와 충돌하면 URL을 신규 생성하지 않고 기존 경로를 개선한다.

## 4. 해외 SEO — 영어 우선, 한국어 2차
영어 클러스터: compound interest, DCA, savings goal, loan amortization, mortgage, FIRE/SWR, take-home pay, net worth, budget, dividend reinvestment, business break-even.
영문 콘텐츠는 미국/영국 등 관할을 명시해 세금/급여 계산 규칙을 혼합하지 않는다. 영어 기본 제품 방향과 별개로 기존 한국어 fallback 계약은 변경 승인 전 유지. JA/ZH 및 기타 국가는 번역 완성도·현지 법률 검토·실측 수요가 충족될 때 단계 확장.
URL 예시는 /en/tools/compound-interest 및 /ko/tools/compound-interest. 실 URL 라우트 감사 후 확정. hreflang 양방향, x-default, 자기 canonical, 언어별 sitemap, 서버 렌더링 제목·설명·본문을 검증한다.

## 5. SEO 페이지 입장·퇴출 계약
KeywordOpportunity: locale, market, query, intent, cluster, demandEvidenceState, provider, period, sourceDate, canonicalCandidate, uniqueTask, contentOwner, reviewer, jurisdiction, freshnessDeadline, translationStatus, conversionEvent, indexDecision.
순서: 수요 증거→중복/검색의도 클러스터링→실제 독립 가치→정확성·법역 검토→기술 SEO→색인 허용→GSC/Naver 실측→개선/병합/noindex/삭제(리다이렉트 검토).
10,473개 후보는 모두 HOLD 상태라는 v527 기준 유지. 111,313개 연구 문헌은 키워드 수요·색인·트래픽 증거가 아니다. 대량 자동 생성/도어웨이/키워드 채우기 금지.
Google FAQ 리치결과와 AggregateRating 별점은 표시 보장 아님. 자사 임의 평점/가짜 리뷰 마크업 금지. IndexNow 제출은 색인 성공 아님. sitemap lastmod는 실제 유의미한 변경 시만 갱신.

## 6. 템플릿과 콘텐츠 계약
공개 랜딩: H1(사용자 질문), 계산기/실습(즉시 사용), 결과와 가정, 수식·방법론, 예제 2개, 적용 법역·출처·수정일, 오류·제한, 관련 과업 링크, 선택적 체험 CTA, 광고(핵심 UI 가림 금지).
구조화 데이터: 검증된 BreadcrumbList/WebPage/SoftwareApplication(해당 시) 및 실제 본문과 일치하는 FAQ만 사용; rich-result 보장 문구 금지.
비공개: /admin, /account, 사용자 거래내역, 인증, 개인화 결과, 내부 API, 카지노/우연성 위험 영역은 noindex/접근통제; robots 차단만으로 개인정보 보호를 대체하지 않는다.

## 7. 구현 아키텍처
콘텐츠 레지스트리와 계산 엔진 분리; 공식 버전, 법역, 적용일, 데이터 출처, 재계산 해시를 유지. SEO read model은 개인정보/원장 쓰기 API와 분리. 계산 결과 공유 URL은 개인정보 없는 정규화 파라미터만 허용.
이벤트: landing_view, calculator_start, calculator_complete, scenario_start, scenario_complete, signup_start, signup_complete, first_economy_action, d7_return, ad_viewable, subscription_conversion; consent/보존기간/중복제거 정책 필수.
중앙은행 승인, 조폐국 발행/폐기, 국고 기존 WLD 지출, Economy Core 복식부기 분리 유지. AI 직접 발행·폐기/국고부족 보전 금지.

## 8. 검증 및 단계별 출시
G0: v603 보안 결함, v530 UI, 원장·인증 차단 해결 전 경제 신규 쓰기 기능 출시 금지.
G1: 키워드·기존 URL·현행 구현 감사, 중복 제거, KO/EN 페이지별 정확성 소유자 지정.
G2: 계산기·체험 read-only MVP, SSR/meta/canonical/hreflang/sitemap/robots, 320px~desktop UI·키보드·스크린리더 검증.
G3: 익명→회원 전환, 권한/CSRF/rate limit, 원장 멱등·보존 불변식, CI 및 격리 Test exact-SHA 검증.
G4: 전체 공개/관리자 라우트 5회 완주, SEO 실제 HTML 크롤, 로그·성능·Core Web Vitals 관찰.
G5: 운영 무중단 승격은 별도 승인과 롤백·실측 증거 후에만. 본 문서 작성은 배포 승인이 아니다.
실험: landing→calculator 완료, calculator→scenario, scenario→signup, signup→first_action 각각 코호트 A/B; 성공은 실측 전 미정, guardrail은 오류율·광고 방해·이탈·비용·원장 불일치 0.

## 9. 충돌·미결정
- 현행 통합 권위 v530과 PROJECT_PLAN 상단 v543/런타임 v599 표기 드리프트는 유지하고 별도 조정.
- 기존 12 계산기·pSEO·직업·국고·주식·SEO 자동화가 이미 문서화되어 있으므로 신규 구현으로 중복 집계하지 않는다.
- SEO 자동화/가짜 평점/모의 GSC 데이터와 실제 검색 실적을 구분.
- 통화·금리·복권·카지노·국고 지급 관련 위험/법역 승인 전 외부 노출·자동집행 금지.
- 이 기획은 신규 기능 제안이며 상위 PROJECT_PLAN에서 채택하기 전 구현 권위가 아니다.

## 10. 작업기록
시작 기준 GitHub main: c56af867ad8f7556e53f895b0bb294c4bfc8a02d. Debian13/minipc 오프라인. 브랜치 docs/feature-seo-growth-plan-v2026.10.14.604. 문서 전용, 운영 변경 없음. 병합 전 main 재확인 필수.
