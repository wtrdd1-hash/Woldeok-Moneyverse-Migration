# v2026.11.17.15 — 관리자 SEO RSC 인증 요청 오류 긴급 복구
이슈: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3238

## 작업 전 — 2026-11-17 13:09 KST
- 직전 v14에서 SEO 프런트엔드 포트 4521 연결 정상화(메인 b8e6b6c5852db9484d0170a481a4c4bd0278a2b5), 기존 프로세스 유지.
- 새 장애: RSC 헤더가 포함된 SEO 화면 탐색은 운영 503. 내부 Next 인증 상태 API가 일반 요청 401과 달리 RSC 헤더 수신 시 307으로 리다이렉트하며, Nginx auth_request가 307을 처리하지 못함.
- 실제 브라우저 요청/쿠키/관리자 접근제어는 건드리지 않고 **내부 인증 서브요청의 RSC 헤더만 제거**. DB·돈·세션·Spring 서비스 불변.
- 최신 main 기준의 전용 브랜치·독립 작업 디렉터리에서 진행.

## 진행 중
- [ ] 분리 Nginx에서 RSC 503 실패 재현 후 401 차단으로 개선 확인.
- [ ] 변경 스크립트, 백업·롤백, 테스트 설정.
- [ ] 메인 재확인, GitHub PR, CI, 실제 운영 점검.

## 종료
아직 미완료. 인증 사용자 긍정 검증은 별도 증거가 필요.

### 중간 점검 — 2026-11-17 13:11 KST
- RED: 분리 Nginx 일반 401 대비 RSC 500; Next 인증 상태 RSC 307, 운영 RSC 503.
- GREEN: 분리 Nginx의 두 관리자 SEO 경로 일반·RSC·프리페치 모두 익명 401, 백엔드 200, 실제 후보 UI 200, 문법·사전검사 통과.
- 내부 인증 헤더 외 인증·쿠키·권한 검사 유지.

## 운영 최종 기록 — 2026-11-17 13:15 KST
- PR #3239 main 병합 c2b426a901b66e8bd8a805a510247b1ab25c56af, GitHub 정책 CI 통과.
- 첫 Nginx reload 직후 구 작업자 응답 503을 즉시 감지하여 자동 롤백. 기존 v14 SEO 화면 연결은 유지. 동일한 검토된 설정을 백업 보존 상태에서 재적용, 문법 검사·무중단 reload·작업자 전환 2초 후 정상 확인.
- 운영 SEO RSC 요청 3회 연속 익명 401. 일반 및 RSC/프리페치 SEO 관리자·감사 화면 401 및 no-store/noindex, 외부 HTTPS RSC 401. 메인·관리자·보안·헬스·버전 200, 실제 Next SEO 화면·CSS 200. 관련 서비스 네 개 active.
- 롤백: /srv/moneyverse-data/ops-backups/p0-admin-seo-v2026.11.17.15/seo-v3-edge-auth.conf.before 및 v14 전체 Nginx 백업. DB·원장·WLD 미수정.
- 미검증: 관리자 로그인 긍정 E2E/세션 연속성, 별도 /admin/stocks 및 /admin/settings 404. 앱 전체 승격 완료라고 주장하지 않음.
- v2026.11.17.15.1에서 Nginx 작업자 교체 대기 및 반복 검증 스크립트 보완.
