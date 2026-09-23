# 월덕 머니버스 디스코드 음악 봇 & 음성 상주 데몬 (Discord Bot)

월덕 머니버스(Woldeok Moneyverse) 서버 전용 고음질 디스코드 음악 봇 및 24/7 음성방 상주 불사 데몬입니다.

## 🎵 핵심 기능

1. **무제한 음악 스트리밍 (`Infinity`)**:
   - 재생 시간 제한 없이 10시간 이상의 장시간 수면 음악, 로파이 플레이리스트, 콘서트 실황 재생 지원.
2. **실시간 볼륨 조절 (`/volume 0~200%`)**:
   - `@discordjs/voice`의 `VolumeTransformer`와 `@discordjs/opus` 엔진을 통해 재생 중 끊김 없이 실시간 음량 조절 및 영속 적용.
3. **SponsorBlock 실시간 API 연동 & FFmpeg 온더플라이 정밀 절단**:
   - `https://sponsor.ajay.app` 커뮤니티 데이터베이스와 실시간 연동.
   - 유튜버 자체 협찬 광고(`sponsor`), 노래 시작 전 대화/스킷(`music_offtopic`), 채널 홍보(`selfpromo`), 인트로/아웃트로를 FFmpeg `aselect='not(between(t,start,end))',asetpts=N/SR/TB` 필터로 0초 만에 완벽 절단하여 순수 음악만 즉시 재생.
4. **24/7 불사 음성 상주 엔진 (Unconditional Voice Stay)**:
   - 5초 주기 초고속 와치독 및 `VoiceStateUpdate` 전수 감지.
   - 봇이 강제 퇴장되거나 다른 채널로 드래그 이동되더라도 1초 이내에 목표 음성 채널로 즉시 강제 복귀.
   - 게이트웨이 샤드 재연결(`ShardResume`) 훅 및 무한 재시도 지수 백오프 탑재.
5. **모든 명령어 채널 전체 공개 (Public Response)**:
   - `/play`, `/queue`, `/nowplaying`, `/skip`, `/volume` 등 모든 응답을 채널 전체에 공개하여 서버 멤버 전원이 실시간으로 신청곡과 상태를 공유.

## ⌨️ 슬래시 명령어 목록 (8종)

| 명령어 | 옵션 | 설명 |
| :--- | :--- | :--- |
| `/play` | `query` (필수: 곡명 또는 유튜브 URL) | 유튜브 음원을 검색하거나 URL을 통해 대기열에 추가하고 즉시 재생 |
| `/volume` | `level` (선택: 0~200) | 실시간 음량을 조절하거나 현재 볼륨 확인 |
| `/skip` | 없음 | 현재 재생 중인 곡을 건너뛰고 다음 곡 재생 |
| `/pause` | 없음 | 현재 재생 중인 음악을 일시 정지 |
| `/resume` | 없음 | 일시 정지된 음악을 다시 재생 |
| `/stop` | 없음 | 재생을 정지하고 대기열을 완전히 비움 (음성방은 24/7 유지) |
| `/queue` | 없음 | 현재 재생 중인 곡과 대기열 목록(최대 10곡) 확인 |
| `/nowplaying` | 없음 | 현재 재생 중인 트랙 정보 및 진행 시간, 볼륨 상태 임베드 확인 |

## ⚙️ 환경변수 설정 (`.env`)

```env
DISCORD_BOT_TOKEN="your_bot_token_here"
DEVNURT_GUILD_ID="1104015535592701984"
VOICE_CHANNEL_ID="1536572442422550538"
MUSIC_LOG_CHANNEL_ID="1542465347364589609"
NODE_ENV="production"
```

## 🚀 실행 및 테스트

```bash
# 단위 테스트 실행 (4/4 PASS)
npm test

# 봇 직접 실행
npm start
# 또는 node index.js

# QA 광고/스폰서 차단 검증 스크립트 실행
python3 scripts/qa_ads_sponsorblock_verification.py
```

## 🛡️ Systemd 서비스 관리

```bash
# 서비스 상태 확인
systemctl status moneyverse-discord-bot.service

# 서비스 재시작
sudo systemctl restart moneyverse-discord-bot.service

# 실시간 로그 확인
journalctl -u moneyverse-discord-bot.service -f
```
