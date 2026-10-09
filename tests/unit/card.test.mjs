import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapText, layoutCard, CARD_W, CARD_H } from '../../src/card.js';
import { createEmpty, setCell, setCenter, setShowText } from '../../src/state.js';

// 1文字=フォントサイズ相当の幅とみなす測定関数
const measure = (text, font = '20px x') => Array.from(text).length * Number((font.match(/(\d+)px/) || [0, 20])[1]);
const m20 = (t) => Array.from(t).length * 20;

test('wrapText は幅で折り返し、句読点を行頭に置かない', () => {
  assert.deepEqual(wrapText('あいうえおかきくけこ', 100, m20), ['あいうえお', 'かきくけこ']);
  assert.deepEqual(wrapText('あいうえお。かき', 100, m20), ['あいうえお。', 'かき']);
  assert.deepEqual(wrapText('', 100, m20), []);
  // 開きかっこは行末に残さない
  assert.deepEqual(wrapText('あいうえ「かきく」', 100, m20), ['あいうえ', '「かきく」']);
});

test('wrapText は行数を超えたら「…」で切る', () => {
  const r = wrapText('あ'.repeat(30), 100, m20, 2);
  assert.equal(r.length, 2);
  assert.ok(r[1].endsWith('…'));
  assert.ok(m20(r[1]) <= 100);
});

test('TC-FR-CARD-001 1080×1350・81マスが枠内', () => {
  const s = setCenter(setCell(createEmpty(), 'm1', 0, '話すこと'), 'わたし');
  const l = layoutCard(s, '一文です。', measure);
  assert.equal(l.width, CARD_W); assert.equal(l.height, CARD_H);
  assert.equal(CARD_W, 1080); assert.equal(CARD_H, 1350);
  const cells = l.ops.filter((o) => o.op === 'rect' && o.w === l.grid.cell);
  assert.equal(cells.length, 81);
  for (const c of cells) {
    assert.ok(c.x >= 0 && c.x + c.w <= CARD_W);
    assert.ok(c.y >= 0 && c.y + c.h <= CARD_H);
  }
  for (const t of l.ops.filter((o) => o.op === 'text')) assert.ok(t.y > 0 && t.y < CARD_H, t.text);
  assert.ok(l.ops.some((o) => o.op === 'text' && o.text === '一文です。'));
  assert.ok(l.ops.some((o) => o.op === 'text' && o.text === 'わたし の棚卸し'));
});

test('TC-FR-CARD-002 中身を隠すとマスの文字が出ない', () => {
  const s = setCell(createEmpty(), 'k1', 0, 'ひみつの悔しさ');
  const hidden = layoutCard(s, '', measure);
  assert.ok(!hidden.ops.some((o) => o.op === 'text' && o.text.includes('ひみつ')));
  const shown = layoutCard(setShowText(s, true), '', measure);
  assert.ok(shown.ops.some((o) => o.op === 'text' && o.text.includes('ひみつ')));
  // 一文なしは案内文、名前なしは既定タイトル
  assert.ok(hidden.ops.some((o) => o.op === 'text' && o.text.startsWith('魅力と課題を1つずつ')));
  assert.ok(hidden.ops.some((o) => o.op === 'text' && o.text === 'わたしの棚卸し'));
});

test('長い一文は文字を小さくして3行以内に収める', () => {
  const l = layoutCard(createEmpty(), 'あ'.repeat(120), measure);
  const lines = l.ops.filter((o) => o.op === 'text' && o.baseline === 'middle' && /^あ+…?$/.test(o.text));
  assert.ok(lines.length <= 3 && lines.length > 0);
});
