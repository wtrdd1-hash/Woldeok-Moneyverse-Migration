# v2026.10.28.1413 — 국가별 AI 블로그 운영 인수 QA

## 작업 전
사용자 구현 지시. 최신 origin/main 및 통합 마스터, v1405 정책, v1412 이미 병합된 AI 원어 작성·출처·DB 영수증 발행기 확인. v1412 다른 작업자의 동시 수정 파일과 충돌하지 않도록 별도 브랜치.

## 중간 기록
읽기 전용 QA 도구는 공식 Test/localhost만 허용하고 운영 URL 거부. 정확한 후보 SHA를 확인하며 익명 관리자 API 거부(401/403), 게시 상태·국가/언어/주제·본문 길이·출처·유일한 영수증·상세 API 일관성을 검사. BLOG_QA_REQUIRE_POST=true 일 때 실제 게시 글이 있어야 통과.

## 테스트 및 결과
Node 로컬 모의 HTTP 서버에서 공개 글 0건/1건과 운영 URL 거부 검사 통과. 운영 데이터, 삭제된 원본 글, 다른 에이전트의 파일과 서비스 포인터 변경하지 않음. 독립 Test 및 운영 승격은 미완료이며 이 도구로 자동발행 성공을 허위 보고할 수 없음.

## v1413.1 중간 수정 — 실제 12개 공식 출처 실연결 확인
- 격리된 미니PC에서 v1412 공식 원문 URL 12개를 HTTPS redirect:manual/12초 이하 조건으로 직접 GET 확인. 한국 3개, 미국 3개, 일본 3개, 중국 코딩·컴퓨터 2개는 모두 HTTP 200, 본문·MIME/크기 기준 충족. 중국 ECONOMY 기존 https://www.pbc.gov.cn/en/3688110/index.html 은 HTTP 404/본문 146바이트로 2시간 자동발행이 해당 슬롯에서 반드시 차단됨을 확인.
- 중국 인민은행 통화정책사 공식 원문 https://www.pbc.gov.cn/zhengcehuobisi/125207/index.html 은 미니PC 직접 GET 200, text/html, 43,987바이트/가공 후 약 4천 글자이며 질적 원문 확인 가능. v1413 별도 브랜치에서 중국 경제 주제만 이 URL로 교체. 안전한 정적 공식 URL 12개/locale 검증 회귀 테스트 2개 PASS.
- 프로덕션·Test 공개 /api/v1/blog/verified 는 모두 HTTP 404 app_gateway_path. v1412 코드는 메인에 존재하지만 현재 Nginx는 이 경로를 백엔드로 포워딩하지 않음; 실제 운영 발행으로 보고 불가. frontend server-to-server BLOG_API_ORIGIN을 올바른 백엔드 주소로 묶는 별도 릴리스 환경 QA 필요.
