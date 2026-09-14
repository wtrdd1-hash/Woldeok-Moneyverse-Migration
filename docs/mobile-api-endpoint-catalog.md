# Complete Mobile App API Call and Response Catalog

**English** | [한국어](mobile-api-endpoint-catalog.ko.md) | [Machine-readable contract](mobile-api-contract.json) | [Runtime contract](mobile-api-runtime-contract.md)

Update version: **v2026.09.14.76**

This is the execution contract for Android/iOS/Flutter/React Native clients and AI coding agents. It covers all 139 app endpoints with URL, method, authorization, path/query/body inputs, success statuses, response transport shape, and authoritative re-sync rules.

## 1. Non-negotiable client rules

- Use `https://easy-scraping.com/app-api/v1` as the only native base URL. Never call the private `/api/v1/*` backend directly.
- Never embed `INTERNAL_API_TOKEN` in an APK/IPA, source tree, log, analytics event, or remote configuration.
- Use one persistent secure CookieJar from pre-login through all authenticated feature requests. Persist every `Set-Cookie`.
- When a write requires CSRF, send the latest `csrfToken` as `X-CSRF-Token`.
- Treat `GET /auth/viewer` and its `signedIn` field as the source of truth for login state.
- Only `2xx` is success. Decode non-2xx as `application/problem+json`; never coerce errors into empty/null success models.
- New app-facing JSON models use **camelCase**. Read legacy snake_case only where explicitly documented for compatibility.
- Preserve semantic `null` and render an explicit placeholder instead of the literal string `null`.
- Keep bigint-like monetary/count values in a precision-safe representation when the API sends strings.
- After a successful write, execute the authoritative GET named in the endpoint's after-success rule.

## 2. Compatibility metadata endpoint

`GET /app-api/v1/meta/contract` is BFF-owned and returns the current API version, contract version, base URL, CookieJar/CSRF rules, error model, and supported groups. Every app API response is stamped with `X-Moneyverse-Api-Version` and `X-Moneyverse-Contract-Version`.

```http
GET /app-api/v1/meta/contract HTTP/1.1
Host: easy-scraping.com
Accept: application/json
Accept-Language: en-US,en;q=0.9,ko;q=0.8
```

Clients must ignore unknown additive fields. Removing a field or changing its semantics requires an explicit compatibility decision rather than silently mutating the v1 contract.

## 3. Common HTTP request form

Use `Content-Type: application/json` and `Accept: application/json` for JSON commands. Image upload endpoints accept raw image bytes rather than base64 JSON. Media reads can forward `Range`, `If-None-Match`, `If-Modified-Since`, and `If-Range`. `Accept-Language` is also forwarded.

```http
POST /app-api/v1/wallet/transfers HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Accept: application/json
Cookie: <attached by CookieJar>
X-CSRF-Token: <latest csrfToken>

{"recipientUserId":"<uuid>","amount":"1000","idempotencyKey":"<uuid>"}
```

## 4. Common success and error handling

Keep each endpoint's response wrapper exactly as returned. Do not invent a universal `data` wrapper. Backend rejections use RFC 9457-style problem JSON. Gateway transport failure is normalized to `502 app_gateway_unavailable`; a 15-second upstream timeout becomes `504 app_gateway_timeout`. Compatibility-relevant headers such as `Retry-After`, ETag/range headers and rate-limit headers are forwarded.

## 5. Client state machine

```text
APP START -> GET /auth/viewer
  signedIn=false -> Login
  signedIn=true, consentCurrent=false -> Consent
  signedIn=true, consentCurrent=true -> Main

WRITE -> validate -> CookieJar + CSRF + idempotency key -> require 2xx
      -> authoritative GET -> replace local state

ERROR -> keep last successful state separate from transport/error state
```

## 6. Complete endpoint inventory

### account — account
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `DELETE` | `/app-api/v1/account` | Delete the caller account | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `202` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/account/identities` | Sign-in methods linked to the caller | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: identities | 응답을 화면의 서버 기준 상태로 교체 |
| `DELETE` | `/app-api/v1/account/identities/:id` | Unlink a sign-in method | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string* | `200` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/account/identities/:provider/link` | Begin linking another sign-in method | 로그인 + 최신 동의 + CSRF(변경 요청) | params provider[path]:string* | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/account/security/sessions` | Active sessions belonging to the caller | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: sessions | 응답을 화면의 서버 기준 상태로 교체 |
| `DELETE` | `/app-api/v1/account/security/sessions/:id` | Revoke one other active session belonging to the caller | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string* | `200` | JSON keys: revoked | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/account/security/sessions/revoke-others` | Revoke every other active session belonging to the caller | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `201` | JSON keys: revokedSessions | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### activity — activity
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `POST` | `/app-api/v1/activity/events` | Ingest client activity telemetry events (page view, dwell, clicks) | 로그인 + 최신 동의 + CSRF(변경 요청) | body IngestActivityEventsDto (application/json) | `200` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### auth — auth
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `POST` | `/app-api/v1/auth/:provider/reauthentication` | Begin step-up reauthentication with a provider | 로그인 + 최신 동의 + CSRF(변경 요청) | params provider[path]:string* | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `PUT` | `/app-api/v1/auth/consent` | Record the authenticated member policy acknowledgement | Prelogin 또는 로그인 세션 + CSRF | body ConsentDto (application/json) | `200` | JSON keys: next | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/auth/local/login` | Sign in with first-party email/password credentials | 인증 흐름 전용: 상태머신 준수 | body LocalLoginDto (application/json) | `201` | JSON keys: outcome, csrfToken, consentCurrent | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 |
| `POST` | `/app-api/v1/auth/local/register` | Start first-party email/password registration | 인증 흐름 전용: 상태머신 준수 | body LocalRegisterDto (application/json) | `202` | JSON keys: accepted, verificationRequired | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/auth/local/verify-email` | Verify first-party email and activate the account | 인증 흐름 전용: 상태머신 준수 | body LocalVerifyDto (application/json) | `201` | JSON keys: outcome, csrfToken, consentCurrent | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 |
| `POST` | `/app-api/v1/auth/logout` | End the session | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `204` | no response body | 쿠키 무효화 반영 후 로컬 사용자 상태 초기화 |
| `POST` | `/app-api/v1/auth/mobile/handoff` | Exchange a one-time native OAuth handoff for an app session | 인증 흐름 전용: 상태머신 준수 | body MobileHandoffDto (application/json) | `201` | JSON keys: outcome, csrfToken, consentCurrent | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 |
| `GET` | `/app-api/v1/auth/policy` | Currently published consent version | 공개/Prelogin에서 호출 가능 | 없음 / none | `200` | JSON keys: termsVersion, privacyVersion | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/auth/prelogin-session` | Create or reuse the pre-login session | 인증 흐름 전용: 상태머신 준수 | 없음 / none | `201` | JSON keys: signedIn, csrfToken | CookieJar와 csrfToken 저장 |
| `GET` | `/app-api/v1/auth/providers` | Sign-in providers this deployment can offer | 공개/Prelogin에서 호출 가능 | 없음 / none | `200` | JSON keys: providers | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/auth/session` | CSRF token for the current session | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: csrfToken | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/auth/viewer` | Session state for rendering navigation | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: signedIn, consentCurrent, adminRoles | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/auth/:provider/authorize` | Begin login with a provider | 인증 흐름 전용: 상태머신 준수 | params provider[path]:string*, client[query]:string* | `200` | JSON keys: authorizationUrl | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/auth/:provider/callback` | Complete an OAuth round trip | 인증 흐름 전용: 상태머신 준수 | params provider[path]:string*, state[query]:string*, code[query]:string*, error[query]:string* | `200` | JSON keys: outcome, provider, mobileHandoff, consentCurrent, csrfToken | 응답을 화면의 서버 기준 상태로 교체 |

### bank — bank
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/bank/loans` | Outstanding loans for the caller | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: loans | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/bank/loans` | Borrow from the virtual bank | 로그인 + 최신 동의 + CSRF(변경 요청) | body BorrowDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/bank/loans/:id/repayments` | Repay part or all of a loan | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body RepayDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/bank/movements` | Move balance between cash and bank | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankMovementDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |

### banking — banking
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `POST` | `/app-api/v1/banking/bonds/:id/redeem` | Redeem matured virtual bond and payout principal with yield | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body IdempotentDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/bonds/purchase` | Purchase 7-day or 30-day virtual government bonds | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankBondPurchaseDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/borrow` | Borrow smart credit loan evaluated by job level and business value | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankBorrowSmartDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/claim-interest` | Claim accrued compound deposit interest into bank balance | 로그인 + 최신 동의 + CSRF(변경 요청) | body IdempotentDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/deposit` | Deposit WLD cash into bank compound interest deposit account | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankTransferDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/repay` | Repay active bank loan | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankRepayDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `GET` | `/app-api/v1/banking/standing` | Bank overview: cash, deposit balance, compound interest, loans, bonds | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/withdraw` | Withdraw WLD from bank deposit account to cash | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankTransferDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |

### board — board
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/board/images/:key` | Read an image attached to a visible board post | 로그인 필요(기능에 따라 최신 동의 필요) | params key[path]:string* | `200` | binary body | 게시글/댓글 목록 또는 상세 재조회 |
| `POST` | `/app-api/v1/board/images/uploads` | Upload one image for a board post | 로그인 + 최신 동의 + CSRF(변경 요청) | body Buffer (application/json) | `201` | binary body | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/posts` | Recent member board posts | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: posts | 게시글/댓글 목록 또는 상세 재조회 |
| `POST` | `/app-api/v1/board/posts` | Write a post | 로그인 + 최신 동의 + CSRF(변경 요청) | body CreatePostDto (application/json) | `201` | JSON keys: post | 게시글/댓글 목록 또는 상세 재조회 |
| `DELETE` | `/app-api/v1/board/posts/:id` | Delete your own post | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body DeletePostDto (application/json) | `204` | no response body | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/posts/:id` | One post, with its body | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string* | `200` | JSON keys: post | 게시글/댓글 목록 또는 상세 재조회 |
| `PUT` | `/app-api/v1/board/posts/:id` | Rewrite your own post | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body UpdatePostDto (application/json) | `200` | JSON keys: post | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/posts/:id/comments` | The replies on a post, oldest first | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string* | `200` | JSON keys: comments | 게시글/댓글 목록 또는 상세 재조회 |
| `POST` | `/app-api/v1/board/posts/:id/comments` | Reply to a post | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body CreateCommentDto (application/json) | `201` | JSON keys: comment | 게시글/댓글 목록 또는 상세 재조회 |
| `DELETE` | `/app-api/v1/board/posts/:id/comments/:commentId` | Delete your own reply | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*, commentId[path]:string*; body DeleteCommentDto (application/json) | `204` | no response body | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/images/:key` | Public image attached to a visible board post | 공개: 로그인 불필요 | params key[path]:string* | `200` | binary body | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/posts` | Public recent board posts | 공개: 로그인 불필요 | 없음 / none | `200` | JSON keys: posts | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/posts/:id` | Public board post | 공개: 로그인 불필요 | params id[path]:string* | `200` | JSON keys: post | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/posts/:id/comments` | Public replies on a board post | 공개: 로그인 불필요 | params id[path]:string* | `200` | JSON keys: comments | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/stock-posts` | 로그인 없이 공개 주식 게시글 조회 | 공개: 로그인 불필요 | params stock[query]:string* | `200` | JSON keys: posts | 게시글/댓글 목록 또는 상세 재조회 |
| `POST` | `/app-api/v1/board/stock-posts` | 주식 관련 게시글 작성 | 로그인 + 최신 동의 + CSRF(변경 요청) | body CreateStockPostDto (application/json) | `201` | JSON keys: post | 게시글/댓글 목록 또는 상세 재조회 |

### businesses — businesses
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/businesses` | Businesses the caller owns | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: businesses | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/:id/boost` | Equip a boost item from inventory to business | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body ApplyBoostDto (application/json) | `201` | direct JSON result; additive fields allowed | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/:id/settle-v2` | Settle a day of revenue with active boosts and double-entry ledger sink | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body IdempotentDto (application/json) | `201` | direct JSON result; additive fields allowed | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/:id/settlements` | Settle a day of revenue | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body IdempotentDto (application/json) | `201` | direct JSON result; additive fields allowed | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/activate-license` | Activate a business using a purchased license item from inventory | 로그인 + 최신 동의 + CSRF(변경 요청) | body ActivateLicenseDto (application/json) | `201` | direct JSON result; additive fields allowed | 내 사업/equity/catalog 관련 상태 재조회 |
| `GET` | `/app-api/v1/businesses/catalog` | App API alias: business types available to buy | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | App API alias: buy a business from the catalogue | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body IdempotentDto (application/json) | `201` | direct JSON result; additive fields allowed | 내 사업/equity/catalog 관련 상태 재조회 |
| `GET` | `/app-api/v1/businesses/equity` | App API alias: own capital available for a business purchase | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 내 사업/equity/catalog 관련 상태 재조회 |
| `GET` | `/app-api/v1/businesses/my-v2` | Enhanced businesses the caller owns with boosts and settlement status | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: businesses | 내 사업/equity/catalog 관련 상태 재조회 |

### casino — casino
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/casino/coin/fairness` | The disclosed win probability and the trial that evidences it | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/casino/coin/plays` | Stake WLD on one toss of the coin | 로그인 + 최신 동의 + CSRF(변경 요청) | body CasinoPlayDto (application/json) | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/casino/coin/terms` | The odds, the stake limits, and what today has already used | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/casino/dice/fairness` | Each dice game’s disclosed odds and the trial evidencing them | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/casino/dice/plays` | Stake WLD on one roll of the die | 로그인 + 최신 동의 + CSRF(변경 요청) | body CasinoDicePlayDto (application/json) | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/casino/games/terms` | Every game’s odds, payout and remaining exposure for today | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/casino/history` | Read the current member's recent casino plays | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/casino/self-limit` | Read the daily limits chosen by the current member | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 응답을 화면의 서버 기준 상태로 교체 |
| `PUT` | `/app-api/v1/casino/self-limit` | Set the daily caps and the lock the member holds themselves to | 로그인 + 최신 동의 + CSRF(변경 요청) | body CasinoSelfLimitDto (application/json) | `200` | JSON keys: daily_bet_limit, daily_loss_limit, locked_until | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### content — content
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/content/announcements` | App API: published announcements | 공개: 로그인 불필요 | 없음 / none | `200` | JSON keys: announcements | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/content/photos` | App API: published gallery photos | 공개: 로그인 불필요 | 없음 / none | `200` | JSON keys: photos | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/content/status` | Server status board | 공개: 로그인 불필요 | 없음 / none | `200` | JSON keys: status | 응답을 화면의 서버 기준 상태로 교체 |

### early-game — early-game
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `POST` | `/app-api/v1/early-game/claims` | Claim today’s event, once | 로그인 + 최신 동의 + CSRF(변경 요청) | body EarlyEventClaimDto (application/json) | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/early-game/first-day` | The seven steps of 16.1’s first day, counted from what happened | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: steps | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/early-game/today` | The event this member is dealt today, and whether it is still theirs | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: event | 응답을 화면의 서버 기준 상태로 교체 |

### engagement — engagement
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/engagement` | Today’s goals, this week’s goals, the next unlock and the preference | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/engagement/early-game` | The early-game weekly goals and collection books | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: goals, collections | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/engagement/npcs/:code/orders` | Take an order from an NPC | 로그인 + 최신 동의 + CSRF(변경 요청) | params code[path]:string*; body EngagementNpcOrderDto (application/json) | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `PUT` | `/app-api/v1/engagement/preferences` | Set whether the member hears about their goals | 로그인 + 최신 동의 + CSRF(변경 요청) | body EngagementPreferencesDto (application/json) | `200` | JSON keys: notifications_enabled | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### photos — photos
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/photos` | Published gallery photos | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: photos | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/photos` | Send an uploaded photo to the gallery for review | 로그인 + 최신 동의 + CSRF(변경 요청) | body PhotoSubmissionDto (application/json) | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/photos/mine` | The caller’s own submissions and where each one got to | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: submissions | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/photos/uploads` | Upload image bytes and receive a storage key | 로그인 + 최신 동의 + CSRF(변경 요청) | body Buffer (application/json) | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### privacy — privacy
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/privacy/requests` | Data subject requests the caller has made | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: requests | 개인정보 요청 목록 재조회 |
| `POST` | `/app-api/v1/privacy/requests` | Raise a data subject request | 로그인 + 최신 동의 + CSRF(변경 요청) | body CreatePrivacyRequestDto (application/json) | `201` | direct JSON result; additive fields allowed | 개인정보 요청 목록 재조회 |

### profile — profile
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/profile` | The caller’s own profile, with every field | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: displayName, imageUrl, joinedAt, jobType, jobLevel, workCompletions, visibility, featuredTitle, email, profile | 프로필 GET 재조회 후 화면 교체 |
| `PUT` | `/app-api/v1/profile` | Replace the caller’s profile and its per-field visibility | 로그인 + 최신 동의 + CSRF(변경 요청) | body ProfileUpdateDto (application/json) | `200` | JSON keys: settings | 프로필 GET 재조회 후 화면 교체 |
| `GET` | `/app-api/v1/profile/:userId` | Another member’s profile, as they have chosen to show it | 로그인 필요(기능에 따라 최신 동의 필요) | params userId[path]:string* | `200` | JSON keys: profile | 프로필 GET 재조회 후 화면 교체 |
| `DELETE` | `/app-api/v1/profile/image` | Remove the profile picture | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `204` | no response body | 프로필 GET 재조회 후 화면 교체 |
| `POST` | `/app-api/v1/profile/image` | Upload a profile picture, replacing the current one | 로그인 + 최신 동의 + CSRF(변경 요청) | body Buffer (application/json) | `201` | JSON keys: imagePath | 프로필 GET 재조회 후 화면 교체 |
| `GET` | `/app-api/v1/profile/settings` | The caller’s own profile settings, as stored | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: settings | 프로필 GET 재조회 후 화면 교체 |

### progression — progression
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/progression` | The caller’s growth stage and what unlocks the next one | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: progression | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/progression/credit` | The caller’s credit grade, what each grade buys, and their loans | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: grade, loans, ladder | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/progression/early-game` | The early-game unlock ladder and what the caller has reached | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: unlocks | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/progression/refreshes` | Recompute the caller’s growth stage from their progress | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `201` | JSON keys: progression | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### rewards — rewards
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/rewards/availability` | Next eligible times for the caller reward controls | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/rewards/daily/claims` | Claim the daily reward | 로그인 + 최신 동의 + CSRF(변경 요청) | body ClaimDto (application/json) | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/rewards/work/claims` | Retired legacy work faucet; use professional work tasks | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `201` | direct JSON result; additive fields allowed | work/profile/tasks/receipts 중 관련 상태 재조회 |

### seasons — seasons
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/seasons/events` | Active season events | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: events | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/seasons/events/:id/consumptions` | Spend on a season event | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body ConsumeDto (application/json) | `201` | direct JSON result; additive fields allowed | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/seasons/events/:id/leaderboard` | Leaderboard for one event | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string* | `200` | JSON keys: entries | 응답을 화면의 서버 기준 상태로 교체 |

### shop — shop
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/shop/catalog` | The catalogue with prices, stock, purchase limits and cosmetics | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: catalogItems | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/catalog/:id/purchases` | Buy a catalogue item | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body CatalogPurchaseDto (application/json) | `201` | direct JSON result; additive fields allowed | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/cosmetics/:userId` | Get active cosmetics equipped by a user | 로그인 필요(기능에 따라 최신 동의 필요) | params userId[path]:string* | `200` | JSON keys: cosmetics | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/holdings` | Catalogue items the caller holds | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: holdings | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/holdings/:id/consumptions` | Consume one held item | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body ItemConsumptionDto (application/json) | `201` | direct JSON result; additive fields allowed | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/holdings/:id/equip` | Equip or unequip a held cosmetic item | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string* | `201` | direct JSON result; additive fields allowed | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/holdings/:id/upkeep-settlements` | Pay the outstanding weekly upkeep on one held item | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body UpkeepSettlementDto (application/json) | `201` | direct JSON result; additive fields allowed | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/items` | Items currently on sale | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: items | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/items/:id/purchases` | Buy an item | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body PurchaseDto (application/json) | `201` | direct JSON result; additive fields allowed | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/public-catalog` | The catalogue with prices, stock and cosmetics for public browsing | 공개: 로그인 불필요 | 없음 / none | `200` | JSON keys: catalogItems | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/purchases` | Purchases made by the caller | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: purchases | holdings/purchases/관련 잔액 재조회 |

### stocks — stocks
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/stocks` | Listed stocks and their current prices | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: stocks | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/:id/candles` | Open/high/low/close for one stock at a given interval | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string*, interval[query]:string*, limit[query]:string* | `200` | JSON keys: interval, candles, range | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/stocks/:id/orders` | Buy or sell a stock | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body OrderDto (application/json) | `201` | direct JSON result; additive fields allowed | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/:id/prices` | Recorded price history for one stock | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string*, limit[query]:string* | `200` | JSON keys: prices | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/stocks/:id/watchlist` | Add or remove a stock from the caller watchlist | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body WatchlistDto (application/json) | `201` | direct JSON result; additive fields allowed | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/alerts` | Conditional virtual-stock alerts belonging to the caller | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: alerts | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/stocks/alerts` | Create a server-evaluated virtual-stock alert | 로그인 + 최신 동의 + CSRF(변경 요청) | body CreateStockAlertDto (application/json) | `201` | direct JSON result; additive fields allowed | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `DELETE` | `/app-api/v1/stocks/alerts/:id` | Delete one virtual-stock alert belonging to the caller | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string* | `200` | direct JSON result; additive fields allowed | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/alerts/events` | Recent virtual-stock alert events belonging to the caller | 로그인 필요(기능에 따라 최신 동의 필요) | params limit[query]:string* | `200` | JSON keys: events | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/history` | Trades made by the caller | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: trades | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/market-events` | Market events currently in effect | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: events | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/portfolio` | Holdings of the caller | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: holdings | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/sparklines` | Recent prices for every listed stock | 로그인 필요(기능에 따라 최신 동의 필요) | params limit[query]:string* | `200` | JSON keys: series | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/watchlist` | Stocks watched by the caller | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: stocks | 종목/포트폴리오/기록 중 관련 상태 재조회 |

### wallet — wallet
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/wallet` | Balances and recent ledger entries for the caller | 로그인 필요(기능에 따라 최신 동의 필요) | params recent[query]:string* | `200` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/wallet/transfers` | Send WLD to another member | 로그인 + 최신 동의 + CSRF(변경 요청) | body TransferDto (application/json) | `201` | direct JSON result; additive fields allowed | 지갑/은행 관련 GET 재조회 |

### work — work
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/work` | Caps, what has been paid against them, and open assignments | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/active-job` | Switch active job among 8 specialization careers | 로그인 + 최신 동의 + CSRF(변경 요청) | body JobSwitchDto (application/json) | `201` | direct JSON result; additive fields allowed | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/work/assignments` | The caller’s recent assignments | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: assignments | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/assignments` | Take a task | 로그인 + 최신 동의 + CSRF(변경 요청) | body WorkAssignmentDto (application/json) | `201` | direct JSON result; additive fields allowed | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/assignments/:id/completions` | Submit a taken task as done | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body WorkCompletionDto (application/json) | `201` | direct JSON result; additive fields allowed | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/assignments/:id/verify` | Verify a submitted task and pay it, within the caps | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body WorkCompletionDto (application/json) | `201` | direct JSON result; additive fields allowed | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/work/profile` | Current active job and all job masteries | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | direct JSON result; additive fields allowed | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/work/receipts` | What the work paid, and the ledger transaction it paid through | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: receipts | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/work/tasks` | Every task on offer, with this member’s standing against each | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON keys: tasks | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/tasks/:id/complete` | Directly complete a career task with EXP and instant WLD faucet payout | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body WorkCompleteTaskDto (application/json) | `201` | direct JSON result; additive fields allowed | work/profile/tasks/receipts 중 관련 상태 재조회 |

### media — media
| Method | App path | Purpose | Auth/CSRF | Request | Success | Response shape | After success |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/media/:key` | Bytes of a published gallery photo | 공개: 로그인 불필요 | params key[path]:string* | `200` | binary body | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/media/profile/:key` | Bytes of a member’s profile picture, on their terms | 공개: 로그인 불필요 | params key[path]:string* | `200` | binary body | 프로필 GET 재조회 후 화면 교체 |

## 7. Request DTO catalog
The following request DTOs are extracted from the backend OpenAPI contract. `*` means required. Do not send invented fields; whitelist/forbid validation may reject them with 400.

### `ActivateLicenseDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `catalogCode` | `string` | yes | example=biz_cvs_license |
| `idempotencyKey` | `string` | yes | format=uuid |

### `ApplyBoostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `boostCode` | `string` | yes | example=biz_cvs_boost_7d |

### `BankBondPurchaseDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `bondCode` | `BOND_7D | BOND_30D` | yes | example=BOND_7D; enum=BOND_7D,BOND_30D |
| `amount` | `string` | yes | example=10000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BankBorrowSmartDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `amount` | `string` | yes | example=5000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BankMovementDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `direction` | `deposit | withdraw` | yes | enum=deposit,withdraw |
| `amount` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BankRepayDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `loanId` | `string` | yes | format=uuid |
| `amount` | `string` | yes | example=1000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BankTransferDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `amount` | `string` | yes | example=1000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BorrowDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `principalAmount` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `Buffer`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| _(raw body)_ | bytes/object | endpoint-specific | See endpoint media type |

### `CasinoDicePlayDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |
| `game` | `dice_parity | dice_number` | yes | enum=dice_parity,dice_number |
| `choice` | `odd | even | 1 | 2 | 3 | 4 | 5 | 6` | yes | enum=odd,even,1,2,3,4,5,6 |
| `stake` | `number` | yes | min=1 |

### `CasinoPlayDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |
| `choice` | `heads | tails` | yes | enum=heads,tails |
| `stake` | `number` | yes | min=1 |

### `CasinoSelfLimitDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `dailyBetLimit` | `number` | yes | min=0 |
| `dailyLossLimit` | `number` | yes | min=0 |
| `lockedUntil` | `string` | no | format=date-time |

### `CatalogPurchaseDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |
| `quantity` | `number` | no | min=1; max=100; description=How many to buy; one when omitted |

### `ClaimDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `ConsentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `termsCompleted` | `boolean` | yes | - |
| `privacyCompleted` | `boolean` | yes | - |
| `ageConfirmed` | `boolean` | yes | - |
| `termsVersion` | `string` | yes | maxLen=64 |
| `privacyVersion` | `string` | yes | maxLen=64 |

### `ConsumeDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `quantity` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `CreateCommentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `body` | `string` | yes | maxLen=1000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `CreatePostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `title` | `string` | yes | maxLen=120 |
| `body` | `string` | yes | maxLen=5000 |
| `idempotencyKey` | `string` | yes | format=uuid |
| `imageStorageKey` | `string` | no | pattern=^[0-9a-f-]{36}\.(png\|jpg\|webp)$ |
| `imageAltText` | `string` | no | maxLen=300 |

### `CreatePrivacyRequestDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `requestType` | `access | correction | restriction | withdrawal | deletion` | yes | enum=access,correction,restriction,withdrawal,deletion |
| `detail` | `string` | no | maxLen=2000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `CreateStockAlertDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `stockId` | `string` | yes | format=uuid |
| `conditionKind` | `price_at_or_above | price_at_or_below | day_change_at_or_above | day_change_at_or_below` | yes | enum=price_at_or_above,price_at_or_below,day_change_at_or_above,day_change_at_or_below |
| `thresholdAmount` | `string` | no | description=Integer WLD threshold for price conditions |
| `thresholdBps` | `number` | no | min=-100000; max=100000 |
| `cooldownSeconds` | `number` | no | min=300; max=604800 |

### `CreateStockPostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `title` | `string` | yes | maxLen=120 |
| `body` | `string` | yes | maxLen=5000 |
| `idempotencyKey` | `string` | yes | format=uuid |
| `imageStorageKey` | `string` | no | - |
| `imageAltText` | `string` | no | maxLen=300 |
| `stockSymbol` | `string` | yes | example=WDX |
| `category` | `analysis | question | journal | business | system` | yes | enum=analysis,question,journal,business,system |
| `stance` | `bullish | neutral | bearish | none` | yes | enum=bullish,neutral,bearish,none |
| `positionDisclosure` | `holder | no_position | operator_related | undisclosed` | yes | enum=holder,no_position,operator_related,undisclosed |

### `DeleteCommentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `DeletePostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `EarlyEventClaimDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |
| `eventDate` | `string` | yes | description=The Asia/Seoul day the screen is showing; example=2026-08-31 |

### `EngagementNpcOrderDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `EngagementPreferencesDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `notificationsEnabled` | `boolean` | yes | - |

### `IdempotentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `IngestActivityEventsDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `events` | `array<ActivityEventItemDto>` | yes | - |

### `ItemConsumptionDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |

### `JobSwitchDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `jobType` | `developer | trader | entertainer | detective | miner | farmer | artisan | civil_servant` | yes | enum=developer,trader,entertainer,detective,miner,farmer,artisan,civil_servant |

### `LocalLoginDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `email` | `string` | yes | maxLen=254; example=member@example.com |
| `password` | `string` | yes | maxLen=128 |

### `LocalRegisterDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `email` | `string` | yes | maxLen=254; example=member@example.com |
| `password` | `string` | yes | maxLen=128; description=Non-empty password. No numeric minimum length is enforced. |
| `displayName` | `string` | yes | minLen=2; maxLen=120 |

### `LocalVerifyDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `token` | `string` | yes | minLen=32; maxLen=512 |

### `MobileHandoffDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `code` | `string` | yes | minLen=32; maxLen=512 |

### `OrderDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `side` | `buy | sell` | yes | enum=buy,sell |
| `quantity` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `PhotoSubmissionDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `storageKey` | `string` | yes | description=A key this server issued from POST /photos/uploads |
| `altText` | `string` | yes | maxLen=300 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `ProfileUpdateDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `visibility` | `public | members | private` | yes | enum=public,members,private |
| `displayName` | `string` | no | maxLen=80 |
| `imageUrl` | `string` | no | maxLen=2048 |
| `fieldVisibility` | `object` | no | example={'imageUrl': 'private', 'workCompletions': 'members'} |
| `featuredTitle` | `string` | no | maxLen=64 |

### `PurchaseDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |

### `RepayDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `amount` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `TransferDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `recipientUserId` | `string` | yes | format=uuid; description=Recipient user id |
| `amount` | `number` | yes | min=1; description=Amount in WLD |
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |

### `UpdatePostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `title` | `string` | yes | maxLen=120 |
| `body` | `string` | yes | maxLen=5000 |
| `idempotencyKey` | `string` | yes | format=uuid |
| `imageStorageKey` | `string` | no | pattern=^[0-9a-f-]{36}\.(png\|jpg\|webp)$ |
| `imageAltText` | `string` | no | maxLen=300 |

### `UpkeepSettlementDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |

### `WatchlistDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `watching` | `boolean` | yes | - |

### `WorkAssignmentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `taskId` | `string` | yes | format=uuid |
| `idempotencyKey` | `string` | yes | format=uuid |

### `WorkCompleteTaskDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `WorkCompletionDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |
| `evidence` | `string` | no | maxLen=1000 |

## 8. Response decoding rules for AI-generated clients

1. Read wrapper keys exactly as listed. Never silently rename `posts` to `items` or `catalogItems` to `items`.
2. `direct JSON result` means the controller returns its service/repository DTO directly. Use `operationId` and `responseShape` in `mobile-api-contract.json`, and ignore unknown additive fields.
3. Do not run binary media through a JSON decoder. Preserve Content-Type, ETag and range semantics.
4. A 204 response has no JSON body.
5. Keep semantic null separate from transport failure. `featuredTitle:null` is valid data; HTTP 503 is a failed read.
6. Parse timestamps with an ISO-8601 parser, never a locale-specific formatter.
7. Treat UUIDs as opaque identifiers.

## 9. Android/Kotlin network skeleton

```kotlin
interface MoneyverseApi {
    @GET("auth/viewer") suspend fun viewer(): ViewerResponse
    @GET("profile") suspend fun myProfile(): MyProfileResponse
    @GET("board/posts") suspend fun posts(): PostsResponse
}

// Use one persistent CookieJar for the entire app.
// Add X-CSRF-Token to writes when the current session has a token.
// On !response.isSuccessful decode ProblemDocument, not the success DTO.
```

## 10. Checklist for AI app generators

- Read `mobile-api-contract.json` first and generate method/path/request DTOs from it.
- Implement authentication from the runtime state machine.
- Connect every write to the authoritative re-fetch rule.
- Define UI placeholders for every nullable field.
- Generate an idempotency UUID once per logical command and reuse that same UUID for retries of that command.
- Honor `Retry-After` on 429 when present.
- Never log OAuth handoff codes, session cookies, CSRF tokens, passwords or internal tokens.
