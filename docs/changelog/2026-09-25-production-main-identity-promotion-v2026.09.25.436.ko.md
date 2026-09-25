# v2026.09.25.436 — 운영 최신 main 정확한 SHA 승격

## 요약
Test와 Production의 런타임 식별자를 `20985765d6316718ceb4b9e61b131475e6df9e96`에서 현재 애플리케이션 `main`의 `d058df3d29191e48c5ab9b12ec10014d015b5812`로 맞췄다. Debian 13 systemd/Nginx의 공식 canary 우선 블루그린 절차를 사용했다.

## 변경 경계
해당 비교 구간에는 2개 커밋이 있지만 최종 파일 변경은 없다. 직업 정산 강제 변경이 바로 다음 커밋에서 되돌려졌기 때문이다. 따라서 이번 릴리스는 순기능 변경이 아닌 정확한 소스 식별자 정합화다. 다만 프론트엔드 릴리스 식별자는 빌드 시점에 고정되므로 대상 SHA에서 재빌드했다.

## 검증
- 대상 SHA의 contract/backend/frontend 빌드 성공.
- 격리 Test 백엔드/프론트엔드 exact SHA 및 백엔드 health 성공.
- Test noindex 경계와 대표 경로 스모크 성공.
- Production 백엔드/프론트엔드 exact SHA 및 백엔드 health 성공.
- Production 대표 경로 스모크 성공.
- 확인한 배포 구간에서 신규 fatal/critical/unhandled/cache-permission 로그 없음.
- 운영 미폐기 활성 세션 행: `1,054 -> 1,054`.

## 릴리스 상태
- Test: `/srv/moneyverse-data/releases/test-d058df3-v436`
- Production: `/srv/moneyverse-data/releases/prod-d058df3-v436`
- 정확한 애플리케이션 SHA: `d058df3d29191e48c5ab9b12ec10014d015b5812`
