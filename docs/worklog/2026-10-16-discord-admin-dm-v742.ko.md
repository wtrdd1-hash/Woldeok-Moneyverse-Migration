# Discord 관리자 DM 중요 운영 알림 — v2026.10.16.742

## 작업 전 — 2026-10-16 KST
- 요청: 운영·보안·원장·관리자 경보 등 중요한 시스템 정보를 관리자 개인 Discord DM으로 전달.
- 안전 범위: '모든 정보'는 **이미 정의된 운영 경보/보고 이벤트 전체**를 뜻하며 회원 원본 데이터, 세션, 비밀키, 원시 로그/DB 덤프를 외부 DM으로 보내지 않는다.
- 시작 소스: `origin/main` 3c60c785; 별도 `feature/discord-admin-dm-v2026.10.16.742`, 독립 worktree 생성.
- 읽은 문서: `AGENTS.md`, `DOCS_INDEX.md`, 통합 기획 마스터, 운영 배포, 문서 정책 및 기존 Discord 경보/봇 코드·테스트.
- 기존 문제: Critical 경보만 DM 전송, info/warning 및 많은 공지·SEO·금융 정책 정보는 채널만 전송; DM 결과 미대기; 타 수신자에 캐시 채널 공유; 원문 자격증명·멘션 차단 미흡.
- 운영 게이트: 기존 금융 앱 DML·대사/출처·v530 전체 UI 승인 문제로 안전한 Production 앱 승격 차단. 이 작업에서 운영 데이터·금전 함수·환경 비밀값은 변경하지 않음.

## 작업 중 — 2026-10-16 KST
1. **v742.1 설계 및 재현:** `backend/src/discord/admin-dm-routing.test.ts` 먼저 추가. 5개 중 4개 실패(RED), 1개 통과.
2. **v742.2 코드:** 중요 시스템 임베드의 기본 채널 + 관리자 DM 동시 발송; `DISCORD_ADMIN_DM_ENABLED=false` 긴급 중지, `DISCORD_ADMIN_DM_MODE=critical` 제한 모드; 수신자별 DM 채널 캐시 및 실패 상태 관리.
3. **v742.3 보호:** `allowed_mentions` 비활성, 임베드 문자열 상한과 이메일/Authorization/token/password 형태 마스킹, Discord 오류 응답 원문 로그 제거.
4. **v742.4 검증:** 기존/신규 DM 테스트 8/8 (GREEN). 백엔드 통합 단위 테스트 1,225 통과/396 스킵/실패 0, 타입 검사/빌드/대상 린트 통과. 린트 첫 실행은 설치 범위 누락으로 실패했으며 오프라인 워크스페이스 종속성 설치 후 정상 통과.
5. **v742.5 문서:** 영문 운영 가이드 및 한국어판, 통합 기획 마스터 2개, 문서 색인, 내부/GitHub 변경 내역 기록.
6. 최신 `origin/main` 재조회: 3c60c785로 동일, 충돌 없음.

### 검증 미충족 및 알려진 범위
- 실제 Discord 관리자 DM/채널 양쪽 수신, exact-SHA 공식 Test, GitHub CI 및 운영 런타임 승격은 별도로 입증해야 함.
- 서비스가 스스로 다운되면 해당 서비스 내부 경보도 전송되지 않음. GitHub CI 및 호스트 장애는 외부 관제 생산자가 별도 필요함.
- 기존 국고의 DM 직접 호출 + 채널 알림 호출은 신규 동시 전달 경로에 의해 중복 발생할 수 있음; 후속 분류/중복 제어 검토 필요.
- 기존 프로덕션 금융·UI 승격 차단 조건을 면제하지 않는다.

## 작업 종료 — v742.10 (2026-10-16 KST)
- **GitHub main 통합 완료:** [PR #901](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/901) 병합 커밋 `a9675489f1206f8afb2f6e0c682fb0ae229b8f8a`. 코드 HEAD `7a09e7b8`의 Git 트리와 병합된 main 트리 일치.
- **CI 확인:** 브랜치 최종 HEAD `7a09e7b8` CI [38908502716](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/38908502716) 성공. 본문 v742.9에서 기록한 Test 빌드 및 로컬 회귀검사 통과.
- **실제 발송:** 테스트 목적의 합성 메시지를 실제 관리 채널과 관리자 Discord DM 양쪽으로 전달 성공. 운영 릴리스 자체는 교체하지 않음.
- **정리:** feature 원격 브랜치 GitHub 자동 정리 워크플로 이후 존재하지 않음. 기존 Discord 봇은 무중단 유지. 격리 카나리 전체 중지.
- **운영 상태 BLOCKED:** 실제 공개 Production 애플리케이션은 v717 `176ca04e`. 금융 테이블 직접 쓰기 권한/기초잔액 출처 및 v530 관리자 포함 전체 인증 UI 검증 미해결. DM 자동 미러링은 Production 앱에 배포되기 전까지 적용되지 않으므로 '운영 완료'가 아님.
- **후속 릴리스 게이트:** v743 금융 안전 판정, 전체 로그인/세션 연속성/무중단·롤백 및 전체 UI 승인 후 공식 Test→Production 경로로 별도 승격해야 함.


## 작업 후 검증 증거 — 2026-10-16 22:13–22:20 KST
- v742.6 실제 Discord API: 백엔드 후보의 `sendAdminDirectMessage()`가 관리자 DM 성공 응답 확인.
- 동일 후보의 `sendDiscordEmbed()`: 기존 관리 채널 및 관리자 DM **두 경로 모두 성공 로그**, 반환값 `true`. 메시지에는 합성 테스트 문구만 포함.
- PR [#901](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/901) 등록; 최초 후보 `deec174e`에 대한 GitHub CI **success**.
- v742.7 격리 불변 Test 후보 `test-v2026.10.16.742-deec174eef7f` 생성. 관리자 DM은 비활성, `NODE_ENV=test`, `SEO_INDEXING_ENABLED=false`, PG 읽기전용, 외부 IP 차단을 걸어 별도 백엔드 3146 포트 가동. `GET /health` **HTTP 200** 및 로컬 바인딩 확인 뒤 Test 카나리 중지. 기존 공식 Test/운영 포인터와 활성 봇은 불변.
- 기획서 재조회 중 upstream `main` v741 문서 릴리스가 추가로 전진하여 다시 rebase/최종 CI 재검사 예정.
- 재무 P0, v530 관리자 포함 166개 인증 UI 5회 게이트는 아직 별도 미해결. **Production 애플리케이션 승격을 실행하지 않음**.
