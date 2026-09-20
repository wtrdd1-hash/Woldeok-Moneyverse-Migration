# 월덕 머니버스 — 1:1 개인 채팅 상세 기획서

> 버전: v2026.09.20.305
> 상태: **긴급 / P0 제품 기획 우선순위**
> 날짜: 2026-09-20
> 상위 기획: `PROJECT_PLAN.ko.md`
> 영문 기준 문서: [ONE_TO_ONE_PRIVATE_CHAT_SPEC.md](ONE_TO_ONE_PRIVATE_CHAT_SPEC.md)
> 변경 성격: 기획/문서 전용. 구현 gate 통과 전에는 런타임, DB, API, 실시간 인프라, Production 동작을 변경하지 않는다.

## 1. 긴급 목표
로그인한 Moneyverse 회원끼리 안전하고 신뢰성 있게 사용할 수 있는 모바일 우선 1:1 개인 채팅을 구현한다. 이 작업은 계정 안전, 악용 대응, 개인정보, 알림, 회원 유지, 향후 소셜 기능 전체에 영향을 주므로 **긴급 / P0**로 취급한다. 프론트엔드에 입력창만 붙이는 수준으로 출시하면 안 된다.

최소 출시 기준은 “메시지가 보내진다”가 아니다. 적격한 두 회원이 정확히 하나의 개인 대화를 시작/계속할 수 있고, 메시지가 서버 권위로 저장·복구되며, 차단/신고가 즉시 작동하고, 민감정보가 새지 않으며, 재연결·세션만료·오류 상태가 결정적으로 처리되어야 한다.

## 2. 초기 출시 범위
포함:
- 로그인 회원 간 텍스트 1:1 채팅;
- 정책상 별도 thread를 허용하기 전까지 회원쌍당 canonical 대화 1개;
- 대화목록, 안 읽은 수, cursor 기반 과거내역;
- 전송, 재시도, 서버 전달확인, 읽음상태;
- 실시간 수신 + 권위 API 기반 재연결 복구;
- 사용자 DM 허용 설정;
- 차단, 음소거, 신고;
- 개인정보 최소화 알림;
- moderator 증거 검토;
- 모바일/태블릿/데스크톱 반응형 UI;
- 접근성, rate limit, 악용방지, 보안 telemetry.

초기 미포함:
- 그룹/익명/공개 채팅방, 음성/영상;
- 파일전송, 채팅 내부 WLD/WDX 송금;
- 사라지는 메시지;
- 종단간암호화라고 표시하는 기능;
- AI 사용자 사칭 메시지;
- 관리자의 사유 없는 전체 개인채팅 자유열람.

## 3. 핵심 권위 규칙
1. 참여자, 작성자, 순서, 전달/읽음, moderation 상태는 백엔드가 최종 권위다.
2. 1:1 대화 principal은 정확히 두 명이며 클라이언트가 제3자를 추가할 수 없다.
3. 서버가 유효 참여자로 확인한 대화만 조회할 수 있다.
4. 인증된 자기 계정으로만 전송한다.
5. 차단된 회원쌍은 양방향 신규 메시지를 즉시 거부한다.
6. 서버 영속화 확인 전 전달 성공으로 표시하지 않는다.
7. WebSocket/SSE는 최적화 수단이지 데이터 권위가 아니다.
8. 읽음 sequence는 사용자별 단조 증가하며 타인 상태를 수정할 수 없다.
9. 사용자 archive/delete와 moderation/audit 보존은 별개다.
10. 개인 채팅은 noindex이며 공개 프로필/랭킹/SEO/광고 타게팅에 기본 사용하지 않는다.

## 4. 대화 가능 조건
대화 생성/전송 직전 서버가 계정상태, DM 설정, 차단관계, moderation 제한, 정지상태, rollout flag, 승인된 연령/안전 규칙을 평가한다.

권장 응답:
`DmEligibility { allowed, code, retryAfter?, policyVersion }`

클라이언트는 안전한 일반 거절문구만 표시하며 상대의 정확한 연령검증·moderation·보안상태를 노출하지 않는다. 정책이 명시적으로 허용하지 않으면 “상대가 나를 차단했다” 같은 민감 원인을 직접 알려주지 않는다.

## 5. 데이터 모델
Conversation:
- UUID id;
- participant_a_id / participant_b_id;
- 정규화 participant-pair key;
- created_at / last_message_at;
- active/restricted/closed;
- policy_version;
- 최신 server sequence.

회원쌍당 한 대화를 쓰면 정규화 pair에 unique constraint를 둔다.

Message:
- UUID id;
- conversation_id;
- sender_id;
- 서버 단조 증가 sequence;
- 길이 제한 body;
- 초기 text-only message_type;
- created_at;
- moderation visibility/state;
- sender+conversation 범위 idempotency key.

Participant state:
- last-read sequence;
- archive/mute;
- notification override;
- 안전한 unread cache.

별도 safety 엔티티:
- block relation;
- report;
- moderation evidence;
- abuse/rate-limit state;
- privileged content-access audit.

## 6. API 계약
권장:
- `POST /api/v1/chat/conversations` canonical 대화 생성/조회;
- `GET /api/v1/chat/conversations` cursor 대화목록;
- `GET /api/v1/chat/conversations/:id/messages` cursor/sequence 조회;
- `POST /api/v1/chat/conversations/:id/messages` idempotency key 전송;
- `POST /api/v1/chat/conversations/:id/read` 자신의 read sequence만 전진;
- `POST /api/v1/chat/conversations/:id/mute`;
- `POST /api/v1/chat/users/:id/block`;
- `DELETE /api/v1/chat/users/:id/block`;
- `POST /api/v1/chat/conversations/:id/report`;
- `GET/PUT /api/v1/account/privacy/direct-messages`.

모든 endpoint는 인증, object-level authorization, bounded input, 공통 오류 envelope, 개인정보 안전 로그를 요구한다.

## 7. Idempotency·순서·동시성
전송은 client-generated idempotency key를 요구한다. 동일 principal+conversation+key 재요청은 최초 commit 결과를 반환한다. 같은 key로 다른 body를 보내면 fail-closed 한다.

메시지 순서는 서버 sequence가 결정하며 client clock을 권위로 쓰지 않는다. 동시 send/read, retry race, send 중 block, realtime session expiry를 통합테스트한다.

## 8. 실시간 연결·재연결
WebSocket/SSE 등은 message.created, conversation.read, conversation.restricted, 필요한 notification/mute 변경, resync hint를 전달할 수 있다.

연결 시 세션 인증과 conversation별 subscription 권한을 확인하고 임의 conversation ID 구독을 금지한다.

연결 끊김 시:
1. 전달 성공을 꾸미지 않고 reconnecting 표시;
2. bounded backoff;
3. 마지막 확정 sequence 이후 authoritative delta 조회;
4. ID/sequence 중복 제거;
5. unread/read 재동기화.

realtime 장애 시 committed message를 잃지 않고 API refresh/polling으로 안전하게 degrade한다.

## 9. 대화·입력 UX
데스크톱은 공간이 충분하면 목록+대화 split을 쓸 수 있다. 모바일은 목록/대화를 별도 navigation state로 두고 뒤로가기 시 목록 scroll을 보존한다.

Composer:
- virtual keyboard/safe-area 대응;
- 공백 전용 전송 금지;
- 최대 길이 제한;
- sending/failed/retry 표시;
- 한국어 IME 조합 중 Enter 오발송 방지;
- 320/360/390px 가로 overflow 금지.

loading, empty, restricted, blocked, offline, reconnecting, session-expired, server-error 상태를 각각 정의한다.

## 10. 대화목록 개인정보
공개 안전 프로필 이름/아바타, 최소화된 최근 메시지 preview, 서버기준 시간, unread badge, mute 상태는 표시할 수 있다.

잔액, 보유자산, 부채, 비공개 친구/클럽 관계, 계정보안 상태, 연령검증 세부정보, moderation flag는 표시하지 않는다.

## 11. 읽음·접속상태
읽음표시는 선택적/정책제어 기능이다. 제공하더라도 필요한 최소 상태만 공개한다.

정확한 상시 online presence나 마지막 접속시각은 초기 기본 기능에서 제외한다. 향후 추가 시 개인정보·stalking 위험을 별도 검토한다.

## 12. 차단
차단은 서버 안전기능이다.
- 양방향 신규 send 즉시 거부;
- 신규 대화 생성 차단;
- 상대 알림 억제;
- 진입점 비활성;
- retention에 따른 과거 데이터 보존;
- moderation 증거 보존;
- 괴롭힘을 유발할 수 있는 block 여부 직접 노출 방지.

차단 해제 후에도 차단기간 시도 메시지를 소급 전달하지 않는다.

## 13. 음소거
음소거는 알림만 억제하며 권한/저장을 바꾸지 않는다. 사용자별, 가역적이며 차단과 독립적이다.

## 14. 신고·moderation
신고는 신고자, conversation, 선택 message ID 또는 제한 evidence window, 사유, 선택 메모, 서버 timestamp, policy version을 기록한다.

제출된 evidence는 moderation 상태변경 외 임의수정을 금지한다.

관리자 도구는 report/evidence 중심, 최소권한, 감사 가능해야 한다. 예외적인 본문 열람은 누가 무엇을 언제 왜 열었는지 immutable audit를 남긴다.

## 15. 연령 민감 안전
Production 전 명시 결정:
- 누가 누구에게 DM 가능한지;
- verification/age tier 영향;
- 성인-미성년 접촉 경계;
- unsolicited DM limit;
- link 제한;
- escalation;
- evidence/retention.

정책은 서버에서 집행하며 상대의 정확한 연령/검증상태를 노출하지 않는다.

## 16. 스팸·악용 방지
최소:
- 계정별 send rate limit;
- conversation burst limit;
- 신규 대화 생성 limit;
- 비례적인 반복/중복 탐지;
- URL/link 정책;
- oversized payload 거부;
- automation/replay telemetry;
- 단계적 throttle;
- suspension 연동.

## 17. 알림
기존 개인정보/알림 설정에 통합하고 lock-screen 본문 노출을 최소화한다.

차단된 상대, mute 대화, 수신 비적격/제한 상태, DB commit되지 않은 메시지는 알림하지 않는다.

## 18. 로그·analytics
허용: outcome, latency, size bucket, reconnect/delivery count, rate-limit, error code, 집계 metrics.

금지: raw message body, private transcript, token/cookie/CSRF, 불필요한 peer 민감속성.

## 19. 보존·삭제
일반 보존, archive/hide, 회원탈퇴, 신고증거, 법/보안 hold, backup retention을 분리한다.

회원탈퇴가 referential integrity를 깨거나 필수 moderation evidence를 정책 없이 삭제하면 안 된다. 개인정보 문서는 실제 삭제/익명화/보존 범위를 정확히 설명한다.

## 20. 보안 Production 차단 테스트
- BOLA/cross-account 조회;
- sender ID 위조;
- 임의 realtime subscription;
- 필요한 state-changing CSRF;
- send replay;
- 동일 idempotency key + 다른 body;
- block bypass;
- XSS/injection;
- oversized payload/resource exhaustion;
- cursor tampering;
- 타인 read-state 변경;
- moderation API 권한상승;
- 로그/알림 private-content leakage.

메시지 text는 안전하게 escaping한다. rich text/URL은 별도 sanitization 전에는 확대하지 않는다.

## 21. 접근성
키보드 탐색, visible focus, semantic form/button, 과도하지 않은 상태안내, WCAG 2.2 AA 대비, zoom/reflow, reduced motion, unread/mute/실패/신고 screen-reader label을 요구한다.

## 22. 성능·신뢰성
대화목록/역사는 bounded query를 사용하고 participant lookup, recency, conversation+sequence, report queue index를 둔다. N+1 profile query, reconnect 전체 history 재다운로드를 금지한다. realtime backpressure와 degraded refresh 경로를 둔다.

## 23. 운영·관리자 지표
본문 없이 realtime health, send success/error, delivery lag, reconnect rate, rate-limit, report queue age, moderation SLA, notification failure를 본다.

인프라 장애, moderation restriction, 사용자 block/mute를 서로 다른 상태로 표시한다.

## 24. rollout·kill switch
1. schema/API dark launch;
2. staff/test account;
3. isolated Test E2E;
4. 승인된 제한 cohort;
5. 안전/신뢰성 증거 후 확대.

Kill switch는 신규 DM 시작/전송을 즉시 중단하되 저장 history와 다른 서비스를 훼손하지 않는다.

## 25. QA 매트릭스
기능: thread 생성/재사용, send/receive, pagination, unread/read, mute, block/unblock, report, archive, notification.

동시성: 동시 send/read, duplicate retry, send 중 reconnect, in-flight send 중 block, realtime 중 session expiry.

반응형: 320/360/390/768/1024/1280/1440 CSS px, 지원 Android/iOS, 한국어 IME, landscape, virtual keyboard, zoom/reflow.

보안/개인정보: 20절 전체 negative test, noindex, private-content log scan, notification privacy, admin evidence-access audit.

## 26. Production 릴리스 gate
다음 전부 통과 전 Production 금지:
- 구현 직전과 작업 중간 최신 권위기획 재확인;
- schema forward migration + compatibility/rollback 검증;
- backend/unit/integration 통과;
- exact candidate SHA isolated Test;
- authenticated cross-account E2E;
- realtime disconnect/reconnect recovery;
- block/report/rate-limit;
- mobile responsive/accessibility QA;
- critical privacy/security 0건;
- 기존 session/핵심 flow 회귀 없음;
- exact merged SHA 재빌드;
- 무중단 Production;
- 승격 후 health/API/realtime/session smoke.

## 27. 롤백
서버정책으로 신규 send/진입점을 끄고, 다른 서비스 영향 없이 chat realtime fanout을 중단하며, commit 데이터와 moderation evidence를 보존한다. 호환 frontend/backend release로 복귀하고 기존 session 유지도 검증한다.

## 28. 긴급 구현 순서
1. **v2026.09.20.305-01 P0 긴급:** schema, retention, interaction policy, 연령/안전 계약.
2. **v2026.09.20.305-02 P0 긴급:** DB migration, repository/service, authorization, idempotency, API.
3. **v2026.09.20.305-03 P0 긴급:** 인증 realtime, ordering, reconnect recovery, backpressure.
4. **v2026.09.20.305-04 P0 긴급:** 반응형 conversation list/thread/composer/read state.
5. **v2026.09.20.305-05 P0 긴급:** block, mute, report, notification, moderator evidence.
6. **v2026.09.20.305-06 P0 긴급:** security/privacy/abuse/concurrency/mobile/accessibility E2E.
7. **v2026.09.20.305-07 P0 긴급:** 최신기획 재확인, exact-SHA Test, rollback drill, 무중단 Production.
