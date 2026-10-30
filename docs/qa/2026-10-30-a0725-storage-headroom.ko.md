# 개발 A — 검증된 호스트 저장공간 여유량 QA (2026-10-30 07:25 KST)

**판정: 대상 테스트 PASS / 전체 게이트 FAIL / 운영 배포 HOLD.** 기준 main `62c6cd038951d65c94b709302bdaec6e75b080b6`, 구현 체크포인트 `55cb5c1c3a91fc810184db815b17d78b535c79f2`. 최종 PR #1956 SHA/CI는 GitHub 기록 참조.

- 호스트 전용 ROOT/DATA 읽기 수집기(Ed25519 개인키 서명), 서버 공개키 검증(부트/마운트 네임스페이스, 120초 신선도, 재생 순서, 예약 블록 제외 가용량), 관리자 세션·권한, private/no-store/noindex, 한영 반응형 화면 및 UNKNOWN 상태 구현. 일반 회원·Android API 노출 없음. DB/원장/마이그레이션 변경 없음.
- Backend 검증 5 PASS, 컨트롤러 2 PASS, 실제 HTTP 권한·503 3 PASS, 실제 호스트 수집기 1 PASS, 호스트→Backend 위조 차단 1 PASS, Frontend 데이터·정밀도 2 PASS, Next API 2 PASS, 관리자 화면·접근성·SEO 2 PASS. Backend/Frontend Typecheck 및 Backend Build PASS, 변경 파일 ESLint PASS.
- Database 단위 56 PASS/4 SKIP, 보안 회귀 11 PASS, 운영 의존성 감사 알려진 취약점 0건. 전체 ESLint 기존 오류 3건 FAIL, Backend 전체 2,358 PASS/240 FAIL/493 SKIP, Frontend 전체 100초 초과, 모바일 API NPC affinity 계약 불일치. 전체 Frontend Build는 DATA 100%·1GiB 미만 가용 공간으로 안전상 BLOCKED. 공식 Test 정확 SHA 인증 E2E 미완료, Production 배포 금지.
- 실제 개발 PostgreSQL 17.11 읽기 전용 검사: 적용 마이그레이션 293개/소스 304개, 앱 계정 `audit_logs` 직접 SELECT/INSERT/UPDATE/DELETE 및 `users` UPDATE 권한 존재. Production 동일 여부 미확인. 원장·DB 수정 없음. 기존 보안 이슈 #993 업데이트.
- 브랜치 시작 38/종료 39, PR 시작 32/종료 33, 비-main 고유 미통합 35/완전 포함 3, 충돌 PR #1901/#1892, 중복 SHA/PR head 불일치 0. 삭제·강제종료·병합 0. 모두 보존.
- DATA 가용 공간 약 981MiB→667MiB, ROOT 사용률 약 96%. 타 작업자 자료·백업·컨테이너 삭제 없음. 사고 #1170 기록. Test/Production 수집기·키 미설치로 503/UNKNOWN 유지. 롤백은 향후 승인된 이전 불변 앱 버전 복귀이며 이번 회차에서는 미실행.
