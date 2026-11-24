# 토큰 절약 릴스 확인 및 Graphify 엔진 설치 — v2026.11.24.1340

[원본 릴스](https://www.instagram.com/reel/Dc8MKIBtnI0/) 공개 설명(2026-09-06)은 토큰 절감, 무료 모델 연결, 코드 구조 파악, 개발 스킬 자동 실행 4가지 기능을 소개. 제품명은 공개 설명·썸네일에 없고 영상 본문은 미확보. 추정 제품명을 확정하거나 4종 설치 완료로 표현하지 않음.

기존 Graphify 스킬·Superpowers·Caveman·Ponytail 존재 확인 및 보존. 관련 개선으로 `graphifyy==0.9.118` 실행 엔진을 별도 Python venv에 설치하고 `~/.local/bin/graphify` 링크 생성. [공식 소스](https://github.com/Graphify-Labs/graphify), 기존 확보 커밋 `013a6461c31da6e003c0dea191aca84c94cb8d47`. CLI 도움말, 의존성 검증 및 합성 Python/Java 파서 검증 통과. 합성 테스트 코드의 graph.json 생성 확인. 실제 프로젝트 그래프 생성·외부 모델 연결·무료 모델 라우팅·자동 훅·Test/운영 변경 없음. 사용자 로컬 bin PATH 설정 필요 가능. 기존 개발 규정 유지. 나머지 정확한 도구 확인에는 영상 화면/가이드 필요.

## 서버 시간 작업기록
```text
2026-11-24T13:40:38+09:00 START: verify reel names and prior installations; no permission or service changes
2026-11-24T13:40:55+09:00 CHECKPOINT: public metadata has functional descriptions only; exact names unverified; graphify and Superpowers skill already present; prepare optional isolated Graphify engine
2026-11-24T13:41:10+09:00 FINISH: Graphify optional CLI installed, dependencies and synthetic Python/Java parser smoke passed; existing skills preserved; video exact names not confirmed; no external model connection, hooks, or deployment changes
2026-11-24T13:41:28+09:00 CHECKPOINT: synthetic graphify update result recorded in graphify-smoke.log
```
