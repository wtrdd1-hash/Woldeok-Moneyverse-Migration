# 📚 문서 카탈로그 (Document Catalog)

[English canonical](DOCUMENT_CATALOG.md) | **한국어**

> **스냅샷 버전**: `v2026.10`  
> **기준 브랜치**: `main` (실제 실물 경제 레퍼런스 기준: 중앙은행 통화정책, 2,500만 국고 앵커, 국채 3종/레포 거래소, WSHC 공기업 알리오, 국민연금공단(NPS) 역사적 도메인 기준)  
> **용도**: 전체 프로젝트 문서 체계의 인벤토리 및 정리 상태를 공증하는 공식 카탈로그 원장.

---

## 최신 공식 권위 (아래 구버전 목록보다 우선)

1. [문서관리 정책](DOCUMENTATION_POLICY.ko.md)에 따른 [최상위 구현기획 PROJECT_PLAN](planning/PROJECT_PLAN.ko.md) **v2026.10.10.542**가 제품·엔지니어링 권위다.
2. [통합 기획 마스터](planning/INTEGRATED_PLANNING_MASTER.ko.md)는 회차·결정·권위 차이 원장이다. 두 문서가 명시 채택한 세부명세만 현행 권위다.
3. [v542 경제 무결성·문서 정합화](planning/ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.ko.md)와 [v523 중앙은행·조폐국·국고·경제코어](planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.ko.md)가 우선한다. 아래 경제·국채·연금·FX 문서는 **조건부/검증대기 도메인 참고자료**로 최상위 제품 권위가 아니다.
4. v511 완료 원장과 v473 QA는 당시 이력이며 현재 `main` Test/Production 합격 증거가 아니다.

## 역사적 도메인 참고 문서 목록 (현재 권위순서 아님)

1. **[실제 실물 경제 레퍼런스 기준 거시경제 총괄 기획서](MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.ko.md)**: 한국은행/기재부 기준 중앙은행 통화정책, 2,500만 국고 앵커, 국채 3종/레포, 공기업 3사 배당, 국민연금 5단계, 자본시장/증권거래세 6대 기둥 총괄 사양서
2. **[국고 2,500만 앵커 & 자율 투자 회수 사이클 기획서](TREASURY_25M_ANCHOR_AUTONOMOUS_CYCLE_SPEC.ko.md)**: 무유저/저유저 환경 국고 자동 팽창 및 안전 비축금 2,500만 WLD 보존 자율 순환 엔진
3. **[국채(KTB) 3종 & 환매조건부채권(Repo) 대출 거래소 사양서](TREASURY_BONDS_EXCHANGE_SPEC.ko.md)**: 3년/5년/10년물 국채 실시간 호가 거래, 24시간 레포 대출 및 국고 이자 지급 엔진
4. **[국민연금공단(NPS) 공적 연금 적립 & 평생 기초연금 사양서](NATIONAL_PENSION_SERVICE_SPEC.ko.md)**: 5단계 적립(5만~100만 WLD), 국고 100% 매칭, 시간당 평생 기초연금 지급 및 3대 국부펀드 운용
5. **[한국은행 외환보유액 & 서울외환시장(FX) 환율 시스템 사양서](FOREIGN_EXCHANGE_RESERVES_AND_MARKET_SPEC.ko.md)**: 100만 USD 외환보유액, 변동환율제, 외환당국 스무딩 오퍼레이션 및 연 4.5% 달러 외화예금
6. **[글로벌 외환안정망 & SDR·금보유고, 통화스왑 비상협정 및 대국민 선물환(Forward) 환헤지 사양서](GLOBAL_FX_SAFETY_NET_AND_FORWARD_HEDGE_SPEC.ko.md)**: IMF SDR 바스켓 및 실물 금 104.4t 다변화, 한미/한일 통화스왑 상설 라인, CIP 이론 선물환 환헤지 센터 및 EWS 4단계 외환위기 조기경보
7. **[예금보험공사(KDIC) 5천만원 예금자보호법 & 금융안정기금 및 뱅크런 대위변제 사양서](DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.ko.md)**: 1인당 50만 WLD 보호, 0.08% 예보료 징수, 1,000만 WLD 예보기금, 부실금융 긴급 대여 및 대위변제 풀스택
8. **[국가투자공사(WSHC) 산하 3대 공기업 및 대국민 경영공시 알리오(ALIO) 사양서](STATE_ENTERPRISES_AND_CORPORATE_GOVERNANCE_SPEC.ko.md)**: 에너지·인프라·금융 3대 공기업 재무제표, 30% 국고 배당 납입 및 `/enterprises` 대국민 알리오 포털
6. **[국고 세수 자동 사회 환원 및 재정 선순환 기획서](planning/TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.ko.md)**: 국고 5대 금고, 4대 사회 환원, 10대 법정 세율 및 30% 안전 비축금 원장
7. **[통합 기획 마스터](planning/INTEGRATED_PLANNING_MASTER.ko.md)**: v2026.10 최신 프로덕션 릴리스 및 15대 도메인 권위 통합 기획
8. **[통합 앱 명세서 및 유저 가이드](APP_SPEC_AND_USER_GUIDE.ko.md)**: 15대 전 도메인 공식 구현 스펙 및 사용자 안내
9. **[2026 차세대 핀테크 디자인 시스템 공식 지침서](DESIGN_SYSTEM_GUIDELINES.ko.md)**: Linear/Stripe/Apple 20만+ 래퍼런스 기반 디자인 규격
10. **[2026 반응형 디자인 기준 공식 지침서](RESPONSIVE_DESIGN_GUIDELINES.ko.md)**: 320px~1920px 5대 뷰포트 매트릭스 및 Zero-Overflow 방어 지침
11. **[문서 인덱스 (INDEX.ko.md)](INDEX.ko.md)**: 15대 도메인별 선별 탐색 경로
12. **[현재 런타임/OS 기준](CURRENT_RUNTIME_BASELINE.ko.md)**: Debian/systemd/Nginx/Docker/PostgreSQL 인프라 베이스라인
13. **[문서 거버넌스 정책](DOCUMENTATION_POLICY.ko.md)**: Single Source of Truth(SSOT) 및 버전 관리 불변식

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
