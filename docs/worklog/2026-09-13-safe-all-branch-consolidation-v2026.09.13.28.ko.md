# 전체 브랜치 안전 통합 작업기록 — v2026.09.13.28

## 목표

현재 `main` 위에 안전하게 표현할 수 있는 모든 브랜치의 유효 변경을 하나의 후보로 모으되, 파괴적이거나 의미상 잘못된 병합은 거부합니다. 최신 기획·문서를 보존하고 stacked 런타임 작업을 정리하며 DB migration parity를 하나의 일관된 순서로 유지하고, exact-SHA Test 증거 전에는 Production으로 진행하지 않습니다.

## 기준과 기획서 재확인

- 작업 시작 및 중간 확인 시 `main`: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`
- `docs/planning/PROJECT_PLAN.md` / `.ko.md`를 작업 전과 중간에 다시 확인했습니다.
- Living Spec의 최신 main 동기화, 적용 migration 불변, 영어 기준/한국어 동등 문서, 격리 Test exact-SHA 검증, Production fail-closed 원칙이 그대로 유지됨을 확인했습니다.
- 승인된 모든 Remote Desktop 대상이 오프라인이어서 이번 회차에는 `@미니pc홍`에서 로컬 실행·테스트 서버 실행을 할 수 없었습니다.

## 브랜치 감사

최종 후보 생성 직전 저장소에서 59개 ref를 확인했습니다. 통합 작업 중 다른 동시 작업으로 `integrate/all-branches-v2026.09.13.25`, `integrate/rehome-roadmap-p1-p2-v2026.09.13.26`, `integrate/final-all-v2026.09.13.27`이 추가됐으며, 단순히 버전 번호가 높다는 이유로 채택하지 않고 다시 감사했습니다.

### 주식/커뮤니티/보안 상위 체인으로 포함된 작업

병합한 `feat/stock-tagged-community-discovery-v2026.09.13.10`에는 계정 보안, 관리자 입력 상태 보존, Business Settlement Boost, Trusted Client IP, 주식 태그 커뮤니티 및 탐색의 선행 stacked 작업이 이미 포함돼 있었습니다. 따라서 같은 내용을 담은 하위 `auto`, `feat`, `fix`, `integrate`, `test-candidate` ref는 개별 재병합하지 않고 포함/대체된 것으로 분류했습니다.

### 선택적으로 조정한 체인

- 은행 / migration parity / marketplace: 런타임 UI는 보존했지만 오래된 소스의 `179-local-email-auth.sql`을 통합 migration 순서 위에 다시 재생하지 않았습니다.
- 로컬 인증 메일: SMTP sender, 백엔드 연결, 인증 action/page, 테스트를 보존하고 중복 migration 번호는 복사하지 않았습니다.
- 조건부 알림 / 개인 대시보드 / 포트폴리오 분석: 런타임과 `182-conditional-stock-alerts.sql`을 통합하되 현재 기획서·문서 인덱스는 최신 `main` 기준을 유지했습니다.
- Event Calendar: 런타임과 과거 기록을 보존하고 내비게이션은 수동 조정하여 `/dashboard`, `/account/security`, `/calendar`가 모두 유지되도록 했습니다.

### 직접 병합한 안전 작업

- Economy Scenario Lab 대체 체인
- Casino Game System 문서
- AI Economy Controller 영문/한국어 문서 패키지

### 동시 생성 통합 브랜치 처리

`integrate/final-all-v2026.09.13.27`은 감사했지만 전체 병합하지 않았습니다. 이 브랜치에는 동일한 로컬 이메일 인증 SQL이 `179-local-email-auth.sql`과 `180-local-email-auth.sql`에 동시에 존재하고, 별도로 `179-business-settlement-v2-boost-runtime-fix.sql`도 존재합니다. 따라서 migration 번호·내용 중복 위험이 있습니다. 일부 파일을 직접 대조한 결과 PR상 큰 차이로 보이는 문서/런타임도 현재 후보와 blob SHA가 동일한 경우가 많아 실제 내용 차이보다 분기 이력이 크게 보이는 부분도 확인했습니다.

현재 `main`과 크게 분기됐고 `163-local-email-auth.sql` 같은 대체된 상태를 가진 과거 인증/문서 통합 브랜치는 강제로 재생하지 않았습니다. 유효한 개념은 최신 정식 문서와 런타임에 반영된 상태로 유지하고, 오래된 이력은 저장소 기록으로 남겼습니다.

## 사용한 통합 PR / 처리

- #229: 주식/커뮤니티/보안 통합 상위 체인 병합
- #230: 감사 후 migration 충돌 때문에 은행/마켓플레이스 런타임만 선택 통합
- #232: 감사 후 로컬 인증 메일 런타임만 선택 통합
- #236: 감사 후 알림/대시보드/포트폴리오 런타임과 migration 182 선택 통합
- #244: Economy Scenario Lab 병합
- #245: Casino Game System 기획서 병합
- Event Calendar 런타임·문서 선택 통합 및 내비게이션 수동 조정
- #254: AI Economy Controller 문서 병합
- Draft #252: 동시 생성 v27 감사. 로컬 인증 migration 중복 때문에 전체 병합 거부

## 최종 DB migration 순서

1. `179-business-settlement-v2-boost-runtime-fix.sql`
2. `180-local-email-auth.sql`
3. `181-stock-tagged-community.sql`
4. `182-conditional-stock-alerts.sql`

이번 통합으로 production checksum 기준에 포함된 기존 migration을 의도적으로 이름 변경하거나 재작성하지 않았습니다.

## 검증 상태

- `main`: 변경 없음
- Production: 변경 없음
- 최종 후보: `integrate/final-safe-all-v2026.09.13.28`
- GitHub CI: 이 작업기록 커밋 이후 최종 exact SHA 기준으로 실행 예정
- 격리 Test: `@미니pc홍`을 포함한 승인 원격 장비 오프라인으로 차단
- 백엔드/DB/API/UI exact-SHA Test smoke: 아직 성공 주장 불가
- Production 승격: 필수 Test 증거 전까지 차단

## 정리

원본 브랜치 삭제 성공은 주장하지 않습니다. 현재 세션의 GitHub 연결에는 remote ref 삭제 기능이 없고 승인 원격 장비도 오프라인입니다. 대체된 브랜치 삭제는 최종 후보 검증 후 삭제 가능한 승인 환경이 확보됐을 때 진행해야 합니다.
