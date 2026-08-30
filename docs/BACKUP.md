# 백업과 복구

이 배포에서 **다시 만들 수 없는 것**을 어떻게 보관하고, 어떻게 되돌리고,
되돌릴 수 있다는 것을 어떻게 **확인**하는지.

배포 절차는 [RELEASING.md](RELEASING.md)에 있다. 여기는 그 앞에 있어야 하는
것이다 — 마이그레이션은 되돌아가지 않으므로, 되돌릴 방법은 마이그레이션보다
먼저 있어야 한다.

---

## 무엇이 백업되고 무엇이 안 되는가

| 대상 | 어떻게 |
|---|---|
| 경제 데이터베이스 전체 | `pg_dump` 논리 덤프. 원장·계정·잔액·감사 로그·**사진 메타데이터**가 전부 여기 있다 |
| 사진 원본 파일 | `photo-data` 볼륨을 tar로. 메타데이터만 되돌리면 깨진 이미지의 갤러리가 된다 |
| `.env`와 시크릿 | **백업하지 않는다.** 아래 "왜 .env는 넣지 않는가" |
| 컨테이너 이미지 | 백업하지 않는다. GHCR에 커밋 태그로 남아 있다 |
| 마이그레이션 SQL | 백업하지 않는다. 저장소가 정본이고, 덤프가 `schema_migrations`를 함께 담는다 |

두 산출물 모두 **호스트 디렉터리**에 쓴다. 데이터베이스가 사는 `db-data` 볼륨에
백업을 두면 그 디스크가 죽는 순간 둘 다 없어지므로, 같은 볼륨은 백업 위치가 아니다.

### 왜 `.env`는 넣지 않는가

`.env`에는 생성된 비밀값과 OAuth 클라이언트 자격증명이 들어 있다. 평문으로
백업에 넣으면 백업 파일 하나가 곧 이 스택 전체의 열쇠가 된다(기획서 §17.10 · §16).

넣지 않아도 복구는 된다. 빈 서버에서 `bootstrap-env.sh`가 데이터베이스 비밀번호와
내부 토큰을 **새로** 만들고, 덤프는 역할의 비밀번호를 담지 않으므로 새 비밀번호와
복원된 데이터가 그대로 맞물린다. 사람이 다시 구해야 하는 것은 **OAuth 클라이언트
자격증명 두 쌍뿐**이고, 그것은 원래 Discord·Google 콘솔에 있는 것이지 우리 것이 아니다.

---

## 암호화 키

백업은 AES-256-CBC(PBKDF2-SHA256, 600k회)로 암호화된다. 키는 **백업과 따로** 둔다.

- 기본 위치는 `~/.moneyverse-backup-key`, 권한 600. 배포 디렉터리 안도 아니고
  `BACKUP_DIR` 안도 아니다 — 스크립트가 두 경우 모두 거부한다. 백업을 복사한
  사람이 키까지 같이 복사하게 두면 암호화가 아무 일도 하지 않는다.
- `.env`에 `BACKUP_ENCRYPTION_KEY`를 적으면 `backup.sh`가 **실행을 거부한다.**
  그 파일은 compose가 컨테이너로 실어 나르고 다음 배포가 덮어쓰는 파일이다.
- 비밀 관리 도구를 쓴다면 파일 대신 `BACKUP_ENCRYPTION_KEY` 환경변수로 넘겨도 된다.

**키를 잃으면 모든 백업이 잡음이 된다.** 만든 직후에 호스트 밖으로 사본을 하나
옮겨 둔다. 스크립트는 키의 sha256 앞 12자리를 *지문*으로 찍고 매니페스트에도
기록하므로, 복구 중에 "이 백업이 어느 키로 쓰였는가"는 열어 보지 않고 답할 수 있다.

---

## 설치 (호스트에서 한 번)

```bash
ssh <host>
cd ~/moneyverse-production

# 1. 키를 만든다. 이미 있으면 거부한다.
bash backup.sh init-key
cat ~/.moneyverse-backup-key      # 비밀 관리 도구에 옮겨 적고 화면을 지운다

# 2. 백업 역할의 비밀번호를 배포에 심는다.
#    bootstrap-env.sh가 BACKUP_DB_PASSWORD를 .env에 한 번 만들어 두고,
#    seed.sh가 그 값으로 moneyverse_backup 역할에 로그인을 준다.
gh workflow run deploy.yml -f environment=production

# 3. 첫 백업을 손으로 돌려 본다.
bash backup.sh run
bash backup.sh list
```

`BACKUP_COPY_TO`를 `.env`에 넣으면 두 번째 위치(마운트한 디스크, 원격 경로)에도
같은 파일을 복사한다. 비워 두면 `run`이 매번 "이 데이터의 모든 사본이 이 호스트
하나에 있다"고 경고한다.

### 매일 돌리기

cron은 호스트 지역시간을 쓰고 `PATH`가 짧다. 04:10 KST는 **19:10 UTC(전날)**이다.

```cron
PATH=/usr/local/bin:/usr/bin:/bin
10 19 * * * DEPLOY_DIR=$HOME/moneyverse-production /bin/bash $HOME/moneyverse-production/backup.sh run >> $HOME/moneyverse-backups/wdmvp/backup.log 2>&1
40 19 * * * DEPLOY_DIR=$HOME/moneyverse-migration /bin/bash $HOME/moneyverse-migration/backup.sh run >> $HOME/moneyverse-backups/wdmv/backup.log 2>&1
```

**루트가 아니라 배포 사용자의 crontab에 넣는다.** 그 사용자가 배포 디렉터리와
docker를 갖고 있고, 루트로 쓴 백업 파일은 그 사용자가 읽지 못한다.

두 배포는 `BACKUP_DIR`이 다르고(`~/moneyverse-backups/<stack>`), 파일 이름에
스택과 데이터베이스 이름이 들어간다. 한 디렉터리를 같이 쓰더라도 보존 정리는
자기 스택의 백업만 센다.

---

## 매일 무엇이 일어나는가

```
pg_dump (moneyverse_backup 역할)  →  gzip  →  openssl enc  →  BACKUP_DIR/
사진 볼륨 tar (backend 컨테이너)   →  gzip  →  openssl enc  →  BACKUP_DIR/
                                                            +  .manifest.json
```

- 덤프는 `backup` compose 서비스 안에서 **`moneyverse_backup`** 역할로 돈다.
  이 역할은 `pg_read_all_data` 하나만 갖는다 — 모든 테이블을 읽고 아무것도 쓰지
  못한다. 논리 백업이 할 수 있는 가장 좁은 권한이다.
- 압축과 암호화는 **호스트에서** 한다. 그래서 평문 덤프가 디스크에 닿지 않고,
  암호화 키가 어떤 컨테이너에도 들어가지 않는다.
- 매니페스트는 평문이다. 열쇠 없이도 `list`가 동작해야 하고, 복구할 때 "어느
  백업이 어느 시점인가"를 답할 수 있어야 한다. 안에는 수치와 합계뿐이고 개인에
  관한 것은 없다.
- 쓰고 나면 **그 자리에서 다시 읽는다.** 복호화해서 gzip CRC를 통과시키고
  `pg_dump`가 끝을 맺은 문장까지 확인한 뒤에야 성공으로 보고한다. 한 번도 읽어
  본 적 없는 백업은 백업이 아니라 짐작이다.

### 보존 정책

| 구간 | 남기는 것 | 변수 |
|---|---|---|
| 최근 14일 | 전부 | `BACKUP_RETAIN_DAYS` |
| 그 뒤 8주 | ISO 주마다 가장 최근 것 하나 | `BACKUP_RETAIN_WEEKS` |
| 그 이전 | 삭제 | |

가장 최근 백업은 달력이 뭐라 하든 지우지 않는다. 지우는 것은 이 스크립트가 쓴
세 파일뿐이고, 디렉터리는 건드리지 않는다. `BACKUP_COPY_TO` 쪽은 정리하지
않는다 — 원격의 보존 정책은 그 원격이 정할 일이다.

---

## 배포 전 확인

```bash
ssh <host> 'DEPLOY_DIR=$HOME/moneyverse-production bash $HOME/moneyverse-production/backup.sh verify'
```

`verify`는 네 가지를 본다: 매니페스트의 sha256과 실제 파일이 같은가, 이 호스트의
키로 복호화되는가, 덤프가 끝까지 온전한가, 그리고 **36시간보다 오래되지
않았는가**(`BACKUP_MAX_AGE_HOURS`). 마지막 항목이 "매일 돌기로 한 것이 실제로
돌고 있는가"를 대신 묻는다.

---

## 복구 — 빈 서버

호스트를 통째로 잃었을 때. 순서대로.

```bash
# 1. 스택을 올린다. 이미지는 GHCR에 있고, .env는 여기서 새로 만들어진다.
mkdir -p ~/moneyverse-production && cd ~/moneyverse-production
#    compose.yml·스크립트·migrations는 워크플로가 실어 온다:
#    gh workflow run deploy.yml -f environment=production

# 2. 백업 파일과 키를 이 호스트에 가져온다.
#    키는 BACKUP_DIR 안에 두지 않는다. 스크립트가 거부한다.

# 3. 데이터베이스만 먼저 띄운다.
STACK=wdmvp docker compose up -d db

# 4. 되돌린다. 새 데이터베이스로 들어간다 — 기존 것을 덮어쓰지 않는다.
bash restore.sh <backup-file> --photos

# 5. 스크립트가 마지막에 찍어 주는 두 줄로 배포를 그 데이터베이스로 옮긴다.
sed -i 's/^DB_NAME=.*/DB_NAME=<복원된-이름>/' .env
STACK=wdmvp docker compose up -d --wait
```

`restore.sh`가 **새 데이터베이스**로 복원하는 이유: `docker compose up db`는
`packages/database/init`을 돌려 `.env`가 가리키는 데이터베이스에 코어 스키마를
이미 만들어 둔다. 그 위에 덤프를 얹으면 첫 `CREATE TABLE`에서 충돌한다. 빈
데이터베이스는 그런 것이 없고, 리허설이 끝나면 그냥 버리면 되며, 손이 미끄러져도
지금 서비스 중인 사본을 부수지 않는다.

복원이 끝나면 스크립트가 백업 시점에 기록해 둔 수치와 복원된 데이터베이스의
수치를 **다시 계산해서 대조한다.** 하나라도 다르면 0이 아닌 코드로 끝나고,
"설명되기 전에는 사람 앞에 내놓지 말라"고 말한다.

옮긴 뒤 `migrate`는 할 일이 없다(덤프가 `schema_migrations`를 담고 있다).
`seed`는 이 배포의 자격증명을 다시 나눠 준다.

### 되돌려도 돌아오지 않는 것

- **OAuth 클라이언트 자격증명.** Discord·Google 콘솔에서 다시 가져와
  `.env`에 넣거나 `ADOPT_FROM`으로 다른 컨테이너에서 복사한다.
- **세션.** 쿠키를 서명하던 값이 새로 생겼으므로 모두 다시 로그인한다.
- **관리자 부여.** 운영은 `BOOTSTRAP_DISCORD_ADMIN_IDS`를 비워 두므로, 덤프에
  담긴 `user_roles`가 그대로 살아 있어야 한다. 대조 수치가 그것을 확인해 준다.

---

## 리허설 (분기마다, 그리고 큰 마이그레이션 앞에서)

**복구는 해 본 적이 있어야 복구다.** 기획서 §11 QA · §17.9.

리허설은 **테스트 스택(`wdmv`)에서, 테스트 스택 자신의 백업으로** 한다. 운영
데이터를 다른 호스트나 다른 스택에 올려 두는 것 자체가 위험이고, 로그인까지
확인하려면 OAuth 콜백이 이미 등록된 주소가 필요하기 때문이다.

```bash
ssh <host>
cd ~/moneyverse-migration

# 1. 어느 시점을 되돌릴지 고른다.
DEPLOY_DIR=$PWD bash backup.sh list

# 2. 그 백업을 새 데이터베이스로 복원한다. 사진은 함께 되돌린다.
DEPLOY_DIR=$PWD bash restore.sh wdmv-moneyverse_migration-<stamp>.sql.gz.enc --photos

# 3. 테스트 배포를 복원된 데이터베이스로 옮긴다.
sed -i 's/^DB_NAME=.*/DB_NAME=<복원된-이름>/' .env
STACK=wdmv docker compose up -d --wait

# 4. https://test.easy-scraping.com 에서 실제로 로그인한다.

# 5. 끝나면 되돌린다.
sed -i 's/^DB_NAME=.*/DB_NAME=moneyverse_migration/' .env
STACK=wdmv docker compose up -d --wait
docker compose exec -u postgres db psql -U moneyverse_migrator -d postgres \
  -c 'DROP DATABASE <복원된-이름>'
```

운영 백업은 여기까지 하지 않는다. 대신 같은 호스트에서 `restore.sh`로 **옆
데이터베이스에만** 복원해 수치 대조까지 확인하고(3~4단계 없이), 확인이 끝나면
그 데이터베이스를 지운다.

### 성공 기준

`restore.sh`가 대조하는 것과 사람이 보는 것이 모두 맞아야 한다.

| 항목 | 어떻게 확인되는가 |
|---|---|
| 원장 합계 | 차변 합계·대변 합계·거래 수·전기 수가 지정 시점 기준으로 백업 매니페스트와 **정확히** 같다 |
| 계정 잔액 | 지정 시점까지의 전기에서 유도한 잔액 총액이 같고, **자기 전기와 어긋나는 계정이 0개**다 |
| 사진 메타데이터 | 사진 수가 같고, `id:storage_key:visibility`를 정렬해 이어 붙인 md5 다이제스트가 같다 |
| 사진 원본 | `--photos`로 되돌린 뒤 갤러리에서 이미지가 실제로 보인다 |
| 로그인 | 복원된 사본이 붙은 배포에서 Discord와 Google로 각각 한 번씩 로그인된다 |

"지정 시점"은 매니페스트의 `cutoff` — 덤프를 시작하기 직전 데이터베이스 시계에서
읽은 값이다. 백업이 도는 동안에도 사이트는 계속 돌기 때문에, 양쪽 모두 이 시각을
경계로 세지 않으면 애초에 비교가 성립하지 않는다.

**결과를 어딘가에 적는다.** 언제, 어느 백업으로, 몇 분 걸렸는지. 다음 사고
때 필요한 것은 스크립트가 아니라 "지난번엔 40분 걸렸다"는 문장이다.

---

## 잘 안 될 때

| 증상 | 원인 |
|---|---|
| `the database did not answer as moneyverse_backup` | `.env`에 `BACKUP_DB_PASSWORD`가 없거나, 그 값이 생긴 뒤 `seed.sh`가 아직 안 돌았다. 배포를 한 번 돌린다 |
| `was written with key … and this host holds …` | 다른 키로 만든 백업이다. 지문으로 어느 키인지 찾는다 |
| `BACKUP_ENCRYPTION_KEY is in …/.env` | 키를 `.env`에서 빼고 키 파일로 옮긴다 |
| `the backend container did not answer` | 스택이 내려가 있다. 올리거나, 사진이 없는 배포라면 `BACKUP_INCLUDE_PHOTO_OBJECTS=false` |
| `the newest backup is …h old` | cron이 돌지 않고 있다. `PATH`와 crontab 사용자를 먼저 본다 |
| 복원 중 `role "moneyverse_…" does not exist` | 없어야 정상인 상황이다. `restore.sh`가 덤프에서 역할 이름을 읽어 미리 만든다 — 이 오류가 났다면 덤프 밖에서 참조되는 역할이 생긴 것이므로 그 마이그레이션을 확인한다 |
