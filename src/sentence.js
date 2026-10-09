// 個性の一文（FR-MIX-002〜005）
import { PATTERNS, DEFAULT_WHO } from './config.js';
import { filledItems } from './progress.js';

export function canMix(state) {
  return filledItems(state, 'miryoku').length > 0 && filledItems(state, 'kadai').length > 0;
}

export function pickedText(state, pick) {
  if (!pick) return '';
  return (state.cells[pick.t] && state.cells[pick.t][pick.i]) || '';
}

export function buildSentence(state) {
  const m = pickedText(state, state.mix.m);
  const k = pickedText(state, state.mix.k);
  if (!m || !k) return '';
  const w = state.mix.who || DEFAULT_WHO;
  const pattern = PATTERNS[state.mix.pattern] || PATTERNS[0];
  return pattern({ m, k, w });
}

function pickOther(items, current, rng) {
  if (items.length === 0) return null;
  const others = items.length > 1 && current
    ? items.filter((it) => !(it.t === current.t && it.i === current.i))
    : items;
  const chosen = others[Math.floor(rng() * others.length) % others.length];
  return { t: chosen.t, i: chosen.i };
}

// 魅力と課題をランダムに選び直す（候補2以上なら直前と別のもの）
export function shufflePicks(state, rng = Math.random) {
  return {
    m: pickOther(filledItems(state, 'miryoku'), state.mix.m, rng),
    k: pickOther(filledItems(state, 'kadai'), state.mix.k, rng),
  };
}

// 未選択なら最初の記入済みを選ぶ
export function ensurePicks(state) {
  const m = state.mix.m || pickOther(filledItems(state, 'miryoku'), null, () => 0);
  const k = state.mix.k || pickOther(filledItems(state, 'kadai'), null, () => 0);
  return { m, k };
}
