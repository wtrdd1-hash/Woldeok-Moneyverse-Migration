# 제품 기획 Worklog — v2026.09.12.27

기준일: 2026-09-12
브랜치: `docs/monetization-compliance-seo-v2026.09.12.27`

## 목적

수익성, 광고, 한국/미국 규제 위험 최소화, 개인정보, 사용자에게 보이는 UX 품질, Google/검색 유입에 관한 지금까지의 요구사항을 Moneyverse Living 기획에 통합한다.

## 작업 전 GitHub 기준

- 최신 `main` SHA: `8acaedaa6287798b97cd7d3f847a72e3d86527a8`;
- `docs/planning/PROJECT_PLAN.md`;
- `docs/planning/PRODUCT_GROWTH_PLAN.md`;
- 현재 문서 INDEX와 v2026.09.12.26 직업/숙련도 통합 상태;
- WLD/WDX를 서비스 내부 가상·게임 시스템으로 유지하는 기존 원칙;
- Living Plan의 기존 광고/법률 gate와 SEO 기본선.

## 발견한 공백

기존 Living Plan에도 보수적인 광고 gate와 기본 SEO 요구사항은 있었지만 아래를 하나의 구현 지향형 기준으로 연결한 canonical 기획서는 없었다.

- 수익모델 선택;
- 광고 위치 규칙;
- 구독 UX;
- 한국/미국 준수 검토 gate;
- 개인정보 data architecture;
- 광고/분석 SDK governance;
- Search Console 운영;
- EN/KO SEO IA;
- 2026 Google Search 변경사항;
- 수익성과 사용자 피해 guardrail.

## 검토한 최신 외부 자료

1. 2026-09-08까지의 Google Search Central 문서 업데이트.
2. Google Search Essentials 및 최신 Core Web Vitals 가이드.
3. 독창적이고 유용한 콘텐츠와 기존 SEO 기본기를 강조하는 2026 Google 생성형 AI Search 가이드.
4. FTC 광고/마케팅, 추천·리뷰, 네이티브 광고 투명성 가이드.
5. 2025년 4월 COPPA 개정사항을 반영한 FTC 가이드.
6. FTC 2026 negative-option/구독 자료 및 최근 구독 집행사례.
7. California AG/CPPA CCPA 자료와 2026 시행 위험평가 규정.
8. 한국 개인정보보호위원회 행태정보/맞춤광고 자료 및 2026 가명정보 가이드.
9. 한국 공정거래위원회 추천·보증 경제적 이해관계 공개 개정자료.

## 결정

- 초기 광고는 contextual/non-personalized를 기본으로 하고 personalized 광고는 개인정보/법률 검토 후 켠다.
- 민감한 금융 유사 행동 화면에는 광고를 배치하지 않는다.
- 네이티브/스폰서 콘텐츠는 콘텐츠 가까이에 광고임을 명확히 표시한다.
- 구독은 가격/자동갱신을 명확히 공개하고 명시적 동의와 간단한 해지를 제품 불변조건으로 둔다.
- WLD/WDX에는 virtual/simulated/game-only 성격을 일관되게 표시한다.
- SEO를 EN/KO IA, indexability contract, Search Console, Core Web Vitals까지 포함한 제품 subsystem으로 다룬다.
- FAQ rich result처럼 Google에서 제거된 기능을 핵심 성장전략으로 사용하지 않는다.
- `llms.txt`를 Google 순위 요구사항처럼 취급하지 않는다.
- 수익 최적화는 CTR만 보지 않고 리텐션, 신뢰, 지원부담, 성능을 함께 본다.

## 작업 중간 동시변경 확인

중간에 `main`을 다시 확인했고 `8acaedaa6287798b97cd7d3f847a72e3d86527a8`로 유지됐다. 이번 문서작업에 반영해야 할 새로운 main 변경은 없었다.

## 추가/수정 파일

- `docs/planning/MONETIZATION_COMPLIANCE_SEO_SPEC.md`
- `docs/planning/MONETIZATION_COMPLIANCE_SEO_SPEC.ko.md`
- `docs/changelog/2026-09-12-monetization-compliance-seo-v2026.09.12.27.md`
- `docs/changelog/2026-09-12-monetization-compliance-seo-v2026.09.12.27.ko.md`
- 영문/한국어 worklog
- `docs/INDEX.md`

## 실제 서비스 검증

이번 회차의 현재 웹 retrieval 경로에서는 운영/테스트 공개 엔드포인트를 실제 정상 서비스로 검증하지 못했다. 따라서 현재 운영 UI나 runtime 건강상태를 추측하거나 정상이라고 기록하지 않는다.

## 배포

문서-only 변경이므로 테스트 서버 배포는 필요하지 않다.

이 문서를 실제 구현할 때는 별도 런타임 개발 브랜치와 기존 staging-first 릴리스 절차를 사용한다.

## 다음 우선순위

1. 실제 광고 슬롯 wireframe 및 responsive layout;
2. 개인정보 preference center UX와 consent state machine;
3. 현재 Next.js 앱과 실제 공개 SEO route/template 대조;
4. Search Console 운영 runbook 및 sitemap/canonical 자동 회귀검사;
5. 광고-only / 광고제거 구독 / 혼합모델 수익 시나리오;
6. 기능/국가별 출시 법률검토 matrix;
7. 서비스 복구 시 첫 `Runtime Product Reality Audit` 실행.