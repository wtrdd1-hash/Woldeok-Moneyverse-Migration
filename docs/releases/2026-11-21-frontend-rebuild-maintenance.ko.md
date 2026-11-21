# 프론트엔드 재구축 점검 전환 — 2026-11-21

상태: **점검 안내 운영 적용 / 기존 전용 프론트엔드 2개 중지 / 새 프론트엔드 미승격**.

사용자가 전체 프론트엔드 중지, ‘프론트엔드 긴급 점검 중’ 안내, Nov18 디자인의 Spring 전체 재구축·백엔드 결함 수정·관리자 포함·운영 승격을 명시 승인했다. 데이터/세션/공유 API의 중지 또는 보안 게이트 완화 승인이 아니다.

## 실제 적용

- [PR #3346](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3346) 정상 병합. 적용 정본 main `93a31e3e441f986441e83f31fcdf9ab4e4143ad6`.
- Nginx 문서 전용 503 안내. `Cache-Control: private, no-store, max-age=0`, `Retry-After: 300`, noindex. 예상 완료 시간을 표시하지 않았다.
- root 소유 r3 runner SHA256 `7dbab08f6b977bbfdbafcc18f282351dd63fa930ce8e9577a407d9958321e4c6`. 보호된 stage `/var/lib/moneyverse-frontend-rebuild-20261121/maintenance-proposal-r3`에 설정·원본·해시·Test/운영/중지 영수증·진단 보존. r1/r2 미적용.
- 먼저 loopback 보호 Test만 적용해 실제 503 문구, 운영 원상태, API 경계 유지 증명 후 동일 아티팩트를 운영에 적용했다. Test 외부 접근 차단 유지.
- 인벤토리 exact 876개 문서 경로 모두 503·점검 헤더·문구 확인. 동적 33개 패턴 포함; 모든 동적 entity의 테스트 완료 의미는 아니다. 실제 `/stocks/QA-maintenance` 별도 점검 확인.
- 운영 브라우저 1280px에서 문구·파비콘 실제 로드·가로 넘침 없음 확인. 회원/관리자 업무 화면 기능의 수용 증거는 아니다.
- 기존 `/favicon.ico` 그대로 사용: 200, SHA256 `7c17c9be67fb26d74879b5392423e736ed7079a3c00e5a203adcecddf35fa3d5`.
- `moneyverse-frontend-consolidated-prod-v20261121.service`와 `moneyverse-frontend-consolidated-test-v20261121.service`를 DB-free frontend-presentation 모드·실제 PID/cwd·역방향 의존성 확인 후 disable/stop. 두 서비스 모두 inactive/disabled/MainPID0.
- 기존 Next frontend unit은 이미 inactive였다. HTML과 API를 함께 제공하는 Spring 프로세스는 공유 백엔드이므로 유지한다. 따라서 ‘공유 Spring 프로세스까지 모두 종료’한 것은 아니다. 외부 프론트엔드 문서 진입은 점검 안내로 대체했다.
- API 중지 전후: `/api/v1/stocks` 200 JSON, `/api/v1/auth/me` 401 JSON, `/api/v1/admin/me` 401 JSON. 인증 없는 loopback probe이며 로그인 세션의 양성 수용 증거로 확대하지 않는다. 세션 삭제·키 회전·DB/원장 변경 없음.

## 검증 및 복원

Python 4개 테스트 통과(0실패): 실제 격리 Nginx의 503/동적 문서/API 오류 JSON/POST method-body-query/auth_request 허용·거부/Test admission, partial install 및 잘못된 syntax 원복. 보안·제어문자 테스트 8개 통과, 현재 보안·제어문자 검사 통과. CI policy 성공; control-plane 분류로 애플리케이션 런타임/빌드는 skip이며 새 앱 검증으로 보고하지 않는다.

설정 원본 SHA256 `e8ce6854379dc38f1943af3789b01436578cfc16ce64284ccffc4ef71acb4ec5`, 점검 후 `1e3d624f8ab3ff5f872ac90c33f38128deed413e9e06b88033c9f20671d16fd0`. 원복은 먼저 필요한 기존 frontend unit 두 개를 enable/start해 포트와 실제 렌더링을 확인하고, 현재 설정·소유 include 해시를 재확인한 뒤 기록된 원본/정확한 역변경으로 점검 include를 제거하고 nginx -t 및 graceful reload한다. 동시 타 작업 설정이 바뀌면 오래된 전체 설정을 복사하지 않는다. 새 프론트엔드가 검증되기 전 점검만 제거하지 않는다.

## 남은 재구축

기존 native26 부분 구현은 전체 정상화가 아니다. 새 native 기능별 controller/template/client, 관리자 전 기능, API의 고정 데이터·허위 성공 제거, 실제 권한/CSRF/재인증/영수증, 5개 언어·PC/모바일·모든 경로 QA, 정확 아티팩트 Test 및 운영 수용은 진행 중이다. 점검 페이지 운영 적용을 새 프론트엔드 완성으로 보고하지 않는다.
