# Woldeok Moneyverse — 日本語ガイド

[← Main README](../README.md) · [変更履歴](../docs/changelog/CHANGELOG.ja.md) · [ドキュメント一覧](../docs/INDEX.md)

Woldeok Moneyverse は **Next.js / NestJS / PostgreSQL** で構築されたコミュニティ向け仮想経済サービスです。WLD、仮想株式、カジノ、仕事報酬はすべてサービス内部の仮想データで、現実の通貨・証券・ギャンブル商品ではありません。

## 主な機能
- 8職業、繰り返し業務、職業EXP
- デイリークエストと長期成長
- WLDウォレットと台帳
- ショップ/インベントリ
- 仮想株式/事業
- 預金、利息、信用ランク別ローン、仮想債券
- サーバー権威型の仮想カジノミニゲーム
- 管理者向け経済/運用画面

重要な経済更新は TypeScript から直接テーブルを更新せず、PostgreSQL `SECURITY DEFINER` 関数で認可・ポリシー・冪等性・台帳整合性を確認します。

WLD は API 上で整数文字列として扱い、JavaScript `Number` の精度問題を回避します。

現在のカジノ基準: RTP 95%、1回 10–200 WLD、1日総ベット 2,000 WLD、1日実損失 1,000 WLD。個人制限はさらに厳しく設定できます。

詳細は [ドキュメント一覧](../docs/INDEX.md) を参照してください。
