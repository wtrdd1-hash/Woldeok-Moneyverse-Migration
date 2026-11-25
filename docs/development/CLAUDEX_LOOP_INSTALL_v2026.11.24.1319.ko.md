# Claudex Loop 설치 — v2026.11.24.1319

상태: 미니PC Debian 개발 계정 설치 완료. 애플리케이션·Test·운영 배포 없음.

[원본 릴스](https://www.instagram.com/reel/DfmlL5ETNsn/) 공개 설명 확인. [공식 소스](https://github.com/chaseai-yt/claudex-loop), MIT, 고정 커밋 `53cddc42e39346fb8c6d5d612281a3b1add14e66`.

`~/.agents/skills/`, `~/.claude/skills/` 양쪽에 `claudex-loop`, `claudex-route`, `codex-build`, `codex-review` 설치. 기존 Codex–Gemini 핑퐁 유지. 새 세션에서 Codex `$claudex-loop`, Claude Code `/claudex-loop` 호출. Python 3.13.5, Claude Code 2.1.331, Codex 0.162.0 및 양쪽 로그인 확인. 메타데이터 검증 통과, 오프라인 단위 테스트 37/37 통과, 8개 설치 폴더 원본 비교 통과, 실행기 도움말 확인. 실제 모델 교차 검토·구현은 미실행.

최신 main·통합기획·기존 작업기록 우선, 격리 워크트리 및 작업 소유권 준수, 비밀값·회원 데이터 공유 금지. 기본 최대 5회 검토 및 독립 검수. 실제 Test 게이트와 운영 승격 규정 유지. 미완료 검토를 승인으로 처리하지 않음. Gemini는 별도 협업 경로이며 Claudex 자체 지원 공급자가 아님. 예약 변경 없음.

롤백: 신규 설치 4개 폴더씩만 소유권 확인 후 제거. 기존 스킬 보존. 업데이트 시 고정 커밋 검토 및 재검증.

## 서버 시간 기준 시작·중간·종료 기록

```text
2026-11-24T13:19:32+09:00 START: identify upstream, inspect project rules and installed skills; no service changes
2026-11-24T13:19:46+09:00 CHECKPOINT: upstream 53cddc42; project main 9876c09888ec84034eec183cf1309c85df3d7447; both CLI logins confirmed; no runtime changes
2026-11-24T13:20:04+09:00 PRE-INSTALL main=9876c09888ec84034eec183cf1309c85df3d7447; metadata and 37 tests pass
2026-11-24T13:20:05+09:00 FINISH: four skill directories installed in both hosts; 8 copies verified; existing Gemini pingpong preserved; live model loop not run; no service changes
```
