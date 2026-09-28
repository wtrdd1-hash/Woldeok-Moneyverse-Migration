# 📚 문서 카탈로그 (Document Catalog)

[English canonical](DOCUMENT_CATALOG.md) | **한국어**

> **스냅샷 버전**: `v2026.09.28.477`  
> **기준 브랜치**: `main` (15대 전 도메인 REST API 풀스택 체계화 및 마스터 카탈로그 발행)  
> **용도**: 전체 프로젝트 문서 체계의 인벤토리 및 정리 상태를 공증하는 공식 카탈로그 원장.

---

## 🏛️ 공식 권위 문서 (Authoritative Master Docs)

1. **[통합 앱 명세서 및 유저 가이드](APP_SPEC_AND_USER_GUIDE.ko.md)**: 15대 전 도메인 공식 구현 스펙 및 사용자 안내
2. **[기획서 전 기능 추적 매트릭스 & 심화 QA 보고서 (v473)](QA_TRACEABILITY_MATRIX_V473.ko.md)**: 14대 도메인 42개 기획 기능 전수 대조 및 100% 검증 원장
3. **[2026 차세대 핀테크 디자인 시스템 공식 지침서](DESIGN_SYSTEM_GUIDELINES.ko.md)**: Linear/Stripe/Apple 20만+ 래퍼런스 기반 디자인 규격
4. **[2026 반응형 디자인 기준 공식 지침서](RESPONSIVE_DESIGN_GUIDELINES.ko.md)**: 320px~1920px 5대 뷰포트 매트릭스 및 Zero-Overflow 방어 지침
5. **[풀스택 전체 QA 전수 감사 보고서 (v473)](QA_AUDIT_REPORT_V473.ko.md)**: 300+ API, 11대 관리자 화면, 5대 뷰포트 ALL_GREEN_PASS 검증 원장
6. **[문서 인덱스 (INDEX.ko.md)](INDEX.ko.md)**: 15대 도메인별 선별 탐색 경로
7. **[현재 런타임/OS 기준](CURRENT_RUNTIME_BASELINE.ko.md)**: Debian/systemd/Nginx/Docker/PostgreSQL 인프라 베이스라인
8. **[문서 거버넌스 정책](DOCUMENTATION_POLICY.ko.md)**: Single Source of Truth(SSOT) 및 버전 관리 불변식

---

## 📊 인벤토리 요약

`docs/` 디렉토리 내 문서는 총 **1,650개**이며, 15대 도메인별로 완벽하게 분류 및 색인화되었습니다.

| 문서 분류군 | 파일 수 | 주요 내용 |
| :--- | :---: | :--- |
| **01. 마스터 스펙 / 가이드** | 67 | 앱 통합 명세서, 기획 추적 매트릭스, 런타임 베이스라인, 문서 정책 |
| **02. 디자인 시스템** | 6 | 2026 핀테크 디자인 지침서, 2026 반응형 공식 지침서, UI/UX 가이드 |
| **03. 기획 (Planning)** | 280 | 제품 성장 계획(pSEO/바이럴), 보안 보증, 통화 유통속도 |
| **04. 기능 가이드 (Features)** | 22 | 복리 계산기, 주식 거래소, 직업 파밍, 출석 룰렛 |
| **05. 아키텍처 / 인프라** | 12 | MSA 게이트웨이, PostgreSQL ACID 원장, Nginx Reverse Proxy |
| **06. API / 계약 (Contracts)** | 10 | REST API 마스터 카탈로그, OpenAPI 3.0, 모바일 계약 |
| **07. 작업 일지 (Worklog)** | 548 | 일자별 상세 기술 구현 내역 및 배포 기록 |
| **08. 변경 이력 (Changelog)** | 425 | 릴리스별 변경점 및 버그 픽스 히스토리 |
| **09. 업데이트 로그** | 162 | `v469 ~ v473` 릴리스 공지 및 변경 사항 요약 |
| **10. 릴리스 아카이브 & QA 보고서** | 64 | `v473 QA 전수 감사`, `기획 추적 매트릭스`, 릴리스별 산출물 |

---

## 🧹 문서 정리 및 보존 규칙 (Preservation Invariants)

1. **역사 기록 영구 보존**: 기존의 일자별 작업 일지와 릴리스 변경 로그를 임의로 삭제하거나 덮어쓰지 않고 최신 버전을 순수 추가(`-0 lines`) 형태로 누적 관리합니다.
2. **단일 진실 공급원 (SSOT)**: 라우트 목록은 `routes.config.ts`, API는 `API_CATALOG_MASTER.ko.md`, 디자인 규격은 `DESIGN_SYSTEM_GUIDELINES.ko.md`, 반응형 규격은 `RESPONSIVE_DESIGN_GUIDELINES.ko.md`, QA 검증은 `QA_AUDIT_REPORT_V473.ko.md` 및 `QA_TRACEABILITY_MATRIX_V473.ko.md`로 일원화합니다.
3. **다국어 무결성**: 핵심 거버넌스 문서는 한국어/영문 페어로 상호 링크를 유지합니다.
