/* ============================================================================
   Auditoría de answers.js · `node check-respuestas.mjs` desde esta carpeta.
   ----------------------------------------------------------------------------
   El modo «Adivina la wh» se sostiene entero sobre este archivo: sin la
   respuesta, la pregunta no determina la wh y la app marcaría mal cosas que
   están bien. Los fallos aquí, como en todo lo demás de esta app, NO dan error:
   una pregunta sin respuesta simplemente no aparece nunca en el modo.

   Comprueba:
     1. cada pregunta ABIERTA del banco tiene respuesta
     2. no sobra ninguna respuesta (pregunta renombrada = respuesta huérfana)
     3. ninguna respuesta contiene su propia wh: la regalaría
     4. las `alt` son wh de verdad y no repiten la correcta
     5. el solapamiento está declarado en LOS DOS SENTIDOS
   ============================================================================ */
import { QL, BANK } from './check-env.mjs';
import { readFileSync } from 'node:fs';

/* answers.js es un script clásico (window.…), como bank.js: se ejecuta igual. */
new Function(readFileSync(new URL('./answers.js', import.meta.url), 'utf8')).call(globalThis);
const A = globalThis.window.QUESTION_ANSWERS || {};

const { analyze, whBaseOf, WH_HINTS, LV, setLevel, setUnidad } = QL;
setLevel(LV[LV.length - 1]); setUnidad('');

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
console.log('QUESTION LAB · respuestas del banco\n');

/* ── 1 y 2. Partición: cada abierta con su respuesta, sin sobras ────────── */
const abiertas = [];
for (const lvl of LV) for (const q of (BANK[lvl] || [])) {
  const r = analyze(q);
  if (r.ok && r.qtipo === 'open') abiertas.push(q);
}
console.log('1 · cada pregunta abierta tiene respuesta');
for (const q of abiertas) if (!A[q]) fallo(`sin respuesta: «${q}»`);
if (!problemas) console.log(`   ✓ ${abiertas.length} preguntas abiertas cubiertas`);

console.log('\n2 · no sobra ninguna respuesta');
const enBanco = new Set(abiertas);
const huerfanas = Object.keys(A).filter(q => !enBanco.has(q));
if (huerfanas.length) huerfanas.forEach(q => fallo(`huérfana (ya no está en el banco): «${q}»`));
else console.log('   ✓ ninguna huérfana');

/* ── 3. La respuesta no puede contener la wh ────────────────────────────── */
console.log('\n3 · ninguna respuesta regala la wh');
let regalan = 0;
for (const q of abiertas) {
  if (!A[q]) continue;
  const wh = whBaseOf(q);
  const texto = ' ' + A[q].a.toLowerCase().replace(/[.,!?¿¡'’]/g, ' ') + ' ';
  /* Se busca la wh como PALABRA entera: «where» dentro de «somewhere» no la
     regala, y «who» dentro de «whose» tampoco. */
  const suelta = wh.split(/\s+/).every(p => texto.includes(' ' + p + ' '));
  if (suelta) { fallo(`«${q}» → la respuesta «${A[q].a}» contiene «${wh}»`); regalan++; }
}
if (!regalan) console.log('   ✓ ninguna');

/* ── 4. Las alternativas son wh reales ──────────────────────────────────── */
console.log('\n4 · las alternativas declaradas son wh de verdad');
let malAlt = 0;
for (const [q, o] of Object.entries(A)) {
  for (const alt of (o.alt || [])) {
    if (!WH_HINTS[alt]) { fallo(`«${q}» declara «${alt}», que no es una wh`); malAlt++; }
    if (alt === whBaseOf(q)) { fallo(`«${q}» se declara a sí misma como alternativa`); malAlt++; }
  }
}
if (!malAlt) console.log('   ✓ todas válidas');

/* ── 5. El solapamiento va en los dos sentidos ──────────────────────────── */
console.log('\n5 · si «when» acepta «what time», el par inverso también');
const pares = new Set();
for (const [q, o] of Object.entries(A)) for (const alt of (o.alt || []))
  pares.add([whBaseOf(q), alt].sort().join(' ↔ '));
const porWh = {};
for (const q of abiertas) (porWh[whBaseOf(q)] ||= []).push(q);
let cojos = 0;
for (const par of pares) {
  const [x, y] = par.split(' ↔ ');
  /* Solo se exige el inverso si esa wh TIENE preguntas con respuesta de hora,
     así que se comprueba que al menos una del otro lado lo declare. */
  const declaraX = (porWh[x] || []).some(q => (A[q].alt || []).includes(y));
  const declaraY = (porWh[y] || []).some(q => (A[q].alt || []).includes(x));
  if ((porWh[x] || []).length && (porWh[y] || []).length && !(declaraX && declaraY)) {
    fallo(`«${par}» solo está declarado en un sentido`); cojos++;
  }
}
if (!cojos) console.log(`   ✓ ${pares.size} par(es) de wh que se solapan, en los dos sentidos: ${[...pares].join(' · ')}`);

/* ── Resumen legible ────────────────────────────────────────────────────── */
console.log('\nRespuestas por wh:');
for (const [wh, qs] of Object.entries(porWh).sort((a, b) => b[1].length - a[1].length)) {
  const conAlt = qs.filter(q => A[q] && (A[q].alt || []).length).length;
  console.log(`  ${wh.padEnd(11)} ${String(qs.length).padStart(3)}${conAlt ? `   (${conAlt} con alternativa)` : ''}`);
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nRESPUESTAS OK');
process.exit(problemas ? 1 : 0);
