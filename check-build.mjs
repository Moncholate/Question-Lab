/* ============================================================================
   QUE LO PUBLICADO SEA LO PROBADO · `node check-build.mjs` desde esta carpeta.
   ----------------------------------------------------------------------------
   Question Lab se servía tal cual, y eso tenía una virtud que conviene no
   perder: no existía un artefacto compilado que pudiera diferir del fuente, así
   que sus chequeos probaban EXACTAMENTE lo que descargaba el alumno.

   `build.mjs` rompe esa garantía —ahora hay un `dist/`— y este archivo la
   devuelve. No comprueba que el build «parezca» bien: comprueba que se COMPORTA
   igual. Es lo único que hace seguro quitar comentarios con un tokenizador
   propio, porque una corrupción o revienta al parsear o cambia una respuesta.

   Corre solo (`node check-build.mjs`) y además debería correr en el despliegue
   antes de publicar nada.
   ============================================================================ */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { QL, dir } from './check-env.mjs';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };

console.log('QUESTION LAB · lo publicado contra lo probado\n');

/* ── 1. Construir ─────────────────────────────────────────────────────────── */
console.log('1 · el build corre y encoge el archivo');
const salida = execFileSync(process.execPath, ['build.mjs'], { cwd: dir, encoding: 'utf8' });
process.stdout.write(salida.replace(/^/gm, '  '));
const fuente = readFileSync(dir + 'index.html', 'utf8');
const listo  = readFileSync(dir + 'dist/index.html', 'utf8');
if (listo.length >= fuente.length) fallo('el build no quitó nada');

/* ── 2. Ni un comentario, pero el copyright se queda ──────────────────────── */
console.log('\n2 · sin comentarios, con el aviso de copyright');
const bloques = (listo.match(/\/\*[\s\S]*?\*\//g) || []);
if (bloques.length) fallo(`quedan ${bloques.length} comentarios de bloque`);
if (!/Todos los derechos reservados/.test(listo)) fallo('se perdió el aviso de copyright');
if (!/name="author"/.test(listo)) fallo('se perdió el meta de autor');
if (!problemas) console.log('   ✓ 0 comentarios · aviso y meta en su sitio');

/* ── 3. El texto visible no se tocó ───────────────────────────────────────── */
/* Una cadena rota por el tokenizador no tiene por qué reventar: puede quedarse
   ahí, mal, y no la ve nadie hasta que un alumno abre esa pantalla. Se comparan
   TODAS las claves de i18n y TODOS los `data-i18n` del marcado. */
console.log('\n3 · ni una palabra cambiada');
const claves = (s) => [...s.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map(m => m[1]).sort();
const cf = claves(fuente), cl = claves(listo);
if (cf.join('|') !== cl.join('|')) fallo(`los data-i18n no coinciden: ${cf.length} en el fuente, ${cl.length} en dist`);

/* El script de dist se evalúa en los MISMOS globales que ya montó check-env,
   así que las dos versiones conviven y se pueden enfrentar. */
const inline = (html) => {
  const b = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  return new Function(b[b.length - 1] + '\n;return {analyze, I18N, setLevel, LV, setUnidad, expectedAnswers};').call(globalThis);
};
let DIST;
try { DIST = inline(listo); }
catch (e) { fallo(`el JavaScript de dist NO PARSEA: ${e.message}`); console.log(`\n✗ ${problemas} problema(s)`); process.exit(1); }

for (const lang of ['es', 'en']) {
  const a = QL.I18N && QL.I18N[lang], b = DIST.I18N && DIST.I18N[lang];
  if (!a || !b) { fallo(`no se pudo leer I18N.${lang}`); continue; }
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  if (ka.join('|') !== kb.join('|')) fallo(`[${lang}] cambia el juego de claves`);
  const distintas = ka.filter(k => a[k] !== b[k]);
  if (distintas.length) fallo(`[${lang}] ${distintas.length} textos cambiaron: ${distintas.slice(0, 3).join(', ')}`);
}
if (!problemas) console.log(`   ✓ ${cf.length} data-i18n y los dos idiomas, palabra por palabra`);

/* ── 4. Y se comporta igual ───────────────────────────────────────────────── */
/* La prueba de verdad. Si el tokenizador se hubiera comido media expresión
   regular, el archivo podría seguir parseando y analizar distinto. */
console.log('\n4 · misma respuesta en las 300 del banco');
const retrato = (mod, q) => {
  const r = mod.analyze(q);
  if (!r || !r.ok) return 'NO:' + ((r && (r.error || r.msg)) || '?');
  const piezas = (r.parts || []).map(p => `${p.role}=${p.text}`).join('|');
  const resp = r.answer && r.answer.lines
    ? r.answer.lines.map(l => l.pieces.map(p => `${p.role}:${p.text}`).join(' ')).join(' / ')
    : '';
  return `${r.qtipo}·${r.tense}·${piezas}·${resp}`;
};
const BANCO = Object.values(globalThis.window.QUESTION_BANK || {}).flat()
  .map(x => typeof x === 'string' ? x : x && x.q).filter(Boolean);
/* Y unas cuantas escritas a mano, incluidas las que el analizador RECHAZA: el
   camino del error también tiene expresiones regulares. */
const EXTRA = ['where did you eat today?', 'Do you turn off the light?', 'Whose turn is it?',
  'She works in Santiago?', 'Where do live?', 'What time do you get up during the week?',
  "What's your name?", 'If I call you, will you answer?', 'Is it your turn?'];
let distintas = 0;
for (const q of [...BANCO, ...EXTRA]) {
  if (retrato(QL, q) !== retrato(DIST, q)) {
    distintas++;
    if (distintas <= 3) console.log(`   ✗ «${q}»\n       fuente: ${retrato(QL, q)}\n       dist  : ${retrato(DIST, q)}`);
  }
}
if (distintas) fallo(`${distintas} preguntas se analizan distinto en dist`);
else console.log(`   ✓ ${BANCO.length + EXTRA.length} preguntas, retrato idéntico`);

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nBUILD OK · lo publicado es lo probado');
process.exit(problemas ? 1 : 0);
