# 전략 방향 후보 C — 금융 유틸리티에서 경제생활까지, v2026.10.14.602

> **상태:** DRAFT / PROPOSAL_ONLY / NOT_ADOPTED.
> **기존 공식 최상위 계획:** `PROJECT_PLAN.md` v2026.10.05.530, `INTEGRATED_PLANNING_MASTER.md`; 본 문서는 이를 승인 없이 승계·덮어쓰지 않는다.
> **감사 근거:** [심화 분석](../findings/MONEYVERSE_STRATEGY_DEEP_DIVE_v2026.10.14.602.ko.md), [SEO 원시 증거](../findings/MONEYVERSE_SEO_DEEP_EVIDENCE_v2026.10.14.602.ko.md), [외부 레퍼런스 47건](../findings/MONEYVERSE_REFERENCE_REGISTER_v2026.10.14.602.csv).
> **기본 정책:** 제품 fallback 한국어, 영문 문서 원본/한국어 두 번째 언어, 국내/해외 개별 기획, 광고만 현금 수익, WLD 외부 현금화 불가, 경제 데이터 불변식/승인 우선, 테스트 확인 후 무중단 운영 배포.

## P0 의사결정 후보
1. **포지셔닝:** 금융문제 해결을 검색 입구로, Moneyverse 가상 경제를 핵심 재방문 가치로 둔다. 기존 게임 코어 유지.
2. **분리형 제품 네비게이션:** 공개 도구(계산기·용어·경제 설명)와 회원 세계(나의 경제·사회·시장)를 분리. 결과를 보기 위해 가입시키지 않는다.
3. **첫 7일 성장 루프:** 시간/보상 반복 클릭이 아니라 선택→실제 장부 변화→설명→다음 선택. 개인 경제 + 사회·국고의 영향을 시각화한다.
4. **검색 확장 권한:** 정확한 페이지별 근거가 없으면 신규 독립 URL 발행 금지. 언어별 실제 본문/상호 hreflang·자기 canonical 필수.
5. **정확한 데이터만 보여주는 관리자:** MOCK·추정·부분 연결·실측 VERIFIED 구분, 연결 권한 없으면 NO_DATA. 인덱싱/광고 KPI 보장 금지.
6. **경제·규제 안전:** 카지노/레버리지/카피트레이딩은 별도 법률·브랜드·광고 적합성 심사 전 검색 중심에서 제외. 기존 기능 제거 또는 스위치 변경은 별도 승인.

## 제품 상태별 화면 계약
**방문자:** 공개 도구가 즉시 작동, 공식 가정/시행일/오류와 접근성을 공개. 경제 시뮬레이션은 선택형; 개인정보 없이 기본 가정으로만 체험.
**익명 시나리오 완료:** 가상 WLD임을 명시, 전후 자산·위험/민감도 요약, 공유 링크는 개인 입력을 노출하지 않음, 계정 생성 없이도 결과 확인.
**가입 사용자 첫 세션:** 온보딩 동의 → 역할/목표 선택 → 직업 1회 → WLD 수입 영수증 → 세금/저축/투자 옵션 중 1회 → 순자산/현금흐름 변화 확인. 메뉴 20개보다 핵심 2~3개 선택을 우선.
**D1:** 현금흐름/생활 사건/예산 계획 알림은 동의·빈도 제한; 무작위 압박/숨겨진 손실 없음.
**D7:** 직업 역량/장기 목표/친구와 공공 프로젝트, 실제 경제 원장과 공공성 성과 시각화.
**D30:** 경제 생활의 30일 누적 장부/결정/성장·실패 원인 보고서. 확정 투자 수익 또는 현실 금융 자문처럼 보이지 않게.

## 메뉴 후보
공개: **계산기 / 금융 용어 / 경제 시뮬레이션 / 가이드**
로그인: **내 경제(직업·현금흐름·지갑·목표) / 시장(은행·가상 주식·사업) / 사회(국고·정책·공공사업·클럽) / 내 기록(원장·성장·알림)**
고급: 주식 작도/국채/공기업/AI 정책/관리자는 역할·목적에 맞게 별도. 카지노는 별도 검토 대상, 공개 유입·SEO 핵심에서 제외.

## 가치 증거와 검증 분모
| 단계 | 정의 | 유효한 분모 | 반증 조건 |
|---|---|---|---|
| Organic exposure | GSC/Naver에서 노출된 확인 페이지 | 엔진×국가×기기×기간 | fake metrics 의존 |
| Tool completion | 사용자가 실제 결과를 확인 | 적격 도구 조회 비봇 세션 | 계산만 로딩/스크롤을 완료로 집계 |
| Second useful action | 저장·다른 계산·시나리오 결과 등 | 도구 완료자 | 가입 버튼 클릭을 곧 가치로 간주 |
| Activation | 영수증 검증된 첫 경제 의사결정 | 가입 cohort | 가입/로그인만 활성화로 간주 |
| Retention | 해당 일/구간에 의미 있는 경제행동 | 활성 cohort 시간창, 제외조건 명시 | 단순 알림 클릭/봇/관리자 포함 |
| Monetization | 유효 공개 PV당 실제 순수익·공헌 | 광고 적격 PV, 정책 준수 | 가짜 RPM/무효트래픽/강제 광고 |

## 세 가지 최초 실험의 정의
**KO Compound to Scenario:** 계산값 이후 '같은 예산으로 10년 가상 경제 체험' 버튼 선택, 기본값 유지·익명, 더보기 수준 CTA. 효과 지표 second_action, 도구 완료율, 종료 비율.
**KO Salary to Budget:** 급여 실수령 설명 뒤 가상의 월별 예산/생활비/세금 선택, 금전/개인정보 미수집, 교육 목적 명시.
**EN Savings Goal to Sim:** 실제 영문 설명·USD/국제공통 복리 개념의 가정 후 경제 위기/투자 시나리오; US 과세를 KO 계산식으로 대신하지 않음.

실험 설계는 A/B 또는 순차 test, 유사 광고/SEO 상태를 유지하고 사전 분모/기간/불확실성을 문서화. 차트/시나리오 때문에 결과 페이지 CWV나 완결성을 해치면 실패 처리.

## 경제 코어 데이터 계약
정합성: `total_supply_change == minted - burned`; `sum(all_entries_by_transaction) == 0`; 재시도 동일 idempotency key는 동일 영수증; 국고/은행/투자는 음수/이중 배당/권한 누락 금지.
정책: AI 추천과 승인/민팅/출금 주체 분리. 수급·보조금·소각·환불의 단일 분모/예산 기간/재원·우선순위 명시. v522의 비율 총 140% 표현은 분모/조건 정의 전 미승인 상태.
정량 보호: 자산 상위 집단 독점, 무한 반복 적립, 첫 사용자 경험이 불가능할 만큼 높은 물가, 경제 원장 드리프트를 금지. Monte Carlo·악용 시뮬레이션과 롤백 계획.

## SEO 운영 진실 계층 계약
`SeoEvidence{engine, property, uri, source, fetchedAt, dateRange, sampleCount, status:VERIFIED|PARTIAL|STALE|NO_DATA|ERROR, submitted, crawled, indexed, clicks, impressions, ctr, position}`
`SeoDocument{routeId, primaryIntent, locale, jurisdiction, canonical, alternates, title, description, sourceEffectiveAt, contentChangedAt, robots, structuredDataEligible, indexState, qualityOwner}`
서버 단일 authoritative 생성기로 robots/canonical/hreflang/sitemap/JSON-LD 파생. 실패 상태를 숫자 100%로 대체하는 fallback 금지. 기존 Google ping 경로/가짜 색인 성공 UI는 제거 후보이며 실제 GSC API의 사용자 권한·응답·오류를 별도 확인한다.

## 기술 업무 분리 및 Git 운영
| 주체/브랜치 제안 | 범위 | 충돌 방지 |
|---|---|---|
| GPT: `fix/seo-truth-*` | 메트릭 진실·색인 API·schema P0 | 관리자 SEO 및 검색 서버 파일 독점 범위 지정 |
| Gemini: `fix/locale-seo-*` | locale-aware sitemap·canonical·title/hreflang | SEO metering 파일 수정 금지/공통 타입 합의 |
| UX: `feat/optional-economy-scenario-*` | 도구→선택 시뮬레이션 | 현재 UI 수용 게이트 준수 |
| Economy: `docs/economy-budget-authority-*` | 국고/AI 정책·복식부기 세부 권위 | 운영 DB migration/스위치 변경 금지 |

작업 전 모든 문서/최근 릴리스/PR 확인, 시작/중간/final `origin/main` SHA 기록, 변경 중에도 main fetch, EN/KO 대응, 내부·GitHub 업데이트/로그/릴리스 버전. 코드 수정 시 최신 main 별도 브랜치→Test exact candidate/백엔드+DB+E2E/보안→무중단 운영. 이번 v602는 어떤 코드/DB도 바꾸지 않음.

## 출시/학습 단계별 승인 게이트
| 단계 | 기획서 승인 요건 | 검증 없으면 |
|---|---|---|
| Gate 0: 지표 신뢰성 | real GSC/Naver/GA4와 NO_DATA 표현, 정당한 Google sitemap 제출 | 신규 SEO 확장 BLOCKED |
| Gate 1: URL 적격 | 대표 20~40개 SEO source/locale/canonical/hreflang/사용 가치 확인 | 기존 URL 유지, 신규 발행 보류 |
| Gate 2: 경제 첫 경험 | 1회 영수증, 정합성, 개인정보 동의, 모바일/접근성 | 공개 시뮬레이션만 제한 제공 |
| Gate 3: 장기 유지 | 신규 cohort D7/공정성/지원 비용 + 위험 사전 선언 | 규모 확대 보류 |
| Gate 4: 수익 | 실측 유효 광고 적격 PV/RPM/공헌, AdSense 적합 | 광고 확대·추가 국가 보류 |

**의사결정 필수:** 사용자와 제품 운영자가 C안 채택 여부 및 P0 범위를 승인하면 그때 별도 통합기획 버전으로 반영한다. 계획본 버전을 운영 버전과 같게 만들려고 올리지 말 것.
