# v2026.10.01.497 App/Site/Economy Core 보안 설계 작업일지

## 시작 기록

- 날짜: 2026-10-01 KST.
- 작업: 승인된 v497 방향을 App Core/Site Core 분리, 단일 Economy Core, 제한형 AI 수치정책의 명시적 보안경계까지 확장한다.
- 기준 설계 브랜치: `docs/unified-macroeconomy-v2026.10.01.496@96620ea610e0a39841965010307797993f1566a2`.
- 최신 확인 `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`.
- 격리 worktree: `/home/debian/.worktrees-moneyverse/api-security-economy-core-v497`.
- 브랜치: `docs/api-security-economy-core-v2026.10.01.497`.
- 범위는 아키텍처/조사 문서 전용이다. 런타임·DB·Test·Production 변경을 주장하지 않는다.
- 권위 재검토: AGENTS.md, Documentation Policy, Project Plan, Integrated Planning Master, Security Master Plan, Security Assurance Master Plan, database-security, runtime security model, mobile API runtime contract, AI Economy Controller spec, v496 거시경제 설계.
- 최신/1차 보안근거 재검토: OWASP API Security 2023, OWASP MASVS, NIST SP 800-207/207A, RFC 9700, RFC 9449, RFC 8705, PostgreSQL SECURITY DEFINER 최신 지침, Google Play Integrity, NIST AI RMF/GAI profile, OWASP LLM Excessive Agency.
- 직전 조사패스의 레퍼런스 코퍼스: 경제·AI·safe control·BFF/API·보안·은행·시장무결성·인과 정책평가·게임경제·노동/기업·악용탐지 분야를 합쳐 중복제거 discovery 149,691건. 모든 자료를 전문 정독했다는 의미가 아니라 발견 코퍼스다.

## 중간 기록
- 작업 중 `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`; 권위 드리프트 없음.
- v497 App/Site/Economy Core 보안 아키텍처 영문과 조사검토, 한국어 대응문서를 작성했다.
- App/Site BFF 분리, 단일 Economy Core, workload+actor 이중검증, generated API inventory, request hash/replay 통제, mobile integrity binding, DB role 격리, AI no-write 경계, policy registry, 명시적 AI 수치한도를 포함했다.
- 현행/1차 근거로 Microsoft/AWS BFF, OWASP API Security/MASVS, NIST SP 800-207/207A, RFC 9700/9449/8705, PostgreSQL function security, Google Play Integrity, NIST AI RMF, OWASP LLM Excessive Agency를 재검토했다.
- 조사근거는 신규 Crossref unique 118,490건, 병합/중복제거 최종 discovery 후보 149,691건을 기록한다.

## 설계 종료 기록
- 최종 `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`; 작업 중 변경 없음.
- EN/KO written-spec 구조: H1 1/1, H2 37/37, H3 42/42, 1..37 순서 일치.
- EN/KO 조사검토 구조: H1 1/1, H2 6/6, H3 12/12.
- 핵심검증은 App/Site 분리, 단일 Economy Core, workload+actor 분리, AI 자기한도 변경금지, direct balance/price/history write=0, 세금 100% 국고, 명시적 AI 수치 envelope를 포함한다.
- 이번 회차는 조사/아키텍처 문서 전용이다. Project Plan 권위통합, 런타임·DB·Test·Production 변경을 주장하지 않는다.
