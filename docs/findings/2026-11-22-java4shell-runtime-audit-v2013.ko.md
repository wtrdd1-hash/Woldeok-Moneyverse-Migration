# Java4Shell(CVE-2026-114938) — 미니PC 실행 JVM 및 보안 위험 점검

**버전:** v2026.11.22.2013 | **점검 시각:** 2026-11-22 20:13~20:18 KST
**상태:** 읽기 전용 점검 완료 / 보완 필요 / Test·운영 승격 없음
**범위:** 승인된 Debian 13 미니PC 호스트 1대. 전체 인프라 조사, 침투 시험, 취약점 악용 검증 또는 모든 프로세스의 패치 인증이 아님.
**원문:** [English](2026-11-22-java4shell-runtime-audit-v2013.md)
**작업 기록:** [EN](../worklog/2026-11-22-java4shell-runtime-audit-v2013.md) / [KO](../worklog/2026-11-22-java4shell-runtime-audit-v2013.ko.md)

## 1. 릴스 검증 및 공식 자료 교차 확인

- 사용자 제공 릴스: https://www.instagram.com/reel/DgCmvLryp6I/
- 미니PC에서 인스타그램 페이지 공개 메타데이터/캡션 HTTP 200 확인. 게시 날짜는 2026-11-22로 표시됐으며, Java4Shell(CVE-2026-114938), 인증 없는 공격 위험, Java 17/21/25/27 보안 패치를 소개함. **영상 자체 재생 또는 음성 내용은 검증하지 못함.**
- 취약점은 실재함. KISA는 2026-11-18 Oracle Java 보안 공지를 발표하고 11월 20일까지 FAQ를 보완. Oracle은 2026-11-17 보안 패치를 발표.
- 핵심 악용 조건: 영향받는 OpenJDK Java 17(17.0.6 이후), 21, 25, 27과 x86-64 AVX-512 VBMI CPU, 취약한 최적화 Base64 디코더에 도달하는 공격자 제어 입력. **모든 Spring Boot 서버가 무조건 RCE에 노출된다는 뜻이 아님.** Oracle Java 8 Enterprise Performance Pack은 별도 예외 대상. 같은 공지의 다른 Java CVE는 별도 영향 판단 필요.
- Oracle 보안 수정 버전: 17.0.21.1 / 21.0.13.1 / 25.0.5.1 / 27.0.1.1. 다른 OpenJDK 공급사 버전은 해당 공급사 패치 및 백포트 여부를 직접 확인해야 함.

## 2. 실제 미니PC 읽기 전용 확인

| 항목 | 실측 | 판단 |
| --- | --- | --- |
| 호스트 | Debian 13, x86_64 | 해당 호스트로만 범위 제한 |
| CPU | AMD Ryzen 7 7735HS | /proc/cpuinfo에서 avx512vbmi 미검출 |
| 기본 설치 Java | OpenJDK 21.0.13.1+2-1-deb13u1-Debian | Java 21 수정 버전과 일치 |
| 실행 중 Java PID | 32개 | 백엔드·Test·프리뷰·운영 후보 포함 |
| jcmd VM.version | Java 21.0.12.1: 28개 / 21.0.13.1: 1개 / 확인 불가: 3개 | 설치 Java와 실제 실행 버전이 다름 |
| 삭제된 실행 파일 참조 | PID 28개 | 패키지 업데이트 이후 기존 JVM 미재시작 가능성 |
| 주 백엔드 | moneyverse-spring-backend.service: 21.0.13.1 | 주 Spring JVM은 보안 수정 버전 사용 |
| 기타 서비스 | 다수 21.0.12.1, Test·프리뷰·운영 후보 단위 | 이름만으로 실제 외부 공개 여부 단정 불가 |
| 수신 주소 | 여러 구버전 JVM이 127.0.0.1 수신 | Nginx 프록시로 외부 노출되는지는 이 감사에서 미확인 |

**증적 명령:** java -version, /proc/cpuinfo CPU 플래그 검사, /proc/PID/exe 확인, jcmd PID VM.version, systemctl list-units, ss -lntp, Git 상태 및 원격 SHA. 토큰, DB 접속정보, 프로세스 환경변수, 개인·금융 데이터는 문서에 저장하지 않음.

## 3. 위험 분류

1. **이 미니PC에서 CVE-2026-114938 악용 가능성: 낮음.** 필요한 AVX-512 VBMI CPU 명령이 노출되지 않은 Ryzen 7 7735HS 환경이기 때문. 다른 CPU/서버/컨테이너 및 향후 배포 환경 안전까지 보증하지 않음.
2. **Java 패치 운영: 개선 필요.** 구버전 Java 21.0.12.1 실행 JVM 28개는 여전히 실행 중. 21.0.13.1 패키지 설치만으로 이미 시작된 JVM이 자동 패치되지 않음. KISA가 함께 공지한 CVE-2026-114939~114942 등의 위험은 Java4Shell CPU 조건과 동일하다고 가정할 수 없음.
3. **확인 불가 JVM 3개: 미해결.** 실제 런타임/서비스 이미지 추가 확인 필요.
4. **서비스 QA: 미실시.** 로그인/권한/API/재무 원장/롤백/무중단 배포 검증이 없는 읽기 전용 조사. 기존 프런트엔드 503 및 릴리스 HOLD 그대로 유지.

## 4. 권장 조치 순서 (별도 QA/승격 게이트 필수)

1. 서비스 담당자, 실제 수신 주소·프록시 경로, JAR·런타임 불변 경로와 복구본을 목록화. 주 API/금융/운영 후보/Test를 구분.
2. Debian/OpenJDK 공급사 패치 및 컨테이너·번들 JDK를 확인하고, 확인 불가 3개 JVM도 검증. shell java -version만 보고 종결하지 않음.
3. 구버전 JVM은 개별 Test에서 패치 버전으로 기동해 Spring 헬스, 인증/권한, API 실제 데이터, 금융 읽기 및 QA 검사.
4. 검증된 무중단·롤백 절차에 따라 서비스별 순차 교체. 28개 JVM 일괄 종료 금지. 각 교체 후 실행 PID의 jcmd VM.version과 오류 및 회귀검사.
5. AVX-512 VBMI 지원 CPU에서 즉시 패치 불가 시 공급사 공지에 따라 -XX:-UseBASE64Intrinsics 임시 완화를 Test 검증 후 고려. 다른 CVE 패치 대체 불가.
6. 재점검하여 구 JVM 0개 및 확인 불가 JVM 0개 증적 확보 후 릴리스 판단.

## 5. 공식 자료

- KISA: https://www.boho.or.kr/kr/bbs/view.do?bbsId=B0000133&menuNo=205020&nttId=72313
- Oracle 2026-11 CSPU: https://docs.oracle.com/en-us/iaas/releasenotes/java-management/jdk-cspu-november-2026.htm
- 공급사별 대응: https://www.scala-lang.org/blog/jdk-java4shell-vulnerability.html
- 악용 조건: https://www.sophos.com/en-us/security-advisories/sophos-sa-20261118-java4shell

## 6. 변경 경계

**문서만 작성.** 앱 코드·서비스·OS/JVM 패키지·DB·권한·Nginx·Test·운영 환경 변경이나 재시작이 없었음. 기존 통합 기획을 덮어쓰지 않으며 배포 승인 또는 보안 패치 완료를 의미하지 않음.
