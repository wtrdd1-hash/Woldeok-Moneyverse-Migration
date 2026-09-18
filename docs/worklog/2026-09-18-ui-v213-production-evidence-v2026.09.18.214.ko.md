# v213 Test 및 Production 승격 작업일지 — v2026.09.18.214

v212에서 실제 Test edge topology와 남아 있던 AdSense iframe CSP 문제를 확인했습니다. v213에서 이를 수정하고 local/full QA, PR #467, CI #1279를 통과한 뒤 merged main SHA `24b85df1e0e5f922e461b1dcea82ec291bf54e48`로 다시 build했습니다.

Test Nginx는 direct smoke 후 v212 port 3114에서 exact-main v213 port 3115로 전환했습니다. 공개 Test responsive/CSP/browser 검증을 통과했고 Test backend PID/시작 시각은 변하지 않았습니다.

Production exact-main v213은 별도 build 후 backend 3002에 연결한 3202 canary에서 direct smoke를 통과했습니다. Nginx를 기존 3201 frontend에서 3202로 원자 전환했고 public browser 27/27을 통과했습니다. public traffic이 canary를 사용하는 동안 영구 3001 frontend service를 동일 exact release로 교체하고 direct smoke 후 Nginx를 다시 3001로 복귀했습니다. 이후 browser 27/27을 다시 통과했습니다. 3202 canary는 종료했고 기존 3201은 rollback anchor로만 유지합니다. Production backend는 전 과정에서 변경하지 않았습니다.
