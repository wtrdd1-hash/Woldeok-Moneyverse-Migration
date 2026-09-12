# SEO, 광고 및 법적 고지 감사 — 2026-09-08

[English](2026-09-08-seo-ads-legal-audit.md) | **한국어** | [문서 색인](../INDEX.ko.md)

## 범위
Test 화면을 색인하거나 거래/게임플레이 흐름 옆에 광고를 배치하지 않으면서 검색 크롤러 노출과 AdSense 안전성을 개선합니다. 실제 광고 위치에 개인정보 고지를 맞추고 남은 준수 점검을 문서화합니다.

## 체크리스트
- [x] 프로젝트 배포 및 SEO 지침 확인
- [x] robots, sitemap, metadata, 구조화 데이터, ads.txt, 광고 위치, 개인정보 고지 감사
- [x] SEO/AdSense가 명시적으로 활성화되지 않으면 fail-closed하도록 변경
- [x] 상점 구매 흐름 광고 제거 및 남은 공개 콘텐츠 광고 위치와 개인정보 고지 정합성 맞춤
- [x] 회귀 테스트와 배포 엔드포인트 스모크 검사 추가
- [x] 프론트엔드 테스트, lint, Production 빌드 로컬 실행
- [x] 작업 브랜치를 푸시하고 PR #120으로 `test`에 병합
- [x] CI/빌드 검증 후 Kubernetes 호스트의 Production rolling canary로 변경 프론트엔드 이미지 검증
- [x] 검증된 변경을 PR #121 (`a077e884`)로 `main` 병합
- [x] 검증된 Production 프론트엔드 이미지 배포 및 공개 SEO/광고 엔드포인트 확인

## 완료된 검증
- 프론트엔드: `@moneyverse/contract` 빌드 후 테스트 파일 51개, 테스트 532개 통과
- ESLint: 오류 0, 기존 `<img>` 최적화 경고는 남음
- Next.js Production 빌드: 통과
- GitHub Actions Test 배포 run `34213083792`: ref/CI/이미지 빌드 성공

## 확인된 배포 불일치
Test 배포는 호스트 SSH 단계에서만 실패했습니다. GitHub Actions에 설정된 배포 키를 현재 호스트가 받지 않았기 때문입니다. 저장소 문서도 서로 충돌했습니다. `AGENTS.md`는 이전 Docker `wdmv` Test 스택이 2026-09-07 폐기됐다고 했지만 `docs/RELEASING.md`와 `deploy.yml`은 여전히 해당 스택 배포를 시도했습니다.

당시 Kubernetes ingress는 `test.easy-scraping.com`을 Production `wdmvp` 프론트엔드로 라우팅해 Test 호스트명이 Production sitemap/크롤러 정책을 반환했습니다. 이는 SEO 작업의 적절한 Test 게이트가 아닙니다. 이 작업 시점에는 Production을 변경하지 않았습니다.

## 당시 개선 방향
이미 빌드된 `<sha>-test` 이미지를 격리된 Kubernetes canary에서 공개 SEO/광고/법적 고지 화면만 검증하고, 색인/광고는 비활성화하며 로그인/변경 경로는 사용하지 않습니다. canary 검증 전까지 `main`과 Production 배포를 그대로 유지하고, 오래된 배포 경로 불일치는 저장소 워크플로가 Kubernetes 호스트와 맞춰질 때까지 기록으로 남깁니다.

## Production 완료 — 2026-09-09
- PR #121이 검증된 Test 브랜치를 `main`의 `a077e88454aa06b34557c7bdc11a4e5edaa4f33f`에 병합했습니다.
- Production workflow run `34280512568`은 ref 강제, CI 검증, 이미지 빌드를 통과했지만 기존 SSH ship 단계는 현재 호스트의 키 거부로 실패했습니다.
- DB 상태 변경을 피하기 위해 프론트엔드 이미지만 롤링했습니다. DB 마이그레이션/백엔드 이미지 변경은 필요하지 않았습니다.
- 정확한 `main` 커밋에서 Production SEO/AdSense 빌드 인자로 프론트엔드를 다시 빌드하고 호스트 containerd에 가져온 뒤 Kubernetes `wdmvp-frontend`로 롤아웃했습니다.
- Production 배포는 `ghcr.io/wtrdd1-hash/wdmv/frontend:a077e88454aa06b34557c7bdc11a4e5edaa4f33f-production`을 참조하며 Ready replica 1개를 가졌습니다.
- 제어된 롤아웃 동안 Flux GitOps를 일시 중지한 뒤 인프라 소스를 `4b183b74261abf28f34c3468bcd6b05e16323994`로 갱신하고 Flux를 재개했습니다. `apps`가 해당 revision 적용을 보고했습니다.
- `/`, `/status`, `/robots.txt`, `/sitemap.xml`, `/ads.txt`, `/privacy`, `/shop` 공개 검사는 모두 HTTP 200을 반환했습니다.
- `robots.txt`는 Production sitemap을 가리키고, `ads.txt`는 예상 Google publisher 레코드를 포함하며, sitemap URL은 Production origin을 사용하고 `/shop`에는 `SPONSORED ADVERTISEMENT` 표시가 없습니다.

## 남은 운영 문제
저장소 배포 워크플로에는 현재 호스트에서 인증되지 않는 SSH 전송 경로가 남아 있었습니다. 당시 실행 중인 Production revision에는 영향이 없었지만 다음 자동 호스트 롤아웃 전에 수정해야 하는 항목입니다.
