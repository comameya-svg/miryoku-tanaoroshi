# TEST_PLAN（IEEE 829 簡易版）

## 1. 対象
src/ の純粋モジュール（config, state, storage, progress, sentence, card のlayout/wrap, sample）と画面全体。

## 2. テストピラミッド
- ユニット（node:test）: 純粋関数を網羅。目標 行カバレッジ80%以上（app.js と card.js の描画部はDOM依存のため対象外とし、E2Eで担保）
- 静的チェック（scripts/check.mjs）: NFR-SEC-001/002、NFR-PERF-001、FR-LEGAL-001
- E2E（内蔵ブラウザ・Chromium）: docs/E2E_SCENARIOS.md の6本

## 3. テストケース（TC）
| TC | 内容 | 種別 |
|---|---|---|
| TC-FR-GRID-001 | setCenter→normalize→保存→読込で値が戻る | unit |
| TC-FR-GRID-002 | テーマ8件、魅力4・課題4、配置が上段/左＝魅力・右/下段＝課題 | unit |
| TC-FR-GRID-003 | 3マス記入で count=3 | unit |
| TC-FR-EDIT-002 | 各テーマのヒントが8件・空文字なし | unit |
| TC-FR-EDIT-003 | 41文字→40文字、前後空白除去 | unit |
| TC-FR-VIEW-001 | 9×9セル配列（81件）、記入済みフラグ、中心ブロックにテーマ名 | unit |
| TC-FR-MIX-001 | 記入済みリストは空欄を含まない、種類別 | unit |
| TC-FR-MIX-002 | 相手が空→「誰か」 | unit |
| TC-FR-MIX-003 | 3文型の文面一致、語句は「」付き、pattern範囲外は0 | unit |
| TC-FR-MIX-004 | 乱数注入でシャッフル結果が決定的、候補2以上で前回と別 | unit |
| TC-FR-MIX-005 | 魅力0件 or 課題0件で canMix=false | unit |
| TC-FR-CARD-001 | layout が 1080×1350、グリッド81セルが枠内 | unit＋E2E |
| TC-FR-CARD-002 | showText=false でセル文字が空、true で文字あり | unit |
| TC-FR-CARD-003 | canShare なしで共有ボタン非表示 | E2E |
| TC-FR-SAMPLE-001 | 記入例が normalize 済みで全テーマ1件以上、閲覧で保存データ不変 | unit＋E2E |
| TC-FR-CTA-001 | SESSION_URL が https、リンク属性 | unit＋E2E |
| TC-FR-STORE-001〜004 | save/load/clear、例外時 ok=false、不正JSON→空 | unit |
| TC-FR-LEGAL-001 | タイトル・見出しに商標語なし、フッターに出典 | static＋E2E |
| TC-NFR-SEC-001/002 | fetch/XHR/sendBeacon/innerHTML がソースにない | static |
| TC-NFR-PERF-001 | src合計 < 60KB | static |
| TC-NFR-USE-001 | 375px で scrollWidth ≤ 375 | E2E |

## 4. Entry / Exit / Suspension
- Entry: SRS/SDD 承認、全Must要件にTC接続
- Exit: unit 全PASS、行カバレッジ≥80%、static 全PASS、E2E 6本PASS
- Suspension: 同一失敗3回でアプローチ変更（failure_patterns.md へ記録）
