# v2026.09.16.160 — 경제 AI 운영 활성화

- 날짜: 2026-09-16
- 브랜치: `ops/economy-ai-activation-v2026.09.16.160`
- rebase 후 문서 기준 SHA: `03a8ae9c5313d0915589691afc6fff022323c305`
- 활성화 대상 앱 런타임: `be218f0403372689dbdf8af9bf8700264f39348f`
- 버전 메모: 작업 중 Work day/week reset merge가 `v2026.09.16.159`를 먼저 사용해 이 운영 활성화 문서/통합 버전은 `v2026.09.16.160`으로 이동했다. 최초 v159 활성화 receipt는 append-only 이력으로 유지하고 v160 정정 receipt를 추가했다.
- 영문 기준 문서: [2026-09-16-economy-ai-activation-v2026.09.16.160.md](2026-09-16-economy-ai-activation-v2026.09.16.160.md)

## 범위
이번 작업은 이미 배포된 이중 경제 AI 검토 lane을 활성화한다. 최신 `main`을 새로 배포하거나 원장/정책 스키마를 바꾸거나 결정론 경제엔진을 우회하지 않는다. classical policy가 계속 권위 실행 경로이자 AI 장애/검토부재 fallback이다.

## 런타임 구성
- 로컬 OpenAI-compatible inference는 `127.0.0.1:11434`에만 바인딩하고 `moneyverse-economy-ai.service`로 실행한다.
- 런타임과 모델은 `/srv/moneyverse-data/ai`에 저장하며 여유가 작은 시스템 디스크에는 모델 weight를 두지 않는다.
- A 좌석 `llama3.2:3b`, B 좌석 `gemma3:1b`를 사용한다. `qwen2.5:3b` 후보는 confidence 계약을 위반해 운영 후보에서 제외했다.
- 최대 동시 상주 모델 2개, 요청 동시성 1, keep-alive 2분, `MemoryHigh=6G`, `MemoryMax=7G`로 제한했다. Ollama cloud는 비활성화했다.
- 백엔드는 호출 timeout 180초, 동시성 1, exact-result cache 300초, review TTL 120분을 사용한다.

## Test 증거
- 기존 `economy-ai-review.test.ts` 10/10 통과.
- 선택한 두 모델 모두 `decision/confidence/rationale/risks` JSON 계약과 `confidence 0..1` 범위를 지켰다.
- 검증 프로세스는 배포된 `test-be218f040337` application release와 권위 Test DB를 사용했다. 공개 Test route도 `be218f...`를 반환하므로 current-main exact-SHA release 증거로 간주하지 않는다.
- 격리 Test 합성 제안을 실제 reviewer+Test DB 저장 경로로 실행해 4개 라우팅 분야, 8개 좌석 호출, `council_agree`, 집계 confidence `0.9625`, 약 60.4초를 확인했다.
- exact proposal hash는 `dual_agree`, 값 하나를 바꾼 proposal은 `ai_missing_classical_fallback`으로 이전 검토를 재사용하지 않았다.
- 모델 설정 제거 시 `unconfigured_classical_fallback`을 확인했다.
- Test-only veto는 exact proposal만 `ai_veto`로 차단했고 변경 proposal은 차단하지 않았다.
- application role의 `economy_ai_policy_reviews` 직접 조회는 의도대로 거부됐고 보호 함수/scoreboard 경로만 사용했다.

## Production 활성화
- feature switch 변경 전에 운영 백엔드에 동일 모델 설정을 적용하고 정상 재시작을 확인했다.
- `economy_ai_policy_review`를 `admin_set_feature_switch`로 `disabled → enabled` 변경했다. 최초 enable receipt에는 provisional v159 사유가 남아 있고, 별도 감사 `enabled → enabled` receipt가 최종 v160 버전 정정 사유를 기록한다.
- 활성화 직후 운영 reviewer는 약 40ms에 `no_eligible_classical_proposal`로 종료했다. AI council 호출과 경제 정책 변경은 없었다.
- 공개 `/api/version`은 계속 `be218f0403372689dbdf8af9bf8700264f39348f`, 홈은 HTTP 200이며 활성화 구간의 backend/AI 서비스에서 fatal/error/OOM 일치 로그가 없었다.
- 적격 classical proposal이 생기기 전 운영 AI review row는 0건이 정상이다. 이번 주 scheduler receipt는 활성화 전에 실행돼 아직 `disabled` 기록이며 다음 주기부터 enabled 상태를 읽는다.
- 검증 후 탈락/미사용 모델은 제거해 선택 모델 2개만 남겼고 로컬 모델 저장소는 약 2.7GiB다.

## 안전·롤백
- AI는 대체 정책값을 직접 쓰지 못한다. append-only 검토와 exact matching proposal veto만 가능하며 불일치·검토부재·모델장애·미설정은 classical fallback을 유지한다.
- 롤백 순서: 감사 함수로 `economy_ai_policy_review=disabled` → 활성화 이전 backend env 복원 → backend 재시작 → 필요 시 로컬 inference service 중지/비활성화.
- agent confidence/latency/token/decision mix를 계속 관측한다. 소형 로컬 모델은 안전 검토 보조이며 회계·정산 권위가 아니다.
