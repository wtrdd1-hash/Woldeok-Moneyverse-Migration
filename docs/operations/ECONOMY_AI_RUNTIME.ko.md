# Moneyverse 경제 AI 런타임

> 버전: v2026.09.16.160
> 영문 기준 문서: [ECONOMY_AI_RUNTIME.md](ECONOMY_AI_RUNTIME.md)

## 권위와 위원회 구조
결정론/classical 경제엔진이 회계·상하한·정책의 권위다. AI lane은 exact classical proposal을 검토해 `agree`, `veto`, `abstain` 증거만 append하며 대체 정책값을 직접 쓸 수 없다. AI 증거가 없거나 만료·불일치·장애이면 classical lane으로 fallback한다.

`macro`, `shop`, `stock`, `jobs`, `welfare`, `integrity` 6분야에 A/B 전문 좌석을 둔다. proposal 관련 분야만 호출하되 macro/welfare/integrity는 항상 포함한다. 충돌 또는 고위험 분야는 rebuttal pass를 수행할 수 있다. exact proposal hash, expiry, council evidence, latency, token 사용량을 중재·평가용으로 저장한다.

## 호스트 저장소와 서비스
- `/dev/sda`: 약 30GiB 시스템/앱 파일시스템. 모델 weight 저장 금지.
- `/dev/sdb1`: 약 98GiB 데이터 파일시스템, `/srv/moneyverse-data`에 마운트.
- AI root: `/srv/moneyverse-data/ai/{models,adapters,cache,datasets,evals,logs,runtime}`.
- 로컬 inference: `moneyverse-economy-ai.service`, `127.0.0.1:11434`에만 바인딩.
- Ollama cloud는 비활성화하고 모델·런타임은 데이터 디스크에 둔다.

## v2026.09.16.160 운영 모델 프로필
- A 좌석: `llama3.2:3b`.
- B 좌석: `gemma3:1b`.
- 백엔드 endpoint: `http://127.0.0.1:11434/v1`.
- `ECONOMY_AI_MAX_CONCURRENCY=1`, `ECONOMY_AI_TIMEOUT_MS=180000`, `ECONOMY_AI_CACHE_TTL_SECONDS=300`, `ECONOMY_AI_REVIEW_TTL_MINUTES=120`.
- inference service는 최대 상주모델 2개, 병렬요청 1개, keep-alive 2분, `MemoryHigh=6G`, `MemoryMax=7G`로 제한한다.
- 현재 호스트 RAM은 약 10GiB(+swap)다. 이 호스트에서 7~8B 모델 두 개를 상주시켜 운영하지 않으며 해당 급 이중 로컬 모델은 최소 32GiB RAM을 권장한다.

분야/좌석별 override는 `ECONOMY_AI_<DOMAIN>_<A|B>_{API_BASE_URL,API_KEY,MODEL}`을 유지한다. 공통 fallback은 `ECONOMY_AI_API_BASE_URL`, `ECONOMY_AI_MODEL_A`, `ECONOMY_AI_MODEL_B`, 선택적 `ECONOMY_AI_API_KEY`다.

## 활성화 증거
- 기존 reviewer 단위시험 10/10 통과.
- 선택 A/B 모델은 confidence `0..1`을 포함한 runtime JSON 계약을 통과했고 계약을 위반한 Qwen 후보는 제외했다.
- 격리 Test에서 실제 모델 호출, append-only 저장, scoreboard, exact-hash agree, exact-only veto, mismatch fallback, unconfigured fallback을 확인했다.
- Production `economy_ai_policy_review`는 provisional v159 작업명으로 감사 가능한 관리자 switch 경로에서 최초 활성화했다. v159 receipt는 append-only로 보존하고 Work 초기화 버전 충돌 뒤 추가 v160 감사 receipt로 현재 switch 사유를 정규화했다.
- 활성화 후 첫 운영 review는 `no_eligible_classical_proposal`이어서 정책값 변경과 운영 AI review row 생성이 없었다. 검증 후 탈락/미사용 모델을 제거해 `llama3.2:3b`, `gemma3:1b`만 남겼고 로컬 모델 저장소는 약 2.7GiB다.

## 운영·롤백
feature-switch 상태, reviewer 결과, `economy_ai_agent_scoreboard`, latency/token, service memory, backend error, reconciliation을 관측한다. 모델 품질 문제를 이유로 결정론 검증을 약화하지 않는다.

롤백은 fail-safe다. 감사 함수로 `economy_ai_policy_review`를 disabled로 바꾸고 필요 시 활성화 이전 backend AI env를 복원한 뒤 backend를 재시작한다. 로컬 inference가 필요 없으면 service를 중지/비활성화한다. classical policy lane은 계속 사용할 수 있다.
