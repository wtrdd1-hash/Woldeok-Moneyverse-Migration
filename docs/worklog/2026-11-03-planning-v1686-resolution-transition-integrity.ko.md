# 기획 v1686 — F675-227 해결 상태 전이 정합성

**START 2026-11-03 07:07 KST:** Previous Feature Addition v1684 → Current Feature Improvement v1686 → Next Feature Addition v1688 (provisional). Main f5c3fbedae1c3b3ec2374882b049aac43a655eb4, Draft #2581, issue #2580. miniPC services active, root 97%/3.3GiB. Superpowers local skills inspected; skills__list returned no URI for skills__read (BLOCKED method only).

**SOURCE:** 소스에서 확인한 세 작성 경로: admin_support_set_status는 무변경에도 시각·감사를 갱신하고, support_add_message와 admin_support_reply는 메시지 INSERT 이후 상태 UPDATE. 피드백 ON 전 단일 DB 전이 함수가 필요하다. 운영 사고 확정이 아닌 제안이다.

**QA:** v1482 FAILED/P0, Production HTTP500 24/28, Test 0/28, broad app DB grants, 5 migration checksum mismatches, exact-main CI 2 failures, off-host restore BLOCKED. P0 4/P1 6, Production RELEASE HOLD. External newly verified 0, cumulative UNKNOWN/10000 BLOCKED.

**CHECKLIST:** [x] main/QA/source read; [x] isolated worktree; [x] bilingual integrated spec; [x] midpoint verification; [x] focused tests/security/parity; [ ] commit/push/PR; [ ] final CI/issue update.

**MIDPOINT:** 중간 검증: 원격 main 변경 없음, 영문/한국어 정본과 통합문서 대조 PASS, 릴리스 집중 시험 35/35 PASS, 저장소 보안·제어문자·diff 검사 PASS. 신규 기능 수용시험 미실행, 운영 보류.
**FINAL:** pending. Documentation only; no runtime/DB/finance/Test/Production mutation.
