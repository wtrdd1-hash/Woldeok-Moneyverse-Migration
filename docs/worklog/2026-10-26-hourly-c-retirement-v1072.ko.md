# 개발 C v1072 — 퇴직금 계산기 근속 자격 및 추정치 검증 (운영 보류)

## 시작
- Debian 13.6 미니PC, 주요 서비스 7개·PostgreSQL 연결 확인. 최신 main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- AGENTS/README·기획서 국영문, QA/A/B/C 및 열린 PR·CI 조사. 경매 후보는 기존 #1301/#1270 중복으로 제품 코드 게시 없이 중단.
- 신규 P1: 공개 퇴직금 계산기가 근속 1년 미만 입력을 막고 최소 1년 퇴직금을 강제로 표시. 음수·비정상 급여 입력과 출처 없는 SEO 평점도 개선 대상.
- 공공 계산기 순수 수식과 화면 변경. DB/API/금융 원장 변경 없음.

## 체크포인트
- [ ] RED 테스트
- [ ] GREEN 계산·접근성·SEO
- [ ] main/기획 중간 확인
- [ ] 정확 SHA 검증·CI
- [ ] Draft PR 및 운영 보류

## 중간
진행 전.

## 종료
진행 전.

## 중간 — 19:54 KST
- origin/main 재조회 후 동일 SHA, 국영문 통합기획 해시 불변. 퇴직금 계산기 중복 PR 없음.
- TDD RED 5건 실패 확인 후 GREEN 6/6. 1년 미만 0원·입력값 경계·1년 이상 월할 계산·자격 안내·허위 WLD 지급 문구·SEO 가상 평점 제거.
- API/DB/금융 원장 변경 없음. A/B/QA/Gemini 보존.

## PR 전 — 19:59 KST
- 기존 레이아웃 SEO가 실제 퇴직금 계산기가 아닌 국민연금/FIRE 계산기를 설명하고, 공통 도우미가 가상 평점을 추가하는 문제 확인. 추가 RED 2건→GREEN 총 8/8. 메타/OG/FAQ/구조화 데이터 실제 기능으로 수정, 44px 터치 영역 보완.
- 초기 HEAD: Lint 오류 0/경고 1128, Typecheck PASS, Frontend 전체 1403 PASS/6 FAIL(기존), app-api 179 PASS. 운영 보안 2 High, 전체 26건 FAIL. 1GiB 힙 제한 로컬 Webpack Build OOM으로 재검증 필요.
- main·기획 재조회 불변. DB/운영 배포 변경 없음.
