# PROGRESS（進捗・完了定義）

## 全体ステータス: 公開待ち（社長承認待ち）

### Phase 別進捗
| Phase | 状態 | 成果物 |
|---|---|---|
| 0 ヒアリング | 完了 | research/intake_sheet.md |
| 1 リサーチ | 完了 | research/research_v1.md, research_v2.md |
| 2 SRS | 完了 | docs/SRS.md |
| 3 SDD | 完了 | docs/SDD.md, CLAUDE.md |
| 4 テスト/ハーネス | 完了 | docs/TEST_PLAN.md, docs/E2E_SCENARIOS.md, harness/HARNESS.md, CONSTRAINTS.md |
| 5 レビュー | GO | harness/review-log.md ほか |
| 6 実装 | 完了 | index.html, assets/style.css, src/*.js |
| 7 検証 | Green | unit 26/26・カバレッジ行96%・static 7/7・E2E 6/6 |
| 8 本番移行 | 条件付き承認（公開は社長承認後） | 下記 PRR |

### DoD チェックリスト
- [x] 全Must要件に受入基準とTC
- [x] unit 全PASS／カバレッジ80%以上
- [x] static 全PASS（外部送信なし・innerHTMLなし・商標語なし）
- [x] E2E 6本 PASS（スマホ幅・ダークモード目視含む）
- [x] 記入例に勤務先・自治体名なし
- [ ] GitHub Pages 公開（社長承認待ち）
- [ ] 実機（iPhone Safari / LINEアプリ内ブラウザ）での保存確認

## PRR（Google SRE 簡易版）
| 領域 | 判定 | メモ |
|---|---|---|
| アーキテクチャ | OK | 静的ファイルのみ、依存ゼロ |
| 容量 | OK | GitHub Pages、src 約37KB |
| 信頼性 | OK | 保存失敗・破損データでも動作 |
| 監視 | LOW-NG | アクセス解析なし（個人情報を集めない方針のため意図的） |
| セキュリティ | OK | 外部送信なし・textContentのみ |
| 自動化 | OK | npm test / coverage / check |
| 外部依存 | OK | Google Fontsのみ（失敗時は代替書体） |
| スケジュール | OK | 10/12に間に合う |
| 成長性 | OK | テーマ・文型は config.js で追加可 |
| ドキュメント | OK | CLAUDE.md・SRS・SDD |
**総合: 条件付き承認（LOW-NG 1件）**。条件: 公開は社長承認後、公開後に実機（iPhone/LINE）で保存を確認。

## 残作業
- 即時: 公開（Publicリポジトリ作成→push→Pages）、講演スライドの特典表記を差し替え、QRコード作成
- 短期: 申込先URLの確定（現在は横田さんの問い合わせフォーム）
- DEFER: テーマ名の編集、JSON書き出し、PDF印刷
