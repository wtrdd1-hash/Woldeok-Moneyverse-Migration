# QA — 개발 A 09:25 가상시장 이벤트 방향 필터 (DRAFT / HOLD)

- 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, 시작·중간·커밋 직전 재확인. 영문 원본과 국문 통합기획서 검토.
- RED-GREEN: Backend 최초 10건 실패, Frontend 검증/Android 테스트 최초 실패. 수정 후 Backend 대상 12건(단위 10·HTTP 2), Frontend 대상 7건(파서 2·Android 2·페이지 3) 통과.
- Backend 전체 2,960 PASS / 517 SKIP. DB 단위 62 PASS / 4 SKIP. Frontend 전체 2,904 PASS / 2 FAIL 및 워커 오류 1건. 동일한 관리자 콘솔 세션 테스트 2건이 수정하지 않은 main에서도 실패함을 확인. 전체 Frontend 게이트 FAIL.
- 타입검사 PASS, Lint 오류 0/경고 1,022, 모바일 API 계약 184개 PASS, 보안·릴리스 검사 10 PASS. 첫 빌드의 Next 워커 SIGABRT 후 단일 워커 재빌드 PASS.
- 개발 PostgreSQL 17.11에서 moneyverse_app 읽기 전용 실행: 함수 EXECUTE 허용, 전체 3건/호재 3건/악재 0건, 필터 결과 3/0건, ROLLBACK. 실제 Test 인증 E2E를 대신하지 않음. 개발 DB의 user_items DELETE, account_balances UPDATE 직접 권한은 기존 P0 위반이며 운영 DB에도 동일하다고 단정하지 않음.
- Test 공개 SHA `bc8cd8a6...`, Production API SHA `353c6d5d...`로 후보와 불일치. 정확 SHA Test 인증·접근성 브라우저 E2E·독립 복원·GitOps·운영 출처 증거 미충족. 병합/배포/DB 쓰기/재시작 없음.
- 시작 원격 브랜치 64개/열린 PR 62개. 기존 브랜치 삭제 없음. 최종 SHA CI 완료 전 PASS로 판정하지 않음.

- Draft PR #2293 생성 후 원격 브랜치 65개/열린 PR 63개. 기존 브랜치 삭제 0개, 미통합 변경 보존. 최초 코드·기록 SHA `0ec87cf3d55ab669699f6e7da4b0146c00a000d6`, 후속 기록 SHA는 PR 참조. 최종 SHA CI 진행 중으로 PASS 미판정.

**v3 빈 결과 증거 강화:** 구형 백엔드의 무필터 HTTP 200 `events:[]`는 필터 적용 증거가 아님. Nest가 필터 요청에 `appliedDirection`을 응답하고 웹·Android는 빈 결과도 정확한 값 일치를 요구하며 미일치 시 검증 실패 처리. TDD RED Backend 2/Frontend 2, GREEN Backend 12/Frontend 7. 최신 Backend 전체 2,962 PASS/517 SKIP. 최신 Frontend 전체 재실행은 워커 EPIPE로 집계 전 중단; 앞선 전체 실행 2 FAIL/워커 오류가 마지막 완결 보고. v3 빌드 첫 시도 rayon 스레드 자원 부족, 스레드 제한 재시도 PASS. 새 테스트 파일 Lint 오류 수정 후 전체 오류 0/경고 1,022. HOLD 유지.
