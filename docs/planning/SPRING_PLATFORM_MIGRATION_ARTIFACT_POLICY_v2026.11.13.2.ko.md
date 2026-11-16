# 스프링 전환 아티팩트·Artifactory·무중단 배포 상세 정책

**기획 버전:** v2026.11.13.2 · **작성일:** 2026-11-13 KST · **상태:** DRAFT / 아티팩트 파이프라인 실제 변경 없음
[English](SPRING_PLATFORM_MIGRATION_ARTIFACT_POLICY_v2026.11.13.2.md) · [스프링 전환 상세 재검토](SPRING_PLATFORM_MIGRATION_DETAILED_REVIEW_v2026.11.13.2.ko.md)

## 1. “아티팩트”와 “Artifactory”는 다르다

**빌드 아티팩트(artifact)**: 컴파일된 Spring JAR, 컨테이너 이미지, SBOM(사용 소프트웨어 구성표), 빌드 출처 증명, 테스트 증적, 운영 배포 매니페스트, 마이그레이션 checksum 묶음, 복귀용 실행체다. **JFrog Artifactory**는 이런 파일을 보관하고 권한/무결성/보관 정책을 운영하는 제품 중 하나이며, 지금 미니PC에 설치돼 있다고 확인한 것은 아니다.

**현재 이미 있는 인프라:** GitHub Actions CI, Test 후보/배포 workflow, GHCR 기반 OCI 컨테이너 이미지, 정확한 SHA/digest, 빌드 provenance/SBOM 설정, GitHub Action 아티팩트의 30일·90일 보관 설정, 문서화된 Debian 불변 배포 디렉터리. 따라서 새로운 서버를 처음부터 만드는 게 아니라 **기존 체계의 실효성을 검증하고 Spring 아티팩트를 추가**하는 방향이 우선이다.

**권장 판단:** 기본은 GHCR + GitHub Actions + 검증 가능한 호스트 불변 배포 기록 유지. JFrog Artifactory는 여러 비공개 언어별 패키지 저장소, 정교한 보관·라이선스·취약점 관리, 독립 원격 캐시·서명된 미러·오프라인 복구 등 기존 체계로 충족되지 않는 요구가 입증된 경우에만 별도 승인한다. 8GiB 미니PC에 신규 상주 저장소 서비스를 무조건 추가하지 않는다.

## 2. 종류별 산출물과 검증 주체

| 산출물 | 만들어지는 경로 | 반드시 연결할 식별자·검증 | 주의할 점 |
| --- | --- | --- | --- |
| Spring 실행 JAR(bootJar) | 승인된 CI/Gradle 또는 Maven 래퍼 | Java/Boot/라이브러리 버전, 소스 SHA, JAR SHA256, 테스트 실행 ID | 운영 호스트에서 최신 main을 다시 컴파일해 쓰면 안 됨 |
| Spring OCI 이미지 | 승인된 CI 이미지 빌드 | sha256 다이제스트, 베이스 이미지 다이제스트, 아키텍처, SBOM, 출처 증명 | 변경 가능한 이미지 태그만 믿으면 안 됨 |
| 기존 Next 프론트 | 기존 Next 빌드·배포 경로 | 동일 앱 소스 SHA, 공개 버전 엔드포인트, 빌드 ID | Spring 변경으로 SEO·프론트 빌드가 달라지지 않게 |
| 복귀 Nest 이미지 | 실제 검증된 이전 이미지/배포 디렉터리 | pull 가능한 digest, 당시 세션/DB 호환성, 정상 작동 결과 | 파일 만료로 마지막 정상 버전을 잃으면 복귀 불가능 |
| API 계약 묶음 | OpenAPI + 골든 HTTP 테스트·TS/Java/Kotlin 연결 | 계약 해시, 전후 코드 SHA, 소비자 목록 | 코드 생성 성공만으로 기능 동등성을 인정 금지 |
| SQL checksum | 정식 packages/database 마이그레이션 | 정렬된 마이그레이션 해시, 실제 DB 적용 이력 | Hibernate/Flyway가 기존 이력을 수정하거나 빼앗으면 안 됨 |
| SBOM·취약점 결과 | CI, SPDX 또는 CycloneDX | 대상 digest, 라이선스/취약점 결과, 예외 승인 | 목록만 만들고 검토하지 않으면 소용없음 |
| Provenance/서명 | 빌드 CI 신뢰 주체 | 원본 저장소, 워크플로, 소스 SHA, 대상 digest, 독립 검증 | CI 성공 ≠ 저장된 실행물이 그 코드임의 증거 |
| 배포 매니페스트 | 운영 승격 절차 | 실제 digest, Test 인증, DB epoch, 복귀 digest, 승인 주체 | GitHub 저장소 HEAD와 앱 소스 SHA를 분리 |
| 복원 증적 | 격리된 백업·복귀 리허설 | 복원 대상/시간, 해시, 검증 결과, 실행 책임 | 백업 파일 존재 ≠ 복원 성공 |

**아티팩트에 포함 금지:** DB 비밀번호·세션 비밀키·Discord/Telegram 토큰·OAuth 토큰·.env·개인정보 원본·실제 운영 회원 데이터. 컨테이너 레이어, 컴파일 로그, SBOM 커스텀 메타데이터, 매니페스트에도 비밀을 저장하지 않는다.

## 3. 버전 표준과 파일명

- **기획 문서 버전** v2026.11.13.2는 현재 문서 번호다. 이것을 실제 Spring 배포 버전이라고 표시하지 않는다.
- **애플리케이션 식별자** = 승인된 40자리 소스 커밋 SHA + CI run ID + Java/의존성 잠금 지문. 리포지토리 HEAD와 실제 앱 소스 SHA가 다를 수 있으므로 모두 보관.
- **이미지 예시** = ghcr.io/wtrdd1-hash/moneyverse/spring-backend@sha256:FULL_DIGEST. **존재한다고 확인된 이미지 경로가 아니라 제안 네이밍**이다. 사람이 읽는 태그는 부가 정보이고 실제 설치는 digest로 고정한다.
- **JAR 예시** = moneyverse-spring-backend-APP_VERSION.jar + SHA256 체크섬·source SHA·테스트 실행 로그. 로컬 개발자가 만든 임의 JAR 운영 반영 금지.
- **API 계약 해시** = route-map + OpenAPI 스키마 + 호환성 테스트 픽스처. 기존 라우트를 증거 없이 재생성해 삭제하지 않는다.
- **DB 호환성 번호** = 기존 SQL 마이그레이션 checksum 집합과 schema epoch. 구버전 Nest/Spring이 동시에 읽는 동안 비호환 DDL 적용 금지.
- **복귀 아티팩트** = 배포 시점에 pull/실행 검증한 마지막 정상 버전 digest, 불변 경로, 호환 DB·세션 증거.

## 4. G1에서 구현할 CI·빌드·신뢰 경로

1. **PR 승인:** 원본 브랜치/정확한 SHA 확인. 보호된 브랜치·필수 리뷰·SQL 이전 번호 변경 금지를 검사한다.
2. **툴체인:** Java21 + 실제 검토된 안정 Spring Boot, Gradle/Maven wrapper, 의존성 버전 잠금·체크섬·신뢰 저장소 목록·보안/라이선스 검사. 새 Spring patch 채택 시 원래 빌드와 클라이언트 호환성을 재검증한다.
3. **사전 시험:** 컴파일/정적 분석/단위 시험/실제 격리 PostgreSQL 함수·권한 음성 시험/HTTP 계약·Android 검증. 필수 항목 SKIP은 PASS가 아니다.
4. **보안:** 의존성·베이스 이미지·비밀값 스캔, 고위험 취약점 예외의 승인자·만료일 기록, 공급망 권한 최소화. 결과를 녹색으로 만들기 위해 게이트를 삭제하지 않는다.
5. **아티팩트 생성:** bootJar, 시험 보고서, SPDX/CycloneDX SBOM, SHA256, 이미지 생성에 쓰인 베이스 이미지 digest를 기록한다. 비루트 사용자/멀티스테이지·정확한 재현 가능성 조사.
6. **배포 저장:** 승인 GHCR 및 필요한 경우 별도 제어된 JAR 저장소에 업로드한다. GitHub OIDC/짧은 수명 신뢰 증명과 빌드 출처 증명 생성 후 **별도의 소비자 경로에서 검증**한다. BuildKit의 provenance 옵션만 켜놓고 검증을 생략하지 않는다.
7. **매니페스트:** repo SHA, 실제 app SHA, CI ID, JAR/image checksum, SBOM/출처, API/DB 해시, 실제 Test 대상, 복귀 image, 담당자·승인을 묶은 불변 배포 계약 생성.
8. **격리 Test:** 빌드한 바로 그 OCI digest 또는 JAR을 사용하여 서비스 가동한다. Production을 위해 main에서 다시 빌드하지 않는다. 실제 도메인/인증/돈/장애/복원 증거를 연결.
9. **운영 승격:** G0에서 확정한 현행 Debian systemd/Nginx 무중단 절차를 따르며, 올바른 digest와 독립 Test 인증/운영 승인이 있을 때만 배포. GHCR 업로드나 Actions 녹색 표시는 곧 운영 배포가 아님.
10. **운영 관찰:** 기존·신규 backend/frontend/DB 정체성, 로그인 연속성, Android, 관리자 명령, 원장, p95/p99, GC/스왑·풀 지표를 관찰하고 확인된 이전 버전을 유지한다.

**권한 원칙:** PR CI에 PROD 이미지 발행·승격 권한 무분별 부여 금지, Test/Production 자격 분리, 일회용 CI 토큰, 이미지는 digest 고정, 서명 검증과 예외 승인을 필수 게이트로 둔다.

## 5. 불변 배포 매니페스트의 구체적인 필드

아래는 **스키마 제안 예시**이며 실제 배포 데이터가 아니다. REPLACE로 표시된 값이 있으면 실행/승격 검증기가 **무조건 거부**해야 한다.

~~~json
{
  "schemaVersion": 2,
  "state": "CANDIDATE_NOT_DEPLOYED",
  "repository": "wtrdd1-hash/Woldeok-Moneyverse-Migration",
  "repositoryHeadSha": "REPLACE_40_CHARACTER_SHA",
  "applicationSourceSha": "REPLACE_40_CHARACTER_SHA",
  "ciRunId": "REPLACE_RUN_ID",
  "spring": {
    "java": "21",
    "bootVersion": "SELECT_AFTER_G1_AUDIT",
    "bootJarSha256": "REPLACE_64_HEX",
    "ociRepository": "REPLACE_REGISTRY_REPO",
    "imageDigest": "sha256:REPLACE_64_HEX"
  },
  "frontendDigest": "sha256:REPLACE_64_HEX",
  "apiContractSha256": "REPLACE_64_HEX",
  "migrationSetHash": "REPLACE_64_HEX",
  "databaseCompatibilityEpoch": "REPLACE_REVIEWED_EPOCH",
  "sbomSha256": "REPLACE_64_HEX",
  "provenanceAttestationRef": "REPLACE_VERIFIED_REF",
  "testAttestationRef": null,
  "rollbackLastKnownGoodDigest": "sha256:REPLACE_64_HEX",
  "rollbackRestoreReceipt": null,
  "approval": "NOT_APPROVED"
}
~~~

**검증 조건:** 올바르지 않은 체크섬·원본 저장소·서명·Test 증거·DB epoch·복구 대상이면 시작/승격을 막는다. Test/운영에 사용된 매니페스트는 수정하지 않고 새로운 빌드에 새 문서·새 시험·새 승격을 연결한다.

## 6. 보관기간·디스크·자동 삭제 정책 제안

| 구분 | 권장 정책(아직 실행 설정 아님) | 삭제 금지 조건 |
| --- | --- | --- |
| 운영 중인 이미지·JAR | 사용 기간 전체와 규정상 필수 기간 유지 | 실행 중 또는 현재 매니페스트가 가리키는 경우 |
| 마지막 정상 버전(LKG) | 최소 운영 관찰+복귀 기간, **90일 이상 제안**. 더 엄격한 현행 정책 우선 | Actions TTL 만료만 이유로 삭제 금지 |
| 격리 Test 후보 | 검토·진행 중 유지, 완료 후 **30일 제안** | 현 Test 서비스·사고 재현에 사용 중일 때 |
| 실패·취소된 CI | 검토 후 **14일 제안**, 감사/보안 기록은 별도 장기 유지 | 보안 사고·원인 분석이 끝나지 않았을 때 |
| SBOM·provenance·매니페스트 | 대응 운영 아티팩트와 동일하게 보관 | 실제 바이너리가 없는 단독 매니페스트 정리 필요 |
| DB 백업·복구 기록 | 기존 금융 백업 규정·법적 보존 우선 | 코드 정리 때문에 운영 원본 백업·자금 기록 삭제 금지 |

**정리 순서:** (1) 실제 Test/Production의 현재 실행 이미지 조회 → (2) 되돌릴 후보 digest 확인 → (3) 사고·감사 보관 대상 분리 → (4) GHCR에서 pull 검증 및 오프라인 복원 리허설 → (5) 미참조·승인 대상만 삭제 → (6) 삭제 로그·절감 용량·복귀 검증 결과 기록. 루트 디스크·/srv 데이터 디스크 용량은 G0 기준에 맞추고, 빌드 아카이브로 서버 스왑/IO를 악화시키지 않는다.

## 7. JFrog Artifactory 도입 여부 비교

| 판단 기준 | GHCR + GitHub Actions 확장(기본안) | JFrog Artifactory 신규 도입 |
| --- | --- | --- |
| OCI/이미지 다이제스트 | 기존 운영 워크플로에서 활용, 실효성 확인 필요 | 지원 가능하나 신규 저장소·배포 계약 작성 |
| Maven/Gradle 의존성 | 신뢰 저장소·wrapper·lock·검증으로 우선 시작 | 사설 패키지·미러·정책 통합 필요 시 유리 |
| 운영비·라이선스 | 기존 인프라 재사용 | 추가 라이선스/백업/패치/운영 인력 필요 |
| 미니PC 자원 | 별도 상주 레지스트리 미추가 | 별도 호스트/서비스의 가용성·용량 검증 필수 |
| 보안 | OIDC/Sigstore·증명·SBOM·digest 검증 | 공급망 서명·증명 형식의 상호 운용성 검증 |
| 현재 선택 | **우선 제안** | 요구가 확인되고 소유자가 승인해야 함 |

Artifactory를 채택한다면 OCI 저장소와 Maven 저장소를 분리하고, 릴리스 저장소 불변성, 배포 전용/읽기 전용 권한, TLS, 데이터 보관, 이중화, 백업 복원, 미러 일관성, 서비스 장애 시 배포 중단·재해복구 RTO/RPO, 서명 호환성까지 별도 RFC를 작성한다. 레지스트리 이전 중 승인된 digest에 다른 바이너리를 덮어쓰지 않는다.

## 8. Spring 이미지 실행·JVM·무중단 승격 주의사항

- 권장 실행 이미지는 비루트 사용자·계층화·읽기 전용 가능한 경로를 우선한다. 서비스 비밀·설정은 이미지/소스 외부에서 공급하고, 환경 스냅샷에 비밀번호를 기록하지 않는다.
- health를 **liveness(프로세스)** / **readiness(필수 의존성)** / **startup(초기화)**으로 분리한다. Actuator 환경·힙덤프·개인정보 메트릭·Swagger·관리자 DB/SQL을 인터넷에 공개하지 않는다.
- Hikari DB 풀, 최대 스레드 수, 요청 큐, 외부 연결, 스케줄 작업자 수를 실제 PostgreSQL 및 서버 RAM 한계에 맞춰 설정한다. Spring 시작 중 Hibernate/Flyway가 기존 SQL 이력을 자동 변경하지 못하게 한다.
- UTC/한국시간·한국어 UTF-8·요청 종료·종료 시 연결 drain·민감 로그 제거·trace 데이터 양을 검증한다.
- Java 설치가 되어 있다는 사실만으로 **운영 Java 백엔드 상시 구동을 허가하지 않는다.** 기존 Node·DB·봇과 공존하는 데 필요한 실제 메모리/스왑 여유가 충족되지 않으면 별도 호스트·용량 확장 후 진행한다.
- **무중단 절차:** 이전 정상 서비스 보존 → 신규 후보 독립 실행 → 버전/준비 검증 → 과거 로그인·Android·웹훅 확인 → 읽기 cohort 이동 → 금융/명령은 DB 작성자 fence 후 단일 전환 → Nginx 절체 → 지표 관찰 → 되돌릴 이전 버전 유지. 실제 edge 경로는 G0 확인 후 확정한다.

## 9. 실패를 의도적으로 만드는 아티팩트 복구 시험

| 장애 시뮬레이션 | 반드시 나와야 하는 결과 |
| --- | --- |
| 배포 매니페스트와 이미지 digest 불일치 | 신규 시작 거부, 이전 서비스 유지·경보 |
| 태그만 존재·이전 OCI digest 삭제 | Test/운영 승격 차단, 이미지 존재 검증 실패 |
| 출처 서명 저장소/워크플로/SHA가 다름 | 신뢰하지 않는 바이너리 거부 |
| SBOM 고위험 취약점·예외 만료 | 보안 검토·승격 보류 |
| Java/Boot 버전 오류·콜드스타트 실패 | 신규 트래픽 금지, 실행 로그 수집 |
| DB epoch 불일치 | 데이터베이스 임의 변경 없이 fail-closed |
| JVM OOM·Hikari 연결 고갈 | 새 명령 보류, 중복 결제 방지·이전 업스트림 유지 |
| 프론트/백엔드 실제 소스 SHA 불일치 | 동일 배포 인증 실패·운영 승격 금지 |
| 스케줄러 두 개 동시 실행 | lease/fence로 경제 효과 한 번만, 아니면 전환 중단 |
| 마지막 정상 이미지 복원 실패 | 운영 승격 중단, 복구 후보 검증부터 재수행 |

**아티팩트 단계 합격 기준:** bootJar 해시, 검증 가능한 OCI digest, 독립 출처 증명, SBOM 검토, 올바른 배포 매니페스트, 실제 Test 동일 SHA·DB·권한·세션 검증, 마지막 정상 버전의 복귀 리허설 및 승인. 하나라도 누락되면 PLANNING/BLOCKED 상태 유지.

## 공식 참고 자료

- 저장소 [운영 배포 가이드](../RELEASING.ko.md), 기존 .github/workflows/test-candidate.yml 및 deploy.yml.
- Spring Boot 빌드/설치: https://docs.spring.io/spring-boot/system-requirements.html , https://docs.spring.io/spring-boot/installing.html .
- GitHub 아티팩트 출처·서명 및 독립 검증: https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations , https://docs.github.com/en/actions/concepts/security/artifact-attestations .

**상태 DRAFT: 이번 기획 작업으로 Artifactory 설치, 신규 Spring JAR/이미지 빌드, 레지스트리 설정 변경, Test/운영 승격, 금융 데이터 변경은 발생하지 않았다.**
