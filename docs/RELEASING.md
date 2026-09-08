# 배포 지침서

개발한 것을 **사용자에게 내보내는 절차**. 사람과 AI 에이전트 모두 이 문서 하나만
읽고 따라할 수 있게 쓴다.

---

## 배포는 하나다

| | 운영 (production) |
|---|---|
| 주소 | `https://easy-scraping.com` |
| `STACK` | `wdmvp` |
| 컨테이너 | `wdmvp-backend` … |
| 호스트 디렉터리 | `~/moneyverse-production` |
| 데이터베이스 | `moneyverse_production` |
| 루프백 포트 | `3022` |
| 검색 노출 | 켜짐 |
| 이미지 태그 | `<sha>-production`, `latest-production` |
| 부트스트랩 관리자 | 없음 (콘솔에서 부여) |

두 번째 스택 `wdmv`가 `test.easy-scraping.com`에 있었고 2026-09-07에 폐기됐다.
자기 데이터베이스와 자기 암호화 키, 워크플로 설정의 절반을 따로 갖고 있었는데,
그것이 실제로 만들어 낸 것은 **잘못된 배포를 굴릴 수 있는 드롭다운과 모든 계정의
두 번째 사본**이었다. 2026-09-08에 워크플로에서도 선택지를 걷어냈다.

프런트엔드 이미지에는 공개 주소가 **빌드 시점에 박힌다**(`robots.txt`와
`sitemap.xml`이 호스트 이름을 담아야 한다). 환경이 이미지 태그에 남아 있는 것은
그 때문이다 — 같은 이름의 이미지 두 벌이 숨은 차이를 갖는 것보다 낫다.

---

## 1. 개발 중 — 로컬에서 확인

```bash
pnpm install
pnpm dev            # frontend + backend
```

커밋 전에 네 가지가 전부 통과해야 한다. 하나라도 실패하면 CI가 같은 자리에서 막는다.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI는 여기에 세 가지를 더 본다. 셋 다 저장소만 있으면 로컬에서도 돌아간다.

```bash
scripts/check-control-bytes.sh    # 정규식 안의 \u 이스케이프가 원시 바이트로 바뀌었는가
scripts/check-secrets.sh          # 추적되는 파일에 자격증명이 들어갔는가
pnpm audit --prod --audit-level=high
```

`check-secrets.sh`가 무엇을 통과시키는지는 그 파일 머리말에 적혀 있다 — 요약하면
**환경변수 참조이거나 `ci_`로 시작하는 CI 상수**만 값으로 적을 수 있다. 걸린 값은
줄을 지우는 것으로 끝나지 않는다. **먼저 교체하고**, 그다음 이력에서 지운다.

> **AI 에이전트에게**: `pnpm lint`를 파이프로 넘기면 종료 코드가 가려진다.
> `pnpm lint; echo $?`처럼 종료 코드를 직접 확인하고, "통과했다"는 말은 그 출력을
> 본 뒤에만 한다. 데이터베이스가 필요한 테스트는 `DATABASE_URL`이 없으면 조용히
> 건너뛴다 — **건너뛴 테스트를 통과한 테스트로 보고하지 않는다.**

마이그레이션을 새로 추가했다면 로컬 스크래치 DB에도 올려야 그 테스트가 돈다.
(`packages/database/.env`가 가리키는 DB. 자세한 것은 `AGENTS.md`.)

---

## 2. 사용자에게 배포하기 (운영)

`main`에 푸시해도 **배포되지 않는다.** CI만 돈다. 올리는 것은 사람이 정한다.

```bash
git push origin main
gh workflow run deploy.yml
gh run watch
```

워크플로가 하는 일:

1. `ci.yml` 실행 (lint · typecheck · test · build)
2. 이미지 두 개를 빌드해 GHCR에 push — `<sha>-production`, `latest-production`
3. `compose.yml`·스크립트·`migrations/`를 호스트로 전송
4. `roll.sh` 실행 → `bootstrap-env.sh` → `migrate` → `seed` → 컨테이너 교체 → 헬스체크

### 배포 전 점검

폐기된 테스트 스택이 하던 일 — 같은 커밋을 먼저 굴려 보는 것 — 을 대신할 것이
없다. **이 목록이 그 자리를 대신한다.**

- [ ] **운영 백업이 있고, 열린다** — 아래 명령
- [ ] `ci.yml`이 이 커밋에서 통과했다
- [ ] 마이그레이션을 추가했다면 CI의 DB 테스트가 그 커밋에서 돌았다
- [ ] 사용자에게 보이는 한국어 문구를 바꿨다면 의도한 변경이다
- [ ] 되돌릴 방법을 알고 있다 (아래)

첫 항목은 명령 하나다.

```bash
ssh <host> 'DEPLOY_DIR=$HOME/moneyverse-production bash $HOME/moneyverse-production/backup.sh verify'
```

매니페스트의 sha256이 맞는지, 이 호스트의 키로 복호화되는지, 덤프가 끝까지
온전한지, 36시간보다 오래되지 않았는지를 본다. **마이그레이션을 포함한
릴리스라면 건너뛰지 않는다** — 스키마 변경은 되돌아가지 않고, 그때 남는 길은
백업뿐이다. 절차 전체는 [BACKUP.md](BACKUP.md).

### 확인

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://easy-scraping.com/
ssh <host> 'cd ~/moneyverse-production && STACK=wdmvp docker compose ps'
```

---

## 3. 되돌리기

이미지 태그가 커밋이라, 되돌리는 것은 `.env` 두 줄이다.

```bash
ssh <host>
cd ~/moneyverse-production
sed -i 's#/backend:.*#/backend:<이전-sha>-production#' .env
sed -i 's#/frontend:.*#/frontend:<이전-sha>-production#' .env
STACK=wdmvp docker compose up -d --wait
```

**마이그레이션은 되돌아가지 않는다.** 스키마를 바꾼 릴리스를 되돌리려면 앞으로
가는 마이그레이션을 새로 쓴다. `migrate.sh`는 이미 적용된 파일의 sha256이 달라지면
실행을 거부한다 — 이미 적용된 마이그레이션 파일은 **절대 수정하지 않는다.**

데이터를 되돌려야 하는 상황이라면 이미지 태그로는 안 된다. [BACKUP.md](BACKUP.md)의
복구 절차가 그 경우다. `restore.sh`는 기존 데이터베이스를 덮어쓰지 않고 새
데이터베이스로 복원한 뒤, 백업 시점에 기록해 둔 수치와 대조해서 보여 준다.

## 4. 이미지만 최신으로

이미 배포가 올라와 있고 이 호스트만 그 이미지로 옮기고 싶을 때:

```bash
ssh <host> bash ~/moneyverse-production/update.sh
```

파일은 옮기지 않는다. **마이그레이션이 포함된 릴리스는 워크플로를 돌려야 한다** —
`update.sh`만 쓰면 없는 컬럼을 찾는 백엔드가 뜬다. 스크립트가 호스트에 있는 가장
최근 마이그레이션 번호를 찍어 준다.

---

## 새 호스트 이름을 붙일 때

OAuth 콜백은 **API로 바꿀 수 없다.** 새 주소로 로그인이 되려면 사람이 두 콘솔에
직접 추가해야 한다.

| 제공자 | 위치 | 추가할 값 |
|---|---|---|
| Discord | Developer Portal → 앱 → OAuth2 → Redirects | `https://<host>/auth/discord/callback` |
| Google | Cloud Console → 사용자 인증 정보 → OAuth 2.0 클라이언트 | `https://<host>/auth/google/callback` |

Discord의 `PATCH /applications/@me`는 200을 주고 `redirect_uris`를 조용히 무시한다.
포털이 유일한 방법이다.

API는 `APP_BASE_URL`의 origin과 정확한 콜백 경로가 일치하지 않는 제공자를 **조용히
비활성화한다.** 그래서 주소를 바꾸면 `bootstrap-env.sh`가 두 redirect URI를 함께
다시 쓴다.

---

## Discord 봇

**테스트와 운영은 서로 다른 Discord 애플리케이션을 쓴다.** 봇 토큰을 공유하면 테스트
배포가 운영 길드에 글을 쓴다. 그래서 토큰은 GitHub 환경 시크릿이고, 백엔드는 부팅할 때
토큰의 첫 조각(애플리케이션 id가 base64url로 들어 있다)이 `DISCORD_APPLICATION_ID`와
같은지 확인한다. 다르면 아웃박스를 켜지 않고 로그에 이유를 남긴다 — 토큰은 찍지 않는다.

| 변수 | 무엇 |
|---|---|
| `DISCORD_APPLICATION_ID` | 이 배포의 애플리케이션 id |
| `DISCORD_BOT_TOKEN` | 그 애플리케이션의 봇 토큰 (시크릿) |
| `DISCORD_INTERACTIONS_ENABLED` | 슬래시 명령 수신 여부 (`true`) |
| `DISCORD_INTERACTIONS_PUBLIC_KEY` | 포털의 Public Key (64 hex). 서명 검증에 쓴다 |
| `DISCORD_INTERACTIONS_GUILD_ID` | 명령을 받을 길드 |
| `DISCORD_INTERACTIONS_ROLE_IDS` | 명령을 쓸 수 있는 역할 (쉼표 구분) |
| `DISCORD_OUTBOX_ENABLED` | 아웃박스 알림 발송 여부 (`true`) |
| `DISCORD_OUTBOX_CHANNEL_ID` | `default` 라우트가 글을 쓰는 채널 |

운영 웹 활동 아웃박스의 지정 대상은 길드 `1184322508556611625`, 채널
`1542465347364589609`이다. 이 값은 GitHub의 `production` 환경 변수에만 저장한다.
테스트 환경은 별도 봇·길드·채널을 사용하며 운영 채널로 테스트 알림을 보내지 않는다.

사람이 콘솔에서 해야 하는 것 (API로 대신할 수 없다):

1. Developer Portal → 앱 → General Information → **Interactions Endpoint URL**에
   `https://<host>/api/v1/integrations/discord/interactions`. 저장할 때 Discord가 서명된
   PING을 보내므로, **배포가 먼저 올라가 있어야 저장된다.**
2. 봇을 길드에 초대한다. 필요한 권한은 아웃박스 채널의 메시지 전송뿐이다.
3. 슬래시 명령 등록은 아직 수동이다:
   `DISCORD_APPLICATION_ID=… DISCORD_GUILD_ID=… DISCORD_BOT_TOKEN=… node -e "require('./dist/discord/command-registration').registerDiscordGuildCommands()"`
   (`backend/src/discord/command-registration.ts` — 허용된 호출은 길드 일괄 덮어쓰기 하나뿐이다.)

어떤 이벤트를 알릴지는 `.env`가 아니라 `discord_outbox_routes` 테이블이 정한다
(마이그레이션 066). 행이 없거나 `enabled=false`인 종류는 발송 대상이 아니며,
아웃박스에서 `suppressed`로 정리된다.

## 배포가 하지 않는 것

- **백업.** 배포는 백업을 만들지도 확인하지도 않는다. 백업은 호스트의 cron이
  하루 한 번 돌리고, 배포 전에 사람이 `backup.sh verify`로 확인한다 —
  [BACKUP.md](BACKUP.md).
- **관리자 부여.** `BOOTSTRAP_DISCORD_ADMIN_IDS`는 비어 있다. 관리자는 운영
  콘솔에서 부여한다.
- **Cloudflare 경로 변경.** 터널 ingress와 DNS는 `ops/`의 스크립트로 따로 한다.
  터널 설정은 이 호스트의 다른 사이트들과 공유하므로, 규칙을 추가할 때는 반드시
  기존 규칙을 보존하고 catch-all 앞에 넣는다. 붙이는 것은
  `cloudflare-publish.mjs`, 떼는 것은 `cloudflare-unpublish.mjs`이며 둘 다
  보내기 전에 터널 설정 전체를 `cf-backup/`에 저장한다.

## 시크릿이 사는 곳

| 값 | 어디서 오는가 |
|---|---|
| `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, `INTERNAL_API_TOKEN`, `STATUS_COLLECTOR_PASSWORD`, `BACKUP_DB_PASSWORD` | 호스트에서 `/dev/urandom`으로 생성. 한 번 쓰이면 다시 쓰지 않는다 |
| `BACKUP_ENCRYPTION_KEY` | **`.env`에 넣지 않는다.** `backup.sh init-key`가 `~/.moneyverse-backup-key`에 만들고, 사본 하나는 호스트 밖에 둔다. `.env`에 있으면 `backup.sh`가 거부한다 — [BACKUP.md](BACKUP.md) |
| Discord·Google 클라이언트 자격증명 | `ADOPT_FROM`이 가리키는 기존 컨테이너에서 호스트 안에서 복사 |
| `GHCR_PULL_TOKEN` | GitHub 시크릿. `read:packages`만. 호스트 디스크에 남지 않는다 |
| `DISCORD_BOT_TOKEN` | GitHub **환경 시크릿**(`production`). **절대 `ADOPT_FROM`으로 복사하지 않는다** — 위의 「Discord 봇」 절 |
| `DISCORD_APPLICATION_ID`, `DISCORD_INTERACTIONS_*`, `DISCORD_OUTBOX_*` | GitHub **환경 변수**(`vars`). 시크릿이 아니다 — 애플리케이션·길드·역할·채널 id뿐이다 |

**어떤 값도 저장소·CI 로그·이 문서에 들어가지 않는다.** 스크립트는 어떤 키가
설정됐는지만 출력하고 값은 출력하지 않는다.
