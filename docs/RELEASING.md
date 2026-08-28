# 배포 지침서

개발한 것을 **테스트 서버에 올리는 절차**와 **사용자에게 내보내는 절차**.
사람과 AI 에이전트 모두 이 문서 하나만 읽고 따라할 수 있게 쓴다.

---

## 두 개의 배포가 있다

같은 `deploy/compose.yml` 파일이 이 호스트에서 두 번 돈다. `STACK` 값이 컨테이너
이름·compose 프로젝트·Cloudflare 터널이 찾는 별칭을 모두 정한다. 그래서 **볼륨도
데이터베이스도 시크릿도 서로 완전히 분리돼 있다.**

| | 테스트 (dev) | 운영 (production) |
|---|---|---|
| 주소 | `https://test.easy-scraping.com` | `https://easy-scraping.com` |
| `STACK` | `wdmv` | `wdmvp` |
| 컨테이너 | `wdmv-backend` … | `wdmvp-backend` … |
| 호스트 디렉터리 | `~/moneyverse-migration` | `~/moneyverse-production` |
| 데이터베이스 | `moneyverse_migration` | `moneyverse_production` |
| 루프백 포트 | `3021` | `3022` |
| 검색 노출 | 꺼짐 | 켜짐 |
| 이미지 태그 | `<sha>-test`, `latest-test` | `<sha>-production`, `latest-production` |
| 부트스트랩 관리자 | `TEST_BOOTSTRAP_DISCORD_ADMIN_IDS` 변수 | 없음 (콘솔에서 부여) |

**두 배포는 데이터를 공유하지 않는다.** 테스트에서 만든 계정·잔액·게시글은 운영에
나타나지 않고, 그 반대도 마찬가지다.

프런트엔드 이미지에는 공개 주소가 **빌드 시점에 박힌다**(`robots.txt`와
`sitemap.xml`이 호스트 이름을 담아야 한다). 그래서 같은 커밋이라도 이미지가 두
벌이고, 태그에 환경이 들어간다.

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

> **AI 에이전트에게**: `pnpm lint`를 파이프로 넘기면 종료 코드가 가려진다.
> `pnpm lint; echo $?`처럼 종료 코드를 직접 확인하고, "통과했다"는 말은 그 출력을
> 본 뒤에만 한다. 데이터베이스가 필요한 테스트는 `DATABASE_URL`이 없으면 조용히
> 건너뛴다 — **건너뛴 테스트를 통과한 테스트로 보고하지 않는다.**

마이그레이션을 새로 추가했다면 로컬 스크래치 DB에도 올려야 그 테스트가 돈다.
(`packages/database/.env`가 가리키는 DB. 자세한 것은 `AGENTS.md`.)

---

## 2. 테스트 서버에 올리기

`main`에 푸시해도 **배포되지 않는다.** CI만 돈다. 올리는 것은 사람이 정한다.

```bash
git push origin main
gh workflow run deploy.yml -f environment=test
gh run watch
```

워크플로가 하는 일:

1. `ci.yml` 실행 (lint · typecheck · test · build)
2. 이미지 두 개를 빌드해 GHCR에 push — `<sha>-test`, `latest-test`
3. `compose.yml`·스크립트·`migrations/`를 호스트로 전송
4. `roll.sh` 실행 → `bootstrap-env.sh` → `migrate` → `seed` → 컨테이너 교체 → 헬스체크

### 확인

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://test.easy-scraping.com/
ssh <host> 'cd ~/moneyverse-migration && STACK=wdmv docker compose ps'
```

---

## 3. 사용자에게 배포하기 (운영)

**테스트에서 확인한 뒤에만 한다.** 같은 커밋으로 올린다.

```bash
gh workflow run deploy.yml -f environment=production
gh run watch
```

### 배포 전 점검

- [ ] 같은 커밋이 테스트에 올라가 있고, 화면에서 확인했다
- [ ] 마이그레이션을 추가했다면 테스트 DB에 실제로 적용됐다
- [ ] 사용자에게 보이는 한국어 문구를 바꿨다면 의도한 변경이다
- [ ] 되돌릴 방법을 알고 있다 (아래)

### 확인

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://easy-scraping.com/
ssh <host> 'cd ~/moneyverse-production && STACK=wdmvp docker compose ps'
```

---

## 4. 되돌리기

이미지 태그가 커밋이라, 되돌리는 것은 `.env` 두 줄이다.

```bash
ssh <host>
cd ~/moneyverse-production          # 또는 ~/moneyverse-migration
sed -i 's#/backend:.*#/backend:<이전-sha>-production#' .env
sed -i 's#/frontend:.*#/frontend:<이전-sha>-production#' .env
STACK=wdmvp docker compose up -d --wait
```

**마이그레이션은 되돌아가지 않는다.** 스키마를 바꾼 릴리스를 되돌리려면 앞으로
가는 마이그레이션을 새로 쓴다. `migrate.sh`는 이미 적용된 파일의 sha256이 달라지면
실행을 거부한다 — 이미 적용된 마이그레이션 파일은 **절대 수정하지 않는다.**

## 5. 이미지만 최신으로

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

## 배포가 하지 않는 것

- **데이터 이전.** 두 스택의 DB는 별개다. 옮기려면 `pg_dump`를 직접 쓴다.
- **관리자 부여.** 운영에서는 `BOOTSTRAP_DISCORD_ADMIN_IDS`를 비워 둔다. 관리자는
  운영 콘솔에서 부여한다. 테스트에서만 이 변수로 자동 부여한다.
- **Cloudflare 경로 변경.** 터널 ingress와 DNS는 `ops/`의 스크립트로 따로 한다.
  터널 설정은 이 호스트의 다른 사이트들과 공유하므로, 규칙을 추가할 때는 반드시
  기존 규칙을 보존하고 catch-all 앞에 넣는다. 붙이는 것은
  `cloudflare-publish.mjs`, 떼는 것은 `cloudflare-unpublish.mjs`이며 둘 다
  보내기 전에 터널 설정 전체를 `cf-backup/`에 저장한다.

## 시크릿이 사는 곳

| 값 | 어디서 오는가 |
|---|---|
| `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, `INTERNAL_API_TOKEN`, `STATUS_COLLECTOR_PASSWORD` | 호스트에서 `/dev/urandom`으로 생성. 한 번 쓰이면 다시 쓰지 않는다 |
| Discord·Google 클라이언트 자격증명 | `ADOPT_FROM`이 가리키는 기존 컨테이너에서 호스트 안에서 복사 |
| `GHCR_PULL_TOKEN` | GitHub 시크릿. `read:packages`만. 호스트 디스크에 남지 않는다 |

**어떤 값도 저장소·CI 로그·이 문서에 들어가지 않는다.** 스크립트는 어떤 키가
설정됐는지만 출력하고 값은 출력하지 않는다.
