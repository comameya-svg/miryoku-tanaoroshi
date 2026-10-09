import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, PATTERNS, SESSION_URL, MAX_CELL, themeById, STORAGE_KEY } from '../../src/config.js';
import { createEmpty, normalize, setCenter, setCell, setMix, setShowText, clampText } from '../../src/state.js';
import * as storage from '../../src/storage.js';
import { countFilled, totalFilled, filledItems, grid81, slotToIndex } from '../../src/progress.js';
import { canMix, buildSentence, shufflePicks, ensurePicks, pickedText } from '../../src/sentence.js';
import { sampleState } from '../../src/sample.js';

function memStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), map: m };
}
const broken = { getItem() { throw new Error('x'); }, setItem() { throw new Error('quota'); }, removeItem() { throw new Error('x'); } };

test('TC-FR-GRID-002 テーマは8件・魅力4/課題4・配置', () => {
  assert.equal(THEMES.length, 8);
  assert.equal(THEMES.filter((t) => t.kind === 'miryoku').length, 4);
  assert.equal(THEMES.filter((t) => t.kind === 'kadai').length, 4);
  assert.deepEqual(THEMES.map((t) => t.pos).sort(), [0, 1, 2, 3, 5, 6, 7, 8]);
  assert.ok(THEMES.filter((t) => t.kind === 'miryoku').every((t) => t.pos < 4));
  assert.equal(themeById('k1').name, '悔しかった経験');
  assert.equal(themeById('zz'), null);
});

test('TC-FR-EDIT-002 各テーマのヒントは8件で空がない', () => {
  for (const t of THEMES) {
    assert.equal(t.hints.length, 8, t.id);
    assert.ok(t.hints.every((h) => h.trim().length > 0));
  }
});

test('TC-FR-CTA-001 申込URLはhttps', () => {
  assert.match(SESSION_URL, /^https:\/\//);
});

test('TC-FR-EDIT-003 40文字制限と前後空白の除去', () => {
  const long = 'あ'.repeat(41);
  assert.equal(clampText(long, MAX_CELL).length, 40);
  assert.equal(clampText('  ことば  ', 40), 'ことば');
  assert.equal(clampText(123, 40), '');
  const s = setCell(createEmpty(), 'm1', 0, ` ${long} `);
  assert.equal(Array.from(s.cells.m1[0]).length, 40);
  // 絵文字（サロゲートペア）も1文字として数える
  assert.equal(Array.from(clampText('😀'.repeat(45), 40)).length, 40);
});

test('TC-FR-GRID-001 中心の名前が保存・復元される', () => {
  const st = memStorage();
  const s = setCenter(createEmpty(), 'じゅんちゃん');
  assert.equal(storage.save(st, s, () => '2026-10-06T00:00:00Z').ok, true);
  const r = storage.load(st);
  assert.equal(r.ok, true); assert.equal(r.restored, true);
  assert.equal(r.state.center, 'じゅんちゃん');
  assert.equal(r.state.savedAt, '2026-10-06T00:00:00Z');
  assert.ok(st.map.has(STORAGE_KEY));
});

test('TC-FR-GRID-003 記入数', () => {
  let s = createEmpty();
  s = setCell(s, 'm1', 0, 'a'); s = setCell(s, 'm1', 3, 'b'); s = setCell(s, 'm1', 7, 'c'); s = setCell(s, 'k2', 1, 'd');
  assert.equal(countFilled(s, 'm1'), 3);
  assert.equal(countFilled(s, 'nope'), 0);
  assert.equal(totalFilled(s), 4);
  s = setCell(s, 'm1', 3, '   ');
  assert.equal(countFilled(s, 'm1'), 2);
});

test('setCell は範囲外を無視し、元の状態を変えない（不変）', () => {
  const s = createEmpty();
  assert.equal(setCell(s, 'zz', 0, 'a'), s);
  assert.equal(setCell(s, 'm1', 8, 'a'), s);
  assert.equal(setCell(s, 'm1', -1, 'a'), s);
  const t = setCell(s, 'm1', 0, 'a');
  assert.equal(s.cells.m1[0], '');
  assert.equal(t.cells.m1[0], 'a');
});

test('TC-FR-VIEW-001 9×9は81マス・中心ブロックにテーマ名・記入済みフラグ', () => {
  const s = setCell(setCenter(createEmpty(), '私'), 'k4', 7, '変えたい');
  const g = grid81(s);
  assert.equal(g.length, 81);
  const center = g.find((c) => c.row === 4 && c.col === 4);
  assert.equal(center.type, 'center'); assert.equal(center.text, '私');
  assert.equal(g.filter((c) => c.type === 'theme').length, 16);
  const filled = g.filter((c) => c.type === 'cell' && c.filled);
  assert.equal(filled.length, 1);
  assert.deepEqual([filled[0].row, filled[0].col, filled[0].themeId, filled[0].index], [8, 8, 'k4', 7]);
  assert.equal(g.filter((c) => c.type === 'cell').length, 64);
  assert.equal(slotToIndex(3), 3); assert.equal(slotToIndex(5), 4);
  // 中心ブロックの上段左は魅力テーマ m1
  assert.equal(g.find((c) => c.row === 3 && c.col === 3).themeId, 'm1');
});

test('TC-FR-MIX-001 記入済みリストは種類別・空欄なし', () => {
  let s = createEmpty();
  s = setCell(s, 'm2', 2, '好き'); s = setCell(s, 'k3', 0, '困り');
  const m = filledItems(s, 'miryoku');
  assert.deepEqual(m, [{ t: 'm2', i: 2, text: '好き', theme: '好きなこと' }]);
  assert.equal(filledItems(s, 'kadai').length, 1);
});

test('TC-FR-MIX-005 魅力か課題が0件なら掛け合わせ不可', () => {
  let s = createEmpty();
  assert.equal(canMix(s), false);
  s = setCell(s, 'm1', 0, '話す');
  assert.equal(canMix(s), false);
  s = setCell(s, 'k1', 0, 'ゼロ');
  assert.equal(canMix(s), true);
  assert.equal(buildSentence(s), '');
});

test('TC-FR-MIX-002/003 一文の生成（相手の既定・3文型・「」付き）', () => {
  let s = setCell(setCell(createEmpty(), 'm1', 0, '話すこと'), 'k1', 1, 'つながりゼロ');
  s = setMix(s, { m: { t: 'm1', i: 0 }, k: { t: 'k1', i: 1 } });
  assert.equal(buildSentence(s), '「つながりゼロ」を経験した私だから、「話すこと」で、誰かの役に立てる。');
  s = setMix(s, { who: '地域の事業者' });
  assert.match(buildSentence(s), /地域の事業者の役に立てる。$/);
  s = setMix(s, { pattern: 1 });
  assert.equal(buildSentence(s), '「話すこと」と「つながりゼロ」をかけ合わせられるのは、私だけ。だから地域の事業者の力になれる。');
  s = setMix(s, { pattern: 2 });
  assert.equal(buildSentence(s), '「つながりゼロ」を知っている私が、「話すこと」を活かして、地域の事業者を応援します。');
  assert.equal(normalize({ ...s, mix: { ...s.mix, pattern: 9 } }).mix.pattern, 0);
  assert.equal(PATTERNS.length, 3);
  assert.equal(pickedText(s, null), '');
});

test('選んだマスを空にすると選択が外れる', () => {
  let s = setCell(setCell(createEmpty(), 'm1', 0, 'a'), 'k1', 0, 'b');
  s = setMix(s, { m: { t: 'm1', i: 0 }, k: { t: 'k1', i: 0 } });
  s = setCell(s, 'm1', 0, '');
  assert.equal(s.mix.m, null);
  assert.deepEqual(s.mix.k, { t: 'k1', i: 0 });
});

test('不正な選択（種類違い・範囲外）は捨てる', () => {
  const s = normalize({ cells: { m1: ['a'], k1: ['b'] }, mix: { m: { t: 'k1', i: 0 }, k: { t: 'k1', i: 9 } } });
  assert.equal(s.mix.m, null); assert.equal(s.mix.k, null);
});

test('TC-FR-MIX-004 シャッフルは乱数注入で決定的・直前と別', () => {
  let s = createEmpty();
  s = setCell(s, 'm1', 0, 'a'); s = setCell(s, 'm2', 0, 'b'); s = setCell(s, 'k1', 0, 'x'); s = setCell(s, 'k2', 0, 'y');
  s = setMix(s, { m: { t: 'm1', i: 0 }, k: { t: 'k1', i: 0 } });
  const r = shufflePicks(s, () => 0);
  assert.deepEqual(r, { m: { t: 'm2', i: 0 }, k: { t: 'k2', i: 0 } });
  const r2 = shufflePicks(s, () => 0.9999);
  assert.deepEqual(r2.m, { t: 'm2', i: 0 });
  // 候補が1つならそれを選ぶ
  const one = setCell(setCell(createEmpty(), 'm1', 0, 'a'), 'k1', 0, 'x');
  assert.deepEqual(shufflePicks(one, () => 0.5), { m: { t: 'm1', i: 0 }, k: { t: 'k1', i: 0 } });
  assert.deepEqual(shufflePicks(createEmpty()), { m: null, k: null });
});

test('ensurePicks は未選択時に最初の記入済みを選ぶ', () => {
  let s = setCell(setCell(createEmpty(), 'm3', 2, 'a'), 'k2', 5, 'x');
  assert.deepEqual(ensurePicks(s), { m: { t: 'm3', i: 2 }, k: { t: 'k2', i: 5 } });
  s = setMix(s, { m: { t: 'm3', i: 2 } });
  assert.deepEqual(ensurePicks(s).m, { t: 'm3', i: 2 });
});

test('TC-FR-STORE-002 壊れたデータでも空で起動', () => {
  const st = memStorage();
  st.setItem(STORAGE_KEY, '{壊れたJSON');
  const r = storage.load(st);
  assert.equal(r.ok, false);
  assert.deepEqual(r.state, createEmpty());
  const empty = storage.load(memStorage());
  assert.equal(empty.ok, true); assert.equal(empty.restored, false);
  assert.deepEqual(normalize(null), createEmpty());
  assert.deepEqual(normalize({ cells: 'x', mix: 'y', card: 1 }), createEmpty());
});

test('TC-FR-STORE-003 保存失敗は ok:false を返し例外を投げない', () => {
  assert.deepEqual(storage.save(broken, createEmpty()), { ok: false });
  assert.equal(storage.load(broken).ok, false);
  assert.deepEqual(storage.clear(broken), { ok: false });
});

test('TC-FR-STORE-004 全消去', () => {
  const st = memStorage();
  storage.save(st, setCenter(createEmpty(), 'x'));
  assert.deepEqual(storage.clear(st), { ok: true });
  assert.equal(storage.load(st).restored, false);
});

test('H3 normalize は冪等', () => {
  const s = sampleState();
  assert.deepEqual(normalize(normalize(s)), normalize(s));
});

test('TC-FR-CARD-002 カード表示設定の既定はOFF', () => {
  assert.equal(createEmpty().card.showText, false);
  assert.equal(setShowText(createEmpty(), true).card.showText, true);
  assert.equal(normalize({ card: { showText: 'yes' } }).card.showText, false);
});

test('TC-FR-SAMPLE-001 記入例は全テーマ1件以上・一文が作れる', () => {
  const s = sampleState();
  for (const t of THEMES) assert.ok(countFilled(s, t.id) >= 1, t.id);
  assert.equal(buildSentence(s), '「自治体とのつながりゼロ」を経験した私だから、「漫画で伝える」で、想いを言葉にできない事業者の役に立てる。');
  assert.ok(!JSON.stringify(s).includes('大王'));
});
