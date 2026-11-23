# v2026.11.23.5 — 파비콘 로고 / 관리자 전용 / 404 복구 기록

## 시작
사용자가 반복적으로 "현재 파비콘 자체를 로고로 사용" 지시. 앞선 GPT는 이를 왕관/문자 W 시안으로 잘못 대체하고 잘못된 로고를 생성함. 브랜치에서 열던 이전 문서 PR #3393은 closed/unmerged였고, 브랜치가 없어서 404가 발생했음. 기준 main `9876c09888ec84034eec183cf1309c85df3d7447`.

## 중간
GitHub 실제 바이너리 `spring-backend/src/main/resources/static/assets/mv39/favicon.ico`의 blob SHA `c102a9b1fe85e2d476e00eb82387f97dabb17cc0` 확인. 수정 소스 PR #3395의 `shared/chrome.html`·`mv43/home.html`에서 별도 `woldeok-official-icon.png`를 현행 `favicon.ico`로 교체 (원본 바이너리 수정 없음). 브랜치의 실제 렌더링·Test 미검증.

## 문서 정리
새 전용 브랜치 `docs/ui-canonical-favicon-correction-20261123`: 영문 정본 및 한국어 통합 UI 기준 문서, 4개 프로젝트/통합 마스터 영한 문서의 상단 링크, 2개 문서 카탈로그 링크만 수정. 기존 과거 QA/worklog, 디자인 PNG, 런타임, API, DB 미변경. 일반 사용자/비회원에 대한 관리자 내비게이션 DOM/검색 표시 금지를 명확히 규정.

## 종료 및 보류
문서 PR 생성, 변경 SHA 검토. **Test/운영 승격 없음**. 서버 접근 불가로 실서비스 파비콘 픽셀과 스크린샷 재촬영 미진행. 기존 생성형 이미지들은 로고 불일치로 불합격 처리. UI 권한 렌더링은 별도 기능/보안 코드 수정 및 테스트 요구.
