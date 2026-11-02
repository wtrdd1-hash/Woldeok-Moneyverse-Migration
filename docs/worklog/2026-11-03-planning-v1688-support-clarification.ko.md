# 기획 v1688 — F675-228 문의 추가 정보 요청 카드

**시작 2026-11-03 08:08 KST:** 이전 기능 보완 v1686 → 현재 기능 추가 v1688 → 다음 기능 보완 v1690. main f5c3fbedae1c3b3ec2374882b049aac43a655eb4, 선행 초안 #2585, 개발 이슈 #2591. miniPC 루트 97%/잔여 3.0GiB, 데이터 볼륨 91%. Superpowers 로컬 스킬 확인, skills__list URI가 없어 skills__read 방식만 BLOCKED.

**소스:** 마이그레이션 196/Nest 회원·관리자 문의 API와 웹/app-api 게이트웨이 확인. 정형 추가정보 요청 기능 없음; 기존 증빙 보관소·재검토 기능과 구분. 새 기능 미구현, 공통 상태 전이 권한 선행 필요.

**QA:** 마지막 상세 v1482 FAILED/P0, 운영 확대 다국어 28경로 중 HTTP500 24, Test 0; 과도한 DB 앱 권한·체크섬 5건, 정확 SHA E2E·외부 복원 BLOCKED. P0 4/P1 6, 운영 보류. 외부 신규 승인 0, 누적 UNKNOWN/10000 BLOCKED.

**중간 08:11 KST:** 원격 main 동일, 이슈 #2591 생성, 영문·국문 정본/통합 대조. 로컬 릴리스·보안 테스트 31/31 PASS, 저장소 보안 검사 PASS, 제어문자 검사 PASS, 영문·국문 일치 PASS, diff 검사 PASS. AGENTS.md에 적힌 옛 scripts/check-secrets.sh 경로는 없지만 실제 저장소 보안 스캐너는 PASS. **완료:** 커밋/PR·최종 SHA 원격 CI 대기. 기능 수용시험 미실행, 운영 출시 보류. 문서만 변경, 런타임·DB·WLD·원장·Test/Production·예약 변경 없음.
