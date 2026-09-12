# 한국어 문서 동등성 — v2026.09.12.28

[English](2026-09-12-korean-documentation-parity-v2026.09.12.28.md) | **한국어** | [한국어 문서 색인](../INDEX.ko.md)

날짜: 2026-09-12  
유형: 문서 전용 현지화 및 이동 경로 정비

## 요약

저장소의 현재 아키텍처, 기능, 운영, 연동, 감사, 릴리스, 작업 기록 문서에 한국어 대응 문서를 마련하고 한국어 문서 사이에서 바로 이동할 수 있도록 정리했습니다.

문서 언어 기본 순서는 그대로 유지합니다.

1. 영어 — 공식/기준 원문
2. 한국어 — 유지되는 번역본

## 추가된 한국어 대응 문서

### 아키텍처
- `docs/architecture/system-overview.ko.md`
- `docs/architecture/request-flow.ko.md`
- `docs/architecture/database-security.ko.md`
- `docs/architecture/deployment-flow.ko.md`

### 기능
- `docs/features/jobs-and-progression.ko.md`
- `docs/features/quests.ko.md`
- `docs/features/casino.ko.md`
- `docs/features/banking.ko.md`
- `docs/features/stocks.ko.md`
- `docs/features/businesses.ko.md`
- `docs/features/shop.ko.md`
- `docs/features/admin-control-center.ko.md`

### 운영 / 연동 / 유지관리
- `docs/INFRASTRUCTURE.ko.md`
- `docs/mobile-api.ko.md`
- `docs/operations/local-development.ko.md`
- `docs/operations/database-migrations.ko.md`
- `docs/operations/backup-and-recovery.ko.md`
- `docs/operations/production-deployment.ko.md`
- `docs/operations/security-model.ko.md`
- `docs/localization/README.ko.md`
- `docs/images/README.ko.md`
- `docs/as-casts.ko.md`
- `docs/UPDATE_LOG.ko.md`

### 감사 / 릴리스 / 과거 작업 기록
- 영어로만 있던 프로젝트 부족 사항 감사와 공개 검색 노출 감사에 한국어 문서를 추가했습니다.
- v2026.09.07, v2026.09.07.1, v2026.09.07.2, v2026.09.08 공개 게시판 릴리스 기록에 한국어 문서를 추가했습니다.
- 주요 영어 전용 과거 작업 로그와 변경 기록에 한국어 대응 문서를 추가했습니다.
- 초기 영어 전용 기반/백엔드 구현 계획에는 전체 작업 구조와 최신 문서 우선순위를 설명하는 한국어 대응 문서를 추가했습니다.

## 문서 이동 경로

- `docs/INDEX.md`에서 영어 원문 옆에 한국어 링크를 배치합니다.
- `docs/INDEX.ko.md`를 한국어 문서 허브로 사용합니다.
- 새 한국어 문서 상단에는 영어 원문과 한국어 색인으로 이동하는 링크를 둡니다.
- 원문 자체가 이미 한국어이거나 영어/한국어 병기 문서인 경우 불필요하게 같은 문서를 복제하지 않고 색인에서 이를 표시합니다.

## 과거 문서 처리 원칙

과거 문서는 당시 사실을 임의로 최신 상태처럼 다시 쓰지 않습니다. 예를 들어 과거 인프라 문서가 최신 배포 문서와 충돌하는 경우 한국어판도 당시 기록을 보존하고, 실제 작업 전 최신 GitOps/런타임 문서를 다시 확인하도록 명시합니다.

## 런타임 영향

없습니다. 문서 전용 변경입니다. 애플리케이션 코드, API 동작, 데이터베이스 스키마/데이터, Kubernetes/Flux 상태, Production 런타임을 변경하지 않습니다. 저장소 문서 정책에 따라 문서 전용 변경은 `main`에 직접 반영하며 Test/Production 배포 절차가 필요하지 않습니다.
