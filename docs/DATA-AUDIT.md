# 데이터 감사와 백업 안전 게이트

운영 데이터의 정합성을 **개인 단위 데이터를 출력하지 않고** 지속적으로 확인한다.
이 감사는 읽기 전용 `moneyverse_backup` 역할로 실행되며 데이터 수정 권한이 없다.

## 감사 항목

`deploy/data-audit.sql`은 다음 불변조건을 집계한다.

- 저장된 계정 잔액과 원장 posting으로 재계산한 잔액이 일치하는가
- 잔액 행이 없는 계정이 존재하지 않는가
- transaction 없는 posting, account 없는 balance, user 없는 identity가 없는가
- 전체 debit과 credit 합계가 일치하는가
- 사용자/계정/거래/posting/감사로그 개수와 원장 총액을 운영 추적용 aggregate로 남긴다

개별 사용자 ID, 이메일, 표시명, 거래 메모 등 개인정보나 행 단위 데이터는 출력하지 않는다.

## 실행

```bash
cd ~/moneyverse-production
DEPLOY_DIR=$PWD STACK=wdmvp bash data-audit.sh
```

정상이면 JSON의 `healthy`가 true이고 종료코드 0이다. 불변조건 하나라도 깨지면 종료코드 2로 실패한다.

## 자동 실행

`install-backup-cron.sh`가 백업 및 watchdog과 함께 시간당 한 번 데이터 감사를 설치한다.
운영과 다른 스택의 실행 시간을 엇갈리게 하여 PostgreSQL 부하가 한 시점에 겹치지 않게 한다.
로그는 `$HOME/<stack>-data-audit.log`에 기록한다.

## 배포 게이트

production 배포는 실제 rollout 전에 두 가지를 통과해야 한다.

1. `backup.sh verify`: 최신 백업이 존재하고, 허용된 최대 나이 이내이며, 암호문 checksum/복호화/gzip/pg_dump 종단 검증을 통과한다.
2. `data-audit.sh`: 현재 DB가 원장·잔액·참조 무결성 불변조건을 통과한다.

rollout 뒤에도 `data-audit.sh`를 다시 실행한다. 즉 배포 전에는 "복구 지점이 실제로 읽힌다 + 현재 데이터가 정상이다"를 확인하고, 배포 후에는 migration/rollout이 데이터 정합성을 훼손하지 않았음을 확인한다.

## 백업 체계와 함께 보는 이유

백업 파일이 존재하는 것과 복구 가능한 것은 다르다. 기존 `backup.sh`/`restore.sh`는 암호화, checksum, 최신성, 사진 객체 동시 보관, restore 후 verification figures 비교를 수행한다. 데이터 감사는 여기에 **현재 운영 DB 자체의 불변조건 검사**를 추가한다.

운영 권장 기준:

- 10분 단위 encrypted backup 유지
- backup watchdog으로 freshness 감시
- 물리적으로 다른 저장장치 또는 off-site `BACKUP_COPY_TO` 사용
- 정기 restore rehearsal 수행
- 암호화 키는 backup 및 deploy directory와 분리 보관
- 배포 전 backup verify + data audit를 fail-closed gate로 사용

민감정보는 감사 로그에 기록하지 않는다.
