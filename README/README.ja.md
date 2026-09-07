# Woldeok Moneyverse — 日本語

Woldeok Moneyverse はコミュニティ向けの**仮想経済・成長ゲームプラットフォーム**です。

- Production: **https://easy-scraping.com**
- Test: **https://test.easy-scraping.com**
- Stack: Next.js · NestJS · PostgreSQL · Docker Compose · nginx

> WLD、仮想株式、カジノミニゲーム、職業報酬はすべてサービス内の仮想データであり、現実の通貨・証券・賭博商品ではありません。

## 主な機能

- 8職種、反復可能な仕事、WLD + 熟練度 EXP
- デイリーイベント、クエスト、収集、長期成長段階
- 台帳ベースのウォレットと経済取引
- ショップ、インベントリ、コレクション
- 仮想株式、事業、銀行、信用ローン、債券
- サーバー判定のコイン/ダイス系カジノとセルフリミット・自己除外

## ゲームバランス

カジノの結果と配当はブラウザではなくサーバー/DBが決定します。基準は最低 10 WLD、1回最大 200 WLD、1日総ベット 2,000 WLD、1日実損 1,000 WLD、RTP 95%です。

## セキュリティ

```text
Browser → Cloudflare → nginx → Next.js → NestJS → PostgreSQL SECURITY DEFINER → tables
```

アプリDBロールは主要な残高・台帳・ゲームテーブルを直接更新できません。重要な書き込みはDB関数とidempotency keyを経由します。

## レスポンシブUI

ロゴやナビゲーションはCSS breakpointの`display:none`/display utilitiesで切り替えます。DOMは保持されるため、ウィンドウ幅を戻すと自動で再表示されます。

開発は Node.js 24+ / pnpm 10 を使用し、DB schema の正本は `packages/database/migrations/` のSQL migrationです。
