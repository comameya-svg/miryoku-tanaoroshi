# テスト整合性ログ
### 最終チェック: 2026-10-06
- テストの期待値を実装に合わせて書き換えたもの: なし（wrapTextの行末禁則はテスト追加→実装修正の順）
- skip/only/todo: なし
- カバレッジ除外: src/app.js（DOM依存、E2E-01〜06で担保）、card.js の drawCard（c8 ignore、E2E-02とPNG目視で担保）
- 結果: unit 26/26 PASS、行96.12%・分岐98.15%・関数97.87%、static 7/7 PASS、E2E 6/6 PASS
