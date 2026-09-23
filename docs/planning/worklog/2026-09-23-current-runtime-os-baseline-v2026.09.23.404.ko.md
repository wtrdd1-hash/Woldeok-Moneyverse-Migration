# 작업기록 — 현재 런타임 / OS 기준선 v2026.09.23.404

승인 Debian 호스트를 직접 관측했다. OS는 Debian GNU/Linux 13.6 (trixie), kernel은 6.12.94+deb13-amd64다. 관측 runtime tool은 systemd 257, Node v24.21.0, pnpm 10.0.0, Python 3.13.5, Nginx 1.26.3, Docker 29.8.0이다.

현재 active 서비스에는 Production/Test backend/frontend systemd unit, Discord bot, economy AI, MCP gateway, Nginx, Docker/containerd, 저장소 GitHub Actions runner가 포함된다. Production/Test backend/frontend port는 각각 3000/3001, 3100/3101이다. 관측 Production PostgreSQL은 PostgreSQL 17.11이다.

현재 Debian/systemd 권위와 Kubernetes/Flux target/recovery를 분리하도록 문서를 갱신했다. 파괴적 container 정리나 runtime 배포는 수행하지 않았다.
