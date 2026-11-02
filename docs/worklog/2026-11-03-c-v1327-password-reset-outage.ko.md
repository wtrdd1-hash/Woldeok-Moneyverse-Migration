# 개발 C v1327 — 비밀번호 재설정 장애 구분 및 토큰 URL 보호

**일자:** 2026-11-03 KST. **기준 main:** `846844bf0bd573f0c0f0654e27ccb44321847106`(시작), `d22c36dbecad1fe136d3850715f1068a7d1df573`(중간 fetch 후 충돌 없이 rebase). **브랜치:** `auto/hourly-c-v1327-password-reset-outage-20261103-0845`. **배포:** DRAFT / HOLD.

## 시작 / 원인

Debian 13.6 미니PC에 실제 연결하고 핵심 서비스 7개 및 개발 PostgreSQL 상태를 확인했다. AGENTS.md, 영문·국문 README와 통합 기획서, 최신 main, A/B/C/QA/기획 PR 및 CI를 조사했다. 기존 보안 감사 작업 디렉터리는 수정 중이므로 독립 clean worktree만 사용했다. C #2586은 재설정 **요청** 검증이며 이번 대상은 재설정 **완료**의 장애 구분이다. 동일 범위의 열린 PR은 확인되지 않았다.

Nest 재설정 완료 API는 토큰 만료·재사용(`false`)과 DB/해시 장애(예외)를 모두 401로 처리했고, Next는 이를 모두 만료된 링크로 안내했다. 재설정 토큰이 들어간 URL에는 전역 공개 색인·참조정보 헤더가 상속될 수 있었다. 이는 소스에서 확인한 조건부 위험이지 운영 검색엔진 색인 발생의 증거는 아니다.

## 중간 / 구현

- Backend: 유효하지 않은 토큰은 401 유지, 저장소/해시 장애는 내부 진단 노출 없이 503으로 구분. 기존 DB 함수 재사용, 스키마·금융 원장 변경 없음.
- Frontend: 400/401은 링크 오류, 403은 비밀번호 정책, 5xx/네트워크 실패는 일시 장애 및 재시도 안내. 실제 `{ outcome: 'password-reset' }`만 성공 처리.
- UX/SEO: 스크린리더 오류 알림, 기존 모바일 44px 버튼·확인 입력 유지. 기본 및 지원 언어 재설정 URL에 `private, no-store`, `noindex, nofollow`, `no-referrer` 적용.
- TDD RED: Backend 1건, Frontend 6건 실패 재현. GREEN: Backend 집중 4 PASS, Frontend 집중 27 PASS. 격리 PostgreSQL 17.11에 마이그레이션 327건 적용, 실제 DB 포함 인증 테스트 8 PASS, 앱 역할의 users 직접 SELECT/UPDATE 차단 및 승인된 함수 EXECUTE 확인. 공유 Test/Production DB 변경 없음.

## 종료 / 배포 판정

초기 PR 제출 시 전체 lint/typecheck/build/전체 테스트/app-api/보안/QA/CI, 인증 E2E 및 공식 Test 정확 SHA는 **최종 승인 전**이다. 후속 결과는 PR의 SHA 결속 기록으로 남긴다. 초기 전체 DB 테스트는 슈퍼유저 연결로 실행돼 ACL 실패를 유효한 앱 역할 결과로 해석할 수 없으므로 앱 역할/마이그레이터 분리로 재실행한다. 집중 테스트만으로 출시를 선언하지 않는다. 모든 필수 게이트 PASS 전 main 병합·공식 Test·Production 배포·GitOps 변경·브랜치 삭제 금지. 개발 A/B/QA/Gemini와 핵심 5개 예약은 보존한다.
