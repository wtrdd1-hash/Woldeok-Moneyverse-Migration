# Woldeok Moneyverse — 繁體中文指南

[← 主 README](../README.md) · [變更記錄](../docs/changelog/CHANGELOG.zh-TW.md) · [文件索引](../docs/INDEX.md)

Woldeok Moneyverse 是以 **Next.js + NestJS + PostgreSQL** 建構的社群虛擬經濟平台。WLD、虛擬股票、賭場遊戲與工作獎勵都只是服務內資料，不是現實貨幣或投資/博彩商品。

## 功能
- 職業、重複工作與職業 EXP
- 每日任務與長期成長
- WLD 錢包與帳本
- 商店與庫存
- 虛擬股票與企業
- 存款、利息、信用貸款與虛擬債券
- 由伺服器決定結果的虛擬賭場小遊戲
- 管理員營運/經濟工具

## 安全核心
瀏覽器不直接存取 NestJS 或經濟資料表。重要寫入由 PostgreSQL `SECURITY DEFINER` 函數驗證使用者、政策、冪等鍵與帳本一致性。

WLD 在 API 中維持整數字串，避免 JavaScript `Number` 精度損失。

目前核心賭場基準為 95% RTP、每局 10–200 WLD、每日總投注 2,000 WLD、每日實際損失 1,000 WLD；會員可設定更嚴格的個人限制。

詳見 [文件索引](../docs/INDEX.md)。
