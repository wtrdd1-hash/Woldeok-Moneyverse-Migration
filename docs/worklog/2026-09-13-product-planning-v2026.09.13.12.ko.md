# 제품 기획 작업 로그 — v2026.09.13.12

## 시작 상태

- 최신 `main` `6a2089a22f7bba70af3ce970a8c751e72539849b`를 다시 확인했다.
- `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md` 및 관련 최근 기획 문서를 다시 읽었다.
- 열린 런타임 PR을 재확인했다. Stock-tagged Community discovery (#208), Account Security Center (#201), 관리자 편집상태 안전 (#198), trusted-client-IP 보안 (#197), 사업정산 수정 (#196), 이벤트 캘린더 (#195), 카지노 기획 (#192), Economy Scenario Lab (#189)이 열려 있다.
- 이들 PR에는 동일한 알림/복귀 거버넌스 계약이 없음을 확인했다.

## 선택한 공백

기존 문서 여러 곳에 알림 선호, quiet hours, 시즌 종료 알림, 주간 리캡, 복귀 미션이 흩어져 있지만 목적 분류, 동의/suppression, 플랫폼 권한, 빈도 보호, dedupe/idempotency, 템플릿 보안, 딥링크, 미성년자, analytics, 관리자 운영을 하나로 묶은 권위 명세가 없었다.

이 공백은 런타임 코드를 건드리지 않으면서 리텐션, 보안, 개인정보/법규, 모바일 UX, 수익화에 동시에 영향을 주므로 이번 회차 우선순위로 선택했다.

## 최신 자료 조사

2026-09-13 확인:

1. KISA 불법스팸대응센터 — 2026-03-04 불법스팸 안내서 제7차 개정 안내. 핵심: 광고 수신동의 문구 명확화, 앱푸시 광고 수신거부 절차 단순화, 혜택성 알림도 동의 요건을 우회할 수 없음. 직접 채택.
2. 미국 FTC CAN-SPAM 법률/사업자 안내. 핵심: 상업 이메일의 정확한 발신자/제목과 유효한 수신거부/suppression. 아키텍처에 직접 채택하며 세부 법률 적용은 review-required.
3. Android Developers 알림 런타임 권한 안내. 핵심: Android 13+ 일반 알림의 `POST_NOTIFICATIONS` 및 가치가 이해되는 시점의 권한 요청. 직접 채택.
4. Apple Developer 알림 HIG/interruption level. 핵심: 권한과 긴급도를 실제 사용자 가치/긴급성에 맞춰야 함. 공식 플랫폼 기준으로 채택하며 growth 목적으로 critical/time-sensitive를 오용하지 않음.

## 실제 서비스 확인

`https://easy-scraping.com`은 HTTP 530을 반환했다. `runtime verification unavailable`로 기록하고 운영/Test 알림 UI/API가 존재한다고 추정하지 않았다.

## 결정

- 목적/채널 선호 상태를 서버 권위값으로 사용.
- 보안/거래/운영 메시지와 마케팅을 분리.
- 통신 cadence 제한은 안전/스팸 방지 보호한도이며 게임플레이 cap이 아님.
- 선택 알림에는 quiet hours와 digest/coalescing 적용.
- 결정적 메시지 식별자로 retry/replay 중복 발송 방지.
- WLD/WDX 시장 알림은 학습/복기 중심으로 제한하며 거래횟수를 성공 KPI로 사용하지 않음.
- 보호 미성년자 상태의 개인맞춤 광고 알림 기본 OFF.
- provider 장애가 원장/경제 거래를 되돌리지 않도록 알림을 post-commit side effect로 처리.
- 개인 알림함/선호는 `noindex`; 공개 도움말만 색인 후보.

## 변경 파일

- `docs/planning/NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`
- `docs/planning/NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.ko.md`
- v2026.09.13.12 영문/한국어 changelog
- v2026.09.13.12 영문/한국어 worklog
- 영문/한국어 문서 색인

## 브랜치 / 테스트 / 배포

브랜치: `docs/notification-reactivation-governance-v2026.09.13.12`.

문서-only 변경이다. 이번 변경에는 Test/Production 배포가 필요하지 않다. 향후 런타임 구현은 별도 개발 브랜치에서 진행하고 격리 Test exact-SHA backend/API/database/provider/UI/security 검증 후 Production으로 승격한다.

## 다음 우선순위

1. 열린 런타임 PR을 최신 main과 다시 정합화하고 검증.
2. 자체 이메일 인증 및 Account Security Center P0 보안 완료.
3. 알림 선호/suppression/인앱 알림함/보안·거래 알림 기반 구현.
4. 서비스 복구 즉시 Runtime Product Reality Audit으로 실제 UI/API와 Living Spec을 대조.