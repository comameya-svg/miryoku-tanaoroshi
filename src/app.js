// 画面（SCR-01〜06）。利用者の入力は textContent / value でのみ表示する（NFR-SEC-002）
import { THEMES, KIND_LABEL, MAX_CELL, MAX_CENTER, MAX_WHO, DEFAULT_WHO, PATTERNS, SESSION_URL, SESSION_LABEL, SESSION_NOTE, themeById } from './config.js';
import { createEmpty, setCenter, setCell, setMix, setShowText } from './state.js';
import * as storage from './storage.js';
import { countFilled, totalFilled, filledItems, grid81 } from './progress.js';
import { canMix, buildSentence, shufflePicks, ensurePicks } from './sentence.js';
import { layoutCard, drawCard, CARD_W, CARD_H } from './card.js';
import { sampleState } from './sample.js';

const store = window.localStorage;
const loaded = storage.load(store);
let state = loaded.state;
let saveTimer = null;
let cardUrl = null;

const $ = (sel) => document.querySelector(sel);
const view = $('#view');

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'value') node.value = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(children)) if (c) node.append(c);
  return node;
}

function toast(message) {
  const t = $('#toast');
  t.textContent = message;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 4000);
}

function update(next, { immediate = false } = {}) {
  state = next;
  clearTimeout(saveTimer);
  const run = () => {
    if (!storage.save(store, state).ok) toast('保存できませんでした。ブラウザの設定（プライベートモード等）をご確認ください。');
  };
  if (immediate) run(); else saveTimer = setTimeout(run, 300);
}

function go(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}

function kindBadge(kind) {
  return el('span', { class: `badge badge-${kind}`, text: KIND_LABEL[kind] });
}

function mixButton() {
  return el('button', { class: 'btn btn-primary', type: 'button', text: '魅力 × 課題 を掛け合わせる', onclick: () => go('#/mix') });
}

// SCR-01 ホーム（3×3）
function renderHome() {
  const nameInput = el('input', { id: 'center', type: 'text', maxlength: MAX_CENTER, value: state.center, placeholder: '例：じゅんちゃん／〇〇商店', autocomplete: 'off',
    oninput: (e) => { update(setCenter(state, e.target.value)); centerCell.textContent = state.center || 'あなた'; } });
  const centerCell = el('div', { class: 'cell3 cell-center', text: state.center || 'あなた' });
  const grid = el('div', { class: 'grid3' });
  for (let pos = 0; pos < 9; pos++) {
    if (pos === 4) { grid.append(centerCell); continue; }
    const t = THEMES.find((x) => x.pos === pos);
    const n = countFilled(state, t.id);
    grid.append(el('button', { class: `cell3 cell-${t.kind}${n ? ' has' : ''}`, type: 'button', onclick: () => go(`#/theme/${t.id}`),
      'aria-label': `${KIND_LABEL[t.kind]}：${t.name}（${n}/8）` }, [
      kindBadge(t.kind), el('span', { class: 'cell3-name', text: t.name }), el('span', { class: 'count', text: `${n}/8` }),
    ]));
  }
  return [
    el('p', { class: 'lead', text: totalFilled(state) === 0 && !state.center
      ? 'まずは真ん中に名前を書いて、気になるテーマから埋めてみましょう。'
      : 'テーマを選んで、思いつくことを書き足していきましょう。' }),
    el('label', { class: 'field' }, [el('span', { class: 'field-label', text: '真ん中：あなたの名前・事業名' }), nameInput]),
    grid,
    el('p', { class: 'note', text: '全部埋めなくてOK。魅力1つ・課題1つで掛け合わせできます。' }),
    el('div', { class: 'actions' }, [mixButton(), el('button', { class: 'btn btn-ghost', type: 'button', text: '全体（9×9）を見る', onclick: () => go('#/all') })]),
    el('div', { class: 'actions' }, [el('button', { class: 'btn btn-sub', type: 'button', text: '迷ったら：じゅんちゃんの記入例を見る', onclick: () => go('#/sample') })]),
  ];
}

// SCR-02 テーマ入力
function renderTheme(id) {
  const t = themeById(id);
  if (!t) return renderHome();
  const idx = THEMES.indexOf(t);
  const prev = THEMES[(idx + 7) % 8], next = THEMES[(idx + 1) % 8];
  const counter = el('span', { class: 'count', text: `${countFilled(state, t.id)}/8` });
  const grid = el('div', { class: 'grid3 grid-edit' });
  let i = 0;
  for (let slot = 0; slot < 9; slot++) {
    if (slot === 4) {
      grid.append(el('div', { class: `cell3 cell-theme-${t.kind}` }, [kindBadge(t.kind), el('span', { class: 'cell3-name', text: t.name }), counter]));
      continue;
    }
    const index = i++;
    const box = el('textarea', { class: `cell-input cell-${t.kind}`, maxlength: MAX_CELL, rows: 3, placeholder: t.hints[index],
      'aria-label': `${t.name} ${index + 1}：${t.hints[index]}`, value: state.cells[t.id][index],
      oninput: (e) => { update(setCell(state, t.id, index, e.target.value)); counter.textContent = `${countFilled(state, t.id)}/8`; box.classList.toggle('has', e.target.value.trim() !== ''); } });
    if (state.cells[t.id][index]) box.classList.add('has');
    grid.append(box);
  }
  return [
    el('div', { class: 'theme-head' }, [kindBadge(t.kind), el('h2', { text: t.name }), el('p', { class: 'muted', text: t.lead })]),
    el('p', { class: 'note', text: '薄い字の質問はヒントです。1マス40文字まで。単語でもOK。' }),
    grid,
    el('div', { class: 'actions actions-split' }, [
      el('button', { class: 'btn btn-ghost', type: 'button', text: `← ${prev.name}`, onclick: () => go(`#/theme/${prev.id}`) }),
      el('button', { class: 'btn btn-ghost', type: 'button', text: `${next.name} →`, onclick: () => go(`#/theme/${next.id}`) }),
    ]),
    el('div', { class: 'actions' }, [el('button', { class: 'btn btn-sub', type: 'button', text: '3×3に戻る', onclick: () => go('#/home') }), mixButton()]),
  ];
}

// 9×9（SCR-03 / SCR-06 共通）
function grid9(s, { interactive }) {
  const wrap = el('div', { class: 'grid9', role: 'grid', 'aria-label': '9×9の全体図' });
  for (const c of grid81(s)) {
    const cls = ['c9', `c9-${c.type}`, `c9-${c.kind}`, c.filled ? 'filled' : '', c.col % 3 === 2 && c.col < 8 ? 'br' : '', c.row % 3 === 2 && c.row < 8 ? 'bb' : ''].join(' ');
    const attrs = { class: cls, text: c.type === 'center' ? (c.text || 'あなた') : c.text, title: c.text || null };
    if (interactive && c.themeId) {
      attrs.role = 'button'; attrs.tabindex = '0';
      attrs.onclick = () => go(`#/theme/${c.themeId}`);
      attrs.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(`#/theme/${c.themeId}`); } };
    }
    wrap.append(el('div', attrs));
  }
  return wrap;
}

function renderAll() {
  return [
    el('h2', { text: '全体を見る（9×9）' }),
    el('p', { class: 'note', text: `書いたマスに色がつきます（いま ${totalFilled(state)} / 64 マス）。ブロックをタップすると、そのテーマを書けます。` }),
    grid9(state, { interactive: true }),
    el('div', { class: 'actions' }, [el('button', { class: 'btn btn-sub', type: 'button', text: '3×3に戻る', onclick: () => go('#/home') }), mixButton()]),
  ];
}

// SCR-04 掛け合わせ
function pickSelect(kind, current, onChange) {
  const select = el('select', { class: `pick pick-${kind}`, onchange: (e) => { const [t, i] = e.target.value.split(':'); onChange({ t, i: Number(i) }); } });
  for (const th of THEMES.filter((x) => x.kind === kind)) {
    const items = filledItems(state, kind).filter((it) => it.t === th.id);
    if (!items.length) continue;
    const group = el('optgroup', { label: th.name });
    for (const it of items) {
      group.append(el('option', { value: `${it.t}:${it.i}`, text: it.text, selected: current && current.t === it.t && current.i === it.i }));
    }
    select.append(group);
  }
  return select;
}

function renderMix() {
  if (!canMix(state)) {
    const needM = filledItems(state, 'miryoku').length === 0;
    const needK = filledItems(state, 'kadai').length === 0;
    const missing = [needM && '魅力', needK && '課題'].filter(Boolean).join('と');
    return [
      el('h2', { text: '魅力 × 課題 を掛け合わせる' }),
      el('div', { class: 'empty' }, [
        el('p', { text: `魅力と課題を1つずつ書くと、ここで掛け合わせができます。いまは「${missing}」がまだ空です。` }),
        el('div', { class: 'actions' }, [
          needM && el('button', { class: 'btn btn-primary', type: 'button', text: '魅力を書きに行く', onclick: () => go('#/theme/m1') }),
          needK && el('button', { class: 'btn btn-primary', type: 'button', text: '課題を書きに行く', onclick: () => go('#/theme/k1') }),
        ]),
      ]),
    ];
  }
  if (!state.mix.m || !state.mix.k) update(setMix(state, ensurePicks(state)), { immediate: true });
  const out = el('p', { class: 'sentence', 'aria-live': 'polite', text: buildSentence(state) });
  const refresh = () => { out.textContent = buildSentence(state); };
  const patternBtns = PATTERNS.map((_, p) => el('button', { class: `chip${state.mix.pattern === p ? ' on' : ''}`, type: 'button', text: `言い回し${p + 1}`, 'aria-pressed': String(state.mix.pattern === p),
    onclick: () => { update(setMix(state, { pattern: p })); render(); } }));
  return [
    el('h2', { text: '魅力 × 課題 を掛け合わせる' }),
    el('p', { class: 'note', text: '書いたものから1つずつ選ぶと、「そこにしかない個性」が一文になります。' }),
    el('label', { class: 'field' }, [el('span', { class: 'field-label' }, [kindBadge('miryoku'), ' あなたの魅力']), pickSelect('miryoku', state.mix.m, (m) => { update(setMix(state, { m })); refresh(); })]),
    el('div', { class: 'times', text: '×' }),
    el('label', { class: 'field' }, [el('span', { class: 'field-label' }, [kindBadge('kadai'), ' あなたの課題']), pickSelect('kadai', state.mix.k, (k) => { update(setMix(state, { k })); refresh(); })]),
    el('label', { class: 'field' }, [el('span', { class: 'field-label', text: '役に立ちたい相手（空欄なら「誰か」）' }),
      el('input', { type: 'text', maxlength: MAX_WHO, value: state.mix.who, placeholder: `例：地域の事業者さん（空欄なら「${DEFAULT_WHO}」）`, autocomplete: 'off',
        oninput: (e) => { update(setMix(state, { who: e.target.value })); refresh(); } })]),
    el('div', { class: 'sentence-box' }, [el('p', { class: 'sentence-label', text: 'そこにしかない、わたしの個性' }), out]),
    el('div', { class: 'chips' }, patternBtns),
    el('div', { class: 'actions' }, [
      el('button', { class: 'btn btn-ghost', type: 'button', text: 'ランダムに組み合わせる', onclick: () => { update(setMix(state, shufflePicks(state))); render(); } }),
      el('button', { class: 'btn btn-primary', type: 'button', text: '結果カードを作る →', onclick: () => go('#/card') }),
    ]),
  ];
}

// SCR-05 結果カード
async function makeCardBlob() {
  if (document.fonts && document.fonts.load) {
    const fonts = ["700 46px 'Zen Maru Gothic'", "500 24px 'Noto Sans JP'"].map((f) => document.fonts.load(f, 'あ魅力課題'));
    await Promise.race([Promise.all(fonts), new Promise((r) => setTimeout(r, 3000))]).catch(() => {});
  }
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W; canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  const measure = (text, font) => { ctx.font = font; return ctx.measureText(text).width; };
  drawCard(ctx, layoutCard(state, buildSentence(state), measure));
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function cardFileName() {
  return '魅力課題_棚卸しカード.png';
}

function renderCard() {
  const img = el('img', { class: 'card-preview', alt: '結果カードのプレビュー', width: CARD_W, height: CARD_H });
  const shareBtn = el('button', { class: 'btn btn-ghost', type: 'button', text: '共有する', hidden: true });
  const saveBtn = el('button', { class: 'btn btn-primary', type: 'button', text: '画像を保存する' });
  let blob = null;
  const draw = async () => {
    saveBtn.disabled = true;
    blob = await makeCardBlob();
    if (cardUrl) URL.revokeObjectURL(cardUrl);
    cardUrl = URL.createObjectURL(blob);
    img.src = cardUrl;
    saveBtn.disabled = false;
    const file = new File([blob], cardFileName(), { type: 'image/png' });
    shareBtn.hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
    shareBtn.onclick = () => navigator.share({ files: [file], title: '魅力×課題 棚卸しカード' }).catch(() => {});
  };
  saveBtn.onclick = () => {
    if (!cardUrl) return;
    const a = el('a', { href: cardUrl, download: cardFileName() });
    document.body.append(a); a.click(); a.remove();
  };
  const toggle = el('input', { type: 'checkbox', checked: state.card.showText,
    onchange: (e) => { update(setShowText(state, e.target.checked)); draw(); } });
  draw();
  const parts = [
    el('h2', { text: '結果カード' }),
    el('label', { class: 'toggle' }, [toggle, el('span', { text: 'マスに書いた中身もカードに載せる（SNSに載せる前に内容を確認してください）' })]),
    img,
    el('p', { class: 'note', text: 'うまく保存できないときは、画像を長押しして保存してください。' }),
    el('div', { class: 'actions' }, [saveBtn, shareBtn]),
  ];
  if (!buildSentence(state)) parts.splice(1, 0, el('p', { class: 'empty', text: 'まだ一文ができていません。「掛け合わせる」で魅力と課題を選ぶと、カードに一文が入ります。' }));
  parts.push(el('section', { class: 'cta-box' }, [
    el('h3', { text: 'もっと深く、一緒に棚卸ししませんか？' }),
    el('p', { text: 'じゅんちゃん（横田潤一郎）と30分のオンライン対話で、あなたの魅力と課題を引き出します。' }),
    el('a', { class: 'btn btn-cta', href: SESSION_URL, target: '_blank', rel: 'noopener noreferrer', text: SESSION_LABEL }),
    el('p', { class: 'note', text: SESSION_NOTE }),
  ]));
  parts.push(el('div', { class: 'actions' }, [el('button', { class: 'btn btn-sub', type: 'button', text: '掛け合わせに戻る', onclick: () => go('#/mix') })]));
  return parts;
}

// SCR-06 記入例（利用者データは変えない）
function renderSample() {
  const s = sampleState();
  return [
    el('h2', { text: '記入例：じゅんちゃんの棚卸し' }),
    el('p', { class: 'note', text: '講演でお話しした「伝える力」と「つながりゼロの悔しさ」も、ここから生まれました。' }),
    grid9(s, { interactive: false }),
    el('div', { class: 'sentence-box' }, [el('p', { class: 'sentence-label', text: 'じゅんちゃんの個性' }), el('p', { class: 'sentence', text: buildSentence(s) })]),
    el('div', { class: 'actions' }, [el('button', { class: 'btn btn-primary', type: 'button', text: '自分の棚卸しを始める', onclick: () => go('#/home') })]),
  ];
}

const routes = { home: renderHome, all: renderAll, mix: renderMix, card: renderCard, sample: renderSample };

function render() {
  const [, name, arg] = (location.hash || '#/home').split('/');
  const fn = name === 'theme' ? () => renderTheme(arg) : routes[name] || renderHome;
  view.replaceChildren(...fn().filter(Boolean));
  document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('on', a.dataset.route === (name === 'theme' ? 'home' : name || 'home')));
  window.scrollTo(0, 0);
}

$('#reset').addEventListener('click', () => {
  if (!window.confirm('入力した内容をすべて消します。よろしいですか？（元に戻せません）')) return;
  if (!storage.clear(store).ok) toast('消去できませんでした。');
  state = createEmpty();
  go('#/home');
});

window.addEventListener('hashchange', render);
if (!loaded.ok) toast('保存データを読み込めなかったため、新しく始めます。');
render();
