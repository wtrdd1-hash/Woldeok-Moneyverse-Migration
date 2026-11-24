# 보안 제한형 에이전트 스킬 4종 — v2026.11.24.1431

**범위:** 스킬 등록만 완료, 실행 환경 검증 미완료. **서버 시각:** 2026-11-24T14:31:56+09:00. **main 기준:** `9876c09888ec84034eec183cf1309c85df3d7447`.

출처: https://www.instagram.com/reel/DfeZ0sFzEn7/ (사용자 캡처의 설명 확인, 영상 직접 재생 미검증).

## 작업 기록 및 증거
- 시작: 미니PC 환경 및 기존 스킬 확인, 동명 경로 없음. Node 24, tmux 존재, 가용 RAM 약 1.5 GiB, 디스크 여유 12 GB.
- 중간: main 갱신, 통합 기획서 및 공유 기억 규정 검토. 작업 브랜치의 DOCUMENT_AUTHORITY 문서는 당시 main에 없었으므로 동일하다고 간주하지 않음.
- 공식 원본 3개 SHA-256 확인 후 보안 제한형 스킬로 등록하고 원본을 참고 파일로 보존. Repolyze는 공식 SKILL.md가 없어 공개 저장소 전용 자체 스킬 작성.
- 종료: 공용 경로에 `rigs`, `hindsight-local`, `mineru`, `repolyze-public-review` 설치 및 Claude/Codex/Gemini 링크 등록. 16/16 경로 확인. 실제 세션의 스킬 인식 및 실행 기능 미검증.

## 원본
- rigs: https://github.com/mvschwarz/openrig — `255fa70888fbcb8f62df3b31c7d3b5e81e2447dc`
- hindsight-local: https://github.com/vectorize-io/hindsight — `535eb6d708c95b531162b08a959f162fe891b3bc`
- mineru: https://github.com/opendatalab/MinerU — `097de7f63f54722c9b805ee1c9a14a0c5b02e078`
- repolyze: https://github.com/MxCorpIn/Repolyze — `042469ec176dbf322320348a865eea3d52b5ced6`

## 제한
OpenRig 팀, Hindsight 자동 수집 훅/외부 기억, MinerU 모델/서비스, Repolyze 웹앱/API 미가동. 권한 변경, 비공개 저장소 전송, 애플리케이션 수정 및 운영 배포 없음. 원본 대화·금융·회원 데이터 수집 금지. 기존 GitHub 작업 기록 유지. Repolyze는 공개 저장소에만 사용하며 점수는 보안 인증이 아님. 별도 격리 테스트와 검토 후 실행 환경 활성화.
