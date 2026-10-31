# 기획 v1548 — F675-193 만료 알림 처리 내역 및 예외
**상태:** 문서 기획 / DRAFT / RELEASE HOLD. **주기:** 보완 v1546 → 추가 v1548 → 보완 v1550(잠정). **main:** 761a55a094fb9dd383d213e817305e68c79fa23c. **이슈:** #2122. **선행:** Draft #2119/#2113.

## 시작
miniPC Debian 13.6, 서비스 7개 활성, DEV DB 연결. 스킬 목록 URI가 비어 있어 설치된 Superpowers using-superpowers·brainstorming·writing-plans·verification을 저장소에서 확인. 격리 v1548 작업트리 정상. AGENTS, README, 영문/국문 기획, 알림 서비스/컨트롤러/DTO, Android app-api 및 GitHub PR/이슈 확인.

## 중간·설계
원격 main 동일. 알림 서비스는 in_app_notifications 직접 조회, 번호가 붙은 마이그레이션의 생성/권한 출처는 미확인(운영 부재 증거 아님). 본인 전용 최근 7/30일 확정 알림·실제 기록된 예외를 기획하고 큐 성공/빈 기록의 잘못된 해석과 OFF 중 개별 추적을 금지. 통합 영문/국문 문서에 P0 4·P1 6 인계.

## 근거·인계
과거 QA v1405 백엔드 2,778 PASS/501 SKIP, 프론트엔드 2,770 PASS, 보안 감사 FAIL. 정확 SHA Test·DB 권한·독립 복원·운영 승격 BLOCKED. 신규 합성 수용시험 미실행. 외부 신규 승인 0, 누적 검증/중복 제거/분류 UNKNOWN/10,000. 런타임·DB·금융·Test·Production 변경 없음. PR/CI/최종 SHA는 검증 후만 기록.
