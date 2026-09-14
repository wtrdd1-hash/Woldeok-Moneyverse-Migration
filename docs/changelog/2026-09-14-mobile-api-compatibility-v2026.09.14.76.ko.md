# v2026.09.14.76 — 모바일 전체 API 호환성 계약

- `/app-api/v1/*`의 모든 JSON 응답에서 기존 키를 유지하면서 snake_case 키의 camelCase 별칭을 재귀적으로 추가한다. 기존 camelCase 키와 충돌하면 기존 값을 유지한다.
- 모든 앱 API 응답에 API 버전, 계약 버전, 필드 명명 정책 헤더를 추가하고 `GET /app-api/v1/meta/contract` 메타 API를 제공한다.
- CookieJar/CSRF에 필요한 요청 헤더와 Retry-After/ETag/Range/rate-limit 등 네이티브 클라이언트에 필요한 응답 헤더 전달 범위를 확대했다.
- private API timeout/연결 실패를 안정적인 `application/problem+json` 502/504 오류로 정규화했다.
- 전체 139개 앱 엔드포인트의 요청 DTO 필드·필수 여부·타입·제약·성공 응답 필드를 실제 OpenAPI/TypeScript 계약에서 추출해 기계 판독 JSON과 EN/KO 문서로 고정했다.
- 게시판/갤러리/프로필 이미지 업로드 3개 경로를 raw bytes, 최대 4 MiB, PNG/JPEG/WebP 호출 방식으로 명확히 교정했다.
- 내 프로필에는 앱용 camelCase 필드와 본인 전용 로컬 이메일을 제공하되, 다른 사용자 프로필에는 이메일을 노출하지 않는다.
- CI가 계약 JSON/스키마 문서의 drift를 자동 검출하도록 계약 생성·검증 단계를 추가했다.
