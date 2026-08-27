# 배포

`.github/workflows/deploy.yml`이 이미지를 빌드해 GHCR에 올리고, SSH로 호스트에서
`docker compose`를 굴린다. `main`에 푸시하거나 수동 실행(workflow_dispatch)할 때
돈다. CI 워크플로가 먼저 통과해야 배포가 시작된다.

## private 저장소에서의 자격증명

이미지가 private이라 **인증이 두 곳에서 필요하고, 서로 대체할 수 없다.**

| 어디서 | 무엇으로 | 준비 |
| --- | --- | --- |
| GitHub Actions가 **밀 때** | 워크플로 자신의 `GITHUB_TOKEN` (`packages: write`) | 설정 불필요 |
| 호스트가 **받을 때** | `GHCR_PULL_TOKEN` (PAT, `read:packages`만) | **직접 발급해야 함** |

호스트는 GitHub 밖이라 `GITHUB_TOKEN`을 쓸 수 없다. 이것이 private 저장소 배포에서
유일하게 손이 가는 부분이다.

## 남은 준비 — 사람이 해야 하는 것

### 1. GHCR 풀 토큰

<https://github.com/settings/tokens> → classic token, 스코프는 **`read:packages`만**.
`repo`도 `write:packages`도 필요 없다 — 이 토큰은 호스트에 저장되므로 권한이 좁을수록 좋다.

```bash
gh secret set GHCR_PULL_TOKEN --repo ridanit-ruma/Woldeok-Moneyverse-Migration
```

### 2. 리버스 프록시 항목

Caddyfile은 `/root/easy-scraping-server/infra/caddy/Caddyfile`에 있고 root 소유다.

```
moneyverse-migration.easy-scraping.com {
    reverse_proxy 127.0.0.1:3020
}
```

프론트엔드가 생기면 `/socket.io/*`만 백엔드로 가르고 나머지는 Next로 보낸다.
로비가 WebSocket이라 Next Route Handler로는 프록시할 수 없기 때문이다.

### 3. DNS

`moneyverse-migration.easy-scraping.com` A 레코드를 이 호스트로.

### 4. OAuth 리다이렉트 URI

API 경로를 재설계했으므로 Discord와 Google 개발자 콘솔에서 직접 바꿔야 한다.
바꾸기 전까지 로그인은 동작하지 않는다.

```
https://moneyverse-migration.easy-scraping.com/auth/discord/callback
https://moneyverse-migration.easy-scraping.com/auth/google/callback
```

그 다음 호스트의 `~/moneyverse-migration/.env`에 클라이언트 자격증명을 채운다.

## 이미 되어 있는 것

- 배포 전용 SSH 키를 만들어 호스트의 `authorized_keys`에 등록했다. 개인 키와 별개다.
- `DEPLOY_SSH_KEY` · `DEPLOY_KNOWN_HOSTS` · `DEPLOY_HOST` · `DEPLOY_USER` ·
  `DEPLOY_PORT` 시크릿 설정 완료.
- 호스트에 `~/moneyverse-migration/.env` 생성 (DB 비밀번호와 내부 토큰은 새로 생성한
  값이고, 기존 테스트/프로덕션 스택과 공유하지 않는다).
- 스택을 실제로 한 번 굴려 확인했다: 마이그레이션 46개 적용, DB·백엔드 healthy,
  `/health` 200, API가 problem+json 401.

## 알아둘 것

**`--wait`가 배포의 관문이다.** `docker compose up -d --wait`는 헬스체크가 통과할
때까지 기다리고, 안 되면 실패한다. 실패한 배포가 성공으로 보고되는 일이 없다.

**마이그레이션은 매 배포마다 돈다.** `migrate.sh`가 파일별 `sha256`을 기록하고 바뀐
파일을 거부하므로 재실행이 안전하고, 새 마이그레이션에 별도 단계가 필요 없다.

**백엔드는 루프백에만 바인딩한다**(`127.0.0.1:3020`). 리버스 프록시가 공개 창구다.
`0.0.0.0`으로 열면 내부 전용이어야 할 API가 직접 노출된다.

**`BACKEND_IMAGE`에 `:?required`를 쓰지 않는다.** 값이 없으면 `docker compose ps`와
`logs`까지 전부 실패하는데, 그건 운영자가 그 명령을 가장 필요로 하는 순간이다.
배포가 해석된 이미지 참조를 `.env`에 기록한다.

## 수동 배포

```bash
gh workflow run deploy.yml --repo ridanit-ruma/Woldeok-Moneyverse-Migration
```

## 롤백

이미지는 커밋 SHA로 태그된다.

```bash
ssh <host>
cd ~/moneyverse-migration
sed -i "s|^BACKEND_IMAGE=.*|BACKEND_IMAGE=ghcr.io/ridanit-ruma/woldeok-moneyverse-migration/backend:<sha>|" .env
docker compose up -d --wait
```

스키마는 롤백되지 않는다. 마이그레이션은 앞으로만 간다.
