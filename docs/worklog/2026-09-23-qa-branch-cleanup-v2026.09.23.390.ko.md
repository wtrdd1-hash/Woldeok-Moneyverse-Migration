# QA 브랜치 생명주기 정리 — v2026.09.23.390

## 범위

squash merge 후 소스 브랜치가 누적되지 않도록 QA 브랜치 정리를 강화하고, 병합 이후 새 작업이 추가된 브랜치는 반드시 보존합니다.

## 체크리스트

- [x] 원격 브랜치, 로컬 브랜치, 연결 worktree 전수 확인.
- [x] `main`에 병합됐거나 patch-equivalent인 브랜치만 삭제.
- [x] 고유 미병합 커밋이 있는 브랜치 보존.
- [x] squash merge 정리 판별 수정.
- [x] `git push --force-with-lease`를 이용한 expected-SHA 원자적 삭제 추가.
- [x] 검증 이후 HEAD가 이동한 브랜치는 보존.
- [x] 내부/GitHub EN/KO 업데이트 내역 기록.
- [x] 주요 변경마다 exact-head CI 수행.
- [ ] 최종 exact-head CI와 리뷰 게이트 통과 후 PR #686 병합.
- [ ] 병합된 정리 워크플로를 남은 원격 브랜치에 실제 실행.
- [ ] 최종 원격/로컬/worktree 수 기록.

## 체크포인트

### 체크포인트 1 — 저장소 현황 확인 및 수동 정리

- Migration 원격 브랜치: 약 71개에서 39개로 감소.
- App 원격 브랜치: 이미 병합된 기획 규칙 브랜치를 삭제해 5개에서 4개로 감소.
- 로컬 브랜치: 149개에서 60개로 감소.
- 연결 worktree: 61개에서 34개로 감소.- `main`과 patch-equivalent인 clean worktree 37개 제거.
- 고유 미병합 브랜치는 보존.

### 체크포인트 2 — 근본 원인

`cleanup-merged-branches.yml`이 squash merge에서는 성립하지 않는 ancestry/containment 증거에 의존해, 정상적으로 squash merge된 PR도 소스 브랜치를 남길 수 있었습니다.

### 체크포인트 3 — 1차 워크플로 수정

현재 브랜치 HEAD가 병합된 PR의 HEAD SHA와 정확히 같으면 삭제 대상으로 보고, 병합 뒤 새 커밋이 추가된 브랜치는 보존하도록 수정했습니다.

검증:
- `git diff --check`: PASS.
- `e486e0dd534fb6fd0fa22159d018e78eda11614e` Build Test Candidate run 35802217816: SUCCESS.
- `3b486419f680d1030861c6577866d37c35831afd` CI run 35802417185: SUCCESS.

### 체크포인트 4 — 리뷰 보강

PR 리뷰에서 SHA 확인과 이름 기반 삭제 사이의 경쟁조건이 확인됐습니다. PR close 경로와 scheduled prune 경로 모두 expected-SHA `git push --force-with-lease` 삭제를 사용해, 동시 push가 발생하면 삭제가 안전하게 실패하도록 변경했습니다.

## 배포 상태

이번 변경은 GitHub 저장소 자동화와 문서만 수정합니다. 백엔드/프론트엔드 런타임 코드, 스키마, 운영 데이터, 배포 서비스에는 변경이 없습니다. 따라서 런타임 Test/Production 승격은 적용 대상이 아니며, 병합 전 저장소 exact-head CI 게이트는 그대로 필수입니다.
