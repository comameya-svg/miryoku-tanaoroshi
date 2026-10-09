// 結果カード（FR-CARD-001〜002）。layout は純粋関数、draw だけが Canvas に依存する
import { APP_NAME, PRESENTED_BY } from './config.js';
import { grid81 } from './progress.js';

export const CARD_W = 1080;
export const CARD_H = 1350;
const HEAD = "'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif";
const BODY = "'Noto Sans JP', 'Hiragino Sans', sans-serif";

export const COLORS = {
  bg: '#f2f9ff', navy: '#1d3a6b', text: '#2b3a55', muted: '#5a6a85', line: '#9fd3f5', white: '#ffffff', sun: '#f6b915',
  miryoku: { filled: '#fbd96a', empty: '#fff7dc', theme: '#f6b915', themeText: '#1d3a6b' },
  kadai: { filled: '#9ed3f3', empty: '#e8f4fd', theme: '#2f86c8', themeText: '#ffffff' },
  center: { fill: '#1d3a6b', text: '#ffffff' },
};

const NO_LINE_START = '、。，．」』）)！？!?ー…';
const NO_LINE_END = '「『（(';

// 1文字ずつ測って折り返す（日本語は空白で区切れないため）。maxLines を超えたら末尾を「…」
export function wrapText(text, maxWidth, measure, maxLines = Infinity) {
  const lines = [];
  let line = '';
  for (const ch of Array.from(text)) {
    if (line && measure(line + ch) > maxWidth && !NO_LINE_START.includes(ch)) {
      // 開きかっこを行末に残さず、次の行へ送る
      const chars = Array.from(line);
      let carry = '';
      while (chars.length > 1 && NO_LINE_END.includes(chars[chars.length - 1])) carry = chars.pop() + carry;
      lines.push(chars.join(''));
      line = carry + ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && measure(last + '…') > maxWidth) last = Array.from(last).slice(0, -1).join('');
    kept[maxLines - 1] = last + '…';
    return kept;
  }
  return lines;
}

// measure(text, font) → 幅px。描画命令の配列を返す
export function layoutCard(state, sentence, measure) {
  const ops = [];
  const m = (font) => (t) => measure(t, font);
  ops.push({ op: 'rect', x: 0, y: 0, w: CARD_W, h: CARD_H, fill: COLORS.bg });
  ops.push({ op: 'rect', x: 0, y: 0, w: CARD_W, h: 12, fill: COLORS.sun });

  ops.push({ op: 'text', x: CARD_W / 2, y: 70, text: 'Spiral up!! サミット特典', font: `700 26px ${HEAD}`, color: COLORS.muted, align: 'center' });
  ops.push({ op: 'text', x: CARD_W / 2, y: 122, text: APP_NAME, font: `700 46px ${HEAD}`, color: COLORS.navy, align: 'center' });
  const nameFont = `500 28px ${BODY}`;
  const name = state.center ? wrapText(`${state.center} の棚卸し`, 900, m(nameFont), 1)[0] : 'わたしの棚卸し';
  ops.push({ op: 'text', x: CARD_W / 2, y: 166, text: name, font: nameFont, color: COLORS.text, align: 'center' });

  // 9×9
  const cell = 90, gx = (CARD_W - cell * 9) / 2, gy = 196;
  const cellFont = `500 15px ${BODY}`;
  const themeFont = `700 15px ${HEAD}`;
  for (const c of grid81(state)) {
    const x = gx + c.col * cell, y = gy + c.row * cell;
    let fill, color = COLORS.text, text = '', font = cellFont;
    if (c.type === 'center') {
      fill = COLORS.center.fill; color = COLORS.center.text; text = c.text; font = themeFont;
    } else if (c.type === 'theme') {
      fill = COLORS[c.kind].theme; color = COLORS[c.kind].themeText; text = c.text; font = themeFont;
    } else {
      fill = c.filled ? COLORS[c.kind].filled : COLORS[c.kind].empty;
      text = state.card.showText ? c.text : '';
    }
    ops.push({ op: 'rect', x, y, w: cell, h: cell, fill, stroke: COLORS.white, lineWidth: 2 });
    if (text) {
      const lines = wrapText(text, cell - 12, m(font), 4);
      const lh = font === themeFont ? 20 : 18;
      const top = y + cell / 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, i) => ops.push({ op: 'text', x: x + cell / 2, y: top + i * lh, text: ln, font, color, align: 'center', baseline: 'middle' }));
    }
  }
  for (let b = 0; b <= 3; b++) {
    ops.push({ op: 'line', x1: gx + b * cell * 3, y1: gy, x2: gx + b * cell * 3, y2: gy + cell * 9, color: COLORS.navy, lineWidth: 4 });
    ops.push({ op: 'line', x1: gx, y1: gy + b * cell * 3, x2: gx + cell * 9, y2: gy + b * cell * 3, color: COLORS.navy, lineWidth: 4 });
  }

  // 個性の一文
  const by = gy + cell * 9 + 30, bh = 240;
  ops.push({ op: 'rect', x: gx, y: by, w: cell * 9, h: bh, fill: COLORS.white, radius: 28, stroke: COLORS.sun, lineWidth: 4 });
  ops.push({ op: 'text', x: CARD_W / 2, y: by + 44, text: 'そこにしかない、わたしの個性', font: `700 26px ${HEAD}`, color: COLORS.muted, align: 'center' });
  let size = 38, lines = [];
  const body = sentence || '魅力と課題を1つずつ選ぶと、ここに一文ができます。';
  for (; size >= 26; size -= 2) {
    lines = wrapText(body, cell * 9 - 80, m(`700 ${size}px ${HEAD}`));
    if (lines.length <= 3) break;
  }
  lines = wrapText(body, cell * 9 - 80, m(`700 ${size}px ${HEAD}`), 3);
  const lh = Math.round(size * 1.45);
  const top = by + 70 + (bh - 90 - lines.length * lh) / 2 + lh / 2;
  lines.forEach((ln, i) => ops.push({ op: 'text', x: CARD_W / 2, y: top + i * lh, text: ln, font: `700 ${size}px ${HEAD}`, color: COLORS.navy, align: 'center', baseline: 'middle' }));

  ops.push({ op: 'text', x: CARD_W / 2, y: CARD_H - 40, text: PRESENTED_BY, font: `500 24px ${BODY}`, color: COLORS.muted, align: 'center' });
  return { width: CARD_W, height: CARD_H, ops, grid: { x: gx, y: gy, cell } };
}

/* c8 ignore start — Canvas 依存（E2Eで確認） */
export function drawCard(ctx, layout) {
  for (const o of layout.ops) {
    if (o.op === 'rect') {
      ctx.beginPath();
      if (o.radius && ctx.roundRect) ctx.roundRect(o.x, o.y, o.w, o.h, o.radius); else ctx.rect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = o.fill; ctx.fill();
      if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lineWidth || 1; ctx.stroke(); }
    } else if (o.op === 'line') {
      ctx.beginPath(); ctx.moveTo(o.x1, o.y1); ctx.lineTo(o.x2, o.y2);
      ctx.strokeStyle = o.color; ctx.lineWidth = o.lineWidth; ctx.stroke();
    } else if (o.op === 'text') {
      ctx.font = o.font; ctx.fillStyle = o.color; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.baseline || 'alphabetic';
      ctx.fillText(o.text, o.x, o.y);
    }
  }
}
/* c8 ignore stop */
