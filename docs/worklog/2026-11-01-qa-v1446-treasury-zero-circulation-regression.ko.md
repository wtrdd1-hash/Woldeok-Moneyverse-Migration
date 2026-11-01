# QA v1446 — 국고 유통량 0 회귀 테스트 및 운영 승격 보류

**시작 — 2026-11-01 21:19 KST.** Debian 13.6 미니PC 연결 확인. 최신 main `3d5e321c3d1221febff677469fecdfcb3cf42e7d`, AGENTS.md·README·영문 통합기획서 및 한국어 대조 검토. 기존 PR #2374는 검증된 유통량 0을 준비율 null로 처리하지만 이전 회귀 테스트는 여전히 HTTP 503을 요구하여 CI가 실패했다. 별도 QA 브랜치와 worktree만 사용했다.

**진행 — 독립 RED/GREEN.** 원본 SHA `e39af10f6a876f56b40b7e5a070cdb3dcb61d699`에서 관련 테스트 1 FAIL / 9 PASS로 재현했다. 실제 자료 미확인·누락은 계속 차단하고 검증된 유통량 0만 정상 조회와 준비율 null로 검증하도록 테스트만 변경했다. 국고 증거·재정 증명 관련 테스트 25 PASS, 변경 파일 ESLint PASS. 백엔드 로직·SQL·금융 잔액·API 변경 없음. Draft 누적 PR #2378 작성, 최종 SHA CI 확인 필요.

**종료 및 승격 상태.** 이 수정만으로 운영 배포할 수 없다. 최신 main과 공식 Test·Production SHA가 다르고 공식 Test 정확한 SHA 검증 6건 실패, Production 불변 매니페스트 누락, 인증 E2E·외부 독립 복원 미완료다. Draft/HOLD 유지, 병합·운영 배포·서비스 재시작·공유 DB 변경·금융 거래 미실시. 전체 QA는 GitHub #828 및 PR #2378에 기록한다.
