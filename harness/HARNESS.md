# HARNESS（安全ハーネス仕様）

## H1: DRY_RUN
外部送信・課金・投稿を行うアダプタは存在しない（SDD §8）。公開操作（git push / Pages設定）は人手承認ゲート（H2）で代替。

## H2: 承認ゲート
- GitHub公開: 社長の明示承認がチャットにあるまで実行しない。
- 全消去: confirm() で利用者が承認。

## H3: 冪等性
save は同じ状態を何度書いても結果同一。normalize は冪等（normalize(normalize(x)) = normalize(x)、テストで検証）。

## H4: キルスイッチ
公開後の停止は GitHub Pages を無効化 or リポジトリを Private 化（社長操作）。

## H5: 監査ログ
利用者データは収集しない。変更履歴は git コミットで残す。

## 決定論センサー
| センサー | コマンド | 合格条件 |
|---|---|---|
| test | npm test | 全PASS |
| coverage | npm run coverage | 行≥80% |
| static | npm run check | 全PASS |
| e2e | 内蔵ブラウザで E2E-01〜06 | 全PASS |

## P/G/E
Planner＝SRS/SDD、Generator＝実装、Evaluator＝センサー＋レビュー（review-log.md）。
