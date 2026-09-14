# 내부 작업 기록 — v2026.09.14.76

## 원인
앱 API가 endpoint별로 camelCase와 DB 유래 snake_case를 혼합했고, 일부 문서는 DTO 이름만 적어 다른 AI가 필드 구조를 추측해야 했다. 네이티브 앱에 필요한 Range/ETag/Retry-After 같은 헤더 전달도 불완전했고, transport 실패가 일관된 JSON 오류 계약으로 고정되지 않았다.

## 변경
- 139개 앱 API와 현재 NestJS OpenAPI operation을 전수 대조: 누락 0, 중복 0.
- 앱 BFF에서 JSON key를 additive 방식으로 camelCase 호환 처리. binary body는 변환하지 않음.
- `meta/contract`, 계약 버전 헤더, 안정적인 502/504 problem JSON 추가.
- 실제 OpenAPI request DTO + TypeScript controller return type 기반 상세 EN/KO 스키마 문서 및 machine contract 생성.
- 프로필 null 문제, 본인 이메일, raw image upload 계약을 함께 교정.
- CI contract drift 검사 추가.

## 검증/배포 순서
계획서 재확인 → 구현 → 계획서 중간 재확인 → 계약 재생성 → lint/typecheck/build/test → GitHub CI(DB migration 포함) → exact-SHA Test 배포 → Test 앱 API/백엔드 스모크 → 동일 SHA Production 승격 → 운영 스모크.
