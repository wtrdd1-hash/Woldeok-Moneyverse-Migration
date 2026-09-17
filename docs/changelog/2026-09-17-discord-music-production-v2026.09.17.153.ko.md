# 디스코드 음악봇 운영 승격 — v2026.09.17.153

## 요약
이미 검증된 `main` 기준 디스코드 음악봇 소스를 운영에 승격했다.

## 배포 순서
1. `bot/index.js`, `bot/music.js`, `bot/package.json`, `bot/package-lock.json`이 현재 `origin/main`과 동일한지 확인했다.
2. `npm test`, `node --check music.js`를 통과했다.
3. 미니PC 운영 호스트에서 `moneyverse-discord-bot.service`를 재시작했다.
4. 운영 봇의 Discord 로그인 성공을 확인했다.
5. 길드 음악 명령어 7개 `/play`, `/skip`, `/stop`, `/pause`, `/resume`, `/queue`, `/nowplaying` 등록을 확인했다.
6. 봇이 음성 채널 `1536572442422550538`에 다시 접속한 것을 확인했다.
7. 백엔드 헬스 엔드포인트가 HTTP 200 및 `{"status":"ok"}`를 반환하는 것을 확인했다.

## 명령어 초기화 근거
운영 승격 직전에 길드 범위 명령어를 7개에서 0개로 초기화한 뒤 음악 명령어 7개를 다시 등록했다. 기존 글로벌 경제/관리 명령어 55개는 유지했다.

## 운영 상태
- 서비스: `moneyverse-discord-bot.service`
- 상태: active
- 승격 시각: 2026-09-17 18:06 KST
- 음악 명령어 수: 7
- 대상 음성 채널: `1536572442422550538`
- 백엔드 헬스: HTTP 200

## 비고
봇 소스와 `origin/main` 사이에 차이가 없었으므로 이번 운영 승격에서 소스코드 변경은 발생하지 않았다. 이 문서는 운영 승격 및 검증 근거를 기록한다.
