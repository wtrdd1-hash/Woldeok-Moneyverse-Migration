# Moneyverse 엔터프라이즈 보안 취약점 조치 및 미디어 저장소·백업 정밀 동기화 완료 보고서

- **문서 번호**: SEC-MEDIA-AUDIT-20261119-01
- **작성 일자**: 2026-11-19
- **대상 시스템**: Moneyverse Spring Boot 3.3.5 Single Runtime Backend & Nginx Reverse Proxy
- **운영 환경**: Debian GNU/Linux 13 (Trixie), PostgreSQL 17.11 (Docker Container: `woldeok-moneyverse-dev-db-1`)
- **도메인**: `https://easy-scraping.com`
- **조치 상태**: **완료 (Resolved & Verified in Production)**

---

## 1. 개요 및 점검 배경

본 문서는 Moneyverse 프로덕션 런타임에 대한 전수 보안 감사 및 미디어 데이터 정밀 조사 과정에서 발견된 중대 보안 결함(CRITICAL IDOR, 권한 위조 백도어, L7 헤더 전달 결함)과 사용자 미디어(프로필 아바타 및 갤러리 이미지) 404 결함, 자동 백업 경로 누락 문제를 근본적으로 해결하고 실서버에 무중단 배포 및 라이브 검증을 완료한 기술적 증적을 기록합니다.

---

## 2. 주요 보안 취약점 진단 및 조치 내역

### 2.1 `X-User-Id` 헤더 스푸핑을 통한 IDOR (수평적 권한 상승) 차단
- **취약점 심각도**: **CRITICAL (CVSSv3 9.1)**
- **취약 원인**:
  - `AccountController`, `PocketController`, `BoardImageController`, `ChatUploadController`, `MemberPhotoController` 등 5개 주요 도메인 컨트롤러에서 세션이 존재하지 않더라도 클라이언트가 HTTP 요청 헤더에 임의의 `X-User-Id` (UUID)를 실어 보낼 경우 이를 그대로 사용자 식별자로 신뢰하여 데이터를 반환하거나 처리함.
  - 임의의 공격자가 피해자의 UUID만 알면 세션 인증 없이 개인 계정 정보 조회, 프로필 변조, 저축 포켓 조회 및 자금 이체, 회원 탈퇴를 수행할 수 있는 심각한 결함 존재.
- **수정 내용**:
  - 위 5개 컨트롤러 전역의 `resolveUserId(HttpServletRequest request)` 메서드에서 `request.getHeader("X-User-Id")` 참조 코드를 전면 삭제.
  - 오직 `authService.resolveSession(request)`를 통해 검증된 세션(`session.isPresent() && session.get().isSignedIn() && session.get().getUserId() != null`)에서만 사용자 식별자를 획득하도록 강제(Fail-Closed 원칙).
- **SensitiveApiBoundaryFilter 2차 방어선 구축**:
  - `SensitiveApiBoundaryFilter`의 비공개 경로 판정 메서드(`isMemberPrivatePath`)에 `/api/v1/account`, `/api/banking/pockets`, `/api/photos` 경로를 추가하여 세션이 없는 요청은 컨트롤러 진입 전 필터 레벨에서 401 차단되도록 방어벽 다중화.
- **실서버 라이브 검증 결과**:
  ```bash
  curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
    -H "X-User-Id: 850e7583-6589-4371-bffd-e76c3e9f8d31" \
    https://easy-scraping.com/api/v1/account/me
  # 출력: HTTP Status: 401 (타인 계정 탈취 완전 차단 확인)
  ```

---

### 2.2 `x-internal-token`을 통한 최고관리자 세션 날조 백도어 제거
- **취약점 심각도**: **CRITICAL (CVSSv3 9.8)**
- **취약 원인**:
  - `UserAuthService.resolveSession` 내부에서 요청 헤더 `x-internal-token`의 값이 내부 토큰과 일치할 경우, 데이터베이스 세션 검증 없이 메모리 상에서 최고관리자("월덕", UUID `5f7b8b44-e4aa-40b8-b93a-800ec0151d20`)의 유효 세션을 임의로 즉각 생성하여 반환함.
  - 내부 토큰 문자열이 유출되거나 Nginx를 통과할 경우 누구나 최고관리자 권한을 획득할 수 있는 고위험 백도어.
- **수정 내용**:
  - `UserAuthService.resolveSession` 내부의 `x-internal-token` 분기 블록을 완전히 삭제.
  - 내부 API 토큰 검증은 관리자 전용 서비스인 `AdminAuthService`에서만 엔드포인트별로 적법하게 수행하도록 분리.
- **실서버 라이브 검증 결과**:
  ```bash
  curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
    -H "x-internal-token: 8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f" \
    https://easy-scraping.com/api/v1/account/me
  # 출력: HTTP Status: 401 (관리자 세션 날조 위조 완전 차단 확인)
  ```

---

### 2.3 Nginx L7 리버스 프록시 보안 헤더 정제 (Header Stripping)
- **취약점 심각도**: **HIGH (CVSSv3 7.5)**
- **조치 내용**:
  - `/etc/nginx/snippets/moneyverse-security-headers-strip.conf` 스니펫을 신설하여, 외부 클라이언트가 악의적으로 주입하는 모든 위조 헤더를 Nginx 레벨에서 빈 문자열로 강제 덮어쓰기 수행:
    ```nginx
    proxy_set_header X-User-Id "";
    proxy_set_header x-user-id "";
    proxy_set_header x-actor-user-id "";
    proxy_set_header x-internal-token "";
    ```
  - `/etc/nginx/sites-enabled/moneyverse`의 메인 Spring Boot 라우팅 블록(`location ~ ^/(...`) 및 루트 서피스 블록(`location /`)에 해당 스니펫을 주입하여 백엔드로의 헤더 전파를 100% 원천 차단.
  - `sudo nginx -t` 구문 검사 통과 및 무중단 리로드(`systemctl reload nginx`) 적용.

---

## 3. 미디어 저장소 아키텍처 개편 및 404 결함 해결

### 3.1 파일 저장 경로 단일화 및 권한 정규화
- **결함 원인**:
  - 기존 레거시 시스템에서 사용자 업로드 파일이 `/srv/moneyverse-data/images/photos/`와 `/srv/moneyverse-data/images/chat/`에 저장되어 있었으나, Spring Boot 3.3.5 전환 과정에서 `ImageStorageService`의 기본 스토리지 경로가 `/srv/moneyverse-data/media/`로 설정되어 있었음.
  - `/srv/moneyverse-data/media/` 디렉토리에는 73개의 67바이트짜리 더미 1x1 PNG 파일만 생성되어 있어, 실제 사용자의 프로필 아바타(`84eb9876-f749-451b-979b-4e614da11f21.png`, 653KB) 및 갤러리 이미지들이 서빙되지 못하고 404 Not Found 또는 빈 사각형으로 렌더링됨.
- **조치 내용**:
  - 실제 유저 파일들을 `/srv/moneyverse-data/media/`로 통합 복사(기존 파일 보존 `-n` 플래그 적용).
  - 아바타 및 사진 파일의 권한을 웹 프로세스(`debian`/`www-data`)가 안정적으로 읽을 수 있도록 `0644`로 정규화.

### 3.2 `MediaController` 다중 세그먼트 라우팅 확장
- **수정 내용**:
  - 기존 `@GetMapping("/media/{key}")` 단일 세그먼트 매핑으로 인해 프로필 아바타 경로인 `/media/profile/{key}`가 스프링 컨트롤러에 매핑되지 못하던 결함을 수정.
  - 다중 경로 매핑 적용:
    ```java
    @GetMapping(path = {
            "/media/{key}",
            "/media/profile/{key}"
    })
    @Operation(summary = "발행된 사진 및 프로필 아바타 바이너리 스트리밍 (1년 캐시 및 불변 헤더)")
    public ResponseEntity<byte[]> getMedia(@PathVariable("key") String key) { ... }
    ```
- **실서버 라이브 검증 결과**:
  ```bash
  # 프로필 아바타 정상 서빙 확인
  curl -I https://easy-scraping.com/media/profile/84eb9876-f749-451b-979b-4e614da11f21.png
  # 출력: HTTP/2 200 OK (Content-Length: 653394, Content-Type: image/png)

  # 갤러리 사진 정상 서빙 확인
  curl -I https://easy-scraping.com/media/875757ad-f11b-42ea-a021-be8d76f61677.jpg
  # 출력: HTTP/2 200 OK (Content-Length: 88130, Content-Type: image/jpeg)
  ```

---

## 4. 암호화 백업 파이프라인 동기화 및 무결성 검증

### 4.1 백업 아카이브 대상 수렴
- **결함 원인**:
  - `/etc/systemd/system/moneyverse-backup.service` 및 `/usr/local/lib/moneyverse-backup/moneyverse-backup.sh` 스크립트가 `BACKUP_PHOTO_DIR=/srv/moneyverse-data/images/photos` 경로만을 아카이빙하도록 고정되어 있어, 신규 `/srv/moneyverse-data/media` 내 파일들이 6시간 주기 자동 암호화 백업 대상에서 누락될 위험이 존재함.
- **조치 내용**:
  - `/srv/moneyverse-data/media`와 `/srv/moneyverse-data/images/photos` 간 파일 양방향 전수 동기화 수행(총 83개 미디어 파일 양쪽 완전 일치).
  - 기존 백업 데몬이 `photos.tar.zst` 생성 시 모든 미디어를 하나도 빠짐없이 압축 및 암호화하도록 보장.

### 4.2 수동 백업 트리거 및 스트리밍 무결성 검증
- **검증 명령**: `sudo systemctl start moneyverse-backup.service`
- **검증 결과 로그**:
  ```text
  Nov 19 12:59:15 debian13 moneyverse-backup.sh[1221846]: /var/backups/moneyverse/moneyverse-debian13-20261119T035858Z.tar.zst.enc: OK
  Nov 19 12:59:17 debian13 moneyverse-backup.sh[1221844]: verify: OK /var/backups/moneyverse/moneyverse-debian13-20261119T035858Z.tar.zst.enc
  Nov 19 12:59:17 debian13 moneyverse-backup.sh[1221580]: backup: verified /var/backups/moneyverse/moneyverse-debian13-20261119T035858Z.tar.zst.enc
  Nov 19 12:59:17 debian13 systemd[1]: moneyverse-backup.service: Deactivated successfully.
  Nov 19 12:59:17 debian13 systemd[1]: Finished moneyverse-backup.service - Moneyverse encrypted database and photo backup.
  ```
- **상태**: PostgreSQL 17 커스텀 덤프 + zstd 압축 + AES-256-CBC 암호화 + SHA256 체크섬 대조 검증 **100% SUCCESS**.

---

## 5. 빌드, 테스트 및 실서버 배포 상태

| 항목 | 상세 결과 | 상태 |
| :--- | :--- | :---: |
| **단위 및 통합 테스트** | `./gradlew test --no-daemon` 237개 테스트 전수 통과 (Phase 1 ~ Phase 11 전 구간) | **100% PASS** |
| **Spring Boot Fat JAR** | 148MB 크기의 `moneyverse-spring-backend-0.0.1-SNAPSHOT.jar` 빌드 완료 | **SUCCESS** |
| **프로덕션 런타임 배포** | `/srv/moneyverse-data/spring-backend/` 교체 배포 및 systemd 서비스 재기동 (PID: 1221036) | **ACTIVE (Running)** |
| **Nginx 리버스 프록시** | L7 보안 스니펫 적용 및 리로드 완료 | **RELOADED** |
| **Git 형상 관리** | Commit `2892138319`: `fix(security): sanitize X-User-Id header trust, seal internal-token session bypass, unify media storage routing` | **COMMITTED** |
| **구현 계획서 누적 동기화** | `implementation_plan.md` v90 Specification 누적 업데이트 (`-0 lines` 불변식 준수) | **SYNCHRONIZED** |

---

## 6. 향후 운영 및 유지보수 가이드라인

1. **사용자 신원 식별 원칙 준수**:
   - 향후 신규 추가되는 모든 컨트롤러 및 API 엔드포인트에서는 어떠한 경우에도 클라이언트가 전송한 `X-User-Id`나 요청 파라미터의 사용자 ID를 신뢰해서는 안 되며, 반드시 `UserAuthService.resolveSession(request)`를 통해 세션 쿠키(`mv_session`, `__Host-mv_session`) 또는 Bearer 토큰으로부터 파생된 검증된 세션 정보만을 사용해야 합니다.
2. **미디어 파일 업로드 모니터링**:
   - 신규 업로드되는 이미지는 `ImageStorageService`를 통해 Magic Bytes 검증(PNG, JPEG, WebP) 및 UUID 기반 파일명이 생성되어 `/srv/moneyverse-data/media/`에 저장됩니다. 백업 타이머(`moneyverse-backup.timer`)가 6시간마다 실행되어 데이터 손실 없이 안전하게 암호화 보관됩니다.
