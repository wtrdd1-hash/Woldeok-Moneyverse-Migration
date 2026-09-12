# 알림 및 복귀 메시지 거버넌스 v2026.09.13.12

## 변경 이유

성장/시즌 기획에는 이미 주간 리캡, 복귀 미션, 시즌 알림, 커뮤니티 알림, 계정·보안 메시지가 포함되어 있었지만 알림 목적, 동의, suppression, quiet hours, 중복방지, 금융게임 안전, 미성년자, provider 처리, analytics, 운영자 제어를 하나로 묶은 구현급 계약이 없었다.

## 변경사항

- 영문 canonical `NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`와 한국어 대응본을 추가했다.
- 보안, 거래, 서비스운영, 제품활동, 시즌/라이브옵스, 복귀, 마케팅의 7개 목적 클래스를 정의했다.
- OS 푸시 권한과 Moneyverse 마케팅 동의를 분리했다.
- 서버 권위의 목적/채널별 선호상태, 동의 증빙, suppression을 정의했다.
- quiet hours, 피로도 보호, digest/coalescing, 재시도 안전 중복방지와 멱등성을 추가했다.
- FOMO·거래횟수 증가를 노린 복귀/시장 알림을 금지하고 학습·복기 중심 원칙을 명시했다.
- 미성년자 제한과 잠금화면 민감정보 보호를 추가했다.
- template, deep link, DB/read model, API, scheduler, 관리자콘솔, KPI, 접근성, DoD를 구현 수준으로 정의했다.
- 알림 빈도 제한은 통신 안전 보호한도이며 기본 한도 없음 게임플레이 정책을 바꾸지 않음을 명시했다.

## 2026-09-13 최신 자료 확인

- KISA 불법스팸대응센터: 2026-03-04 정보통신망법 불법스팸 안내서 제7차 개정 안내. 광고 동의 문구 명확화와 앱푸시 수신거부 절차 단순화 원칙을 직접 채택.
- 미국 FTC CAN-SPAM 법률/사업자 안내. 상업 이메일의 정확한 발신/제목과 수신거부 suppression 구조를 직접 채택.
- Android Developers 알림 런타임 권한 문서. Android 13+ `POST_NOTIFICATIONS`와 맥락 기반 권한 요청을 직접 채택.
- Apple Developer 알림 HIG/interruption level 문서. 사용자 권한과 긴급도 사용을 제한적으로 운영하는 기준으로 참고·채택.

구체적인 상업메시지 법률 적용범위는 출시 전 `legal review required`로 유지한다.

## 정책 영향

- 신규 게임플레이 하드캡 없음.
- WLD/WDX 회계, sink 분류, 시장 규칙 변경 없음.
- 보안/계정 알림 영역의 유료 우선순위 판매 금지.
- 개인 알림함/선호는 인증 또는 token scope + `noindex`; 공개 도움말만 검색 노출 후보.

## 실제 서비스 확인

`https://easy-scraping.com`은 이번 회차에도 HTTP 530으로 확인되어 `runtime verification unavailable`로 기록했다. 운영에 알림 시스템이 구현되어 있다고 추정하지 않는다.

## 브랜치 / 배포

- 버전: `v2026.09.13.12`
- 브랜치: `docs/notification-reactivation-governance-v2026.09.13.12`
- 변경유형: 문서-only
- 테스트서버 배포: 이번 문서 변경에는 불필요
- 실제 구현은 별도 개발 브랜치 -> 격리 Test exact-SHA -> backend/API/database/provider/UI 검증 -> Production 순서를 따른다.

## 다음 우선순위

1. 현재 런타임 PR을 최신 main과 다시 정합화하고 Test 검증;
2. 자체 로그인/Account Security Center P0 구현;
3. first-party 알림 선호/suppression/인앱 알림함 기반 구현;
4. 서비스 복구 즉시 Runtime Product Reality Audit 수행.