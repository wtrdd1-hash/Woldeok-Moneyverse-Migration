# Woldeok Moneyverse — 繁體中文

Woldeok Moneyverse 是面向社群的**虛擬經濟與成長遊戲平台**。

- 正式環境：**https://easy-scraping.com**
- 測試環境：**https://test.easy-scraping.com**
- 技術：Next.js · NestJS · PostgreSQL · Docker Compose · nginx

> WLD、虛擬股票、賭場小遊戲、職業獎勵等都是服務內的虛擬資料，並非真實貨幣、證券或賭博產品。

## 功能

- 8 種職業、可重複工作、WLD 與熟練度 EXP
- 每日事件、任務、收集與長期成長階段
- 以帳本為核心的錢包與經濟交易
- 商店、庫存、圖鑑與伺服器端價格
- 虛擬股票、企業、銀行、信用貸款與債券
- 伺服器判定的硬幣/骰子賭場小遊戲、個人限額與自我排除

## 平衡

目前賭場基準：最低 10 WLD、單局最高 200 WLD、每日總下注 2,000 WLD、每日實際損失 1,000 WLD、基準 RTP 95%。所有最終結果均由伺服器/資料庫決定。

## 安全

```text
Browser → Cloudflare → nginx → Next.js → NestJS → PostgreSQL SECURITY DEFINER → tables
```

應用程式 DB role 不能直接修改核心餘額、帳本與遊戲資料。重要寫入透過受控 DB function 與冪等鍵完成。

## 響應式設計

品牌與導覽使用 CSS breakpoint 的 `display:none` / display utilities 控制；調整視窗大小時可自然隱藏並再次顯示，而不是由 JavaScript 刪除 DOM。

開發使用 Node.js 24+ 與 pnpm 10；資料庫 schema 以 `packages/database/migrations/` 的 SQL migrations 為準。
