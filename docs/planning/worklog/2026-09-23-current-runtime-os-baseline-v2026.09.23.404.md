# Worklog — Current runtime / OS baseline v2026.09.23.404

Observed the authorized Debian host directly. OS is Debian GNU/Linux 13.6 (trixie), kernel 6.12.94+deb13-amd64. Runtime tools observed: systemd 257, Node v24.21.0, pnpm 10.0.0, Python 3.13.5, Nginx 1.26.3, Docker 29.8.0.

Active current services include Production/Test backend/frontend systemd units, Discord bot, economy AI, MCP gateway, Nginx, Docker/containerd and the repository GitHub Actions runner. Production/Test frontend/backend ports are 3001/3000 and 3101/3100 respectively. The observed Production PostgreSQL container runs PostgreSQL 17.11.

Documentation was updated to separate current Debian/systemd authority from Kubernetes/Flux target/recovery architecture. No destructive container cleanup or runtime deployment was performed.
