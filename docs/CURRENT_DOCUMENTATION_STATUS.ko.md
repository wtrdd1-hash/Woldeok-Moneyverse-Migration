# 최신 문서 현황 — DOC-2026.11.11.1500

[English canonical](CURRENT_DOCUMENTATION_STATUS.md) | **한국어**

> 기준 시점: 2026-11-11 15:08 KST, 웹 저장소 기준 `05e9260208db5aecc2463347885ae095c1faba2e`. 이 페이지는 **문서 탐색·점검 기록**이며 새로운 기획 권위, 배포 증빙, 미검증 기능의 완료 선언이 아닙니다.

## 권위 문서 우선순위

1. [실행 기준 통합기획서](planning/PROJECT_PLAN.ko.md) / [영문](planning/PROJECT_PLAN.md): 병합된 `main`의 제품·개발 기준.
2. [통합 기획 마스터](planning/INTEGRATED_PLANNING_MASTER.ko.md) / [영문](planning/INTEGRATED_PLANNING_MASTER.md): 변경 이력 및 권위 불일치.
3. 통합 문서에서 **명시적으로 채택한** [상세기획](planning/README.ko.md). 기획 작성과 기능 구현·배포는 다릅니다.
4. [실제 런타임 기록](CURRENT_RUNTIME_BASELINE.ko.md) / [영문](CURRENT_RUNTIME_BASELINE.md), 버전 고정 API 계약 및 배포 영수증: 실측을 설명할 뿐 기획을 대체하지 않습니다.
5. [문서 정책](DOCUMENTATION_POLICY.ko.md), [문서 목록](DOCUMENT_CATALOG.ko.md), [영문 전체 색인](INDEX.md), [국문 색인](INDEX.ko.md), 변경/작업 이력.

기준 `main`의 통합기획서 상단에는 v1518 인벤토리 설계와 `v2026.11.09.1946.2` 블로그 공개 소유자 지시(**BRANCH CANDIDATE**)가 표시되어 있습니다. 별도 `planning-v2082-20261111-1405` / `113fba55c9` 작업 브랜치는 병합 근거가 없는 한 현재 `main` 기획 권위로 간주하지 않습니다. 루트 `implementation_plan.md`의 최신 버전도 제품 권위 자동 변경의 근거가 아닙니다.

## 확인 사실과 미검증 범위

| 항목 | 2026-11-11 근거 | 상태 |
|---|---|---|
| 웹 소스 | 상기 기준 `main`; v311 문서/스킬 변경 병합 기록 | 소스 확인만 완료 |
| 운영 | 15:08 KST 공개 `/api/version` HTTP 200, SHA `727881420a491bb129a1a97258ea8ae67f62bbf8`. [v1949 기록](releases/v2026.11.10.1949-funded-treasury-prod.md) 별도 존재 | 공개 버전 API 확인. 사용자 기능·금융거래 전체 검증 아님 |
| 테스트 | 15:08 KST `test.easy-scraping.com/api/version` HTTP 502; 14:14 QA 기록도 업스트림 불가 보고 | **BLOCKED**, 테스트 통과 선언 금지 |
| 관리자 OTP·국고·국채·연금·블로그 | 소스 및 과거 증빙 존재. 이번 문서 정리에서는 로그인 E2E/자금 거래 미실시 | 기능별 최신 검증·릴리스 증빙 확인 필요 |
| Android 앱 | [별도 앱 저장소](https://github.com/wtrdd1-hash/woldeok-moneyverse-app) `main` `ee97ddfc5a93d7198d2d1ee94bb5a13c3b62ebcb` | 앱 소스 확인만 완료, APK 빌드·API 호환성 미검증 |

## 문서 재고와 정리

- 웹 저장소 Git 추적 Markdown/MDX **4,909개** 확인, 앱 저장소 Markdown **59개** 확인.
- 웹 주요 분류: `worklog` 1,649개, `updates` 1,456개, `changelog` 620개, `planning` 376개, `releases` 214개.
- 내용 완전 동일한 그룹 56개 기록. 링크와 법적·운영 증빙을 고려해 과거 기록은 삭제하지 않음.
- 단순 링크 검사 5,315건 중 후보 647건에는 **웹/백엔드 API 주소가 다수 포함된 오탐**이 있어 실제 문서 오류 수치로 사용할 수 없음. `docs/DOCS_INDEX.md`의 잘못된 상대경로와 옛 파일명 5개를 별도로 교정.
- 영어·한국어 문서 짝 누락 **후보 8개**는 역사 문서 등 예외 여부를 먼저 분류해야 함.
- [상세 점검·후속 정리 목록](findings/2026-11-11-documentation-inventory-v2026.11.11.1500.ko.md) / [영문](findings/2026-11-11-documentation-inventory-v2026.11.11.1500.md).

영어 정본/한국어 보조 언어 원칙 유지, 격리 브랜치 사용, 작업 중·병합 전 `main` 재확인, 과거 기록·링크 보존, 시작/중간/종료 및 내부/GitHub 변경기록을 적용합니다. **문서만 변경했으며 데이터 초기화·운영 승격을 의미하지 않습니다.**
