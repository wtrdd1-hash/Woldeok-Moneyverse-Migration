# 경제 AI 활성화 — v2026.09.16.160

날짜: 2026-09-16
영문 기준: [2026-09-16-economy-ai-activation-v2026.09.16.160.md](2026-09-16-economy-ai-activation-v2026.09.16.160.md)

## 변경
- 격리 Test 증거 확인 후 기존 배포 코드의 `economy_ai_policy_review` 운영 feature switch를 활성화했다.
- Moneyverse 데이터 디스크에 localhost 전용 로컬 inference 서비스를 구성했다.
- A 좌석은 `llama3.2:3b`, B 좌석은 `gemma3:1b`로 선택하고 현재 호스트에 맞춰 동시성·메모리 상주량을 제한했다.
- 기존 6분야 A/B council 구현이 실제 호출될 수 있도록 운영 백엔드에 Economy AI endpoint/model 설정을 추가했다.

## 검증
- 기존 Economy AI 단위시험 10/10 통과.
- 실제 Test 모델 호출의 structured-output 계약, exact-hash agree, exact-only veto, proposal mismatch fallback, 미설정 fallback을 Test PostgreSQL에서 확인했다.
- 운영 활성화는 감사 가능한 feature-switch command 경로를 사용했다. provisional v159 receipt는 불변 이력으로 유지하고 추가 v160 receipt로 현재 switch 사유를 정규화했다.
- 활성화 후 첫 운영 검토는 적격 classical proposal이 없어 정책을 변경하지 않았다.
- 운영 앱 SHA는 `be218f0403372689dbdf8af9bf8700264f39348f` 그대로이며 공개 홈은 HTTP 200을 유지했다. 탈락/미사용 모델 artifact를 제거해 선택한 A/B 두 모델만 남겼다.

## 권위
결정론/classical 경제엔진이 계속 권위다. AI 검토는 exact proposal에 대한 append-only 보조/veto 증거이며 대체 정책값을 임의 생성·기록할 수 없다.
