# 통합 후보 — v2026.11.26.2310.1
[English](2026-11-26-combined-integration-candidate.md) | **한국어**

상태: CODE_READY + 격리 샌드박스 검증. **main 직접 병합 금지**(main 통합은 별도 소유자 지시 필요), 공식 Test·운영 미반영.

- 브랜치 `integration/combined-candidate-20261126`: #3462(#3447·GAMEYEAR 포함) + #3456 + #3464 병합, 충돌 1건(MemberPhotoController)은 함수 기반 버전으로 해결하되 #3456의 업로드 오류 처리 유지, 대체된 직접 SQL 사진 테스트 정리, 루프백 블로그 경로는 쓰기 경로 래칫에 등록.
- 소스 SHA `e3c8e611550821a1129be67ee0280b883769b1a6`, 산출물(bootJar -PmoneyverseSourceSha) sha256 `24c686caf4d62cf769efd1ae9df0de07cdcfa04de48bcbe27cd1cd6b83d2f10c`, `/api/version`이 이 SHA로 200.
- 이 SHA 테스트: Spring 917/0/0(건너뜀 0), 프론트 624파일 / 3,248개, 타입 검사 통과, 마이그레이션 parity 6/6, pnpm audit --prod 취약점 0.
- 정확한 산출물로 샌드박스 회귀(합성, 체인 권한): 정규화 경로에서도 경계 유지(비로그인 관리자 요청 401), 제한 계정 로그인 401, 송금 5 VU 402 rps / 50 VU 362 rps 오류 0, 동일 키 경합(30) 거래 1건, 소켓 정확, 거래 278,124건 후 원장 불변식 0/0/0, 권한 거부·ERROR·누수 0.
- 독립 검토(G7): Gemini 상위 503 "high demand"(HOLD), Codex 2026-11-27 13:57 KST까지 한도(HOLD), 보조(같은 계열) 읽기 전용 보안 서브에이전트 APPROVE·낮음 4건 — 2건 #3456에서 수정(경로 정규화, 관리자 신원 헤더), 2건 기록. 공식 Test 반영(G8) HOLD: 지정 배포 담당/공통 잠금 없음.
