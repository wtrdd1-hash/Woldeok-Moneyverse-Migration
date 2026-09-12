# 미니PC 운영 변경 및 Discord 봇 통합

업데이트 버전: **2026.09.12-03**

## 범위

- 미니PC 작업트리의 운영 변경을 최신 애플리케이션 `main` 위에 줄바꿈 노이즈 없이 복원했습니다.
- 로컬 Discord 봇 소스를 `bot/` 독립 Node.js 패키지로 추가했습니다.
- Discord 인증정보는 환경변수만 사용하며 `DISCORD_BOT_TOKEN`은 저장소에 커밋하지 않습니다.
- 봇 패키지 라이선스를 저장소의 Apache-2.0과 통일했습니다.
- 미니PC에 있던 동의 이동 방지 기능과 주식 관리자 입력 검증 변경을 포함합니다.
- GitHub의 구형 MCP 기능 브랜치를 삭제했으며 이 작업에서 MCP 브랜치 내용은 승격하지 않습니다.

## 검증

- `git diff --check`
- `npm --prefix bot test`
- 병합 전 루트 lint, typecheck, test, production build
- 병합 전 GitHub PR CI

## 롤백

이 작업의 병합 커밋을 되돌립니다. 런타임 비밀값과 운영 데이터는 이 소스 통합에서 변경하지 않습니다.

## 결과

- 로컬 Discord 봇 구문 검사 통과.
- 루트 lint 통과(기존 이미지 최적화 경고만 존재).
- typecheck 통과.
- 병합 과정에서 생긴 `126` 중복을 정산 하드닝 migration `178`로 이동한 뒤 migration parity 통과.
- 백엔드 테스트 822개 통과, migrator URL이 없는 DB 전용 테스트는 skip.
- 프론트엔드 테스트 537개 통과.
- production build 통과.
