# Discord 관리자 DM 운영 알림

[English](discord-administrator-direct-messages.md) | [운영 배포](production-deployment.ko.md)

## 범위 (v2026.10.16.742)

백엔드 `DiscordAlertService`를 통해 발송되는 **사전 정의된 중요 운영 임베드**는 기존 로그 채널과 설정된 관리자 DM에 함께 발송합니다. 원장 대사 실패, 음수 잔액, 감사 무결성, 관리자 주의/정보/긴급 경보, 공지, 국고·금융 통화 정책, 주조·소각, SEO 오류·일일 보고, 주식 급변동 및 기존 커뮤니티 브로드캐스트를 포함합니다. 대규모 자금 이동 등 별도 DM 전용 경보는 기존 경로를 유지합니다.

**모든 원시 로그·회원 개인정보·세션·비밀키·토큰·전체 DB 내용을 DM으로 복제하지 않습니다.** 현재 경보 발행자가 없는 이벤트나 GitHub CI, 백엔드 자체가 중단됐을 때의 외부 호스트 장애는 별도의 모니터링 장치가 있어야 알릴 수 있습니다.

## 비밀값 없는 설정 가이드

- `DISCORD_BOT_TOKEN`: 백엔드가 읽을 수 있는 보호된 환경 파일에만 지정.
- `DISCORD_ADMIN_ALERT_USER_ID`: 실제 수신할 관리자 Discord 사용자 ID를 명시적으로 지정(기본 ID 폴백에 의존하지 않을 것).
- `DISCORD_ADMIN_DM_ENABLED=false`: 전체 DM 중지(기본 활성). 기존 채널 알림은 계속 발송.
- `DISCORD_ADMIN_DM_MODE=critical`: 긴급으로 지정한 알림만 DM. 기본값 `all`.
- `DISCORD_ALERT_CHANNEL_ID` 또는 웹훅: 기존 채널 알림 설정 유지.

디스코드 이용자 DM 차단 설정, 봇의 DM 접근권한을 확인합니다. 개별 수신자별 DM 채널 캐시 분리, `allowed_mentions` 차단, 이메일·자격증명 형태 문자열 마스킹 및 실패 상태 기록을 적용합니다.

## 검증·승격

테스트 환경에서 동일 커밋 실행 및 관리자 무해한 테스트 DM 수신 확인 → 타입·빌드·회귀·CI → 금융/권한/관리자 인증 UI 게이트 통과 → 무중단 Production 승격으로 진행합니다. 미해결 운영 게이트가 있으면 **운영 적용으로 보고하지 않습니다.** 중단 시 보호된 설정을 `DISCORD_ADMIN_DM_ENABLED=false`로 변경하고 정상적인 배포·재시작 절차를 따릅니다.
