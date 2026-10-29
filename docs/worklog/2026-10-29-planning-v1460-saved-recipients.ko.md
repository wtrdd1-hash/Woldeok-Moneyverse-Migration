# 기획 v1460 — F675-171 회원 전용 WLD 수취인 저장

**상태:** DRAFT / RELEASE HOLD. 문서만 변경하며 런타임·DB 데이터·WLD 잔액·원장·기능 스위치·Test·운영 변경 없음.
**주기:** 이전 Feature Improvement v1458 → 현재 Feature Addition v1460 → 다음 Feature Improvement v1462(잠정).
**브랜치:** `auto/planning-v1460-20261029-1405`, 미병합 #1837(선행 #1830)에 의존하며 main 병합 아님. 개발 이슈 #1844.

## 시작 (2026-10-29 14:04–14:07 KST)
- [x] miniPC Debian 13.6 및 주요 서비스 활성, 개발 PostgreSQL 연결. 루트/데이터 디스크 66%/50%. GitHub 저장소·열린 PR·이슈 조사.
- [x] `skills__list` 결과 0건으로 miniPC 설치 `using-superpowers`, `brainstorming`, `using-git-worktrees`, `writing-plans`, `verification-before-completion` 직접 확인. 사람 승인 없는 런타임 구현은 진행하지 않고 기획 초안만 작성.
- [x] 최신 main AGENTS.md·README·영문 canonical/국문 PROJECT_PLAN·기존 통합 포트폴리오 확인. 원격 main `b84d645a87e8fa0d544ca3ee17e785e737e477ea`.
- [x] 지갑의 수취인 UUID 직접 입력, 정확 ID 확인 함수, 별도 수취인 검색 API를 확인했으나 검사한 지갑 소스에 저장 CRUD 없음. GitHub 중복 검색; 과거 거래 이의제기 #1047 및 거래 메모 #1227과 구분.
- [x] QA v1365 FAILED/P0: 과거 브랜치 이름 462개 누락·비조상 344개, 51MiB 검증 bundle, 과거 18,000 WLD 출처 미검증·국고 552행·체크섬 5건·qs Moderate, 정확 SHA Test/독립 복원 HOLD. 운영 앱 SHA와 main 분리. 운영 부정행위 단정 금지.
- [x] 개발 이슈 #1844 생성. 외부 독립 근거 신규 승인 0, 누적 UNKNOWN/10,000, BLOCKED/IN PROGRESS.

## 중간 (2026-10-29 14:09 KST)
- [x] 원격 main 재조회 불변; 영문·국문 canonical 기획서 재해시 확인.
- [x] 기존 영문·국문 통합 기획·마스터·포트폴리오·업데이트 인덱스 8개 갱신. v1456/v1458 선행 초안 보존. 신규 분산 기획서 0개.
- [x] P0 4건·P1 6건의 개발 이관과 수용 조건 양 언어 명세. 실제 PostgreSQL 수용·공식 Test E2E는 기획에서 실행하지 않음.

## 완료 (검증/PR 이후 증거 추가)
- [ ] 양언어 10개 ID·문서 변경 범위·Git diff·릴리스 분류·원격 SHA 검증.
- [ ] 별도 브랜치 push, #1837 기반 Draft PR, CI 확인, GitHub 업데이트, 완료 기록.
