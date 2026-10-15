# v2026.10.16.713 — v712 운영 반영 최종 기록

**[English canonical](2026-10-16-production-locale-v713.md) | 한국어**

- PR #880 병합 후 `origin/main=eb81f9db`에서 격리 문서 브랜치 신규 생성. 코드·DB 데이터 변경 없음.
- Nginx 공개 경로를 새 v712 백엔드 :3223·프론트 :3224로 무중단 전환. 공개 `/api/version`·`/frontend-version` 모두 소스 SHA `142e36b5b0955c575992ca95b1706ba85e8dc909`; 병합된 main과 코드 트리 동일.
- `production-current`는 불변 릴리스 `prod-v2026.10.16.712-142e36b5b095` 사용. 새 systemd 서비스 활성/부팅등록, 구 v697 운영 프로세스는 롤백용 유지. 봇 중단·DB 이주·금액 변경 없음.
- 운영 공개 5회 연속 SHA/헬스/홈/상태/주식/인증 차단 점검 통과. 운영 전환·원복 스크립트·기록 `/srv/moneyverse-tasks/promotion-v712/` 보존.
- CI 통과, Test에서 국가 4개 첫 SSR와 font hint 감소·반복 쿠키 제거 확인.
- 미검증 항목: 국가별 실제 사용자 Core Web Vitals, 기존 운영 로그인 쿠키의 무중단 E2E. Cloudflare 외부 네트워크 왕복 지연은 계속 존재함.
- 상세: [정식 v712 운영 릴리스](../releases/v2026.10.16.712.ko.md).
