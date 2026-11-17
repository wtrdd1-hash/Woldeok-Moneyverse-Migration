# 디스크 용량 실사 업데이트 — v2026.11.17.1

[English canonical](2026-11-17-disk-capacity-audit-v2026.11.17.1.md) | 한국어

**구분:** 문서 및 실시간 읽기 전용 점검. **릴리스:** 없음. **상태:** P0 임시저장소 고갈 위험 발견, 조치 미실행.

- OS 루트 디스크 사용률 59%(가용 39G), 서비스 데이터 68%(가용 61G). ext4 inode 각각 약 20%.
- /tmp tmpfs **96%** 사용(가용 289M): 삭제됐으나 열린 Chromium QA 임시파일 2,580개가 4.98GiB 점유.
- 주요 데이터 디렉터리: releases 35G, tasks 20G, agent-worktrees 12G, ai 7.9G, backups 4.2G. /var/lib/docker 약 11G.
- 조치 게이트: QA 소유자/실행 작업 확인, 방치된 Playwright 브라우저 정상 종료 뒤 공간회수 확인. 실행 릴리스·Worktree·DB 볼륨·백업 임의 삭제 금지.
- 정리·서비스 재시작·DB 쓰기·앱 코드 변경·Test/Production 배포 및 운영승격 없음.
- [정밀 결과](../findings/2026-11-17-disk-capacity-audit-v2026.11.17.1.ko.md) · [작업 기록](../worklog/2026-11-17-disk-capacity-audit-v2026.11.17.1.ko.md).
