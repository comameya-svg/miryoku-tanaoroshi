# リサーチ V1
## 調査日: 2026-10-06
## 対象プロジェクト: 魅力×課題 棚卸しマス

### A. ツール/OSS
| ID | 項目 | 結果 | 信頼度 | 出典 |
|---|---|---|---|---|
| EV-A-01 | 外部ライブラリ（html2canvas等）を使わずPNG化できるか | Canvas 2D の fillText＋toBlob で自前描画すれば依存ゼロで可能 | A | https://developer.mozilla.org/docs/Web/API/CSS_Font_Loading_API |
| EV-A-02 | テスト基盤 | Node v24.14.0 標準の node:test と --experimental-test-coverage で依存ゼロ（ローカル確認済み） | A | ローカル `node -v` |
| EV-A-03 | E2E | Playwright 未導入（インストールはダウンロードを伴う）。Claude内蔵ブラウザ（preview）で手順書どおりに実行・記録する | B | ローカル確認 |

### B. API/規約
| ID | 項目 | 結果 | 信頼度 | 出典 |
|---|---|---|---|---|
| EV-B-01 | Web Share API でPNG共有 | HTTPS必須、canShare({files})で可否判定。未対応ブラウザが多いのでダウンロードを既定、共有は対応時のみ | A | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare ／ https://web.dev/patterns/files/share-files |
| EV-B-02 | Canvas でWebフォント | FontFaceSet.load() の完了を待ってから描画しないと代替フォントになる | A | https://developer.mozilla.org/docs/Web/API/CSS_Font_Loading_API |
| EV-B-03 | GitHub Pages | 無料プランはPublicリポジトリで公開（サミットLPで実績あり） | B | サミットLP運用実績（comameya-svg/spiral-up-summit） |
| EV-B-04 | localStorage | 同一オリジンのブラウザ内のみ保存。プライベートモード等で例外を投げうる→try/catch必須 | A | https://developer.mozilla.org/docs/Web/API/Window/localStorage |

### C. 手法・権利
| ID | 項目 | 結果 | 信頼度 | 出典 |
|---|---|---|---|---|
| EV-C-01 | 「マンダラチャート」 | 一般社団法人マンダラチャート協会等の登録商標。Web使用時は商標表記＋公式リンクを求めている。営利活用は事前相談 | A | https://mandalachart.jp/specification_regulations |
| EV-C-02 | 「マンダラート」 | 今泉浩晃氏が考案（1987）。登録商標の記載は確認できず（未確定） | B | https://ja.wikipedia.org/wiki/マンダラート |
| EV-C-03 | 手法の要点 | 3×3の中心にテーマ、周囲8マスに展開、各マスを中心に再度8マス（9×9） | B | 同上 |

### 未解決・要V2確認
- C系：名称の扱い（商標リスク回避方針）
- 個性の一文の文型（自由記述を差し込んでも不自然にならないか）
- 結果カードの共有時に個人的な課題が公開されるリスク
