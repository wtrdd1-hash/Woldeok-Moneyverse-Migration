# v2026.10.01.495 — 공개 저장소 정리

[English canonical](2026-10-01-public-repository-sanitization-v2026.10.01.495.md) | **한국어**

- 공개 서버 저장소에서 내부 업데이트 추적 기록을 제거했다.
- 내부 업데이트 기록 재추적 방지 ignore 규칙을 추가했다.
- contributor 지침의 저장소 공개 상태 가정을 실제 상태에 맞췄다.
- 비권위 루트 scratch/runtime memory를 공개 안전 호환 포인터로 축소했다.
- 공개 앱 가이드에서 비공개 운영 게이트웨이의 불필요한 참조를 제거했다.
- 이전 일괄 script 정리에서 삭제된 필수 비밀값 없는 DB 초기화 소스를 복구했다.
- 보안/문서 기획에 공개 데이터 최소화와 Git 이력 인지형 secret scan 요구사항을 추가했다.
- 앱 저장소 Android v1.3.5 signing hardening과 연계했다.

검증: 서버 전체 test PASS, typecheck PASS, database 7/7 PASS. lint는 최신 main에 이미 존재하는 lint debt 때문에 RED다. Production 변경 없음.
