# 내부 변경 기록 — v2026.09.16.155

## 장애 근거

- 사용자 증상: 카지노 동작 후 전체 애플리케이션 오류 경계 화면으로 전환될 수 있음.
- 운영 참조 코드: `3286936712@E352`.
- 운영 프론트엔드 로그: `A "use server" file can only export async functions, found object.`
- 추가 런타임 문제: `moneyverse-frontend`는 `debian` 사용자로 실행되지만 릴리스 캐시 파일이 `root` 소유여서 Next.js fetch cache에서 `EACCES`가 반복 발생.

## 코드 변경

1. `casino-state.ts`를 추가하고 `CasinoPlayState`/`CASINO_IDLE`을 `actions.ts` 밖으로 이동.
2. `use server` 액션 모듈의 동기 `parityLabel` 재내보내기 제거.
3. 모든 카지노 클라이언트 컴포넌트가 클라이언트 안전 모듈에서 초기 상태를 가져오도록 수정.
4. 서버 액션 모듈에 런타임 객체/재내보내기가 다시 추가되는 것을 막는 정적 회귀 테스트 추가.
5. 정산 중복 제출을 방지하도록 안내하는 카지노 전용 오류 경계 추가.
6. 일반 로딩 스켈레톤을 카지노 구조 전용 로딩 UI로 교체.

## 런타임 조치

현재 Debian 운영 릴리스의 `.next/cache` 소유권을 `debian:debian`으로 수정해 캐시 쓰기 실패를 중단했습니다. 회원 데이터, DB 스키마, 원장, 잔액, 카지노 정산 데이터는 변경하지 않았습니다.

## 검증 근거

- 카지노 집중 테스트 14건 통과, 실패 0건.
- 타입체크 통과.
- Lint 오류 0건, 변경과 무관한 기존 경고 11건.
- Next.js 프로덕션 빌드 통과.

## 승격 게이트

브랜치 → exact-SHA Test 후보 → 공개 Test exact-SHA/API/사용자 흐름 QA → main → exact-main-SHA Test → 운영 → 운영 smoke/log 점검 순서로 진행합니다. 공개 운영이 의도한 SHA를 제공하고 카지노 동작에서 기록된 서버 액션 경계 오류가 더 이상 발생하지 않아야 완료로 판단합니다.
