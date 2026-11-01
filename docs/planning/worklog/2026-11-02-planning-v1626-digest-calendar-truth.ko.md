# 기획 v1626 — F675-212 시간·영수증 진실성 보완

**주기:** v1624 기능 추가 → v1626 기능 보완 → v1628 기능 추가(잠정). **상태:** 초안 / 운영 보류 / 문서 전용.

## 시작
- miniPC Debian13 서비스·개발 DB 연결 확인. skills__list URI 없음; 설치된 Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion 읽음. 미병합 Draft #2397 위 격리 작업.
- 최신 main 510dbe6bf4d5c2a8089fc06b480776053da7a2e3, AGENTS.md·README.md·영문 정본/한국어 대조·Next/Nest/app-api/DB·GitHub QA 조사.
## 중간
- main 510dbe6... 재확인, Test 버전 API는 main과 같지만 불변 실행 증거 아님; Production 353c6d5... 불일치. QA #2398 백엔드 2건 실패·감사 권고 9건.
- 설정 후보와 실제 실행 영수증 분리, KST 09~11시 경계·과거 리비전·선택적 409·비공개 엣지 및 P0 4/P1 6 명세.
## 완료(증빙 확인 전)
- 한영 대조·릴리스/분류 시험·diff·GitHub 이슈/Draft PR·최종 SHA CI 확인 예정. 실제 기능 수용시험 미실행.
- 외부 신규 승인 0, 누적 UNKNOWN / 10,000 BLOCKED / IN PROGRESS. 런타임/DB/WLD/원장/Test/운영 변경 없음.
