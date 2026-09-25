# 월덕 머니버스 — 전 라우트 UI·기능 QA 명세

> 버전: v2026.09.25.442
> 상태: PLANNING / 권위 상세 QA 계약
> 기준일: 2026-09-25
> 상위 문서: `PROJECT_PLAN.ko.md`, `ACCESSIBILITY_RESPONSIVE_INTERACTION_SPEC.ko.md`
> 영문 기준 문서: [FULL_ROUTE_UI_QA_SPEC.md](FULL_ROUTE_UI_QA_SPEC.md)

## 1. 범위 불변조건

전 사이트 QA는 샘플이 아니라 exact candidate에 존재하는 모든 frontend page를 의미한다.
권위 inventory는 QA 직전 candidate source에서 생성한다.
현재 App Router 구조에서는 모든 `frontend/src/app/**/page.tsx`를 탐색한다.
loading/error/permission 상태와 UI에 영향을 주는 redirect 같은 특수 render surface는 담당 page row에 연결한다.

2026-09-25 현재 소스 스냅샷:
- 전체 page route 86개;
- `/admin/**` 관리자 route 22개;
- dynamic page route 8개;
- loading component 25개, error component 3개 관측.

이 숫자는 현재 스냅샷 증거일 뿐이며 항상 candidate에서 생성한 inventory가 권위다.

## 2. 제외 금지 규칙

발견된 모든 page는 ledger row 하나와 최종 PASS, FAIL 또는 BLOCKED 상태를 가진다.
“변경 안 됨”, “같은 component”, “internal”, “admin”, “지난 release에서 통과”, “비슷해 보임”은 skip 사유가 아니다.
모든 관리자 page는 기본 QA 범위이며 동시에 privileged/high-risk surface로 추가 취급한다.
신규 route가 추가되면 별도 기획 수정 없이 자동으로 QA 범위가 확장된다.## 3. 라우트 실행 계약

각 route 검사는 다음을 수행한다.
1. 필요한 auth/role 상태로 route에 진입한다.
2. 최초 render, title/heading, navigation, 주요 데이터를 확인한다.
3. 상단부터 마지막 content까지 전부 scroll한다.
4. 모든 local tab, section, accordion, drawer, 관련 dialog를 연다.
5. 안전한 Test fixture로 primary/secondary action을 수행한다.
6. keyboard/focus/touch와 page-level 가로 overflow 0건을 확인한다.
7. stateful 화면은 refresh/back-forward 동작을 확인한다.
8. candidate 기인 console/runtime/API error를 기록한다.

Dynamic route는 재현 가능한 valid fixture와 적용 가능한 invalid, not-found, owner/non-owner, permission-denied fixture를 사용한다.
목록 page 확인으로 dynamic detail page 직접 검사를 대체할 수 없다.

## 4. 역할 및 상태 매트릭스

각 page가 지원하는 실질적으로 다른 상태를 모두 사용한다.
- guest / pre-login;
- signed-in member;
- restricted 또는 permission-denied member;
- ownership에 따라 동작이 달라지는 owner/non-owner;
- 필요한 administrator 및 추가 privileged role/step-up 상태.

필수 UI 상태에는 loading/skeleton, empty, long-content, partial/stale, validation error,
server/network error, 지원되는 offline/maintenance, permission denied, success, mutation pending,
적용 가능한 idempotent retry/replay, 저장 후 server-authoritative reread를 포함한다.

## 5. 반응형 매트릭스

모든 page가 반응형 QA에 참여한다. 필수 범위:
320, 360, 375, 390, 412, 430 CSS px portrait; 대표 mobile landscape;
768/1024 tablet; desktop; 200% zoom 및 적용 가능한 400% reflow.

page/body overflow, clipping, overlap, hidden navigation/CTA, 도달 불가 control,
잘못된 wrapping, 핵심 데이터 소실, focus 가림, safe-area overlap, task 완료 불가는 실패다.## 6. 전 사이트 5회 완주 규칙

모든 release candidate는 최소 5회의 완전한 전 사이트 QA pass를 수행한다.
매 pass에서 모든 발견 page와 모든 관리자 page를 방문한다.
5회 누적 결과로 필수 viewport, role, fixture, content-length, UI-state matrix를 모두 커버한다.
pass 중 발견한 결함은 route ledger에 연결해 수정하고 해당 route와 수정된 shared layout/component를 사용하는 영향 page 범위를 재검증한다.

## 7. 관리자 기본선

모든 `/admin/**` page는 매 pass에서 authenticated administrator runtime data로 확인한다.
admin navigation, table/card, filter, form, dialog, responsive reflow,
role 및 recent-reauth/step-up, save/apply confirmation, audit evidence,
민감/파괴 action의 안전한 Test 처리를 포함한다.
관리자 QA를 나중의 선택 단계로 미룰 수 없다.

## 8. 증거 및 coverage 산식

route row별 필수 증거:
`candidate_sha`, `route`, `route_kind`, `role_state`, `fixture_id`, `pass_number`,
`browser_engine`, `viewport`, `orientation`, `zoom`, `runtime_version`, `api_version`,
`result`, `defect_id`, evidence reference.

승격 산식은 fail-closed다.
`발견 distinct page 수 == ledger distinct page 수 == 최종 수용 증거가 있는 page 수`.
불일치, skipped route, unresolved FAIL/BLOCKED, 관리자 page 누락, candidate 기인 runtime/console failure가 하나라도 있으면 Production을 차단한다.

## 9. 런타임 권위

최종 수용은 exact candidate SHA와 실제 backend/API/database contract를 사용하는 Test에서 수행한다.
unit test, source inspection, mocked browser state, screenshot, 과거 route sweep는 보조 증거일 뿐이다.
Production 승격 시 과거 release의 page-pass 주장을 재사용하지 않고 v442 candidate gate를 다시 수행한다.

## 10. 현재 상태 메모

과거에는 60-route browser sweep와 후속 관리자 audit 증거가 있다.
현재 소스는 86개 page를 가지므로 과거 pass는 유용한 이력이지만 현재 full-route 완료를 증명하지 못한다.
v442는 기획/QA 권위만 변경하며 현재 Test/Production이 새 gate를 이미 통과했다고 주장하지 않는다.