# 失敗パターン

| ID | 事象 | 原因 | 対策（CONSTRAINTSへ昇格） |
|---|---|---|---|
| FP-001 | （設計時想定）日本語の折返しで文字があふれる | Canvasは自動折返ししない | measureTextで1文字ずつ折返し（wrapText）＋行数上限で「…」 |
| FP-002 | 「共有する」ボタンが hidden 属性でも表示された | .btn の display:inline-flex が [hidden] より優先 | `[hidden]{display:none!important}` を基本スタイルに置く |
| FP-003 | カードの一文で「（開きかっこ）が行末に残る | 行頭禁則のみ実装 | 行末禁則（「『（）を追加しテストで固定 |
