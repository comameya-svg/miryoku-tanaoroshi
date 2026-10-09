# CLAUDE.md — 魅力×課題 棚卸しマス

## 1. 概要
Spiral up!!サミット（2026-10-12）横田潤一郎さん講演の参加者特典。9マス発想法（マンダラートを参考）で魅力と課題を書き出し、掛け合わせて「個性の一文」を作る静的Webアプリ。AIなし・サーバー保存なし。

## 2. 正本
- 要件: docs/SRS.md ／ 設計: docs/SDD.md ／ テスト: docs/TEST_PLAN.md, docs/E2E_SCENARIOS.md ／ 制約: CONSTRAINTS.md ／ 進捗: PROGRESS.md
- デザイン正本: サミットLP（C:\Users\comam\Desktop\ツール開発\LP制作ハーネス\作業用\いい11チーム_サミットLP_2026-10-02\html-package\index.html）

## 3. 構成
index.html / assets/style.css / src/{config,state,storage,progress,sentence,card,sample,app}.js / tests/unit / scripts/check.mjs

## 4. コマンド
- `npm test` … ユニットテスト
- `npm run coverage` … カバレッジ（行80%以上）
- `npm run check` … 静的チェック（外部送信なし・innerHTMLなし・サイズ・商標語）
- ローカル表示: .claude/launch.json の `mandalart`（python -m http.server 5173）

## 5. 変更の入口
- テーマ名・ヒント・文型・申込URL・出典文言 → src/config.js だけを直す
- 記入例 → src/sample.js

## 6. 絶対ルール
- 利用者の入力は textContent でのみ表示（innerHTML禁止）
- 外部送信（fetch/XHR/sendBeacon）禁止
- 名称・見出しに「マンダラチャート」「マンダラート」を使わない（出典表記のみ可）
- 全消去は確認ダイアログ必須
- 公開（GitHub push）は社長の明示承認後

## 7. 公開手順（承認後）
Publicリポジトリ `comameya-svg/<名前>` → main に push → Settings › Pages（main / root）。
