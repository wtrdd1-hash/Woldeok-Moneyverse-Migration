# v1478 — 회원 전용 고객문의 초안 전송 검증·권한 보완 (2026-10-29)

**상태:** 진행 중 / 문서 전용 / 운영 HOLD. **주기:** 이전 기능 추가 v1476 → 현재 기능 보완 v1478 → 다음 기능 추가 v1480(잠정).

**진실 기준:** 시작 main `54b182d2214a15974350701174175f589789613b`; 선행 Draft PR #1901은 미병합·충돌 상태. `AGENTS.md`, `README.md`, 영문 원본 `docs/planning/PROJECT_PLAN.md`, 한국어 대조 문서 및 양 언어 통합 마스터 확인. Superpowers `using-superpowers`, `brainstorming`, `using-git-worktrees`, `writing-plans`, `verification-before-completion` 검토. `skills__list`에서 URI가 없어 miniPC 설치 스킬을 직접 읽음.

**읽기 전용 근거:** 개발 PostgreSQL 17.11에 문의 3건·메시지 6건, 초안 테이블 없음. SQL 마이그레이션 196·302의 REVOKE 선언과 달리 개발 DB의 `moneyverse_app`에 고객문의 두 테이블의 직접 SELECT/INSERT/UPDATE/DELETE/TRUNCATE 권한이 존재함(`information_schema.role_table_grants` 확인). 운영 권한 및 악용 여부는 미확인. 현재 Next 문의 전송 서버 액션은 호출마다 새 `randomUUID()`를 생성하고, `support_create_thread`는 동일 키 재사용 시 제목/본문 일치를 확인하지 않음. 따라서 응답 유실 후 안전한 재시도 계약을 보완해야 함. QA v1374 Draft #1902는 운영 인증이 아님.

## 작업 확인표
- [x] 설치 스킬·최신 main·PR·실제 문의 소스·개발 DB를 읽기 전용 확인.
- [x] 별도 v1478 워크트리 생성, 선행 v1476 보존.
- [ ] P0 고객문의 DB 권한 편차 및 전송 재시도 백로그를 GitHub에 기록.
- [ ] 영문·국문 통합 마스터와 프로젝트 계획서 보완(독립 세부기획 파일 금지).
- [ ] 중간 main·기획서 재조회, 양 언어 백로그·문서 분류·diff 검증.
- [ ] 커밋·푸시·선행 v1476 기반 Draft PR·최종 로그 기록.

**게이트:** 런타임·SQL·금융 잔액·개발 DB 쓰기·Test·운영 변경 없음. 기능 기본 OFF. 외부 독립 검증 신규 승인 0건, 누적 UNKNOWN/10,000건(BLOCKED / IN PROGRESS).
