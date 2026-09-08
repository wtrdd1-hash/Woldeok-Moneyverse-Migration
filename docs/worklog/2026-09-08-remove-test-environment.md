# 테스트 환경 제거

**상태:** 완료 · 2026-09-08

## 왜

테스트 스택 `wdmv`(`test.easy-scraping.com`)는 2026-09-07에 폐기됐고 AGENTS.md §7에
그렇게 적혀 있다. 그런데 `deploy.yml`에는 `environment` 드롭다운이 그대로 남아
있었고, 바로 그 아래 절차는 아직 `-f environment=test`를 먼저 돌리라고 안내하고
있었다. 즉 폐기가 절반만 반영된 상태였다.

그 상태에서 실제로 test 배포가 디스패치됐고(run 34213083792), 갈 곳이 없으니
실패했다. 지금 클러스터에는 `wdmvp` 네임스페이스 하나뿐이고 test 스택에 해당하는
것이 없다.

## 한 일

- [x] `deploy.yml`에서 `environment` 입력 제거. 남은 입력은 `enable_ads` 하나
- [x] `concurrency` 그룹을 `deploy-production`으로 고정
- [x] `ref` 잡의 분기 제거 — `main` 이외의 ref는 무조건 거부
- [x] `build`·`deploy` 잡의 `environment:`를 `production`으로 고정
- [x] 이미지 태그 접미사를 `production`으로 고정. 태그에 환경이 남는 이유는
      프런트엔드 이미지에 공개 주소가 빌드 시점에 박히기 때문이며, 그 성질은
      스택이 하나가 돼도 그대로다
- [x] 빌드 인자에서 환경 분기 제거 (`APP_BASE_URL`, `SEO_INDEXING_ENABLED`,
      `SEARCH_CONSOLE_VERIFICATION`, AdSense 3개)
- [x] `Name deployment` 스텝을 운영 값으로 접음
- [x] `docs/RELEASING.md` — 「두 개의 배포가 있다」를 「배포는 하나다」로, 테스트
      배포 절(§2) 삭제, 이후 절 번호 조정, 배포 전 점검 목록에서 테스트 의존
      항목 교체
- [x] `AGENTS.md` §7 — 디스패치 예시와 "test first" 문구 갱신

## 남는 것

- GitHub 환경 `test`와 변수 `TEST_BOOTSTRAP_DISCORD_ADMIN_IDS`는 저장소 설정에
  그대로 있다. 워크플로가 더는 참조하지 않으므로 동작에는 영향이 없다. 지우는
  것은 저장소 소유자의 판단.
- `refs/heads/test` 브랜치도 그대로 둔다.

## 검증

- `deploy.yml`에 남은 `test` 문자열: 0 (`environment: production` 두 줄만)
- 문서에 남은 `environment=test` 지시: 0
- 이 변경은 배포를 성공시키지 않는다. `deploy` 잡은 여전히 폐기된 호스트로 SSH를
  시도하며 실패한다 — 그 문제는 별건이다.
