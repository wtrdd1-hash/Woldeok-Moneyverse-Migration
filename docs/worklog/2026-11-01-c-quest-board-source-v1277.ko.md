# 개발 C v1277 — 회원 퀘스트 데이터 검증 (한국어 보조)

**상태: DRAFT / RELEASE HOLD.** 기준 `origin/main` `3d5e321c3d1221febff677469fecdfcb3cf42e7d` (2026-11-01 시작·중간 재확인). 새 독립 브랜치 `auto/hourly-c-quest-board-proof-v1277-20261101-2345`에서만 작업했고 공유 main과 다른 작업자의 변경은 보호했습니다.

## 확인된 문제와 구현

회원 전용 `/quests`는 `GET /api/v1/engagement` 응답을 실제 검증 없이 TypeScript 타입으로 간주했습니다. 잘못된 `today_tasks`는 페이지 오류를 일으킬 수 있고, 잘못된 해금 조건이나 알림 설정은 회원 상태를 오인하게 할 수 있었습니다. 기존 SQL 082의 `member_engagement_dashboard(p_actor)`는 회원별로 일일·주간 목표 최대 3개, 정수 진행도, nullable 해금 정보, boolean 알림 설정을 반환합니다.

검증 함수가 목표 중복·개수·진행도·코드·해금 조건·알림 설정을 검사합니다. 확인할 수 없는 응답은 정상 빈 목표나 기본 알림 설정으로 표시하지 않습니다. 기존 모바일 반응형 및 비색인 정책을 유지하고, 장애 상태에 스크린리더 안내를 추가했습니다. Android app-api는 비정상 성공 응답을 HTTP 503으로 거부하고, 모든 engagement 응답에 비공개 캐시·비색인·참조자 차단 헤더를 설정합니다. **실제 HTTP 검증에서는 전역 `frontend/next.config.ts`가 비색인·참조자 헤더를 `index, follow` 및 `strict-origin-when-cross-origin`으로 덮어쓰므로 FAIL입니다.** 기존 Draft #2225에서 공통 수정을 담당하며 이 브랜치에서는 중복 수정하지 않습니다. 비공개 캐시 헤더는 정상입니다. 기존 NestJS 인증 및 PostgreSQL 함수 계약을 재사용하며 DB·원장 변경은 없습니다.

## 검증과 보류

- 구현 전 실패 재현: 파서 15건, Android 게이트웨이 3건.
- 구현 후 집중 검증: 파서·SSR·게이트웨이 총 44건 통과. 최종 SHA 전체 검증은 별도 증빙 필요.
- 격리된 Next HTTP/모의 Backend에서 웹 오류·정상 응답 200, Android 비정상 응답 503·정상 응답 200을 확인했지만 실제 비색인/참조자 헤더는 FAIL입니다. 공식 인증 E2E를 대체하지 않습니다.
- 필수 CI, 실제 인증 E2E, 공식 Test 및 GitOps 릴리스 게이트가 모두 통과하기 전에는 main 병합·운영배포를 금지합니다.
