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

## v1413.2 — 격리 DB 실제 함수 검증 (2026-10-28 KST)
- 기존 금융/회원 DB와 별도의 임시 데이터베이스 wdmv_blog_v1413_qa_20261028 을 moneyverse-test-db 내에 생성. PostgreSQL 실제 관리자 역할 moneyverse_migrator를 사용, 기존 데이터베이스를 수정하지 않음.
- 발행/원문/철회 SQL v288, v289, v290 순차 적용 성공. 격리된 관리자의 역할 조회 함수는 테스트 전용 허용/거부 픽스처를 사용하며, 실제 관리자/운영 권한 변경 아님.
- 한 트랜잭션에서 게시 영수증 생성, 동일 슬롯/본문 재전송시 신규 게시 없이 동일 영수증, 게시 행 1개·첫 게시 감사 1개, 앱 역할의 직접 INSERT 거부, 비관리자 관리자 철회 시 42501, 허용 관리자 수동 철회 및 감사 2개를 실제 PostgreSQL SQL로 검증. 모든 ASSERT 통과, 시험 트랜잭션 ROLLBACK 후 임시 데이터베이스 DROP을 확인(남은 DB 0개).
- 전체 백엔드 테스트 233파일/1,929 PASS, DB·환경 조건 70파일/440 SKIP. 신규 공식 출처 테스트·발행기·로테이션 14 PASS, 계약 빌드/백엔드 타입검사/린트 PASS. 이 증거는 DB 함수 격리 재현이며 공식 Test 모델 원문 실게시, 운영 무중단 공개 확인과는 별개.
- 운영/Test /api/v1/blog/verified 는 여전히 HTTP 404 app_gateway_path. 실제 Nginx 경로와 BLOG_API_ORIGIN 연결/공식 SHA 배포 미완료. v1412 원어 AI가 생성한 출처 검증 글의 운영 게시 영수증은 아직 없다.

## v1413.3 — 운영 기존 글 재노출 긴급 조치 및 구형 발행기 차단
- 최신 origin/main f7552b160에 다른 에이전트가 구형 Next /api/blog/generate를 7,000자 JSON 직접 발행으로 다시 활성화한 것을 발견. 공식 출처 검증 없이 '실측' 환율·금리·백테스트를 상수로 단정, isAiGenerated:false(감수 완료 위장) 및 crypto.randomUUID 영수증만 만들고 공유 JSON에 직접 overwrite함. 국가 KR/US/JP/VN(승인한 CN과 불일치), 본문 모든 주제에 무관한 복리 계산기 삽입. 이는 사용자 최종 v1405 정책·v1412 DB 영수증 발행과 충돌하는 명백한 안전 회귀.
- 2026-10-28 09:36 KST 운영 및 Test /api/blog에 기존 190건이 재노출됨을 확인. 실제 공유 파일은 198건(기존 철회 8, 재공개 190), 최신 글 publishedAt 10월27일 16:08Z로 모두 v1406 사용자의 10월28일 01:09 KST 철회 지시 이전 글. SHA256 3190ad5af44ff1b62b2b2f2b4d84a4b44ab3053931e2165d3342a471d86d023b, 전용 private 경로 0600 원본 백업 후 동시변경 CAS·fsync·원자 교체로 190건만 다시 WITHDRAWN. 198/198 철회, 운영/Test API 공개 0, 새 글 없음. 데이터 자체 삭제하지 않음.
- 09:40 KST 신규 글 2건이 또 생성됨(슬러그 2026-10-28-kr-compound-e8ad9c2e 및 2026-10-28-kr-compound-195200b4, 본문 각 9천여자). 새 글에 사전검증 없음·isAiGenerated:false·임의 receipt 표시를 확인. 사용자 '시간 경과 자동 비공개/삭제 금지'에 따라 이 새 글 2건은 임의 철회하지 않음. 기존 사용자 철회 대상에만 조치.
- v1413 브랜치에서 구형 API를 fail-closed. GET은 관리자에게도 LEGACY_FILE_PUBLISHER_RETIRED 및 false 공개 상태를 정확히 알리고, POST는 익명 403/관리자·구형 크론 인증자 503 LEGACY_UNVERIFIED_PUBLISHER_RETIRED. 파일 쓰기·임의 출처·가짜 실측·가짜 승인 영수증 코드 완전 제거. v1412 백엔드 blog.rotation_2h 검증 DB 발행 스케줄러는 유지하며 영향을 주지 않음.
- 신규 API 회귀 5 PASS, 프론트 전체 352파일/1,863 PASS, 타입검사/변경린트 PASS. 이 코드는 아직 격리 브랜치이며 3354 실제 운영 구형 API가 차단됐다는 증거는 아니다. 운영 무중단 배포·실제 DB 2시간 게시 QA 필수.
