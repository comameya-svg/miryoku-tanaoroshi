// 記入状況の集計と9×9の配置（FR-GRID-003, FR-VIEW-001, FR-MIX-001）
import { THEMES } from './config.js';

export function countFilled(state, themeId) {
  return (state.cells[themeId] || []).filter((v) => v !== '').length;
}

export function totalFilled(state) {
  return THEMES.reduce((sum, t) => sum + countFilled(state, t.id), 0);
}

export function filledItems(state, kind) {
  const items = [];
  for (const t of THEMES) {
    if (t.kind !== kind) continue;
    state.cells[t.id].forEach((text, i) => {
      if (text !== '') items.push({ t: t.id, i, text, theme: t.name });
    });
  }
  return items;
}

// ブロック内の位置（0〜8、4=中心）→ テーマのマス番号（0〜7）
export function slotToIndex(slot) {
  return slot < 4 ? slot : slot - 1;
}

// 81マスを行優先で返す。type: center | theme | cell
export function grid81(state) {
  const cells = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const block = Math.floor(row / 3) * 3 + Math.floor(col / 3);
      const slot = (row % 3) * 3 + (col % 3);
      const blockTheme = THEMES.find((t) => t.pos === block);
      if (block === 4) {
        const slotTheme = THEMES.find((t) => t.pos === slot);
        cells.push(slot === 4
          ? { row, col, type: 'center', kind: 'center', text: state.center, filled: state.center !== '' }
          : { row, col, type: 'theme', kind: slotTheme.kind, text: slotTheme.name, themeId: slotTheme.id, filled: true });
      } else if (slot === 4) {
        cells.push({ row, col, type: 'theme', kind: blockTheme.kind, text: blockTheme.name, themeId: blockTheme.id, filled: true });
      } else {
        const text = state.cells[blockTheme.id][slotToIndex(slot)];
        cells.push({ row, col, type: 'cell', kind: blockTheme.kind, text, themeId: blockTheme.id, index: slotToIndex(slot), filled: text !== '' });
      }
    }
  }
  return cells;
}
