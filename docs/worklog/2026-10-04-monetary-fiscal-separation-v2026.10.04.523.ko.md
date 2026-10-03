# 통화·재정 기관 분리 작업 기록 — v2026.10.04.523

- 기준일: 2026-10-04
- 브랜치: `docs/monetary-fiscal-separation-v2026.10.04.523`
- 시작 origin/main: `c10e1582ccc0c058dff5c5356ad8b1893759f72c`
- 범위: 기획/문서 전용. 런타임, Test, Production 변경 없음.
- 목표: 현재 국고 환원 동작을 보존하면서 Economy Core를 중앙은행, 조폐국, 중앙국고, 결제/원장 책임으로 명확히 분리한다.
- 편집 전 권위 순서 확인: `docs/DOCUMENTATION_POLICY.md`, `docs/DOCUMENT_CATALOG.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, 현행 국고/경제 상세 명세.
- 외부 근거 범위: IMF 국고-중앙은행/TSA, ECB 유로 발행·생산, 미국 Federal Reserve/BEP/US Mint 역할분리, 가상경제 faucet/sink 운영.
- 안전 경계: 본 회차는 기존 런타임 상태를 승격하지 않으며 다른 동시 작업 브랜치를 수정하지 않는다.

## 중간 기록
- 중간 `origin/main`이 `c10e1582ccc0c058dff5c5356ad8b1893759f72c`에서 `065ee42204a4238c5010897212c7fc2a6c848f64`로 이동했다.
- 새 main의 국고 영문/아키텍처 변경을 보존하기 위해 권위문서 편집 전 격리 브랜치를 해당 exact main으로 rebase했다.
- IMF 국고-중앙은행/TSA, ECB 발행·생산, Federal Reserve/BEP, US Mint, 한국은행, Bank of England 통화창출, EVE 공식 경제보고를 검토했다.

## 검증 체크포인트
- 중앙은행=통화정책 승인, 조폐국=실행 전용, 중앙국고=기존 WLD 재정권위, Economy Core=원장/대사로 분리했다.
- AI 직접 조폐/폐기와 국고부족의 통화화를 금지했다.
- 초기 은행대출은 기존 WLD 완전 사전재원 방식으로 유지한다.
- `git diff --check`: trailing-space 1건 수정 후 PASS.
- v523 상세명세 영/한 쌍과 권위표기 확인.
- 런타임/Test/Production 변경 없음.
