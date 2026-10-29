# A1125 — 도움말 발행본 식별자 제공 (P1, 초안 / 운영 보류)

- 2026-10-29 11:20 KST 시작. Debian 13 미니PC 연결 확인. 시작 main a1d8de0c09af60d1da07d063a0858cfaaf7f044e, 중간 main 4595e8f660cd9646cabcbf2643e5309b9eb9a7b9 (릴리스 문서만 변경). 독립 브랜치/worktree 사용, 공유 main 및 동료 작업 보존.
- 영문·국문 통합기획 F675-169 및 QA v1363 실패/보류 확인. 기존 도움말의 개정 ID, 정수 문자열 버전, 콘텐츠 SHA-256을 제공하는 P1 읽기 개선이다. 회원 피드백 전체 기능 또는 독립 검토 인증 완료를 뜻하지 않는다.
- 불변 마이그레이션 282는 수정하지 않고 295 SECURITY DEFINER 읽기 함수를 추가했다. NestJS 응답, Next.js 검증·표시, Android 기존 읽기 전용 app-api를 연결했다. 기능 플래그 OFF, 금융·운영 DB 변경 및 테이블 DML 권한 추가 없음.
- TDD 실패 확인 후 Backend 7건, Frontend/app-api 9건 PASS. 격리 PostgreSQL 17.11에서 282·295와 공개·비공개·철회·만료·권한 검증 PASS. 최초 픽스처의 불변 개정 UPDATE가 DB에서 정상 거부되어 별도 만료 픽스처 삽입으로 수정했다. 전체 마이그레이션과 공식 Test 정확 SHA 인증 E2E는 미인증.
- 로컬 lint/typecheck/build PASS, 전체 테스트·CI는 최초 작성 시점 대기. 스킵된 검증은 PASS로 간주하지 않는다.
- QA v1363: 과거 18,000 WLD 출처 미인증, 체크섬 불일치 5건, DEV 294 미적용, Test/main SHA 불일치, 독립 복원 미확인. 운영 HOLD.
- 시작 GitHub 실제 브랜치 116개(main 포함), Draft PR 113개, PR 헤드 누락 0개. QA의 비-main 578개는 오래된 로컬 추적 참조가 섞여 실제 원격 브랜치 수로 확정할 수 없다. 삭제·종료 0건.
- 롤백: VERIFIED_HELP_CENTER_V1 OFF 유지, 구버전 읽기 함수 보존. 전체 릴리스 게이트 통과 전 병합·운영 승격 금지.
