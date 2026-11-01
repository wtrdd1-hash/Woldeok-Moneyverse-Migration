# 기획 v1620 — F675-211 회원 만료 알림 수신 요일 선택

**2026-11-01 KST | 기능 추가 | 초안 / 운영 보류 | 문서 전용**

**주기:** 이전 기능 보완 v1618 → 현재 기능 추가 v1620 → 다음 기능 보완 v1622(잠정).

**시작(22:08~22:14 KST):** miniPC Debian 13.6의 백엔드·프론트엔드·Discord·MCP·nginx·Docker 정상, 개발 DB 연결 확인. main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`와 AGENTS.md·README.md·영문 정본·국문 대조·Superpowers 설치 스킬·실제 알림 페이지/Nest/Android/DB 071·114·123·열린 PR/QA 조사. 미병합 기획 Draft #2375(`54a8f2e7a35e4a0a8d7d0546f0c39c7fe295c804`) 기반 격리 작업 폴더. 런타임 변경 없음.

**진행 중:** [x] F675-211 사용자·API·DB·작업자·개인정보·QA·릴리스 명세. [x] 영문/국문 정본 및 통합 문서. [x] 양 언어 업데이트 로그. [x] GitHub P0/P1 이슈·Draft PR. [x] 중간 main 재조회. [ ] 검증.

**완료:** 검증 대기.

**진행 중(22:17~22:24 KST):** F675-211 영문 정본·국문 대조·통합 기획·업데이트 로그 작성. main 3d5e321c3d1221febff677469fecdfcb3cf42e7d 중간 재조회에서 변경 없음. Test e39af10f6...·Production 353c6d5d...는 main과 다름. 기존 미병합 기획 스택은 최신 main의 조상이 아니므로 선행 브랜치 협의 없이 main을 임의 병합하지 않는다. 개발 이슈 #2383 생성. 런타임·DB·금융 변경 없음.
 외부 독립 근거 신규 승인 0건, 누적 UNKNOWN/10,000건, BLOCKED/IN PROGRESS. Test·Production 변경 승인 없음.

**중간 검증:** node --test scripts/release/*.test.mjs 147/147 PASS, 분류 24/24 PASS. 영문/국문 일치 검사 초기에는 통합 문서 `weekdayIsoDays` 표기 누락을 발견해 보완했다. 최종 재검증 및 GitHub PR/CI 대기. 운영 보류.
