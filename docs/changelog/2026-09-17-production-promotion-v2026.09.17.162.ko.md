# Production Exact-SHA 승격 — v2026.09.17.162

날짜: 2026-09-17
영문 기준: [2026-09-17-production-promotion-v2026.09.17.162.md](2026-09-17-production-promotion-v2026.09.17.162.md)

## 변경
- 애플리케이션 SHA `18c7a1324013099e47b2d6e22c5108c4d378139c`를 격리 Test, production-ready, GitOps Production 게이트를 거쳐 승격했다.
- Production DB 백업 후 `203-work-reset-convergence.sql`을 적용하고 기록했다.
- 공개 host systemd runtime을 GitOps Production manifest와 동일 exact SHA로 수렴시켰다.
- GitOps가 릴리스 권위이지만 현재 공개 Nginx가 host systemd 서비스를 사용하므로 exact-SHA mirror가 필요한 임시 이중 런타임 규칙을 문서화했다.

## 검증
- 애플리케이션 main, Test, Production, GitOps Production desired SHA가 모두 `18c7a1324013099e47b2d6e22c5108c4d378139c`로 일치한다.
- Production release workflow `35113806254`와 GitOps reconcile `35117875121`이 성공했다.
- 핵심 공개 페이지, robots/sitemap/ads, catalog/DB 경로, status가 정상이며 Production noindex는 0건이다.
- 경제 AI/자동경제 스위치가 enabled 상태이고 backend/frontend/AI 서비스가 active이며 검증 구간 severe log 일치 항목은 0건이다.
