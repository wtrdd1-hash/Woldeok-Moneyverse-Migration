# 라우트 대조표

원본 애플리케이션 라우트 92개와 이 저장소에서 그것을 대신하는 경로.

**이 문서는 `packages/contract/src/route-map.ts`에서 생성된다. 직접 편집하지 않는다.**

목록의 출처는 route-surface 스냅샷이 **아니다.** 그 파일은 손으로 유지한 프로브 목록이라
`(discord|google)` 대안의 google 쪽, `/api/v1/bank/withdraw`, 보상 명령 둘,
`/sitemap.xml`, `/discord/interactions`, `/media/*`를 한 번도 건드리지 않았다.
스냅샷을 믿고 만든 초판은 10개가 모자랐다. 목록은
`scripts/extract-original-routes.py`가 라우트 모듈에서 직접 뽑는다.

`/assets/*`는 빠져 있다 — Next.js가 해시 붙은 자체 자산 URL을 내보내므로 후계 경로가 없다.

| 원본 | 새 경로 | 모듈 | 비고 |
|---|---|---|---|
| `GET /robots.txt` | `GET /robots.txt` | frontend |  |
| `GET /health` | `GET /health` | health |  |
| `GET /login` | `GET /login` | frontend |  |
| `GET /login/providers` | `GET /login/providers` | frontend |  |
| `POST /api/prelogin-consent` | `PUT /api/v1/auth/consent` | auth |  |
| `POST /auth/logout` | `POST /api/v1/auth/logout` | auth |  |
| `GET /auth/discord/start` | `GET /auth/discord/authorize` | auth |  |
| `GET /auth/discord/callback` | `GET /auth/discord/callback` | auth |  |
| `GET /account` | `GET /account` | frontend |  |
| `GET /api/v1/account/identities` | `GET /api/v1/account/identities` | account |  |
| `POST /api/v1/account/delete` | `DELETE /api/v1/account` | account |  |
| `POST /api/v1/account/identities/00000000-0000-4000-8000-000000000000/unlink` | `DELETE /api/v1/account/identities/{id}` | account |  |
| `POST /api/v1/account/link/discord/start` | `POST /api/v1/account/identities/discord/link` | account |  |
| `POST /api/v1/account/reauth/discord/start` | `POST /api/v1/auth/discord/reauthentication` | auth |  |
| `GET /wallet` | `GET /wallet` | frontend |  |
| `GET /api/v1/wallet` | `GET /api/v1/wallet` | wallet |  |
| `POST /api/v1/wallet/transfers` | `POST /api/v1/wallet/transfers` | wallet |  |
| `POST /api/v1/bank/deposit` | `POST /api/v1/bank/movements` | wallet |  |
| `GET /api/v1/bank/loans` | `GET /api/v1/bank/loans` | wallet |  |
| `POST /api/v1/bank/loans` | `POST /api/v1/bank/loans` | wallet |  |
| `POST /api/v1/bank/loans/00000000-0000-4000-8000-000000000000/repay` | `POST /api/v1/bank/loans/{id}/repayments` | wallet |  |
| `GET /stocks` | `GET /stocks` | frontend |  |
| `GET /api/v1/stocks` | `GET /api/v1/stocks` | stock |  |
| `GET /api/v1/stocks/portfolio` | `GET /api/v1/stocks/portfolio` | stock |  |
| `GET /api/v1/stocks/history` | `GET /api/v1/stocks/history` | stock |  |
| `POST /api/v1/stocks/trade` | `POST /api/v1/stocks/{id}/orders` | stock |  |
| `GET /api/v1/stocks/00000000-0000-4000-8000-000000000000/prices` | `GET /api/v1/stocks/{id}/prices` | stock |  |
| `GET /businesses` | `GET /businesses` | frontend |  |
| `GET /api/v1/businesses` | `GET /api/v1/business-types` | business |  |
| `GET /api/v1/businesses/mine` | `GET /api/v1/businesses` | business |  |
| `POST /api/v1/businesses/purchase` | `POST /api/v1/business-types/{id}/purchases` | business |  |
| `POST /api/v1/businesses/00000000-0000-4000-8000-000000000000/settle` | `POST /api/v1/businesses/{id}/settlements` | business |  |
| `GET /seasons` | `GET /seasons` | frontend |  |
| `GET /api/v1/seasons/events` | `GET /api/v1/seasons/events` | season |  |
| `POST /api/v1/seasons/events/consume` | `POST /api/v1/seasons/events/{id}/consumptions` | season |  |
| `GET /api/v1/seasons/events/00000000-0000-4000-8000-000000000000/leaderboard` | `GET /api/v1/seasons/events/{id}/leaderboard` | season |  |
| `GET /shop` | `GET /shop` | frontend |  |
| `GET /api/v1/shop` | `GET /api/v1/shop/items` | shop |  |
| `GET /api/v1/shop/purchases` | `GET /api/v1/shop/purchases` | shop |  |
| `POST /api/v1/shop/purchases` | `POST /api/v1/shop/items/{id}/purchases` | shop |  |
| `GET /board` | `GET /board` | frontend |  |
| `POST /api/v1/board/posts` | `POST /api/v1/board/posts` | board |  |
| `DELETE /api/v1/board/posts/00000000-0000-4000-8000-000000000000` | `DELETE /api/v1/board/posts/{id}` | board |  |
| `GET /` | `GET /` | frontend |  |
| `GET /announcements` | `GET /announcements` | frontend |  |
| `GET /gallery` | `GET /gallery` | frontend |  |
| `GET /status` | `GET /status` | frontend |  |
| `GET /terms` | `GET /terms` | frontend |  |
| `GET /privacy` | `GET /privacy` | frontend |  |
| `GET /api/v1/announcements` | `GET /api/v1/announcements` | content |  |
| `GET /api/v1/gallery` | `GET /api/v1/photos` | content |  |
| `GET /api/v1/status` | `GET /api/v1/status` | content |  |
| `GET /api/v1/privacy/requests` | `GET /api/v1/privacy/requests` | privacy |  |
| `POST /api/v1/privacy/requests` | `POST /api/v1/privacy/requests` | privacy |  |
| `GET /admin` | `GET /admin` | frontend |  |
| `GET /admin/content` | `GET /admin/content` | frontend |  |
| `GET /admin/minecraft` | `GET /admin/minecraft` | frontend |  |
| `GET /api/v1/admin/me` | `GET /api/v1/admin/me` | admin |  |
| `GET /api/v1/admin/users` | `GET /api/v1/admin/users` | admin |  |
| `POST /api/v1/admin/users/00000000-0000-4000-8000-000000000000/restriction` | `PUT /api/v1/admin/users/{id}/restriction` | admin |  |
| `GET /api/v1/admin/approvals` | `GET /api/v1/admin/approvals` | admin |  |
| `POST /api/v1/admin/approvals` | `POST /api/v1/admin/approvals` | admin |  |
| `POST /api/v1/admin/approvals/00000000-0000-4000-8000-000000000000/decision` | `POST /api/v1/admin/approvals/{id}/decisions` | admin |  |
| `GET /api/v1/admin/audit-events` | `GET /api/v1/admin/audit-events` | admin |  |
| `GET /api/v1/admin/discord-outbox-events` | `GET /api/v1/admin/discord-outbox-events` | admin |  |
| `GET /api/v1/admin/economy/reconciliation/latest` | `GET /api/v1/admin/economy/reconciliations/latest` | admin |  |
| `GET /api/v1/admin/stocks` | `GET /api/v1/admin/stocks` | admin |  |
| `POST /api/v1/admin/stocks` | `POST /api/v1/admin/stocks` | admin |  |
| `PATCH /api/v1/admin/stocks/00000000-0000-4000-8000-000000000000` | `PATCH /api/v1/admin/stocks/{id}` | admin |  |
| `POST /api/v1/admin/stocks/00000000-0000-4000-8000-000000000000/corporate-actions` | `POST /api/v1/admin/stocks/{id}/corporate-actions` | admin |  |
| `GET /api/v1/admin/businesses` | `GET /api/v1/admin/business-types` | admin |  |
| `PATCH /api/v1/admin/businesses/00000000-0000-4000-8000-000000000000` | `PATCH /api/v1/admin/business-types/{id}` | admin |  |
| `GET /api/v1/admin/season-events` | `GET /api/v1/admin/season-events` | admin |  |
| `POST /api/v1/admin/season-events` | `POST /api/v1/admin/season-events` | admin |  |
| `PATCH /api/v1/admin/season-events/00000000-0000-4000-8000-000000000000` | `PATCH /api/v1/admin/season-events/{id}` | admin |  |
| `POST /api/v1/admin/photos/upload` | `POST /api/v1/admin/photos` | admin |  |
| `POST /api/v1/admin/content/announcements` | `POST /api/v1/admin/announcements` | content |  |
| `POST /api/v1/admin/content/announcements/00000000-0000-4000-8000-000000000000/publication` | `PUT /api/v1/admin/announcements/{id}/publication` | content |  |
| `POST /api/v1/admin/content/photos` | `POST /api/v1/admin/photos/metadata` | content |  |
| `POST /api/v1/admin/content/photos/00000000-0000-4000-8000-000000000000/publication` | `PUT /api/v1/admin/photos/{id}/publication` | content |  |
| `POST /api/v1/admin/minecraft/operations` | `POST /api/v1/admin/minecraft/operations` | minecraft |  |
| `GET /api/v1/admin/minecraft/operations/00000000-0000-4000-8000-000000000000` | `GET /api/v1/admin/minecraft/operations/{id}` | minecraft |  |
| `GET /sitemap.xml` | `GET /sitemap.xml` | frontend |  |
| `POST /discord/interactions` | `POST /api/v1/integrations/discord/interactions` | discord |  |
| `GET /auth/google/start` | `GET /auth/google/authorize` | auth |  |
| `GET /auth/google/callback` | `GET /auth/google/callback` | auth |  |
| `POST /api/v1/account/link/google/start` | `POST /api/v1/account/identities/google/link` | account |  |
| `POST /api/v1/account/reauth/google/start` | `POST /api/v1/auth/google/reauthentication` | auth |  |
| `POST /api/v1/bank/withdraw` | `POST /api/v1/bank/movements` | wallet | merged with bank/deposit into one movements endpoint carrying a direction |
| `POST /api/v1/rewards/daily` | `POST /api/v1/rewards/daily/claims` | wallet |  |
| `POST /api/v1/rewards/work` | `POST /api/v1/rewards/work/claims` | wallet |  |
| `GET /media/{key}` | `GET /media/{key}` | frontend |  |
