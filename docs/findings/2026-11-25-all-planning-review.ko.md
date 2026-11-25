# 전체 기획·문서 재검토
버전 v2026.11.25.PLANREVIEW.1 · 검토일2026-11-25 KST

**발견 사항17건(P1 5건·P2 12건)**을 기록했습니다. 사용자 결정2건은 이 브랜치 문서에 반영했으며 나머지 결함을 수정 완료했다고 선언하지 않습니다.

## 범위와 확인 수준
main9876c09888ec84034eec183cf1309c85df3d7447 기준 문서5300개·기획399개·약25MB 전체 텍스트를 구조 검사했습니다. 처음5298개 확장자 목록에 빠진 텍스트2개를 추가했습니다. 열린 PR42개의 파일 변경7054건을 끝까지 조회했고, 기획 변경15개 PR의71항목·48고유 경로/내용 조합도 구조 검사했습니다.
모든 문장·번역의 정독은 아닙니다. 핵심 권위·고위험 분야를 별도 의미 검토했으며 파일별 깊이를 명시했습니다. STRUCTURAL_ONLY는 의미 검토 완료가 아닙니다.

|Depth|All docs|Planning|
|---|---:|---:|
|FULL_READ|46|24|
|SECTION_REVIEWED|23|14|
|STRUCTURAL_ONLY|5231|361|

[Coverage / QA ledger](../qa/2026-11-25-all-planning-review.json)

## 사용자 확정·문서 반영

1. 가상 예금보호는 기존500,000 WLD 설계 한도를 회원별·기관별로 적용합니다. 색인100배 오기를 정정했고 실제 정부 보험·원화 환급이 아님을 명시했습니다.
2. EN·KO 포함 모든 언어 화면에 /en·/ko·/ja·/zh·/vi 접두사를 사용합니다. API·콜백·소켓은 유지합니다. 실제 URL은 변경하지 않았습니다.
[결정·우선 범위](../planning/deltas/v2026.11.25.PLANREVIEW.1.ko.md). main 병합 전 문서 후보입니다.

## 발견 사항

|ID|Priority|내용|State|
|---|---|---|---|
|PLANREV-01|P1|QA 검사 성공이 실제 승격 수용으로 오인될 수 있음|OPEN|
|PLANREV-02|P1|국고 이동을 통화 소각·발행으로 잘못 분류할 수 있음|OPEN|
|PLANREV-03|P1|가상 예금보호 범위·금액·현실 보장 표현 충돌|OWNER_CONFIRMED_DOC_PATCH_RUNTIME_OPEN|
|PLANREV-04|P1|작업 명령서의 런타임·배포 경로가 충돌함|OPEN|
|PLANREV-16|P1|열린 UI PR의 전 페이지 게스트 열람 지시가 관리자 경계와 충돌함|UPSTREAM_PR_OPEN|
|PLANREV-05|P2|현재 운영 요약이 오래됐고 실제 제공 산출물을 특정하지 못함|OPEN|
|PLANREV-06|P2|자동 이미지 준비·체크포인트 규칙에 이미 확정된 결정이 미반영|OPEN|
|PLANREV-07|P2|관리자 매 회차·반응형 증거 필드 검사가 부족함|OPEN|
|PLANREV-08|P2|현재 색인이 옛 색상·무결함 QA를 단일 기준으로 안내함|OPEN|
|PLANREV-09|P2|언어 기본값·한국어 루트·접두사 URL 지시가 충돌함|OWNER_CONFIRMED_DOC_PATCH_RUNTIME_OPEN|
|PLANREV-10|P2|아키텍처 PR3423의 국문 통합 마스터 공지가 누락됨|UPSTREAM_PR_OPEN|
|PLANREV-11|P2|결제 상세 기획에 기존 광고 전용 출시 차단 조건이 누락됨|OPEN|
|PLANREV-12|P2|FX 기획의 운영 통합 선언이 원천 차단과 맞지 않음|OPEN|
|PLANREV-13|P2|블로그 구현 현황 표가 교체된 스텁을 현재 상태로 설명함|OPEN|
|PLANREV-14|P2|API 마스터의 동일한 잘못된 접두사로 상대 링크352건이 깨짐|OPEN|
|PLANREV-15|P2|지갑 예정 함수의 search_path 표준이 명령서와 다름|OPEN|
|PLANREV-17|P2|열린 UI PR 안에 v11·v10 단독 권위와 색상 지시가 공존함|UPSTREAM_PR_OPEN|

### PLANREV-01 · P1 · QA 검사 성공이 실제 승격 수용으로 오인될 수 있음

결함 번호가 있으면 5회 모두 FAIL 또는 BLOCKED인 원장도 ok:true입니다. 관리자 1회·게스트 4회 및 브라우저·뷰포트·역할 정보가 없는 입력도 통과했습니다. 실제 병합·운영 승격 우회를 입증한 것은 아니며 문서상 수용 조건과 도구 판정의 간극입니다.

조치: 기록 완전성 검사와 최종 수용 검사를 분리하고, 미해결 실패·차단은 수용 모드에서 거부해야 합니다. 실패 이력은 보존합니다.

[scripts/qa/verify-full-route-qa-ledger.mjs:64](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/scripts/qa/verify-full-route-qa-ledger.mjs#L64) · [scripts/qa/verify-full-route-qa-ledger.mjs:97](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/scripts/qa/verify-full-route-qa-ledger.mjs#L97) · [docs/planning/FULL_ROUTE_UI_QA_SPEC.md:85](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/FULL_ROUTE_UI_QA_SPEC.md#L85)

### PLANREV-02 · P1 · 국고 이동을 통화 소각·발행으로 잘못 분류할 수 있음

소각 목록은 회원 잔액에서 빠져 다른 회원에게 가지 않으면 HARD_SINK로 정의하지만, 중앙은행 코어는 공식 소각 전표·증명서와 M_total 감소를 요구합니다. 국고로 이동한 수수료와 재원 있는 이자 지급을 발행·소각과 분리해야 합니다.

조치: 기존 v523/v542 회계 정의로 영한 도메인 명세와 지표·시뮬레이션 수용 예제를 통일합니다. 새 정책 결정이 필요하지 않습니다.

[docs/planning/ECONOMY_SINK_CATALOG.md:15](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/ECONOMY_SINK_CATALOG.md#L15) · [docs/planning/BANKING_CREDIT_SAFETY_SPEC.md:73](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/BANKING_CREDIT_SAFETY_SPEC.md#L73) · [docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md:24](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md#L24) · [docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md:107](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md#L107)

### PLANREV-03 · P1 · 가상 예금보호 범위·금액·현실 보장 표현 충돌

영문은 전체 기관 합산, 국문은 기관별입니다. 색인은5,000만 WLD지만 상세 명세는50만 WLD입니다. 공식 보험·원화 상당·즉시 보장 표현도 은행 안전 계약과 다릅니다. 사용자 결정에 따라 회원별·기관별로 정리하고 금액 오기를 수정했습니다. 현실 보험이 아닌 미활성 게임 설계임을 명시했으며 지급 기능을 검증한 것은 아닙니다.

조치: 사용자 확정 문서를 병합한 뒤 적격성·재원·우선순위·재원 부족·원장 영수증을 별도 검증해야 활성화할 수 있습니다.

[docs/DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.md:11](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.md#L11) · [docs/DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.ko.md:12](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DEPOSIT_INSURANCE_AND_FINANCIAL_STABILITY_SPEC.ko.md#L12) · [docs/DOCS_INDEX.md:110](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DOCS_INDEX.md#L110) · [docs/planning/BANKING_CREDIT_SAFETY_SPEC.md:13](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/BANKING_CREDIT_SAFETY_SPEC.md#L13)

### PLANREV-04 · P1 · 작업 명령서의 런타임·배포 경로가 충돌함

AGENTS는 Kubernetes/Flux·Docker 없음·Test 없음으로 설명하지만 운영 문서는 Debian/systemd와 Test를 명시합니다. Spring 단일 런타임 문서의 Next 프로세스0 주장과도 현재 활성 Next unit 메타데이터가 다릅니다. 서로 다른 계층의 기록을 하나의 배포 명령으로 사용하면 안 됩니다.

조치: 실측 운영·승인 목표·과거 기록을 나누고 작업 명령서를 통일해야 합니다. 승인된 Next+Spring 목표와 독립 Test·별도 운영 승인을 유지합니다.

[AGENTS.md:368](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L368) · [docs/INFRASTRUCTURE.md:9](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/INFRASTRUCTURE.md#L9) · [docs/RELEASING.md:14](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/RELEASING.md#L14) · [docs/SPRING_BOOT_SINGLE_RUNTIME_ARCHITECTURE.md:13](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/SPRING_BOOT_SINGLE_RUNTIME_ARCHITECTURE.md#L13)

### PLANREV-16 · P1 · 열린 UI PR의 전 페이지 게스트 열람 지시가 관리자 경계와 충돌함

PR3442는 관리자 포함 전 범위를 선언한 뒤 모든180페이지를 예외 없이 비로그인 열람하도록 요구하지만 같은 PR의 단일 기준은 관리자 검증과 경로 RBAC를 요구합니다. 실제 관리자 정보 노출이 입증된 것이 아니라 위험한 구현 지시 충돌입니다.

조치: 게스트 탐색을 검토된 공개 안전 경로·시안으로 한정하고 보호 HTML·데이터·API 권한 경계를 유지해야 합니다.

[docs/design/CURRENT_UI_DESIGN.md:7](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/design/CURRENT_UI_DESIGN.md#L7) · [docs/design/CURRENT_UI_DESIGN.md:16](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/design/CURRENT_UI_DESIGN.md#L16) · [docs/UI_UX_SINGLE_REFERENCE.md:15](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/UI_UX_SINGLE_REFERENCE.md#L15)

### PLANREV-05 · P2 · 현재 운영 요약이 오래됐고 실제 제공 산출물을 특정하지 못함

문서 상단은11월21일 점검503이지만 지정한 무쿠키 감사 클라이언트는 두 루트200·점검 문구 없음, 버전 API503을 관측했습니다. 기본 HTTP 클라이언트는 차단되어 브라우저·외부 Test 경계 검증으로 해석하지 않습니다. 기존 명명 unit과 실제 활성 unit도 달라 정확한 제공 SHA·경로별 프로세스는 아직 미인증입니다.

조치: 현재 경로→프로세스→산출물→소스의 시점 고정 증빙을 갱신해야 합니다. 이 목록만으로 프로세스를 중지하거나 옛 unit을 시작하지 않습니다.

[docs/planning/PROJECT_PLAN.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/PROJECT_PLAN.md#L3) · [docs/planning/INTEGRATED_PLANNING_MASTER.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTEGRATED_PLANNING_MASTER.md#L3) · [docs/CURRENT_RUNTIME_BASELINE.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/CURRENT_RUNTIME_BASELINE.md#L3) · [docs/RELEASING.md:44](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/RELEASING.md#L44)

### PLANREV-06 · P2 · 자동 이미지 준비·체크포인트 규칙에 이미 확정된 결정이 미반영

워크플로는 workflow_run 자동 실행과 candidate_run_id 필수 수동 실행을 지원하지만 명령서는 단순 수동 명령만 제시합니다. 커밋 금지와 체크포인트 푸시도 함께 있습니다. 자동 이미지 준비·별도 운영 승인, 작업 브랜치 커밋·푸시 포함·main 병합 별도는 이미 사용자 확정 사항입니다.

조치: 확정된 결정을 문서 예제·명령서에 통일하고 후보 증빙 게이트를 유지합니다. 열린 통합 PR과 조정하며 타 브랜치를 덮어쓰지 않습니다.

[.github/workflows/deploy.yml:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/.github/workflows/deploy.yml#L3) · [.github/workflows/deploy.yml:9](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/.github/workflows/deploy.yml#L9) · [AGENTS.md:392](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L392) · [AGENTS.md:449](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L449) · [AGENTS.md:460](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L460)

### PLANREV-07 · P2 · 관리자 매 회차·반응형 증거 필드 검사가 부족함

관리자는5회 각각 실데이터를 검사해야 하지만 도구는 전체 중 관리자 fixture1개만 요구합니다. 역할·브라우저·너비·방향·확대 필드 누락도 허용됩니다. 합성 입력으로 독립 재현했습니다.

조치: 회차별 관리자 수용 증거와 실제 필수 행렬 필드를 검사하고, 권한 거부 음성 시험을 관리자 정상 흐름과 구분합니다.

[scripts/qa/verify-full-route-qa-ledger.mjs:80](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/scripts/qa/verify-full-route-qa-ledger.mjs#L80) · [docs/planning/FULL_ROUTE_UI_QA_SPEC.md:73](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/FULL_ROUTE_UI_QA_SPEC.md#L73) · [docs/planning/FULL_ROUTE_UI_QA_SPEC.md:80](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/FULL_ROUTE_UI_QA_SPEC.md#L80)

### PLANREV-08 · P2 · 현재 색인이 옛 색상·무결함 QA를 단일 기준으로 안내함

문서 목록은 금색·청록 가이드와 과거 v473의100% 무결함 QA를 단일 기준으로 안내합니다. 이후 채택한 디자인은 네이비·보라이며 후보별 재검증이 필요합니다. 과거 결과 자체가 틀렸다는 주장이 아니라 현재 수용 기준으로 노출되는 문제입니다.

조치: 과거 문서는 보존하면서 폐기된 디자인·QA 부분을 역사 기록으로 표시하고 현재 기준 링크를 갱신합니다.

[docs/DOCUMENT_CATALOG.ko.md:150](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DOCUMENT_CATALOG.ko.md#L150) · [docs/DESIGN_SYSTEM_GUIDELINES.md:54](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/DESIGN_SYSTEM_GUIDELINES.md#L54) · [docs/QA_TRACEABILITY_MATRIX_V473.md:7](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/QA_TRACEABILITY_MATRIX_V473.md#L7) · [docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md:13](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md#L13)

### PLANREV-09 · P2 · 언어 기본값·한국어 루트·접두사 URL 지시가 충돌함

이전 국제화·성장·편집 명세는 한국어 기본과 무접두사 canonical,11월20일 명세는 영어·5개 언어를 요구합니다. 이번 사용자 답변에 따라 모든 언어 접두사로 결정하고 영한 명세·마스터에 우선 조항을 추가했습니다. 실제 URL은 이전하지 않았습니다.

조치: 기획 병합 후 기존 URL 호환·접두사 매핑·권한·noindex·다국어 SEO를 독립 Test로 검증해야 합니다. API·콜백·소켓 경로는 유지합니다.

[docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md:242](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md#L242) · [docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md:278](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md#L278) · [docs/planning/GLOBAL_GROWTH_EXECUTION_SPEC.md:62](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/GLOBAL_GROWTH_EXECUTION_SPEC.md#L62)

### PLANREV-10 · P2 · 아키텍처 PR3423의 국문 통합 마스터 공지가 누락됨

상세 기획·프로젝트 계획은 영한 쌍이지만 통합 마스터의 새 아키텍처 공지는 영문에만 있습니다. 승인된 Next+Spring 방향을 다시 묻는 문제가 아니라 미병합 PR의 동기화 누락입니다.

조치: 해당 PR에서 국문 통합 마스터 공지를 맞추고 병합·운영 미적용 상태도 동일하게 기록합니다.

[docs/planning/INTEGRATED_PLANNING_MASTER.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/bdec6e9f6164b79e58cc2287d3cad927f6441799/docs/planning/INTEGRATED_PLANNING_MASTER.md#L3)

### PLANREV-11 · P2 · 결제 상세 기획에 기존 광고 전용 출시 차단 조건이 누락됨

국제화 유료 상품·결제 완료 조건에 상위 AD_ONLY 사업범위 차단을 명시하지 않아 오독할 수 있습니다. 실제 결제 출시 우회를 입증한 것은 아닙니다. 게임 WLD 전용 멤버십은 별도이며 기존 허용 범위를 유지합니다.

조치: 국가·채널별 표와 출시 점검표에 상위 현실 결제 차단을 명시합니다. 이미 확정된 광고 전용 결정을 재질문하지 않습니다.

[docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md:135](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTERNATIONAL_LOCALE_JURISDICTION_MONETIZATION_SPEC.md#L135) · [docs/planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md:21](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md#L21) · [docs/planning/AD_ONLY_ADVERTISING_REVENUE_SPEC.md:11](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/AD_ONLY_ADVERTISING_REVENUE_SPEC.md#L11)

### PLANREV-12 · P2 · FX 기획의 운영 통합 선언이 원천 차단과 맞지 않음

FX 문서는 과거 매크로 문서를 최상위 권위로 놓고 AUTHORITATIVE_PRODUCTION_INTEGRATED를 선언하지만, 현재 소스는 원천 미검증503을 명시합니다. 소스 읽기가 운영 접속 시험을 뜻하지 않습니다.

조치: 기존 기획 체계 아래 조건부·역사 상태로 구분하고, 실제 원장·재원·자격·Test 증거가 없으면 활성화하지 않습니다.

[docs/FOREIGN_EXCHANGE_RESERVES_AND_MARKET_SPEC.md:4](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/FOREIGN_EXCHANGE_RESERVES_AND_MARKET_SPEC.md#L4) · [docs/MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/MACRO_SOVEREIGN_ECONOMIC_SYSTEM_MASTER_SPEC.md#L3) · [spring-backend/src/main/java/com/moneyverse/api/domain/fx/controller/PublicFxController.java:25](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/spring-backend/src/main/java/com/moneyverse/api/domain/fx/controller/PublicFxController.java#L25)

### PLANREV-13 · P2 · 블로그 구현 현황 표가 교체된 스텁을 현재 상태로 설명함

v1405 표는 작성·게시·관리 미구현과 항상 미구현 반환을 주장하지만 같은 문서의 v1412 공지와 현재 소스에 작성·게시·관리 연결이 있습니다. 소스 상태를 정정해야 하며 실제 게시 품질·운영 활성화는 별도 미검증입니다.

조치: 영한 현황 표를 갱신하고 이후 사용자 공개 정책을 연결하며 소스·Test·운영 상태를 나눕니다.

[docs/planning/BLOG_TWO_HOUR_AUTOPUBLISH_SPEC_v2026.10.28.1405.md:44](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/BLOG_TWO_HOUR_AUTOPUBLISH_SPEC_v2026.10.28.1405.md#L44) · [backend/src/scheduler/scheduler.module.ts:101](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/backend/src/scheduler/scheduler.module.ts#L101) · [backend/src/blog-editorial/blog-verified-job.ts:23](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/backend/src/blog-editorial/blog-verified-job.ts#L23)

### PLANREV-14 · P2 · API 마스터의 동일한 잘못된 접두사로 상대 링크352건이 깨짐

이미 docs/api 안인 문서가 링크 앞에 저장소/docs/api를 다시 붙여8개 실제 상세 문서로 가는352개 링크가 잘못됩니다. 같은 원인의352건이며 나머지27개 자동 후보를 모두 오류로 확정한 것은 아닙니다.

조치: 생성기·템플릿의 상대 접두사를 정정하고 재생성 링크를 검사합니다. 정리를 위해 대상 문서를 삭제·이동하지 않습니다.

[docs/api/API_DOCUMENTATION.md:55](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/api/API_DOCUMENTATION.md#L55) · [docs/api/API_DOCUMENTATION.md:70](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/api/API_DOCUMENTATION.md#L70)

### PLANREV-15 · P2 · 지갑 예정 함수의 search_path 표준이 명령서와 다름

통합 마스터의 예정 북마크 함수는 public,pg_temp, 명령서 표준은 pg_catalog,pg_temp입니다. 예정 명세 충돌이며 현재 배포 취약점이 입증된 것은 아닙니다.

조치: 구현 전에 기존 최소권한 함수 표준으로 맞추고 격리 CI/Test의 실제 역할 음성 시험을 요구합니다.

[docs/planning/INTEGRATED_PLANNING_MASTER.md:653](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/docs/planning/INTEGRATED_PLANNING_MASTER.md#L653) · [AGENTS.md:256](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/9876c09888ec84034eec183cf1309c85df3d7447/AGENTS.md#L256)

### PLANREV-17 · P2 · 열린 UI PR 안에 v11·v10 단독 권위와 색상 지시가 공존함

최신 확인73c137에서 현재 디자인 문서는 v11만, 단일 기준 문서는 v10만 쓰라고 합니다. 전자는 금색·청록, 후자는 네이비·보라 지시입니다. v11의180개 PNG 존재는 확인했으나 권위 충돌·사용자 시각 승인을 증명하지는 않습니다.

조치: 단일 버전·매니페스트·색상·경로별 근거로 통일해야 합니다. PR3443도 별도 제안 시안이며 자동 승인된 대체 기준이 아닙니다.

[docs/design/CURRENT_UI_DESIGN.md:14](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/design/CURRENT_UI_DESIGN.md#L14) · [docs/UI_UX_SINGLE_REFERENCE.md:3](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/UI_UX_SINGLE_REFERENCE.md#L3) · [docs/design/game-ui-v2026.11.24.11/README.md:12](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/73c137ae980b466ffcba5f816ba55a9e7855956e/docs/design/game-ui-v2026.11.24.11/README.md#L12)

## 재확인한 조건과 미검증 범위
원래92개 라우트 계약·과거86개 소스 스냅샷·180개 디자인 경로는 다른 집합입니다. 과거 v473의42기능 표가 새180개 경로를 인증하지 않습니다. 후속 구현은 기획 ID→경로/행동→실제 API/DTO→권한/원장 함수→인자 ID fixture→테스트→정확한 Test SHA→운영 증거·담당·상태를 고정해야 합니다.
PR3423은 승인된 Next+Spring 목표를 담은 미병합 기획이고 PR3443은 실행하지 않는 디자인 제안입니다. 이를 로그인·금융·관리자 기능 QA로 승격하지 않습니다. 최신 확인 PR3442의 v11 PNG180개 존재는 확인했으나 권위·권한 지시 충돌이나 시각 승인이 해결된 것은 아닙니다.

백업 문서41행의 오프호스트·불변 보존·격리 복구·실측 RPO/RTO는 여전히 P0 종료 조건입니다. 실제 외부 복제·복원·알림 시험을 하지 않았으므로 이번 검토로 닫지 않습니다. 카지노·FX·KDIC의 의도된503차단을 풀지 않습니다.
P3 유지보수 관찰: Dopamine 문서의 Planned/In-Design/Completed와 하루3회·5회가 다릅니다. 과거 v457/v458기록을 부정하거나 WLD 전용 상품을 현실 결제로 재해석하지 않고 현재/역사 상태를 후속 정리합니다.

상대 파일 링크5136개에서379개 후보를 추렸고, API의 동일 접두사 오류352개를 실제 대상8개와 대조했습니다. 기획 파일 링크 누락 후보는0개입니다. 영한 쌍 누락 후보9개(기존 .en.md쌍 인식), 동일 내용56그룹입니다. 후보 수를 확정 결함 수로 표시하지 않습니다. 일괄 삭제·이동은 하지 않았습니다.

14:12 KST경 지정 무쿠키 HTTP 클라이언트는 두 루트200·점검 문구 없음·버전503을 관측했고 기본 클라이언트는 차단됐습니다. 옛 unit 이름과 활성 Next/Spring unit도 다릅니다. 실제 브라우저·외부 Test 경계·경로별 프로세스·제공 SHA·기능 정상 동작을 인증하지 않습니다. 프로세스를 중지하지 않았습니다.
합성 음성 입력3종은 누락된 거부를 재현했으며 실제 기능 통과가 아닙니다. 앱 빌드·DB·금융·새 E2E·운영 승격은 수행하지 않았습니다. 현실 법률·법정 수치는 검증하지 않았습니다.

## 후속 처리 순서
1. 기존 통합·아키텍처 PR과 충돌 없이 이번 결정·보고서를 리뷰·병합합니다.
2. 기록 완전성과 최종 수용 판정을 분리하고 관리자 매 회차·실제 증거 행렬을 강제합니다.
3. 통화 정의·가상 보호·현실 결제 차단·공개/관리자 경계를 맞춥니다.
4. 작업 명령서·운영·디자인 권위·영한 공지를 갱신하고 생성 API 링크를 정정합니다.
5. 실제 기능 구현은 독립 exact-SHA Test 후 별도 운영 승인을 받습니다.

### 최종 PR 변경 재확인
PR3442가 검토 중077696에서73c137로 진행됐으나 인용한 권위 문서3개는 바이트가 동일하여 발견16·17의 근거를73c137로 다시 고정했습니다. PR3447도3b751d에서aa3c5b로 진행돼 새 구현 전체를 검토했다고 선언하지 않습니다. main은9876c098로 유지됐습니다.
