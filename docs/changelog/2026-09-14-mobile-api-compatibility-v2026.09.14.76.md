# v2026.09.14.76 — Mobile API compatibility contract

- All `/app-api/v1/*` JSON responses preserve existing keys and recursively add camelCase aliases for snake_case keys; existing camelCase values win on collisions.
- Every app response carries API version, contract version, and field-naming headers, and `GET /app-api/v1/meta/contract` exposes safe machine-readable runtime metadata.
- Request/response header forwarding now covers CookieJar/CSRF, language, range/cache validators, Retry-After, ETag, content ranges, request IDs, and rate-limit metadata used by native clients.
- Private API transport failures are normalized to stable `application/problem+json` 502/504 responses.
- Machine-readable and EN/KO references now document all 139 app endpoints with actual request DTO fields, requiredness, types, constraints, success statuses, and TypeScript-derived success response fields.
- Board, gallery, and profile image uploads are explicitly documented as raw bytes up to 4 MiB using PNG/JPEG/WebP rather than JSON/base64/multipart.
- The own-profile contract provides native camelCase fields and owner-only local email while keeping email out of other-user profile responses.
- CI regenerates and verifies the contract/schema snapshots so code/document drift fails the build.
