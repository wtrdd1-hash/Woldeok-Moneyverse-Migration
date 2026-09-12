# 문서 색인

> 문서 언어 기본 순서: **1. 영어 원문 / 2. 한국어 번역본**. 모든 프로젝트 문서는 영어 원문과 한국어 번역본을 함께 유지합니다. 한국어 사용자는 `.ko.md` 문서를 사용합니다.

이 디렉터리는 Woldeok Moneyverse의 상세 프로젝트 문서를 관리합니다. 루트 README는 제품 개요를 제공하고, 이곳의 문서는 운영자와 개발자가 유지해야 할 기획·설계·운영 계약을 설명합니다.

## 기획

- [상시 갱신 프로젝트 계획](planning/PROJECT_PLAN.ko.md)
- [제품 성장 및 리텐션 계획](planning/PRODUCT_GROWTH_PLAN.ko.md)
- [상세 제품 설계 명세](planning/PRODUCT_DESIGN_SPEC.ko.md)
- [기본 제한 정책](planning/DEFAULT_LIMIT_POLICY.ko.md)
- [무제한 기본값 일관성 구현 명세](planning/LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.ko.md)
- [경제 소각처 명세](planning/ECONOMY_SINKS_SPEC.ko.md)
- [경제 소각처 카탈로그](planning/ECONOMY_SINK_CATALOG.ko.md)
- [사업 운영 및 공급망 명세](planning/BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.ko.md)
- [개인 공간 및 도시 프로젝트 명세](planning/PERSONAL_SPACES_CITY_PROJECTS_SPEC.ko.md)
- [플레이어 마켓 및 제작 명세](planning/PLAYER_MARKETPLACE_CRAFTING_SPEC.ko.md)
- [클럽 및 협동 경제 명세](planning/CLUBS_COOPERATIVE_ECONOMY_SPEC.ko.md)
- [커뮤니티 및 시장 무결성 명세](planning/COMMUNITY_MARKET_INTEGRITY_SPEC.ko.md)

프로젝트 계획은 계속 갱신되는 명세입니다. 검증된 구현 변경은 같은 개발 흐름에서 기획서에도 반영해야 하며, 보안 또는 데이터 무결성 규칙 위반은 문서로 정당화하지 않고 코드를 수정합니다.

## 아키텍처

- 시스템 개요 — `architecture/system-overview.md` (한국어 번역 필요)
- 요청 흐름 — `architecture/request-flow.md` (한국어 번역 필요)
- 데이터베이스 보안 경계 — `architecture/database-security.md` (한국어 번역 필요)
- 배포 흐름 — `architecture/deployment-flow.md` (한국어 번역 필요)

## 게임플레이 및 제품 기능

- 직업 및 성장 — `features/jobs-and-progression.md` (한국어 번역 필요)
- 퀘스트 — `features/quests.md` (한국어 번역 필요)
- 카지노 — `features/casino.md` (한국어 번역 필요)
- 뱅킹 — `features/banking.md` (한국어 번역 필요)
- 주식 — `features/stocks.md` (한국어 번역 필요)
- 사업 — `features/businesses.md` (한국어 번역 필요)
- 상점 — `features/shop.md` (한국어 번역 필요)
- 관리자 제어 센터 — `features/admin-control-center.md` (한국어 번역 필요)

## 현지화

- 현지화 유지관리 및 동등성 정책 — `localization/README.md`

## 통합

- 모바일 / 외부 앱 API — `mobile-api.md` (한국어 번역 필요)

## 운영

- 현재 배포 구조 — `INFRASTRUCTURE.md` (한국어 번역 필요)
- [릴리스 가이드](RELEASING.ko.md)
- 로컬 개발 — `operations/local-development.md` (한국어 번역 필요)
- 데이터베이스 마이그레이션 — `operations/database-migrations.md` (한국어 번역 필요)
- 백업 및 복구 — `operations/backup-and-recovery.md` (한국어 번역 필요)
- 운영 배포 — `operations/production-deployment.md` (한국어 번역 필요)
- 보안 모델 — `operations/security-model.md` (한국어 번역 필요)
- [릴리스 및 변경 기록 정책](operations/release-documentation-policy.ko.md)

## 릴리스 기록 및 작업 로그

영어 기록을 1번 문서, 한국어 `.ko.md` 기록을 2번 문서로 함께 유지합니다. 최신 기획·변경 기록에도 동일한 언어 쌍 규칙을 적용합니다.

- [Business Operations & Supply Chain v2026.09.12.25 변경 기록 — 한국어](changelog/2026-09-12-business-operations-supply-chain-v2026.09.12.25.ko.md)
- [제품 기획 v2026.09.12.25 작업 로그 — 한국어](worklog/2026-09-12-product-planning-v2026.09.12.25.ko.md)
- [Unlimited-Default Consistency v2026.09.12.23 변경 기록 — 한국어](changelog/2026-09-12-unlimited-consistency-v2026.09.12.23.ko.md)
- [Community & Market Integrity v2026.09.12.21 변경 기록 — 한국어](changelog/2026-09-12-community-market-integrity-v2026.09.12.21.ko.md)
- [Clubs & Cooperative Economy v2026.09.12.20 변경 기록 — 한국어](changelog/2026-09-12-clubs-cooperative-economy-v2026.09.12.20.ko.md)
- [Player Marketplace & Crafting v2026.09.12.16 변경 기록 — 한국어](changelog/2026-09-12-player-marketplace-crafting-v2026.09.12.16.ko.md)
- [Personal Spaces & City Projects v2026.09.12.11 변경 기록 — 한국어](changelog/2026-09-12-personal-spaces-city-projects-v2026.09.12.11.ko.md)
- [영문 변경 기록의 한국어판](changelog/CHANGELOG.ko.md)

## 문서 관리 규칙

1. 기준 언어는 영어이며 같은 내용의 한국어 문서를 두 번째 문서로 반드시 유지합니다.
2. 영어 파일이 `NAME.md`이면 한국어 파일은 `NAME.ko.md`를 기본 파일명으로 사용합니다.
3. 영어 문서를 수정하면 같은 작업에서 한국어 문서도 동기화합니다.
4. 한국어 번역본이 없는 기존 문서는 번역 대상에서 누락시키지 않고 순차적으로 보완합니다.
5. **문서만 수정하는 작업은 별도 브랜치를 만들지 않고 `main`에 바로 반영합니다.**
6. 코드·설정·데이터베이스·인프라·배포 변경은 별도 브랜치와 테스트 환경 검증 절차를 유지합니다.
7. 기획서는 상시 변경될 수 있으므로 개발 시작 전과 개발 중간에 최신 기획서를 다시 확인합니다.
8. 변경 작업은 버전을 부여하고 내부 작업 기록과 GitHub 변경 기록에 같은 버전을 남깁니다.
