# Woldeok Moneyverse — 简体中文指南

[← 主 README](../README.md) · [更新日志](../docs/changelog/CHANGELOG.zh-CN.md) · [文档索引](../docs/INDEX.md)

Woldeok Moneyverse 是一个基于 **Next.js + NestJS + PostgreSQL** 的社区虚拟经济平台。WLD、股票、赌场游戏、职业奖励等均为服务内虚拟数据，不是现实货币或投资/赌博产品。

## 主要功能
- 职业、任务与职业 EXP
- 每日任务与长期成长
- WLD 钱包与双向账本记录
- 商店与库存
- 虚拟股票和企业
- 存款、利息、信用贷款和虚拟债券
- 服务端判定的虚拟赌场小游戏
- 管理员经济/运行控制界面

## 安全架构
浏览器只访问 Next.js；NestJS API 位于内部网络。关键经济写入由 PostgreSQL `SECURITY DEFINER` 函数执行，并在数据库中检查身份、政策、幂等性和账本一致性。

WLD 通过 API 使用规范化整数字符串传输，避免 JavaScript 浮点精度问题。

## 当前赌场基线
- 核心游戏 RTP：95%
- 单局：10–200 WLD
- 每日总投注：2,000 WLD
- 每日实际损失上限：1,000 WLD
- 用户可以设置更严格的个人限制/自我排除

更多信息请参阅 [文档索引](../docs/INDEX.md)。
