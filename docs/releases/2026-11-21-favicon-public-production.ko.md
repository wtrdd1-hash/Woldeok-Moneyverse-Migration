# 11월18일 디자인 파비콘·공통 헤더 첫 운영 반영 — 2026-11-21

**반영 시각: 00:22:17 KST. 범위: 공개 홈 및 기존 공통 헤더5경로와 index별칭. 전체 웹·관리자·금융 기능 완료가 아니다.**

## 실제 반영
- 운영 /favicon.ico와 동일한11,781바이트 파일을 PC/drawer 로고, 탭 아이콘, 모바일 제목 장식으로 사용했다. 새 이미지를 생성하지 않았다. favicon SHA256 `9ce0a8f10cafff52d1d2f7aa451b3e9162944162f61258842e13aa8546f98e78`.
- 네이비·보라색11월18일 공통 셸을 유지하며320px에서 긴 계산기 제목이 로그인 버튼을 밀어내던3건을 수정했다. CSS `dc1e8c8b6d7ddf5624978dc60a79596491ab5acf70d0feb892d41d9a09c17264`.
- 실제 공개 경로: `/`, `/tools`, `/calculators`, `/tools/compound-calculator`, `/tools/stock-calculator`, `/index.html` 별칭. 그 밖의 URI/백엔드/인증/소켓/관리자 처리 경로는 전환하지 않았다.

## 소스·배포 증거
- [PR3325](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3325), 애플리케이션main `93a3c8dbe8c04fda28689904ffe43a86992c73c1`.
- [정확한 main CI44759127347](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/44759127347) 4개 job SUCCESS. 실제 사용한 CI JAR SHA256 `af0913b0546716871ad57e3fb49b893a4cb662b4a5078882db8707158b6b6cc0`.
- Test4794와 운영4792는 동일 JAR. 실제 PID/작업 디렉터리/열린 JAR inode·해시/파일보다 늦은 프로세스 시작/EnvironmentFiles0/NRestarts0를 확인했다.
- 운영 `moneyverse-native-favicon-prod-v20261121.service`, root `/srv/moneyverse-data/releases/prod-native-favicon-v2026.11.21.1-93a3c8dbe8c0`. Test는 대응test경로/unit이다. 두 서비스 모두 boot-enabled/restart-on-failure.
- 공개 소스 확인은 `/frontend-version?scope=public-presentation`. 응답scope명은public-presentation-only이며 쿼리값과 다르다. 기본 버전 요청의204/이전 Next 참조자의 기존ID를 유지했다.

## 검사 결과와 한계
- 미니PC 최신 전체 Spring546/네이티브 Node79: 실패·오류·skip0, bootJar 성공. 기존 Gradle/JDK 경고를 경고0건으로 보고하지 않는다.
- 정확한 PR merge CI 후보280브라우저 케이스 PASS. 해당 후보와main의 애플리케이션1,829개 클래스/자원 바이트가 동일했다. 별도 실제main125케이스도 PASS.
- 운영 실제 IAB에서5페이지×320/359/360/390/1440px의25배치를 확인했다. 로고/새 CSS/가로 넘침 검사는 통과했다. 이는 모든 기능 성공 판정이 아니다.
- 기존 사용자 로그인·같은 계정 표시·지갑 표시가 전환 전후 유지됐다. 실제 백엔드 정수 문자열과 표시값이 일치함을 확인했으며 식별자/잔액 원문은 문서에 남기지 않았다. 원장 정합성 인증으로 확대 해석하지 않는다.
- 실제 복리 입력1000/월100/연0%/2년 결과3400, 평균단가10×2+20×2 결과평단15/4주/총60/목표15/예상수익0을 확인했다. 가상 계산이며 주문·송금은 실행하지 않았다.
- 관리자 홈과35개 도구를 실제 로그인 상태에서 열었고 검색0/35·보안필터6/35·언어 전환을 조작했다. 관리자 전체 변경·금융 액션 완료를 주장하지 않는다.
- **공개 도구4경로는 로그인 중에도 정적Log in을 표시한다. 홈 로그인은 유지되므로 세션 소실이 아니라 공통 계정 표시 연결 누락이다. OPEN.**
- `/stocks`, `/shop`, `/board`, `/quests` 운영 샘플 화면, 관리자 하위 셸 혼용/시스템 로그 정적 오류 캡처, 기존Next지원금fallback 및 금융/마이그레이션 출처 문제는OPEN이다. 신규 공개 기능3경로의 후보는 아직 운영 edge에 연결하지 않았다.

## Test 접근 보호 정정 및 복구
기존 HTTP403만으로Test가 보호됐다고 본 판단은 실제 브라우저에서 부정됐다. Test 홈은 외부에서 열렸다. Test 전용 루프백 제한과 로컬 터널 경로의 Cloudflare 표시 차단을 적용한 후 **실제 외부 브라우저의 홈·favicon403**, 직접 미니PC 내부의200/정확한main을 각각 확인했다. 운영 호스트의 경로에는 이 Test 제한을 적용하지 않았다. [Cloudflare 원본 요청 헤더 문서](https://developers.cloudflare.com/fundamentals/reference/http-headers/).

첫 공개 전환은 검사기가 허용된 내부actuator404를 외부403과 혼동해 자동 복구됐다. 내부/외부 기준을 분리하여 재전환했고 기존응답을 유지함을 확인했다. 실제 외부 IAB의actuator health/env는403이었다. 데이터·계정·세션·SQL·권한·잔액·원장은 수정하지 않았다.

이전42422aab 프로세스/JAR는 건강한 복구 대상 및 기존 버전 자산 공급자로 유지한다. 이전85b CSS와 알 수 없는 버전의legacyf132 공급은 유지됐다. 활성Nginx SHA256 `b5aa4016f12470bc975999b803b2462236a298e7f76119424b085165edc9fc24`. 복구 구성은 새 Test 보호와 기존 actuator/signup 제한을 보존하며 구문 검사를 통과했다.

[세부 QA](../qa/2026-11-20-favicon-real-frontend-audit.ko.md) · [작업 기록](../worklog/2026-11-20-favicon-logo-frontend-audit.ko.md).
