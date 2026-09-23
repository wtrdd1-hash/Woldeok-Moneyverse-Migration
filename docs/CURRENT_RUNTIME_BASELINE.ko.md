# 현재 런타임 기준선

[English canonical](CURRENT_RUNTIME_BASELINE.md) | **한국어**

> 버전: v2026.09.23.404
> 관측일: 2026-09-23
> 상태: 현재 관측 런타임 기준
> 권위 범위: 현재 Debian 호스트/런타임 사실. 제품 기획 자체를 대체하지 않음.

## 현재 호스트

| 항목 | 현재 관측값 |
|---|---|
| OS | Debian GNU/Linux 13.6 (trixie) |
| Kernel | Linux 6.12.94+deb13-amd64, x86_64 |
| Init/service manager | systemd 257 |
| Node.js | v24.21.0 |
| pnpm | 10.0.0 |
| Python | 3.13.5 |
| Nginx | 1.26.3 |
| Docker | 29.8.0 |
| Container runtime | 현재 Debian 호스트의 Docker + containerd |
| Production PostgreSQL | Docker PostgreSQL 17.11, host 5433 -> 5432 |
| Local AI inference | localhost:11434에 바인딩된 Ollama 호환 서비스 |

이번 작업 세션에서 접근 가능한 권위 개발/런타임 장치는 `debian13`이다. `minipc` 장치는 현재 offline이므로 이 스냅샷의 런타임 증거로 사용하지 않는다.

## 현재 공개 런타임 토폴로지

현재 관측된 공개 권위는 **Debian 13 + systemd 서비스 + Nginx + Docker PostgreSQL**이다.

Production:
- backend: `moneyverse-backend.service`, `/srv/moneyverse-data/releases/production-current/backend`;
- frontend: `moneyverse-frontend.service`, `/srv/moneyverse-data/releases/production-current/frontend`;
- Nginx가 Production backend/frontend를 `3000/3001`로 라우팅한다.

Test:
- backend: `test-main-backend.service`, `/srv/moneyverse-data/releases/test-current/backend`;
- frontend: `test-main-frontend.service`, `/srv/moneyverse-data/releases/test-current/frontend`;
- Nginx가 Test backend/frontend를 `3100/3101`로 라우팅한다.

현재 active로 관측한 보조 서비스에는 Discord bot, economy AI, MCP gateway, Nginx, Docker/containerd, 저장소 GitHub Actions runner가 포함된다.
## 현재와 복구/목표 아키텍처 구분

| 계층 | 현재 관측 권위 | 복구/목표 상태 |
|---|---|---|
| 공개 앱 런타임 | Debian 13 systemd release 디렉터리 | Kubernetes/Flux는 향후/복구 대상일 수 있음 |
| 공개 reverse proxy | 호스트 Nginx | cluster ingress는 현재 공개 런타임 증거가 아님 |
| Production DB | Docker PostgreSQL 17.11 | Kubernetes DB는 대사 증거 없이 권위 DB로 간주 금지 |
| 릴리스 검증 | Test systemd exact candidate + public version/backend/DB 검사 | GitOps 선언은 provenance로 유용하지만 단독으로 공개 런타임 증거가 아님 |
| 런타임 identity | active systemd WorkingDirectory + public version + DB 연결 증거 | repository head 또는 GitOps SHA만으로 불충분 |

문서에서 “Production은 Kubernetes/Flux”라고 현재형으로 쓰려면 실제 공개 권위가 그 상태라는 증거가 있어야 한다. 그렇지 않으면 TARGET/RECOVERY로 표시한다.

## 서비스 부팅 계약

현재 호스트 기준으로 의도적으로 구성된 다음 서비스는 상태를 관리한다.
- `moneyverse-backend.service`
- `moneyverse-frontend.service`
- `test-main-backend.service`
- `test-main-frontend.service`
- `moneyverse-discord-bot.service`
- `moneyverse-economy-ai.service`
- `moneyverse-mcp.service`
- `docker.service`
- `nginx.service`
- repository GitHub Actions runner

Production/Test session continuity, DB 권위, release identity, backup/restore 증거는 별도 수용 게이트다.

## 데이터·컨테이너 정리 규칙

현재 호스트에는 Production/Test DB 외에도 여러 단기 QA PostgreSQL 컨테이너가 존재한다. 존재한다는 이유만으로 삭제하면 안 된다. 정리 전 owner/workstream, 현재 사용 여부, 데이터 가치, rollback 필요성을 분류한다.

컨테이너 이름만으로 Production DB를 판단하지 않는다. systemd 환경/연결, bound port, DB identity, application evidence를 확인한 뒤 정리 또는 migration한다.

## 문서 상태 표기

현재 런타임 문서는 각 사실을 다음 중 하나로 구분한다.
- **OBSERVED CURRENT** — 권위 호스트/런타임에서 직접 측정
- **CONFIGURED CURRENT** — 현재 설정으로 선언됐지만 같은 검토에서 독립 실행 검증하지 않음
- **TARGET/RECOVERY** — 현재 공개 권위가 아닌 목표/복구 구조
- **HISTORICAL** — 과거 incident/change 증거로만 유지

OS, runtime stack, DB major version, public routing, deployment authority가 바뀌면 이 기준선을 갱신한다.
