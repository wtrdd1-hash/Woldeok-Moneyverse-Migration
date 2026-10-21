# v2026.10.21.1062 — 국채 핫픽스 운영승격 재시도, 차단 근거 및 Nginx 연결 복구

## 작업 전 (13:31 KST)
- 사용자는 v1061 운영반영을 승인했다. 릴리스 가이드/운영 절차/문서 정책/통합 기획/PR #976, 실제 systemd·Nginx 상태를 다시 확인했다.
- 후보 브랜치 `fix/bond-subscribe-errors-mobile-v2026.10.21.1061` SHA `ff441253`, 현재 origin/main `0d12f99b`. 별도 작업자의 Test·Production 세대를 덮어쓰지 않았다.
- PR #976은 Draft이며 GitHub CI #2845 실패. 기존 AI 블로그 편집 검증 관련 테스트 4건이 현재 코드의 200 발행 경로와 기존 503 안전 게이트를 다르게 요구한다. 보안 테스트 삭제/우회 금지.
- 공식 금융 검증 `verify-financial-readiness`는 종료 2, `BLOCKED`: `accounts`, `account_balances`, `system_treasury_vaults`에 대한 앱 직접 쓰기 권한 3개. 현재 원장 차이 0건만으로 초기 자금 출처 및 국채 원장 안전성은 인증되지 않는다.
- 공개 `/api/version`은 502였음. 현재 백엔드는 3000 포트, Nginx 운영 API 프록시는 종료된 3233 포트였음. 공개 프론트 프록시 3234와 백엔드는 1055 세대였으나 기존 3001 프론트 별도 서비스는 서로 다른 세대.

## 작업 중: 기존 장애만 좁게 복구
- `/etc/nginx/sites-enabled/moneyverse`를 `/etc/nginx/.moneyverse-v1062-rollback-20261021-133539`에 root 보호 백업(활성 사이트 glob 밖).
- 운영 API 4곳(`/health`, `/api/version`, `/socket.io`, Discord 연동)의 upstream만 3233→3000으로 수정. Test/프론트/계정/DB/세션/스키마/기존 배포 포인터 변경 없음.
- `nginx -t` 통과, 무중단 Nginx reload. 공개 응답 `/api/version` 502→200, `/health` 200, `/` 200, `/bonds` 200. 변경 뒤 문법 재검증.

## 종료 상태
- **운영 API 연결 오류 복구**, 롤백용 이전 설정 보존. 다만 공개 `/api/version` 값 `{"id":"unknown"}`이므로 정확 SHA/릴리스 신원 인증은 여전히 불합격.
- **국채 v1061 앱 코드는 운영 미반영**: CI 실패, 3건 금융 권한 위험, 공식 Test 회원 실거래 인증 누락, 운영 정확 버전 표시 문제. 위험한 권한 강제 회수나 배포 게이트 우회를 수행하지 않았다.
- 회원 WLD 데이터는 수정하지 않았고 추가 청약·정산 거래를 만들지 않았다.
- 후속: 블로그 편집 출처 안전 게이트와 테스트 정합성 복구, 국채/Repo/연금/FX/SWF의 원장 기반 멱등 거래 이관, 직접 DB 권한 제거와 Test 금융 대사, 실제 회원 모바일 QA/세션 연속성, 동일 SHA 백엔드·프론트 운영 준비.
