# API 정보 비공개·공개 표면 보안 명세

> 버전: v2026.09.23.398
> 상태: P0 기획/보안 계약
> 영문 원본: [API_DISCLOSURE_SECURITY_SPEC.md](API_DISCLOSURE_SECURITY_SPEC.md)

## 1. 결정

월덕 머니버스는 운영/테스트 웹사이트에서 API endpoint 목록, request/response schema, OpenAPI/Swagger 문서, cURL·코드 예제, 권한이 필요한 mutation 설명, 내부 service route, 실시간 API 실행 콘솔을 의도적으로 공개하지 않는다.

상세 API 설명은 GitHub의 기획/개발 문서에서만 관리한다. 단, 실제 공개 범위는 저장소 공개 설정이 결정한다. GitHub 저장소가 public이면 GitHub 문서 역시 인터넷에 공개된다. 따라서 "GitHub에만 둔다"는 것은 "머니버스 웹 제품에서 의도적으로 노출하지 않는다"는 뜻이며, public GitHub 저장소의 내용을 비밀로 만든다는 뜻은 아니다.

## 2. 공개 웹사이트 정책

운영 및 테스트 웹 제품에서는 다음처럼 API를 열거하는 개발자 포털 표면을 제거하거나 비활성화한다.
- endpoint 목록 및 검색 가능한 API catalog;
- OpenAPI/Swagger/JSON/YAML 다운로드;
- request/response schema viewer;
- cURL/TypeScript/Python 예제;
- "Try it out", 실시간 endpoint tester, GraphQL explorer, Postman 형태 console 등 대화형 API 실행 기능;
- 관리자, 국고, 지갑, 주식, 은행, 정산, 보상, moderation, 계정, 인증 등 권한·경제 관련 API 상세 설명;
- 정상 사용자 이용에 필요하지 않은 내부 hostname/service name/port/topology/debug route/build metadata/secret/token/credential/signing material/보안통제 구현 상세.

사용자에게 "이 기능은 서버와 안전하게 통신한다" 수준의 일반 설명은 가능하지만 호출 가능한 API 계약을 열거해서는 안 된다.

## 3. 보안은 은닉에 의존하지 않는다

공개 API 문서를 제거하는 것은 정보 노출을 줄이는 보조 통제이며 인증·인가를 대신하지 않는다. 브라우저/모바일 클라이언트의 일부 네트워크 목적지는 사용자가 직접 확인할 수 있으므로 모든 API는 route와 schema가 알려졌다고 가정하고 보호한다.

서버는 deny-by-default 권한, object-level authorization/BOLA 방어, 서버 권위 actor identity, 브라우저 mutation의 CSRF 방어, input allowlist·bounded validation, rate/resource limit, 경제 mutation의 idempotency·concurrency 보호, 필요한 append-only audit, 민감 작업의 step-up/re-authentication을 유지해야 한다.

사이트에서 API 정보를 숨겼다는 이유로 어떤 보안통제도 약화하면 안 된다.

## 4. 클라이언트 구조

가능한 경우 웹 프론트엔드는 불필요한 내부 service topology를 브라우저에 노출하지 않도록 same-origin BFF/server action을 사용한다. 민감 내부 서비스는 UI 지원을 이유로 public Internet에 직접 routable하게 만들지 않는다.

클라이언트에는 서버 secret, DB credential, 내부 API key, signing secret, privileged bearer token, service-to-service credential을 전달하지 않는다. 공개 browser bundle은 실수로 포함된 route inventory, private operational data가 들어간 source map, embedded OpenAPI artifact, secret을 검사한다.

## 5. GitHub API 문서 권위

상세 API 설명의 권위 저장소는 GitHub다. v397이 요구한 engineering contract인 method/path, 인증·인가, request/response schema, validation, stable error, pagination/filtering, idempotency, concurrency, rate/resource limit, persistence/failure semantics, audit/telemetry, version/deprecation, positive/negative test expectation을 GitHub 문서에서 유지한다.

상세 API 문서는 구현과 동기화해야 하지만, 이후 별도 기획 결정이 없는 한 이를 공개 웹사이트로 자동 복제하거나 production static asset으로 포함하지 않는다.

더 강한 기밀성이 필요하면 저장소 또는 API 문서 저장소 자체를 private/access-controlled로 전환해야 한다. public GitHub 저장소는 기밀 저장소로 취급할 수 없다.

## 6. 빌드·승격 게이트

운영/테스트 웹 빌드가 다음을 의도치 않게 공개하면 빌드 실패 또는 승격 차단으로 처리한다.
- OpenAPI/Swagger spec;
- 개발자 포털 API catalog page;
- 다운로드 가능한 API collection;
- live API execution console;
- 비사용자용 endpoint가 포함된 generated route inventory;
- secret 또는 privileged internal configuration.

릴리스 QA는 공개 route와 static asset을 crawl하여 알려진 개발자/API 문서 artifact를 검사하고, 제거 대상에 직접 접근했을 때 승인된 비노출 응답(일반적으로 404/410 또는 최소 공개 안내 페이지)이 반환되는지 확인한다.

## 7. 현재 개발자 포털의 전환

현재 공개 중인 개발자 포털/API 센터는 P0 정보노출 축소 대상이다. 구현 작업은 다음 순서를 따른다.
1. 공개된 developer/API route 및 다운로드 artifact 전수 inventory;
2. 사용자용 도움말과 상세 API engineering 문서 분류;
3. 상세 API 설명을 GitHub 문서로 이동;
4. 공개 endpoint catalog/OpenAPI 다운로드/live tester 제거;
5. navigation, sitemap, robots로 발견 가능한 page, static artifact, cache된 build 어디에서도 제거 대상 문서가 제공되지 않는지 검증;
6. 정보노출 변경과 별개로 authorization/security regression test 실행;
7. exact SHA를 Test에 배포해 frontend/backend/API 동작을 검증한 뒤 기존 무중단 Production 승격 gate 적용.

v398은 기획/문서 변경만 의미하며 현재 운영 개발자 포털이 이미 제거됐다고 주장하지 않는다.
