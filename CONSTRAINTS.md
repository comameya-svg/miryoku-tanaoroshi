# CONSTRAINTS（制約条件）

## 1. 実行制約
- 外部依存は Google Fonts のみ。npm 依存パッケージを追加しない（devDependencies も無し）。
- ビルド工程を作らない。ES Modules をそのまま配信する。

## 2. データ制約
- 利用者データは localStorage（キー `miryoku-tanaoroshi:v1`）のみ。外部送信しない。
- 1マス40文字、相手20文字、中心40文字まで。

## 3. セキュリティ制約
- 利用者入力の表示は textContent のみ。innerHTML / insertAdjacentHTML / document.write を使わない。
- 外部リンクは target="_blank" rel="noopener noreferrer"。

## 4. 権利・表記制約
- 「マンダラチャート」「マンダラート」をアプリ名・見出しに使わない。フッターに出典表記のみ。
- サミットLP以外のブランド（勤務先・自治体名）を記入例に出さない。

## 5. 承認ゲート
- GitHubへの公開（Publicリポジトリ作成・push・Pages設定）は社長の明示承認後のみ。
- 全消去は confirm() を通す。

## 6. 禁止事項（失敗学習で追記）
- （FP-001）配置用の固定height指定で日本語が溢れる → 折返しは measureText ベースで計算する
- （FP-002）hidden 属性で隠す要素に display を指定するクラスを付けるときは、`[hidden]{display:none!important}` を前提にする
- （FP-003）Canvasの文字折返しは行頭・行末の禁則を両方守る
