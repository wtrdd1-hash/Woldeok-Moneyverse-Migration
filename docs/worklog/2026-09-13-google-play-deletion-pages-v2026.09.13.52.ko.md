# 내부 작업기록 — Google Play 삭제 안내 페이지 — v2026.09.13.52

영문 기준본: `docs/worklog/2026-09-13-google-play-deletion-pages-v2026.09.13.52.md`

## 발생 사유

Google Play Console에 입력한 계정 삭제 URL과 데이터 삭제 URL이 모두 HTTP 404를 반환해 경고가 발생했다.

## 작업 순서

1. 작업 전 현재 기획/개인정보 기준을 다시 확인했다.
2. `main` 기준 전용 브랜치 `fix/google-play-deletion-pages-v2026.09.13.52`를 생성했다.
3. 공개 삭제 요청 안내 공통 컴포넌트를 추가했다.
4. `/account-deletion`, `/data-deletion` 공개 경로를 추가했다.
5. 작업 중간에 기획 게이트를 다시 확인했다. 공개 콘텐츠는 정상 상태코드/title/H1/본문/canonical을 갖춰야 하며 운영 승격은 exact-SHA 테스트 검증 후 진행해야 한다.
6. 내부용/GitHub용 영문·한국어 업데이트 문서를 추가했다.

## 남은 검증

- 프론트엔드 typecheck/test;
- exact-SHA 격리 테스트 배포;
- 두 공개 URL HTTP 200 확인;
- 백엔드/DB smoke gate;
- 동일 SHA 운영 승격;
- Google Play Console에 입력하기 전 `easy-scraping.com` 운영 URL 최종 HTTP 200 확인.
