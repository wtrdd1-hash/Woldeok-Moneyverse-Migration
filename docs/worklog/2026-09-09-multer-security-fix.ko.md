# Multer 2.3.0 보안 업데이트 — 2026-09-09

## 발견 사항

새 upstream 보안 권고가 공개되면서 운영 의존성 감사가 실패하기 시작했다. `@nestjs/platform-express@11.2.3`은 `multer@2.2.0`을 고정하고 있으며, 공개 권고는 조작된 multipart 요청으로 서비스 거부(DoS)를 일으킬 수 있는 High 등급 취약점으로 분류하고 `2.3.0`을 패치 버전으로 지정한다.

월덕 머니버스는 프로필 및 관리자 사진 업로드에서 NestJS multipart 처리를 실제 사용하므로, 애플리케이션의 이미지 매직바이트·크기 검증보다 앞단에서 해당 의존성이 요청을 처리한다.

## 조치

- root pnpm override에 `multer >=2.3.0`을 추가했다.
- lockfile을 다시 생성해 실제 해석 버전을 `2.2.0`에서 `2.3.0`으로 변경했다.
- API, DB 스키마·마이그레이션, 경제 규칙, 운영 데이터는 변경하지 않았다.

## 검증

- `pnpm install --frozen-lockfile`
- `pnpm audit --prod --audit-level=high`: override 적용 후 알려진 취약점 0건
- push 전 lint/typecheck/업로드 관련 backend test를 수행하며, PostgreSQL 포함 GitHub CI가 최종 병합 게이트다.

## 롤백

이 커밋을 revert하면 이전 lockfile로 돌아갈 수 있다. 다만 이전 버전은 원격에서 유발 가능한 가용성 취약점이 있으므로 호환성 문제 진단 외에는 롤백 상태를 운영에 유지하지 않고, 반드시 다른 패치된 통합 방식으로 대체해야 한다.

## 참고

- GHSA-wc9g-mqfw-jrwm / CVE-2026-77078
- GHSA-535w-7cp7-47q4 / CVE-2026-82333
- GHSA-qfvm-cv95-jqjf (중단된 업로드의 파일 디스크립터 누수; Multer 2.3.0에서 수정)
