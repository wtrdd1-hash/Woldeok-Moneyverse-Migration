# Woldeok Moneyverse — 简体中文

Woldeok Moneyverse 是一个面向社区的**虚拟经济与成长游戏平台**。

- 正式环境：**https://easy-scraping.com**
- 测试环境：**https://test.easy-scraping.com**
- 技术栈：Next.js · NestJS · PostgreSQL · Docker Compose · nginx

> WLD、虚拟股票、赌场小游戏、职业奖励等均为服务内部虚拟数据，不是真实货币、证券或赌博产品。

## 主要功能

- 8 种职业、重复职业任务、WLD 与熟练度 EXP
- 每日事件、任务、收集与长期成长阶段
- 基于账本的钱包与经济交易
- 商店、库存、图鉴与服务器端定价
- 虚拟股票、企业、银行、信用贷款与债券
- 服务器判定的硬币/骰子赌场小游戏，并支持个人限额与自我排除

## 游戏平衡

赌场结果与赔率全部由服务器/数据库决定。当前基础限制：

- 最低下注：10 WLD
- 单局最高：200 WLD
- 每日总下注：2,000 WLD
- 每日实际亏损：1,000 WLD
- 基础 RTP：95%

用户可以设置更严格的个人下注/亏损限额。自我排除锁定期间，游戏和限额修改都会被禁止。

## 安全架构

```text
浏览器 → Cloudflare → nginx → Next.js → NestJS → PostgreSQL SECURITY DEFINER → 数据表
```

应用数据库角色不能直接修改核心余额、账本和游戏表。经济写操作必须通过经过审查的数据库函数和幂等键完成。

## 响应式界面

顶部品牌和导航通过 CSS breakpoint 的 `display:none` / display 工具切换。元素不会被 JavaScript 删除，因此调整窗口宽度时会自动隐藏并重新显示。

## 开发与部署

要求 Node.js 24+、pnpm 10。数据库结构以 `packages/database/migrations/` 中的顺序 SQL migration 为唯一来源。

部署顺序：CI 检查 → Test 部署验证 → Production 加密备份 → Production 部署 → 公网与 DB 不变量验证。
