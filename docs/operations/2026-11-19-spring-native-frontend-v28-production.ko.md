# Spring 전용 프론트엔드 v2026.11.18.28.1 부분 운영 승격·원복 지침

**2026-11-19 00:03 KST 실제 운영 반영 · [영문 정본](2026-11-19-spring-native-frontend-v28-production.md).** 복리·주식 평균단가 계산기2개와 CSS만 수정. 전체 Spring 프론트 전환 완료 아님.

## 개발/검증 과정
- 코드 커밋 `3d22c5b7d5bbf7a319985f1954c4cdd1aace944c`, Spring Boot 불변 JAR `/srv/moneyverse-data/releases/spring-frontend-v2026.11.18.28.1-3d22c5b7/app.jar`, SHA `e0f8ac8be500321efdfc8c60450e9a42f8205c37d04b58dcbd838e020b939f57`. Test PostgreSQL 읽기전용 Spring4652, 운영 DB 읽기전용 Spring4653(봇/예약 OFF), 기존 운영4550 PID368434 및 v24/v25/v27 보존, DB/원장 쓰기 없음.
- 공식 Modern Web Guidance1.0.1 가이드 확인, TDD5개 실패 후 수정·수학5개 추가, 전체 Java `clean test bootJar` **226/226 PASS**. 별도 Nginx4453에서 구 `/tools`→신 계산기 클릭2/2 PASS. Chrome 두 화면×EN/KO×320/390/1440 12/12, JS 비활성 키보드 폼2/2, 오류400 알림1/1 통과.
- 대상: `/tools/compound-calculator`, `/tools/stock-calculator` HTML은 Spring MVC/Thymeleaf 실 렌더링(React/Node/RSC 불필요), 슬래시 별칭은 308 정규화/쿼리 유지, 신규 CSS `/mv-spring/v28/styles.css`는 JAR 정적 자원. `/tools` 등 이전 Next 공개21개 경로 변경하지 않음, 관리자·금융 P0 차단 유지. 새 Spring의 RSC는406, 기존 Next 정적은204.
- 운영 이전 본 Nginx `/etc/nginx/sites-enabled/moneyverse` SHA `306b4aa556c4bfb22a056dd7df31be54f4e2192537d71092173c60dfc8dbb873` 그대로, 프론트 스니펫 `/etc/nginx/snippets/moneyverse-frontend-v24-pages.conf` 전 `8bc6d032135bad86707c7161a1678d1e76d5a5346e96d9db0041c55db7e39fbb`, 후 `0cefe07e7ab8b5d589e88f543173b5c7436a1e02d35de0e934d0beb0f280316d`. 사전 전체 파일 비공개600권한 백업, 정확 SHA 확인 후 `nginx -t` PASS/무중단 reload. 실제 외부 HTTPS33/33·Chrome15/15 화면/폼·클릭2/2 PASS, 기존 회원401/금융403 유지. API Test457건 200158/401271/50328, 500·502·5040.

## 중요 원복·개인 정보
- MiniPC 비공개 작업 경로 `$TASK/private/` 안에 `nginx-v24-pages-before-v28-release.conf`·`nginx-main-before-v28-release.conf`·테스트 로그(권한600). 전체 Nginx 내용·DB env·세션/실회원 ID/원시 로그는 **GitHub 업로드 금지**.
- 문제가 발생할 경우 반드시 **현재 본설정/스니펫 SHA가 위 ‘변경 후’ 값과 동일하고 Gemini 등의 중간 수정이 없는지 비교**, 백업 스니펫 SHA가 ‘변경 전’과 같은지 확인 후 스니펫 **한 파일만** 복구, `sudo nginx -t`→무중단 reload→공개/관리자/개인정보 API 회귀. 본설정 파일은 이번 릴리스에서 수정하지 않았으므로 무조건 함께 덮어쓰면 안 됨. 원복은 옛 React#418 계산기 장애를 다시 만들 수 있어, 검증된 수정이 있으면 forward repair 우선. **독립 실제 롤백 훈련은 아직 미실시**.
- 전180페이지·전901 API, v17 관리자/회원·전역 채팅 실제 전송, 동적 공개/광고/SEO·금융 정산·외부 공식 Test403·모바일 모든 페이지와 복원검증 미완료. Draft PR 유지/전체 운영 성공 허위 표기 금지.
