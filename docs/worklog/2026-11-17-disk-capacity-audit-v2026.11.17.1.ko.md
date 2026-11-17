# 디스크 용량 점검 작업기록 — v2026.11.17.1

[English canonical](2026-11-17-disk-capacity-audit-v2026.11.17.1.md) | 한국어
상태: OBSERVED / 읽기 전용. 주체: 미니PC MCP 경유 ChatGPT. 범위: 측정·문서화, 용량 정리 미실행.

## 시작 — 2026-11-17 14:11 KST
- 통합 기획 마스터, 런타임 기준, 문서 거버넌스, 백업 관련 문서 확인.
- 디스크 및 컨테이너 기초값 실측. 로컬 Migration 체크아웃에는 다른 작업자의 미커밋 변경이 있고 main보다 뒤처져 있으므로 건드리지 않음.
- GitHub main e96e8f81f4d6b99b221392a2b6fe46356361b145 확인 후 격리 문서 브랜치 audit/disk-capacity-20261117-1417-v1 생성.

## 중간 — 14:12~14:17 KST
- 루트 99G 중 56G 사용/39G 가용(59%). 데이터 197G 중 128G 사용/61G 가용(68%). /tmp tmpfs 6.7G 중 6.4G 사용/289M 가용(96%).
- 두 장치 inode 20%. Docker·데이터 폴더·운영 릴리스 링크 조사.
- /tmp 열린 삭제파일 2,580 inode, 4.98GiB. 2026-11-15부터 실행된 Playwright Chromium 고아 QA 프로세스가 주 원인. 프로세스 종료 안 함.
- root 권한으로 Docker 경로 약 11G, containerd 약 1.7G 확인. PostgreSQL 볼륨·롤백 릴리스 보호 대상으로 구분.
- GitHub main 동일 SHA 중간 재확인 후 문서 작성.

## 종료 — 문서 전용
- 독립 브랜치에 영문 정본/한국어 조사·작업·업데이트 기록. main 병합, Test/Production 배포, DB 쓰기, 파일 삭제, 서비스 재시작, QA 강제 종료 모두 없음.
- 남은 P0: QA 작업자와 소유권 확인 뒤 정상 종료 및 공간 회수 확인. P1: 보존·백업·모니터링 대조.
- 조사 결과: [영문](../findings/2026-11-17-disk-capacity-audit-v2026.11.17.1.md) / [한국어](../findings/2026-11-17-disk-capacity-audit-v2026.11.17.1.ko.md).
