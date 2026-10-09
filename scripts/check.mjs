// 静的チェック（NFR-SEC-001/002, NFR-PERF-001, FR-LEGAL-001）
import { readFileSync, readdirSync, statSync } from 'node:fs';
const src = readdirSync('src').filter((f) => f.endsWith('.js')).map((f) => ({ f, s: readFileSync(`src/${f}`, 'utf8') }));
const html = readFileSync('index.html', 'utf8');
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass, detail });
const banned = [/\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /WebSocket/];
ok('TC-NFR-SEC-001 外部送信なし', src.every(({ s }) => banned.every((re) => !re.test(s))));
ok('TC-NFR-SEC-002 innerHTML等なし', src.every(({ s }) => !/innerHTML|outerHTML|insertAdjacentHTML|document\.write/.test(s)));
const bytes = src.reduce((n, { f }) => n + statSync(`src/${f}`).size, 0);
ok('TC-NFR-PERF-001 src合計<60KB', bytes < 60 * 1024, `${bytes} bytes`);
const title = (html.match(/<title>(.*?)<\/title>/) || [])[1] || '';
const h1 = (html.match(/<h1>(.*?)<\/h1>/) || [])[1] || '';
ok('TC-FR-LEGAL-001 名称に商標語なし', !/マンダラ/.test(title + h1), `${title} / ${h1}`);
ok('TC-FR-LEGAL-001 出典表記あり', /今泉浩晃/.test(html) && /マンダラート/.test(html));
const ext = [...html.matchAll(/(?:src|href)="(https?:[^"]+)"/g)].map((m) => m[1]).filter((u) => !u.startsWith('https://fonts.g'));
ok('TC-NFR-PERF-001 外部依存はGoogle Fontsのみ', ext.length === 0, ext.join(','));
ok('TC-FR-CTA-001 新規タブ＋noopener', /target: '_blank', rel: 'noopener noreferrer'/.test(src.find((x) => x.f === 'app.js').s));
let fail = 0;
for (const r of results) { console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`); if (!r.pass) fail++; }
console.log(`\n${results.length - fail}/${results.length} PASS`);
process.exit(fail ? 1 : 0);
