# 🌐 머니버스(Woldeok Moneyverse) 통합 REST API 마스터 레퍼런스

본 문서는 머니버스 프로덕션 시스템의 전체 **358개 REST API 엔드포인트**에 대한 포괄적이고 권위 있는 공식 기술 레퍼런스입니다.
모든 API는 금융 안전성, 엄격한 멱등성 계약, 원자적 이중 에스크로 및 WLD 통화 소각 규칙을 철저히 준수하도록 설계되었습니다.

---

## 🏛️ 주요 아키텍처 및 공통 호출 규격

### 1. 엔드포인트 베이스 URL
- **프로덕션 게이트웨이**: `https://easy-scraping.com`
- **API 프리픽스**: `/api/v1` (모바일 앱 게이트웨이: `/app-api/v1`)
- **테스트 환경**: `https://test.easy-scraping.com`

### 2. 표준 보안 및 인증 헤더
| 헤더명 | 필수 여부 | 설명 |
| :--- | :---: | :--- |
| `Cookie` | **필수** (보호 라우트) | `__Host-session=<UUID>` 브라우저/클라이언트 인증 세션 쿠키 |
| `x-csrf-token` | **필수** (상태 변경 C/U/D) | CSRF 공격 방지를 위한 이중 토큰 (Double Submit Cookie) |
| `x-internal-token` | **내부 전용** | Next.js BFF 및 내부 마이크로서비스 간 서버-투-서버 신뢰 토큰 (클라이언트 노출 금지) |
| `x-request-id` | 선택 | 분산 트레이싱 및 디버깅용 요청 고유 UUID |

### 3. 상태 변경 요청의 멱등성 (Idempotency Contract)
- 자산 이동, 결제, 상점 구매, 경매 입찰, 세금 납부 등 모든 상태 변경(POST/PUT) 엔드포인트는 클라이언트가 생성한 UUID v4 형식의 `idempotencyKey`를 본문에 포함해야 합니다.
- 동일한 키로 중복 요청 시, 시스템은 중복 거래를 실행하지 않고 최초 처리 결과를 캐시에서 원자적으로 반환합니다.

### 4. 통화 소각 코드 (Permanent Sinks)
머니버스는 통화 가치 안정화를 위해 다양한 소각 코드로 WLD를 100% 영구 폐기합니다:
- `SINK_PROPERTY_TAX`: 가상 부동산 일일 정액 보유세
- `SINK_AUCTION_FEE`: 경매 체결 시 2% 시스템 수수료
- `SINK_APPRAISAL_FEE`: 공인 시스템 감정소 발급 수수료 (`max(250 WLD, ceil(0.25%))`)
- `SINK_SUPPLY_CHAIN_PROCUREMENT`: 사업체 원자재 공급망 조달 수수료 (2%)
- `SINK_PROJECT_DONATION`: 공공 도시 인프라 크라우드펀딩 출자액 (100%)
- `SINK_HOUSING_PURCHASE`: 개인 공간 분양 대금 (100%)

---

## 📚 모듈별 상세 명세서 카탈로그 (Total: 358 Operations)

아래 각 도메인 링크를 클릭하여 파라미터, Request Body, Response 스키마 및 cURL 호출 예시를 확인하실 수 있습니다.

| 번호 | 도메인 명세서 파일 | 포함 태그 | API 개수 | 설명 |
| :---: | :--- | :--- | :---: | :--- |
| **01** | [01-auth-and-account.md](./01-auth-and-account.md) | `auth`, `account` | 28 | 로컬/소셜 인증, 세션, 2FA/TOTP, 비밀번호 관리 |
| **02** | [02-wallet-and-banking.md](./02-wallet-and-banking.md) | `wallet`, `banking`, `game-clock` | 23 | WLD 지갑, P2P 송금, 은행 예적금, 대출 및 포켓 |
| **03** | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) | `stocks`, `newspaper`, `businesses` | 34 | 가상 증시 호가/차트, 매수/매도, 경제 신문, 가상 사업체 공급망 |
| **04** | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) | `marketplace`, `crafting` | 17 | 고정가 장터, 에스크로 경매, P2P 1:1 직거래, 공인 감정소, 제작 |
| **05** | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) | `spaces`, `clubs`, `seasons`, `collections` | 33 | 부동산 분양/세무 구청(보유세 소각), 클럽 캔버스, 시즌 보상, 컬렉션 |
| **06** | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) | `work`, `casino`, `progression`, `engagement`, `early-game` | 33 | 직업 노동, 카지노(주사위/코인), 레벨업, 업적 |
| **07** | [07-community-board-chat.md](./07-community-board-chat.md) | `board`, `chat`, `content`, `profile`, `activity`, `discord` | 62 | 게시판 글/댓글, 실시간 채팅, 갤러리 미디어, 프로필 |
| **08** | [08-admin-control-tower.md](./08-admin-control-tower.md) | `admin`, `Admin Treasury`, `admin-security`, `safety`, `privacy`, `Health`, `Version` | 128 | 실시간 관제 타워, 국고, 감사 로그, 피처 플래그, 사용자 제재 |

---

## 🔎 전체 API 색인 테이블 (Total: 358 Endpoints)

| Method | Path | Summary | Domain Document |
| :---: | :--- | :--- | :--- |
| **DELETE** | `/account` | Delete the caller account | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/account/identities` | Sign-in methods linked to the caller | [01-auth-and-account.md](./01-auth-and-account.md) |
| **DELETE** | `/account/identities/{id}` | Unlink a sign-in method | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/account/identities/{provider}/link` | Begin linking another sign-in method | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/account/security/events` | Recent security events belonging to the caller | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/account/security/sessions` | Active sessions belonging to the caller | [01-auth-and-account.md](./01-auth-and-account.md) |
| **DELETE** | `/account/security/sessions/{id}` | Revoke one other active session belonging to the caller | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/account/security/sessions/revoke-others` | Revoke every other active session belonging to the caller | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/auth/{provider}/authorize` | Begin login with a provider | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/auth/{provider}/callback` | Complete an OAuth round trip | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/{provider}/reauthentication` | Begin step-up reauthentication with a provider | [01-auth-and-account.md](./01-auth-and-account.md) |
| **PUT** | `/auth/consent` | Record the authenticated member policy acknowledgement | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/email-change/complete` | Verify and activate a new login email | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/email-change/request` | Send a verification link for a new login email | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/login` | Sign in with first-party email/password credentials | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/password-reset/complete` | Consume a password reset token and replace the local password | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/password-reset/request` | Request a one-time local password reset link | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/password/change` | Change the current local password after recent reauthentication | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/reauthentication` | Confirm current member password | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/register` | Start first-party email/password registration | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/local/verify-email` | Verify first-party email and activate the account | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/logout` | End the session | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/mobile/handoff` | Exchange a one-time native OAuth handoff for an app session | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/auth/policy` | Currently published consent version | [01-auth-and-account.md](./01-auth-and-account.md) |
| **POST** | `/auth/prelogin-session` | Create or reuse the pre-login session | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/auth/providers` | Sign-in providers this deployment can offer | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/auth/session` | CSRF token for the current session | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/auth/viewer` | Session state for rendering navigation | [01-auth-and-account.md](./01-auth-and-account.md) |
| **GET** | `/bank/loans` | Outstanding loans for the caller | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/bank/loans` | Borrow from the virtual bank | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/bank/loans/{id}/repayments` | Repay part or all of a loan | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/bank/movements` | Move balance between cash and bank | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/bonds/{id}/redeem` | Redeem matured virtual bond and payout principal with yield | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/bonds/purchase` | Purchase 7-day or 30-day virtual government bonds | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/borrow` | Borrow smart credit loan evaluated by job level and business value | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/claim-interest` | Claim accrued compound deposit interest into bank balance | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/deposit` | Deposit WLD cash into bank compound interest deposit account | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **GET** | `/banking/pockets` | List all saving pockets for current user | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/pockets` | Create a new saving pocket | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **PUT** | `/banking/pockets/{id}` | Customize saving pocket appearance and theme | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/pockets/{id}/archive` | Archive saving pocket and recover all funds to cash balance | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/pockets/{id}/transfer` | Transfer funds between main bank balance and saving pocket | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/repay` | Repay active bank loan | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **GET** | `/banking/standing` | Bank overview: cash, deposit balance, compound interest, loans, bonds | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/banking/withdraw` | Withdraw WLD from bank deposit account to cash | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **GET** | `/game-clock` | Read the authoritative accelerated Moneyverse server day/week | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **GET** | `/rewards/availability` | Next eligible times for the caller reward controls | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/rewards/daily/claims` | Claim the daily reward | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/rewards/work/claims` | Retired legacy work faucet; use professional work tasks | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **GET** | `/wallet` | Balances and recent ledger entries for the caller | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **POST** | `/wallet/transfers` | Send WLD to another member | [02-wallet-and-banking.md](./02-wallet-and-banking.md) |
| **GET** | `/business-equity` | The own capital the caller can put behind a purchase | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/business-types` | Business types available to buy, excluding types already owned | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/business-types/{id}/purchases` | Buy a business of this type | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/businesses` | Businesses the caller owns | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/businesses/{id}/boost` | Equip a boost item from inventory to business | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/businesses/{id}/procure` | Procure raw materials for business with WLD payment | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/businesses/{id}/settle-v2` | Settle a day of revenue with active boosts and double-entry ledger sink | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/businesses/{id}/settlements` | Settle a day of revenue | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/businesses/{id}/storage/upgrade` | Upgrade business storage capacity | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/businesses/{id}/supply-chain` | Get supply chain inventory, storage capacity and demand factors | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/businesses/activate-license` | Activate a business using a purchased license item from inventory | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/businesses/catalog` | App API alias: business types available to buy, excluding owned types | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/businesses/catalog/{id}/purchases` | App API alias: buy a business from the catalogue | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/businesses/equity` | App API alias: own capital available for a business purchase | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/businesses/my-v2` | Enhanced businesses the caller owns with boosts and settlement status | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/newspaper/lore` | 주간 금융 개념 배움터 아티클 목록 조회 | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/newspaper/poll` | 주간 독자 여론조사 현황 조회 | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/newspaper/poll/vote` | 주간 독자 여론조사 투표 참여 | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/newspaper/pulse` | 실시간 월드 펄스 및 시장 심리 조회 | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks` | Listed stocks and their current prices | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/{id}/candles` | Open/high/low/close for one stock at a given interval | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/stocks/{id}/orders` | Buy or sell a stock | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/{id}/prices` | Recorded price history for one stock | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/stocks/{id}/watchlist` | Add or remove a stock from the caller watchlist | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/alerts` | Conditional virtual-stock alerts belonging to the caller | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/stocks/alerts` | Create a server-evaluated virtual-stock alert | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **DELETE** | `/stocks/alerts/{id}` | Delete one virtual-stock alert belonging to the caller | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/alerts/events` | Recent virtual-stock alert events belonging to the caller | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/halt-receipts` | Stock halt cost-basis settlement receipts for caller | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/history` | Trades made by the caller | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/market-events` | Market events currently in effect | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/portfolio` | Holdings of the caller | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/sparklines` | Recent prices for every listed stock | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **GET** | `/stocks/watchlist` | Stocks watched by the caller | [03-stocks-and-businesses.md](./03-stocks-and-businesses.md) |
| **POST** | `/crafting/execute` | Execute crafting recipe: consume materials and WLD fee to mint crafted item | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **GET** | `/crafting/recipes` | List all official crafting recipes with required materials and fees | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **GET** | `/marketplace/appraisals` | List my issued provenance appraisal certificates | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/appraisals` | Request system provenance appraisal for collectible with fee burn | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **GET** | `/marketplace/auctions` | List active live English auctions | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/auctions` | Create a new live English auction | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/auctions/{id}/bid` | Bid on a live English auction with escrow and anti-sniping extension | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **GET** | `/marketplace/listings` | List active player marketplace listings with filter and search | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/listings` | List an item for sale in player marketplace with escrow lock | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/listings/{id}/buy` | Buy a marketplace listing item with 1% burn fee and 99% seller settlement | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/listings/{id}/cancel` | Cancel active marketplace listing and recover item to inventory | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **GET** | `/marketplace/my-listings` | List current user marketplace listings and trade history | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **GET** | `/marketplace/trades` | List my P2P direct trades | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/trades` | Propose a new P2P 1:1 direct trade | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/trades/{id}/accept` | Accept a P2P 1:1 direct trade proposal (first step) | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/trades/{id}/cancel` | Cancel a P2P 1:1 direct trade | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **POST** | `/marketplace/trades/{id}/confirm` | Sign-off and execute dual atomic swap for P2P 1:1 trade | [04-marketplace-and-crafting.md](./04-marketplace-and-crafting.md) |
| **GET** | `/clubs` | 클럽 목록 탐색 및 검색 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/clubs` | 신규 클럽 창설 (10,000 WLD 소각) | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/clubs/{id}` | 클럽 상세 정보 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/clubs/{id}/canvas` | 클럽하우스 12x12 공유 캔버스 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **PUT** | `/clubs/{id}/canvas` | 클럽하우스 12x12 공유 캔버스 저장 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/clubs/{id}/feed` | 클럽 피드 글 목록 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/clubs/{id}/feed` | 클럽 피드 또는 공지사항 작성 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/clubs/{id}/join` | 클럽 공개 가입 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/clubs/{id}/leave` | 클럽 탈퇴 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/clubs/{id}/members` | 클럽 회원 명부 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **PATCH** | `/clubs/{id}/members/{userId}/role` | 클럽 회원 역할 변경 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/clubs/{id}/projects` | 협동 프로젝트 목록 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/clubs/{id}/projects/{projectId}/contributions` | 협동 프로젝트 WLD 펀딩 기여 (영구 소각) | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/collections` | 내 수집품 조각 목록 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **PUT** | `/collections/{id}` | 수집품 유저 메모 및 즐겨찾기 수정 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/collections/curation/advance` | 소유권 큐레이션 사다리 단계 진척 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/collections/curation/status` | D1~D7 소유권 큐레이션 사다리 상태 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/seasons/claim-rewards` | 시즌 보상 청구 및 수령 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/seasons/current` | 현재 시즌 정보 및 내 티어/랭킹 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/seasons/events` | Active season events | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/seasons/events/{id}/consumptions` | Spend on a season event | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/seasons/events/{id}/leaderboard` | Leaderboard for one event | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/seasons/hall-of-fame` | 역대 시즌 명예의 전당 헌액자 목록 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/seasons/settle` | 시즌 종료 정산 엔진 (명예의 전당 및 6대 티어 보상 분배) | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/spaces` | 내 개인 공간 목록 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/spaces/{id}` | 개인 공간 상세 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **PUT** | `/spaces/{id}/layout` | 개인 공간 인테리어/레이아웃 저장 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/spaces/{id}/tax/pay` | 개인 공간 일일 부동산세 납부 (100% 영구 소각) | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/spaces/{id}/tax/status` | 개인 공간 부동산세 상태 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/spaces/city/projects` | 공공 도시 프로젝트 목록 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/spaces/city/projects/{id}/contributions` | 공공 도시 프로젝트 펀딩 기여 (WLD 영구 소각) | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **POST** | `/spaces/purchase` | 개인 공간 구매 (WLD 소각) | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/spaces/tax/delinquencies` | 체납 공매 대상 공간 목록 조회 | [05-spaces-clubs-seasons.md](./05-spaces-clubs-seasons.md) |
| **GET** | `/casino/clock` | Read the authoritative accelerated server day and week | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/casino/coin/fairness` | The disclosed win probability and the trial that evidences it | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/casino/coin/plays` | Stake WLD on one toss of the coin | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/casino/coin/terms` | The odds, the stake limits, and what today has already used | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/casino/dice/fairness` | Each dice game’s disclosed odds and the trial evidencing them | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/casino/dice/plays` | Stake WLD on one roll of the die | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/casino/games/terms` | Every game’s odds, payout and remaining exposure for today | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/casino/history` | Read the current member's recent casino plays | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/casino/jackpot` | Read current casino house reserve and jackpot pool | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **PUT** | `/casino/self-limit` | Set the daily caps and the lock the member holds themselves to | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/casino/self-limit` | Read the daily limits chosen by the current member | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/casino/theme/plays` | Stake WLD on one play of a theme catalog game | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/early-game/claims` | Claim today’s event, once | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/early-game/first-day` | The seven steps of 16.1’s first day, counted from what happened | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/early-game/today` | The event this member is dealt today, and whether it is still theirs | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/engagement` | Today’s goals, this week’s goals, the next unlock and the preference | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/engagement/early-game` | The early-game weekly goals and collection books | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/engagement/npcs/{code}/orders` | Take an order from an NPC | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **PUT** | `/engagement/preferences` | Set whether the member hears about their goals | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/progression` | The caller’s growth stage and what unlocks the next one | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/progression/credit` | The caller’s credit grade, what each grade buys, and their loans | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/progression/early-game` | The early-game unlock ladder and what the caller has reached | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/progression/refreshes` | Recompute the caller’s growth stage from their progress | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/work` | Caps, what has been paid against them, and open assignments | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/work/active-job` | Switch active job among 8 specialization careers | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/work/assignments` | The caller’s recent assignments | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/work/assignments` | Take a task | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/work/assignments/{id}/completions` | Submit a taken task as done | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/work/assignments/{id}/verify` | Verify a submitted task and pay it, within the caps | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/work/profile` | Current active job and all job masteries | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/work/receipts` | What the work paid, and the ledger transaction it paid through | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **GET** | `/work/tasks` | Every task on offer, with this member’s standing against each | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/work/tasks/{id}/complete` | Directly complete a career task with EXP and instant WLD faucet payout | [06-gameplay-work-casino.md](./06-gameplay-work-casino.md) |
| **POST** | `/activity/events` | Ingest client activity telemetry events (page view, dwell, clicks) | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/admin/activity/logs` | List user activity logs for administrators | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/admin/activity/traffic` | Privacy-safe day/month/year traffic analytics for administrators | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/admin/announcements` | Create or edit an announcement | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/admin/announcements` | List all announcements for administrators | [07-community-board-chat.md](./07-community-board-chat.md) |
| **PUT** | `/admin/announcements/{id}` | Update an announcement | [07-community-board-chat.md](./07-community-board-chat.md) |
| **DELETE** | `/admin/announcements/{id}` | Delete an announcement | [07-community-board-chat.md](./07-community-board-chat.md) |
| **PUT** | `/admin/announcements/{id}/image` | Attach an uploaded image to a draft announcement | [07-community-board-chat.md](./07-community-board-chat.md) |
| **PUT** | `/admin/announcements/{id}/publication` | Publish or unpublish an announcement | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/admin/photos` | List all gallery photos for administrators | [07-community-board-chat.md](./07-community-board-chat.md) |
| **DELETE** | `/admin/photos/{id}` | Delete a draft or published photo | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/admin/photos/{id}/approval` | Approve and publish a pending member photo | [07-community-board-chat.md](./07-community-board-chat.md) |
| **PUT** | `/admin/photos/{id}/publication` | Publish or unpublish a photo | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/admin/photos/metadata` | Create or edit a photo record | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/admin/photos/submissions` | List pending photo submissions awaiting review | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/announcements` | Published announcements | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/images/{key}` | Read an image attached to a visible board post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/board/images/uploads` | Upload one image for a board post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/posts` | Recent member board posts | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/board/posts` | Write a post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/posts/{id}` | One post, with its body | [07-community-board-chat.md](./07-community-board-chat.md) |
| **PUT** | `/board/posts/{id}` | Rewrite your own post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **DELETE** | `/board/posts/{id}` | Delete your own post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/posts/{id}/comments` | The replies on a post, oldest first | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/board/posts/{id}/comments` | Reply to a post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **DELETE** | `/board/posts/{id}/comments/{commentId}` | Delete your own reply | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/public/images/{key}` | Public image attached to a visible board post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/public/posts` | Public recent board posts | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/public/posts/{id}` | Public board post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/public/posts/{id}/comments` | Public replies on a board post | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/board/public/stock-posts` | 엔드포인트 상세 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/board/stock-posts` | 엔드포인트 상세 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/chat/conversations` | 1:1 대화방 생성 또는 기존 대화방 조회 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/chat/conversations` | 참여 중인 1:1 대화방 목록 조회 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/chat/conversations/{id}/archive` | 대화방 보관 또는 보관 해제 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/chat/conversations/{id}/messages` | 대화방 메시지 이력 조회 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/chat/conversations/{id}/messages` | 대화방에 1:1 쪽지 메시지 전송 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/chat/conversations/{id}/mute` | 대화방 알림 음소거 또는 해제 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/chat/conversations/{id}/read` | 대화방 메시지 읽음 처리 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/chat/conversations/{id}/report` | 부적절한 대화 내용 신고 및 증거 스냅샷 접수 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/chat/unread-count` | 안 읽은 전체 쪽지 개수 조회 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/chat/users/{id}/block` | 특정 회원 1:1 쪽지 차단 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **DELETE** | `/chat/users/{id}/block` | 특정 회원 1:1 쪽지 차단 해제 | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/content/announcements` | App API: published announcements | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/content/photos` | App API: published gallery photos | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/content/status` | App API: service status board | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/integrations/discord/interactions` | Discord interaction webhook | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/media/{key}` | Bytes of a published gallery photo | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/media/profile/{key}` | Bytes of a member’s profile picture, on their terms | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/photos` | Published gallery photos | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/photos` | Send an uploaded photo to the gallery for review | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/photos/mine` | The caller’s own submissions and where each one got to | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/photos/uploads` | Upload image bytes and receive a storage key | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/profile` | The caller’s own profile, with every field | [07-community-board-chat.md](./07-community-board-chat.md) |
| **PUT** | `/profile` | Replace the caller’s profile and its per-field visibility | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/profile/{userId}` | Another member’s profile, as they have chosen to show it | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/profile/image` | Upload a profile picture, replacing the current one | [07-community-board-chat.md](./07-community-board-chat.md) |
| **DELETE** | `/profile/image` | Remove the profile picture | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/profile/settings` | The caller’s own profile settings, as stored | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/profile/titles` | Profile titles actually awarded to the caller | [07-community-board-chat.md](./07-community-board-chat.md) |
| **GET** | `/status` | Server status board | [07-community-board-chat.md](./07-community-board-chat.md) |
| **POST** | `/admin/ai-news/auto-generate` | Auto-generate and optionally publish market news based on currently registered active stocks | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/ai-news/batches` | Start a run that asks the model for five scenarios | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/ai-news/batches/latest` | The current batch of proposed scenarios, and the last run that asked for one | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/ai-news/models` | What the stored key can reach, as GET {base}/models lists it | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/ai-news/scenarios/{id}/discard` | Set a scenario aside | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/ai-news/scenarios/{id}/publish` | Publish a scenario as a market event, with the values the operator settled on | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/ai-news/settings` | API address, model name and whether a key is stored | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/ai-news/settings` | Store the model address, model name and, optionally, a new key | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/approvals` | Withdrawn: two-person approval was retired | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/approvals` | Withdrawn: two-person approval was retired | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/approvals/{id}/decisions` | Withdrawn: two-person approval was retired | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/audit-events` | Recent audit trail entries | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/audit/dispositions` | What was archived, destroyed or held | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/audit/dispositions` | Record what was decided about a range past its retention period | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/audit/events` | Search the audit trail; addresses and session hashes are masked | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/audit/events/{id}/reveal` | Unmask one entry; the reveal is itself recorded | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/audit/retention` | Retention periods, what is past them, and the last disposition | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/audit/retention/{category}` | Append a retention policy version for one category | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/audit/verifications` | Past chain verifications | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/audit/verify` | Recompute the hash chain over a window and record the result | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/bank` | Deposits and the loan book, with the credit ladder behind it | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/business-types` | Every business type, including inactive ones | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PATCH** | `/admin/business-types/{id}` | Rename, redescribe or deactivate a business type | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/controls` | Feature switches, economy policy versions and role assignments | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/controls/auto-policy` | Policy knobs plus classical proposal and matching AI review evidence | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/controls/auto-policy/knobs/{knobKey}` | Take one knob off automatic, or move its approved range | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/controls/auto-policy/runs` | Run the dual-lane automatic adjustment now instead of waiting for Monday | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/controls/consent-versions` | Publish a new terms and privacy policy version (Superadmin only) | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/controls/consent-versions` | List recent terms and privacy policy versions | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/controls/feature-switches/{featureKey}` | Enable, pause, put into safe mode or disable a feature | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/controls/feature-switches/economy_auto_policy` | Enable or pause the automatic economy policy without step-up | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/controls/policies` | Create an economy policy version, immediate or scheduled | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/controls/policies/activations` | Activate every policy version whose effective time has passed | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/controls/policies/rollbacks` | Return the economy to the previous policy version | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/controls/role-revocations` | Take back an administrative role | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/controls/roles` | Grant an administrative role, or move the superadmin designation | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/discord` | Discord delivery: which types are routed, and what is stuck | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/discord-outbox-events` | Recent Discord outbox deliveries | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy` | Money supply, issuance and burn, concentration and operational health | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy/ai-status` | Economy AI feature switch, latest council review and agent scoreboard | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy/alerts` | Alerts, unacknowledged first | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/economy/alerts/{id}/acknowledgements` | Acknowledge an alert | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/economy/bulk-payouts` | Pay every member the filter matches | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy/bulk-payouts/{id}/report` | Who was paid, who was skipped and who failed, one row each | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/economy/bulk-payouts/previews` | Count the members a payout would reach, and what it would cost | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/economy/killswitch` | Toggle master killswitch or module circuit breaker | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/economy/knobs-v2` | Update economic knobs (interest, bond yields, loan rates) | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy/macro-v2` | Admin Control Center 2.0 Macro Economy statistics | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy/reconciliations/latest` | Most recent economy reconciliation health snapshot | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy/scenario-lab/preview` | Read-only deterministic economy scenario projection | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy/stats` | Realtime Faucet vs Sink stats and circulation summary | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/economy/transactions/{id}/reversal` | Reverse one transaction, posting its opposite back to the ledger | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/economy/users/{id}/inspect-v2` | Inspect user wallet, deposits, loans, jobs, businesses | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/economy/users/{id}/override-v2` | Override user cash or bank balance (grant or confiscate WLD) | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/me` | Roles held by the caller | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/photos` | Upload image bytes to the private store | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/safety/chat-reports` | 관리자 1:1 개인 채팅 신고 큐 목록 조회 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/safety/chat-reports/{id}` | 관리자 1:1 개인 채팅 신고 상세 및 증거 스냅샷 열람 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/safety/chat-reports/{id}/action` | 관리자 1:1 개인 채팅 신고 조치 실행 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/safety/takedowns` | 관리자 긴급 콘텐츠 삭제 큐 조회 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/safety/takedowns/{caseId}/action` | 관리자 긴급 콘텐츠 삭제 조치 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/season-events` | Every season event, including inactive ones | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/season-events` | Create a season event in the active season | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PATCH** | `/admin/season-events/{id}` | Retitle, redescribe or deactivate a season event | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/security` | Console session state and login policy | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/security/forced-logouts` | End every live session a member holds | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/security/ip-blocks` | List current and historical service IP blocks | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/security/ip-blocks` | Block an IP address or CIDR until manually lifted | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **DELETE** | `/admin/security/ip-blocks/{id}` | Lift a service IP block | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/security/login-policies/{userId}` | Replace the address allowlist for an administrator | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/security/sessions` | Enter the operations console, rotating the session | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **DELETE** | `/admin/security/sessions` | Leave the operations console | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/security/users/{id}/permanent-suspension` | Permanently restrict a member and revoke all live sessions | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/shop/items` | List all items in the catalog for admin inspection | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PATCH** | `/admin/shop/items/{id}` | Update price, active status, or stock of a catalog item | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/stocks` | Every stock, including inactive ones | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/stocks` | List a new stock | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PATCH** | `/admin/stocks/{id}` | Rename, redescribe or deactivate a stock | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **DELETE** | `/admin/stocks/{id}` | Delete a stock that has no history | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/stocks/{id}/corporate-actions` | Apply a split or reverse split | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/stocks/{id}/halt` | Halt stock trading and auto-settle all holdings into cost-basis WLD | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/stocks/{id}/halt-settlement` | Get stock halt settlement progress and statistics | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/stocks/{id}/halt-settlement/retry` | Retry failed or quarantined stock halt settlements | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/stocks/{id}/price` | Set a stock price by hand | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/stocks/dynamics` | Trend, volatility and fair value per stock | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/stocks/market-events` | Recent market events, ended and cancelled included | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/stocks/market-events` | Publish a market event: news that leans the market | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **DELETE** | `/admin/stocks/market-events/{id}` | End a market event now | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/support/threads` | Administrator support inbox | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/support/threads/{id}/messages` | Read a support conversation as administrator | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/support/threads/{id}/messages` | Reply to a member support conversation | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/support/threads/{id}/status` | Change support conversation status | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/treasury/drain` | 국고 잉여 자금 영구 소각 (Step-Up/Admin) | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/treasury/inject` | 국고 자금 긴급 주입 (Step-Up/Admin) | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/treasury/overview` | 중앙 국고 및 비축금 현황 대시보드 조회 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/treasury/transactions` | 국고 원장 입출금 및 순환 감사 내역 조회 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/users` | Members and their status | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/users/{id}/portfolio` | Detailed user asset portfolio | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/users/{id}/restriction` | Restrict or unrestrict a member | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/work` | The work catalogue, the reward policy in force, and job levels | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/admin/work/auto-tune` | Automatically calculate and tune daily reward cap based on economy health | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PUT** | `/admin/work/policy` | Update work reward policy daily cap, weekly cap, and repeat decay | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/admin/work/stats` | Real-time 24h work ranking, daily cap usage buckets, and 7-day trend | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **PATCH** | `/admin/work/tasks/{id}` | Update base reward, duration, daily limit, and active state of a work task | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/health` | Liveness probe | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/privacy/requests` | Data subject requests the caller has made | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/privacy/requests` | Raise a data subject request | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/safety/takedown` | 비회원 공개 긴급 콘텐츠 삭제 접수 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **POST** | `/safety/takedown/status` | 비회원 접수 상태 조회 | [08-admin-control-tower.md](./08-admin-control-tower.md) |
| **GET** | `/version` | Backend runtime identity | [08-admin-control-tower.md](./08-admin-control-tower.md) |
