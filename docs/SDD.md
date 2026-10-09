# SDD — 魅力×課題 棚卸しマス（IEEE 1016 簡易版）

## 1. 論理ビュー（コンポーネント）
| コンポーネント | ファイル | 責務 | DOM依存 | 対応要件 |
|---|---|---|---|---|
| Config | src/config.js | テーマ8種（ID/名前/種類/説明/ヒント8）、文型3種、申込URL、商標・出典文言 | なし | FR-GRID-002, FR-EDIT-002, FR-MIX-003, FR-CTA-001, NFR-MAINT-001 |
| State | src/state.js | 空データ生成・正規化（型/長さ/空白）・更新（純粋関数、新しいオブジェクトを返す） | なし | FR-GRID-001, FR-EDIT-003, DATA-001 |
| Storage | src/storage.js | localStorage アダプタ（load/save/clear、例外を結果値で返す） | Storage互換を注入 | FR-STORE-001〜004 |
| Progress | src/progress.js | テーマ別記入数、記入済みリスト（種類別）、9×9セル配列 | なし | FR-GRID-003, FR-VIEW-001, FR-MIX-001 |
| Sentence | src/sentence.js | 一文生成、ランダム選択（乱数注入） | なし | FR-MIX-002〜005 |
| Card | src/card.js | カード配置計算（純粋）＋Canvas描画＋文字折返し（measure注入） | Canvas（描画部のみ） | FR-CARD-001〜002 |
| Sample | src/sample.js | じゅんちゃん記入例データ | なし | FR-SAMPLE-001 |
| App | src/app.js | 画面遷移（hash）、イベント、描画（textContentのみ） | あり | 全画面 |

依存方向: App → (Config, State, Storage, Progress, Sentence, Card, Sample)。純粋モジュール同士は Config のみ参照。

## 2. プロセスビュー
- 起動: Storage.load → State.normalize → 画面描画（hash に応じて SCR-01〜06）
- 入力: input イベント → State.update → 300msデバウンスで Storage.save → 失敗時トースト（FR-STORE-003）
- カード: document.fonts.load（3書体）を最大3秒待つ → Card.layout → Card.draw → canvas.toBlob → ダウンロード（<a download>）／共有（canShare 時のみ）
- 全消去: confirm() → OK時のみ Storage.clear → 空データで再描画
- エラー: 例外はUIに案内表示し、データは書き換えない

## 3. データビュー
- DATA-001（SRS §4）を `miryoku-tanaoroshi:v1` に JSON 保存。normalize は未知キーを捨て、配列長8・文字数40に切り詰め、型不一致は既定値。
- 記入例（DATA-003）はメモリ上のみ。利用者データと混ぜない。

## 4. 物理ビュー
- 静的ファイルのみ。GitHub Pages（HTTPS）。ビルドなし。
```
index.html  assets/style.css  src/*.js  tests/unit/*.test.mjs  scripts/check.mjs  package.json
```

## 5. ADR
### ADR-001: フレームワーク・外部ライブラリを使わない
- 状態: 承認 ／ 理由: 当日まで6日、無料公開、保守者が非エンジニア。依存ゼロで壊れにくい ／ 代替案: React+Vite（ビルド工程が増える）、html2canvas（CDN依存・日本語折返しの不安定さ）／ 変更禁止レベル: 中
### ADR-002: PNGはCanvasへ自前描画
- 理由: 依存ゼロ、出力サイズ固定（1080×1350, SNS縦長）、中身を隠す制御が容易 ／ 代替案: DOMのスクショ（ライブラリ必須）
### ADR-003: 名称に商標語を使わない
- 理由: EV-C-01/C-02 ／ 決定: 名称「魅力×課題 棚卸しマス」、フッターに出典表記
### ADR-004: 利用者入力は textContent でのみ描画
- 理由: NFR-SEC-002（XSS防止）。テンプレートHTMLは固定文字列のみ innerHTML 可だが、本実装では DOM API で生成し innerHTML 自体を使わない

## 6. 横断ルール
- 外部送信なし（NFR-SEC-001）。破壊的操作は「全消去」のみ＝確認ゲート必須。
- 文言・テーマ・URLは config.js に集約。
- 色: LPのトークン（--sky-50/100/300, --navy, --text, --sun, --sun-soft）＋課題色 --kadai:#d6ecfb、魅力色 --miryoku:#fff1c2。ダークモードはLPと同値。

## 7. トレーサビリティ（要件↔モジュール↔TC）
SRS §6 の表に、上記コンポーネント表の「対応要件」列を加えたものを正とする。

## 8. 外部送信・課金
なし。DRY_RUN対象の外部アダプタは存在しない（HARNESS.md H1 参照）。
