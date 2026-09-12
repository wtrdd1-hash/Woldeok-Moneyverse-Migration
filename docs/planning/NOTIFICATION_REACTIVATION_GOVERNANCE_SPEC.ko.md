# 월덕 머니버스 — 알림 및 복귀 메시지 거버넌스 명세

> 버전: v2026.09.13.12
> 상태: 구현 지향형 Living 제품 명세
> 기준일: 2026-09-13
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `MINOR_SAFETY_AGE_ASSURANCE_CONTENT_REMOVAL_SPEC.md`, `ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md`
> 영문 기준 문서: [NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md](NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md)
> 한국어 색인: [../INDEX.ko.md](../INDEX.ko.md)

## 0. 목적

Moneyverse에는 이미 주간 리캡, 복귀 미션, 시즌 종료 안내, 커뮤니티 알림, 보안/계정 메시지 계획이 있다. 이 문서는 이를 인앱 알림함, 이메일, 웹/모바일 푸시, 향후 SMS까지 아우르는 하나의 구현 계약으로 정리한다.

목표는 메시지를 많이 보내는 것이 아니다. 사용자가 의도한 행동을 완료하고, 계정을 보호하고, 서비스 변경을 이해하거나, 의미 있는 활동으로 복귀할 수 있게 하는 최소한의 적절한 메시지를 보내는 것이다.

## 1. 알림 분류

모든 템플릿은 하나의 주 목적만 가져야 한다.

1. `SECURITY_CRITICAL` — 의심 로그인, 비밀번호/인증수단 변경, 복구, 새 세션, 보안 잠금.
2. `TRANSACTIONAL` — 구매 영수증, 환불, 결제 실패, 계정 내보내기/삭제 상태, 필요한 경우 가치변경 행동 영수증.
3. `SERVICE_OPERATIONAL` — 점검, 장애, 마이그레이션, 서비스 가용성의 중대한 변경.
4. `PRODUCT_ACTIVITY` — 사용자가 요청한 퀘스트, 직업, 수집, 사업, 관심종목, 커뮤니티, 클럽 활동.
5. `SEASON_LIVEOPS` — 시즌 시작/종료, D-14/D-7/D-3/D-1 안내, 이벤트 상태, 획득 보상 안내.
6. `REACTIVATION` — 주간 리캡, 복귀 미션, 미완료 목표, 복귀 요약.
7. `MARKETING_COMMERCIAL` — 유료 플랜, 스폰서 콘텐츠, 프로모션 등 상업적 권유.

상업적 목적을 보안, 거래, 운영, 또는 모호한 “혜택 알림”으로 위장하지 않는다.

## 2. 채널 정책

계획 채널은 다음과 같다.

- 인앱 알림함: 로그인 사용자의 기본 채널;
- 이메일: 계정/보안/거래 알림 + 별도 동의한 선택 카테고리;
- 웹/모바일 푸시: opt-in 및 OS 권한이 있을 때만;
- SMS: 구체적 제품 필요, 사업자, 관할 법규, 비용모델이 확정되기 전까지 기본 비활성화;
- Discord: 명시적으로 연결된 계정/커뮤니티 선호와 플랫폼 정책 범위에서만.

중대한 계정보안 메시지는 계정 보호를 위해 사용 가능한 검증 채널을 사용할 수 있으나, 그 예외를 프로모션에 재사용하지 않는다.

## 3. 동의 및 선호 상태

선호 상태는 서버 권위값이며 목적별로 분리한다. 권장 상태:

`UNKNOWN`, `OPTED_IN`, `OPTED_OUT`, `REQUIRED_SERVICE`, `CHANNEL_UNAVAILABLE`, `PENDING_VERIFICATION`.

최소 저장 항목:

- `user_id`;
- `purpose_code`;
- `channel`;
- `state`;
- `policy_version`;
- `source_surface`;
- `consented_at` / `revoked_at`;
- 필요한 경우 locale 및 timezone 스냅샷;
- 불필요한 민감정보를 넣지 않은 증빙/audit 식별자.

한국 법령/정책상 필요한 경우 마케팅 목적 개인정보 활용 동의와 광고성 정보 전송 동의를 별도로 표현할 수 있어야 한다. 선택적 마케팅 동의를 거부해도 핵심 서비스 이용이 가능해야 한다.

수신거부는 새 예약 요청뿐 아니라 이미 대기열에 있는 향후 선택형 메시지에도 가능한 범위에서 즉시 반영한다. 선호 변경은 멱등성과 감사 가능한 시각을 가져야 한다.

## 4. 한국 불법스팸/광고성 정보 제품 요구사항

Moneyverse의 이메일·푸시·SMS 등 프로모션 전자메시지는 한국 광고성 정보 규정을 출시 게이트로 다룬다.

제품 원칙:

- 실제 목적이 광고라면 “혜택 알림”, “정보 제공”처럼 모호한 동의 문구를 쓰지 않는다;
- 필요한 경우 마케팅 목적 개인정보 동의와 광고성 정보 수신동의를 분리한다;
- 앱푸시 광고 수신거부를 위해 불필요한 로그인이나 복잡한 절차를 강제하지 않는다;
- 쿠폰·마일리지·적립금 등을 일방 제공한 뒤 이를 이유로 필요한 사전동의 없이 광고성 안내를 보내지 않는다;
- 채널별 발신자/광고표시/수신거부 표시 요건을 구현하기 전 상업 발송을 시작하지 않는다;
- 동의 버전, 취득 경로, 철회 이력을 증빙으로 보관한다.

직접 반영 근거: 한국인터넷진흥원 `불법스팸 방지를 위한 정보통신망법 안내서` 제7차 개정 안내, 2026-03-04. 세부 적용범위는 상업 출시 전 `legal review required`로 유지한다.

## 5. 미국 상업 이메일 기준

상업 이메일은 CAN-SPAM 기준을 수용할 수 있도록 정확한 발신자/헤더, 기만적이지 않은 제목, 필요한 광고표시, 유효한 수신거부 수단, 적법한 철회 이후 향후 상업 이메일 억제를 지원해야 한다.

실제 운영은 가능한 경우 법정 최대 처리기간까지 일부러 기다리지 않고 즉시 수신거부를 반영한다.

직접 반영 근거: 미국 FTC CAN-SPAM 법률/사업자 안내. SMS/robotext 및 주법 적용 여부는 실제 채널 도입 전에 별도 법률 검토가 필요하다.

## 6. OS 알림 권한과 채널

푸시 권한과 Moneyverse 마케팅 동의는 같은 것이 아니다.

- Android 13 이상에서 일반 알림 전송은 플랫폼 `POST_NOTIFICATIONS` 런타임 권한을 고려해야 한다.
- 권한 요청은 첫 화면에서 무조건 띄우기보다 사용자가 가치를 이해할 수 있는 맥락에서 한다.
- Android notification channel은 낮은 가치 알림을 사용자가 별도로 끌 수 있도록 명확한 카테고리로 나눈다.
- Apple의 `timeSensitive` 또는 `critical`은 성장 KPI를 위한 도구가 아니다. 실제 긴급성·플랫폼 정책을 충족하는 경우에만 사용하며 시즌, 소셜, 마케팅, 복귀 알림은 일반/수동적 수준을 기본으로 한다.

## 7. Quiet hours와 발송 시각

선택형 알림의 기본 quiet hours는 사용자 현지시간 22:00–08:00으로 두되 사용자가 변경할 수 있게 한다.

기본적으로 `PRODUCT_ACTIVITY`, `SEASON_LIVEOPS`, `REACTIVATION`, `MARKETING_COMMERCIAL`에 적용한다. `SECURITY_CRITICAL`과 지연이 실제 피해를 만드는 운영 장애 알림은 필요 시 예외가 될 수 있다.

시간대를 모른다고 마케팅을 위해 IP 기반 정밀 위치를 추정하지 않는다. 가능한 경우 계정/기기 timezone을 사용하고, 없으면 보수적인 서비스 timezone을 사용한다.

## 8. 빈도 및 피로도 보호

기본 한도 없음 정책은 게임플레이에 적용되지만, 알림 빈도는 주의력 보호와 스팸 방지라는 구체적 안전 목적이 있으므로 보호한도를 둘 수 있다.

초기 가드레일 예시:

- 복귀 메시지: 신규 사용자 행동이 없으면 7일 동안 선택형 외부 메시지 최대 2회;
- 일반 활동 알림: 가능한 경우 반복 이벤트를 digest로 묶음;
- 커뮤니티 폭주: 같은 대화/기간의 반응·답글을 집계;
- 시즌: D-14/D-7/D-3/D-1 일정 중심으로 발송하고 반복 카운트다운 스팸 금지;
- 마케팅: 관할/채널별로 보수적 cadence 설정;
- 보안: 실제 공격을 숨기게 되는 빈도 제한은 금지.

이 제한은 통신 안전을 위한 것이며 플레이, XP, 퀘스트, 구매, 성장 횟수를 막아서는 안 된다.

## 9. 중복방지와 멱등성

모든 논리 메시지는 다음과 같은 결정적 키를 가진다.

`notification:{purpose}:{user_id}:{object_id}:{event_version}`

재시도, 중복 webhook, 배포 재시작, 시즌 재정산 때문에 같은 메시지가 여러 번 발송되지 않도록 scheduler/provider 기록을 멱등하게 처리한다.

## 10. 복귀 메시지 제품 설계

복귀 메시지는 손실회피를 조작하지 말고 상태를 요약하고 한 가지 유용한 다음 행동을 제안한다.

포함 가능:

- 마지막 활동 이후 무엇이 바뀌었는지;
- 미완료 시즌/스토리 목표;
- 추천 행동 1개;
- 권위 데이터 기반 관심종목/사업 변화 요약;
- 이미 획득한 미수령 보상;
- 정확한 이벤트/시즌 날짜.

금지:

- 실제로 사라지지 않는데 “돈이 사라지고 있다”는 표현;
- 가짜 카운트다운;
- 허위 희소성;
- 일반 리텐션에 반복적 “긴급” 표현;
- 이탈했다는 이유만으로 큰 WLD 지급;
- 손실 복구를 위해 많은 거래를 하도록 유도;
- WLD/WDX의 virtual/simulated/game-only 성격을 흐리는 표현.

## 11. 금융 게임 알림 안전

시장 관련 알림은 강박 거래나 고위험 행동을 부추기지 않는다.

허용 예:

- 관심종목 가상 기업 이벤트 게시;
- 시장 점검/정산 상태 변경;
- 사용자가 요청한 거래 저널 복기 알림;
- 분산투자 학습 콘텐츠;
- 구현된 경우 주문 체결/거절 영수증.

기본 성장 알림으로 금지:

- “오르기 전에 지금 사세요”;
- “놓치기 전에 파세요”;
- 거래횟수 증가를 목표로 한 반복 손익 알림;
- 수익 보장/손실 회복 언어;
- 최근 손실만을 근거로 한 개인화된 긴급 거래 유도.

거래횟수는 알림 성공 KPI가 아니다.

## 12. 미성년자 안전

`child_restricted` 등 보호 상태에서는:

- 개인맞춤 광고 알림 기본 OFF;
- 마케팅 자격은 미성년자 안전/법정대리인 동의 명세를 따른다;
- 잠금화면 미리보기에서 민감한 소셜 내용을 기본 노출하지 않는다;
- 계정보안 알림은 적절한 검증 채널로 유지한다;
- 연령/대리인 데이터를 불필요하게 외부 알림 사업자 payload에 복제하지 않는다.

## 13. 템플릿 계약

모든 템플릿 버전은 다음을 정의한다.

- `template_code`, version;
- purpose class;
- 허용 채널;
- locale;
- 제목/subject와 body 변수;
- deep-link allowlist;
- 동의 요구사항;
- quiet-hour 동작;
- TTL/만료;
- dedupe key/window;
- 민감정보 미리보기 정책;
- fallback 채널;
- 접근성 검토 상태;
- 필요한 경우 법규 검토 상태.

운영자가 임의 HTML/JS를 넣는 템플릿은 허용하지 않는다. 변수는 목적지에 맞게 타입 검증하고 escape한다.

## 14. 딥링크 보안

알림 링크는 allowlist된 1차 도메인 경로나 검토된 외부 목적지만 사용한다.

- session token, reset secret, payment secret, 원문 개인정보를 URL에 넣지 않는다;
- 민감행동은 이동 후 정상 인증/재인증을 요구한다;
- 알림 링크 자체는 권한이 아니다;
- 만료/삭제 객체는 안전한 안내 상태로 이동한다;
- 마케팅 attribution parameter에 개인 금융/계정 식별자를 넣지 않는다.

## 15. 데이터 모델

권장 테이블/read model:

- `notification_preferences`;
- `notification_templates`;
- `notification_events`;
- `notification_deliveries`;
- `notification_suppressions`;
- `notification_digest_items`;
- `notification_provider_receipts`;
- `notification_audit_events`.

Provider token/endpoint는 민감도에 따라 암호화 또는 동등한 보호를 적용하고 일반 관리자 목록/로그에 노출하지 않는다.

## 16. API 계약

후보 API:

- `GET /api/v1/notifications` — 인증된 알림함, cursor pagination;
- `POST /api/v1/notifications/:id/read` — 멱등 read 상태;
- `POST /api/v1/notifications/read-all`;
- `GET /api/v1/account/notification-preferences`;
- `PUT /api/v1/account/notification-preferences` — 버전화 + CSRF 보호;
- `POST /api/v1/account/notification-endpoints` — 검증된 push endpoint/device token 등록;
- `DELETE /api/v1/account/notification-endpoints/:id`;
- 계정 로그인 권한을 주지 않는 단일목적 scoped token 기반 이메일 수신거부 endpoint.

관리자 API의 preview/test-send는 승인된 운영자/테스트 목적지에 한정한다.

## 17. 스케줄러/전송 파이프라인

권장 흐름:

`domain event -> eligibility/purpose evaluation -> preference/consent check -> quiet-hours/frequency check -> dedupe -> template render -> outbox -> provider -> delivery receipt -> analytics/audit`.

가치변경 트랜잭션은 알림 성공에 의존하지 않는다. 알림은 post-commit side effect이며 이메일/푸시 실패 때문에 이미 커밋된 원장 거래를 롤백하지 않는다.

## 18. 사용자 UI

### 알림 센터

데스크톱: All / Account / Market / Season / Community / Billing 그룹 필터를 가진 목록.

모바일: 충분한 터치 영역의 카드 목록. 읽지 않음 상태는 색상만 쓰지 않고 아이콘/텍스트와 시각 표현을 함께 쓴다.

상태: loading/skeleton, empty, offline/stale, partial provider failure, error, push 권한 거부, maintenance.

### 선호 설정

선택형 카테고리는 목적과 채널을 각각 보여준다. 보안/필수 서비스 메시지는 가짜 disabled toggle로 숨기지 말고 왜 필요한지 설명한다.

설정 변경 중 전체 페이지 자동 새로고침으로 입력값을 날리지 않는다.

## 19. 접근성

- 선호 control에 프로그래밍 가능한 label과 visible focus 제공;
- switch on/off 상태를 보조기술에 노출;
- toast는 적절한 `aria-live`를 사용하되 반복 방해 금지;
- 의미 있는 시간/날짜에는 timezone 문맥 제공;
- 색이나 아이콘만으로 상태 전달 금지;
- 닫기/읽음처리는 keyboard와 touch 모두 지원.

## 20. 분석/KPI

민감 payload 원문 없이 목적/채널별로 측정:

- generated, suppressed, queued, sent, delivered, failed;
- 법적/기술적으로 적절한 open/click;
- unsubscribe/opt-out rate;
- 알림 권한 허용/거부율;
- 가능한 경우 complaint/spam rate;
- digest/coalescing rate;
- duplicate-prevention count;
- 메시지 이후 D1/D7 복귀율;
- 단순 클릭이 아닌 실제 의미 있는 후속행동;
- 세션/지원 영향;
- 미성년자 정책 차단 건수;
- delivered message당 provider 비용.

클릭률 상승이 complaint, opt-out, 오류, 위험거래, 미성년자 정책 위반 증가를 정당화하지 않는다.

## 21. 수익성 영향

구독/결제 안내와 별도 동의 프로모션을 지원할 수 있지만:

- 유료 노출이 선호/quiet-hour/미성년자 정책을 우회하지 않는다;
- 스폰서 메시지는 명확히 표시한다;
- 광고주가 보안/계정 알림 영역의 우선순위를 구매할 수 없다;
- 발송비, 수신거부율, 이탈, 고객지원비를 수익성 계산에 포함한다;
- 광고비로 WLD/WDX 랭킹, 시장가격, 추천 로직 우위를 판매하지 않는다.

## 22. SEO 영향

개인 알림함, 선호, 수신거부 상태, 기기 endpoint 페이지는 인증 또는 token-scope 보호 + `noindex`를 사용한다.

알림 설정, 수신거부, 보안알림, 커뮤니케이션 선택권을 설명하는 공개 도움말은 색인 가능 후보지만 사용자별 상태는 노출하지 않는다.

## 23. 관리자 콘솔

운영자는:

- 템플릿/config 코드 검색;
- synthetic/test data로 locale별 preview;
- 발송 전 예상 대상자 수 확인;
- suppression/consent/frequency 영향 확인;
- 향후 선택형 캠페인 pause/cancel;
- aggregate delivery failure 확인;
- audit history 확인을 할 수 있다.

운영자는:

- 명시적 마케팅 수신거부 우회;
- 전체 device token/contact list 무제한 export;
- 보안 알림 이력 수정;
- 운영 사용자 주소로 임의 테스트 발송;
- 작성 중 campaign form 자동새로고침으로 입력값 손실을 유발할 수 없다.

대규모 발송은 최종 audience/purpose/channel preview와 사유 기록을 요구한다.

## 24. 운영 config

통신 안전 한도는 gameplay limit가 아니다.

예시:

- `notifications.enabled`;
- `notifications.channel.email.enabled`;
- `notifications.channel.push.enabled`;
- `notifications.channel.sms.enabled=false`;
- `notifications.quiet_hours.default_start`;
- `notifications.quiet_hours.default_end`;
- `notifications.reactivation.max_7d`;
- `notifications.marketing.max_7d`;
- `notifications.digest.window_minutes`;
- `notifications.provider.timeout_ms`;
- `notifications.provider.retry_policy_version`.

모든 config 변경은 버전화하고 감사 가능해야 한다.

## 25. 악용·보안

다음을 방어한다.

- endpoint 등록 탈취;
- unsubscribe/recovery 동작을 이용한 이메일 존재여부 추정;
- 공격자가 유발하는 notification bombing;
- 템플릿/UGC 변수의 HTML/script injection;
- 악성 딥링크;
- provider webhook spoofing;
- queue replay/중복 발송;
- 관리자 mass-send 실수;
- 잠금화면에 민감한 커뮤니티/금융정보 노출.

지원되는 경우 provider callback의 서명/진위 검증을 한다.

## 26. Definition of Done

알림 시스템은 다음 전까지 출시완료로 보지 않는다.

- 목적 taxonomy와 필수/선택 규칙 구현;
- 사용자 선호가 서버 권위값이며 감사 가능;
- 마케팅 수신거부가 가능한 범위에서 이미 queued된 선택형 메시지에도 적용;
- quiet hours/frequency 테스트 통과;
- dedupe/idempotency 테스트 통과;
- 보안알림을 마케팅으로 재사용하지 못함;
- provider token/secret 보호 및 redaction;
- EN/KO 템플릿과 선호 UI 동등성;
- 데스크톱/모바일/접근성 상태 검증;
- 미성년자 제한 검증;
- 이메일/푸시 장애가 권위 product transaction을 깨지 않음;
- analytics가 생성/발송/도달/행동을 구분;
- 한국/미국 상업메시지 법률 검토 checklist 완료;
- 런타임 구현은 Test exact-SHA 검증 완료.

## 27. 리서치 노트 — 2026-09-13

- **KISA / 공식 불법스팸 안내 / 2026-03-04** — 직접 채택: 광고동의 목적을 명확히 표현, 앱푸시 수신거부 절차 단순화, 혜택·쿠폰 메시지 처리 강화. 출처 유형: 한국 정부 산하기관 공식 가이드.
- **FTC / CAN-SPAM 법률 및 사업자 안내 / 2026-09-13 확인** — 직접 채택: 정확한 발신자/제목, 상업 이메일 수신거부 및 suppression 구조. 출처 유형: 미국 연방 규제기관/법률.
- **Android Developers / 알림 런타임 권한 / 2026-09-13 확인** — 직접 채택: Android 13+ 권한과 맥락 기반 권한 요청. 출처 유형: 공식 플랫폼 개발자 문서.
- **Apple Developer / 알림 HIG 및 interruption level / 2026-09-13 확인** — 참고/직접 채택: 사용자 동의와 긴급 우선순위의 제한적 사용. 출처 유형: 공식 플랫폼 디자인/개발자 문서.

## 28. 구현 우선순위

P0: 선호/동의 모델, 보안·거래 알림, suppression, dedupe, 인앱 알림함, 운영 감사.

P1: push/email 활동 카테고리, quiet hours, digest, 시즌 lifecycle 메시지, 복귀 요약.

P2: 동의, complaint, 피로도, 미성년자 안전 guardrail이 검증된 뒤에만 개인화/실험 확대.

이번 버전은 문서-only이다. 실제 구현은 별도 개발 브랜치 → 격리 Test exact-SHA 검증 → backend/API/database/provider 검증 → Production 순서를 따른다.