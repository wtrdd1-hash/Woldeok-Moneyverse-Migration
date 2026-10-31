# v2026.10.31.1550 — 국부펀드 관리자 기능 운영 승격 기록

## 시작
사용자의 재승격 및 전수 검증 지시를 받아 AGENTS.md·통합 문서 허브·RELEASING·기존 국부펀드 로그·최신 main을 재확인. PR #2163의 정식 313을 우선 사용하고, 중복된 구 PR #2162의 다른 313은 병합하지 않음. 미니PC 별도 워크트리 및 이전 Test/운영 릴리스 보존.

## 중간 — 소스, 실제 Test
- PR #2165 CI와 Test 후보 빌드 통과, main 병합 SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`. 새 SHA로 BE·FE 실제 운영 빌드 성공.
- 공식 Test 새 불변 버전 `test-v2026.10.31.1550-bc8cd8a6c654` 적용. 백/프론트 공개 버전 일치, 릴리스 신원 검사 `ok:true`, 실패 0건, 국고 미확인 503 유지.
- 별도 폐기 가능한 Test DB에서 임시 승인 관리자 로그인 E2E: 백/프론트 SWF 조회·정책 저장 200, 관리자 SSR 패널 정상, 기존 오류 문구 없음, CSRF 누락·외부 Origin 요청 403. **실 운영 회원 로그인으로 가장하거나 인증한 결과 아님.**
- 새로운 워크트리 패키지 설치는 호스트 스레드 부족 EAGAIN이 발생해, 검증된 기존 격리 워크트리 의존성으로 메인 SHA를 새로 빌드함. 기존 운영 서비스 재시작 없음.

## 중간 — 운영 DB 안전성
- 실제 운영 앱 DB `woldeok_moneyverse_dev` 재무 게이트 `READY_FOR_OTHER_RELEASE_GATES`: 정식 분개의 미균형 및 설명 안 되는 계정 차이 0. 기존 accounts/account_balances/system_treasury_vaults DML은 사용자 승인 경고로 별도 표시. **552개 과거 국고 원장 연결 누락은 여전히 별도 차단 사유.**
- 운영 전체 DB 백업 `/srv/moneyverse-data/backups/swf-v1550-20261031/woldeok_moneyverse_dev-pre313.pgdump` 생성·SHA-256 검증 및 복원 목차 확인.
- 최신 main의 정식 `313-admin-swf-governance-scoped-write.sql`만 운영 DB에 1개 트랜잭션으로 적용 및 체크섬 기록. 정책 함수 `admin_swf_update_policy(uuid,jsonb)` 실행 가능, 원본 테이블 직접 UPDATE는 금지 유지. 기존 SWF 포트폴리오 4건·이벤트 270건 보존. 금융 송금·잔액 조정·자동 국부펀드 집행 없음.

## 종료 — 무중단 운영 절체
- 새 운영 불변 디렉터리 `prod-v2026.10.31.1550-bc8cd8a6c654`와 신규 영구 systemd 백/프론트 유닛(4164/4165)을 먼저 실행. 이전 운영 3564/3565는 중지하지 않고 롤백용으로 보존하고, 기존 고정 릴리스 경로로 고정.
- 신규 웹 서비스의 운영 DB·내부 API 토큰·공식 도메인이 종전 서비스와 같음을 민감정보 출력 없이 검증. 이중 스케줄러 실행을 막도록 신규 백엔드 자동 작업은 비활성으로 두고 기존 운영 백엔드의 백그라운드 작업 지속. 미확인 금융 집행은 계속 금지.
- Nginx 원본 설정 백업 후 운영 포트만 교체, 문법 검사 후 reload. `production-current` 포인터를 새 버전으로 원자 변경.
- 실제 공개 `easy-scraping.com` 백/프론트 버전 모두 `bc8cd8a6...`. 운영 호스트 신원 검증 `ok:true`, 실패 0건. /, /status, /admin/treasury, /blog, /robots.txt, /sitemap.xml, /ads.txt 모두 HTTP 200. 비로그인 SWF GET 401, 외부 Origin PUT 403, 공개 국고 정산 503. 새 운영 유닛의 오류 수준 로그 없음.
- 롤백: 백업 Nginx 설정 복원·검사·reload, 필요 시 production-current 이전 불변 릴리스 원복. 정식 DB 313은 순방향 유지. 사용자 잔액·감사 로그를 조작하지 않음.

## 아직 미해결
과거 국고 기록 552건의 정식 원장 연결 미검증으로 국고 공개 보고·지급·회수·자동 투자 집행은 차단 상태. **실제 운영 관리자 본인 계정의 로그인 상태에서 설정 저장 E2E를 수행한 것은 아님**(격리 Test에서 수행). 운영 변경의 증거와 제약을 분리해 보고함.
