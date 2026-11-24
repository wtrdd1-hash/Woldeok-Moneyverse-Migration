# FE-B 블로그 공개 상세 보호 — v2026.11.24.FE-B.1
시작: 원격 main 9876c09888ec84034eec183cf1309c85df3d7447 기반 독립 worktree. Next/Spring 목표 구조 Draft #3423 검토. Test/운영 변경 없음.
중간: Vitest RED(모듈 누락)에서 GREEN(3/3), 블로그 라우트 회귀 1/1, 계약 패키지 빌드 및 프론트 타입 검사 PASS. 공개 상세/메타데이터에서 미공개·철회 게시글 본문이 slug 추측으로 노출되지 않도록 404 처리.
완료: 블로그 공개 접근 보호에 한정. 금융 API, 공통 인증·셸·언어 파일 미변경. /bank,/stocks 게스트 302 보존은 QA2 검증 필요. 전체 Next 테스트·실백엔드·인증 금융·Playwright·180 시각·exact-SHA Test 배포 미승인, RELEASE HOLD.
공유 보안 P0 인계: main frontend/src/lib/api.ts의 INTERNAL_API_TOKEN 하드코딩 대체값을 FE-A/보안 담당이 제거하고 노출 평가·필요시 교체해야 함. FE-B는 공유 파일을 수정하지 않음.
