# 수익화·준수·SEO — v2026.09.12.27

기준일: 2026-09-12

## 요약

수익화, 한국/미국 준수, 개인정보, 광고, 검색 유입을 제품 핵심 요구사항으로 다루는 구현 지향형 기획서를 추가했다.

## 추가사항

- 공개 콘텐츠 광고, 네이티브 스폰서, 광고제거 구독, 비-P2W 유료 꾸미기, 향후 B2B 후원을 포함한 수익모델 포트폴리오;
- WDX/랭킹/경제우위를 돈으로 직접 판매하지 않는 금지정책과 금융상품 오인 방지 문구;
- 광고 route allowlist/blocklist와 광고 슬롯 구현계약;
- 구독 가격·갱신·동의·해지·환불상태·멱등성 요구사항;
- 한국 개인정보/행태광고·추천보증·유료상품 검토 gate;
- 미국 FTC 광고, COPPA, 캘리포니아 개인정보, 정기결제 검토 gate;
- 개인정보 data inventory와 제3자 SDK 검토계약;
- EN/KO SEO 정보구조, canonical/hreflang/sitemap/indexability, Search Console 운영;
- 2026 Google Search 지역차이, 생성형 AI 검색, llms.txt, FAQ rich result 변경사항 반영;
- 광고 수익화와 공유하는 Core Web Vitals 성능예산;
- 수익/SEO analytics, KPI guardrail, 관리자 config;
- 광고·구독·SEO Definition of Done과 상용 출시 compliance checklist.

## 검토한 외부 근거

- 2026-09-08까지의 Google Search Central 문서 업데이트;
- Google Search Essentials / Core Web Vitals;
- 2026 Google 생성형 AI Search 가이드;
- FTC 광고/마케팅, 추천·리뷰, 네이티브 광고 가이드;
- 2025 개정사항을 반영한 FTC COPPA 자료;
- 2026 FTC negative-option/구독 자료;
- California AG/CPPA CCPA 및 2026 시행 규정;
- 한국 개인정보위 행태광고 및 2026 가명정보 자료;
- 한국 공정위 추천·보증 경제적 이해관계 공개 자료.

## 배포

문서-only 변경이다. 이번 버전은 테스트서버/운영 배포가 필요하지 않다. 실제 런타임 구현은 별도 개발 브랜치에서 진행하고 격리 테스트환경 검증 후 운영으로 승격한다.