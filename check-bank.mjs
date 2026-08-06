/* ============================================================================
   Auditoría del banco de preguntas · `node check-bank.mjs` desde esta carpeta.
   ----------------------------------------------------------------------------
   Existe porque las preguntas malas de bank.js NO dan error: `buildIdPool` y
   `buildRPool` las descartan con `if(!r.ok) continue`, así que una pregunta que
   el analizador no entiende simplemente no aparece nunca. Y hay un fallo peor y
   más silencioso todavía: si el tiempo que la pregunta deriva no está entre los
   visibles del nivel donde vive, la pregunta SÍ sale en Identifica pero su
   respuesta correcta no está entre las opciones. Ninguna de las dos se ve
   probando a mano, porque la app se ve perfectamente normal.

   Corre el script inline de index.html contra un DOM de mentira para usar el
   analizador de verdad, no una copia que se desincroniza.
   Sale con código 1 si algo no llega a la app.
   ============================================================================ */
import { QL, BANK } from './check-env.mjs';

const { analyze, tenseIdOf, ID_TENSES, LV, setLevel, expectedAnswers, openExpected, whBaseOf, WH_HINTS } = QL;

/* Los tiempos que Identifica ofrece salen de ID_TENSES filtrada por
   `visibleAt(o.cefr)` — NO de CEFR.tenses, que solo cubre los tiempos "propios"
   y deja fuera to be, los modales y would. */
const nivelDe = tid => (ID_TENSES.find(o => o.id === tid) || {}).cefr;
const idx = l => LV.indexOf(l);

let problemas = 0;
const fila = (nivel, q, motivo) => { console.log(`   ✗ [${nivel}] ${q}\n       ${motivo}`); problemas++; };

console.log('BANCO DE QUESTION LAB · auditoría contra el analizador\n');

const resumen = [];
const global_vistas = new Map();
for (const nivel of LV) {
  const qs = BANK[nivel] || [];
  setLevel(nivel);                       // fija visibleAt para este curso
  let ok = 0, cerradas = 0, abiertas = 0;
  const tiempos = {};

  for (const q of qs) {
    const clave = q.toLowerCase();
    if (global_vistas.has(clave)) fila(nivel, q, `DUPLICADA (ya está en ${global_vistas.get(clave)})`);
    else global_vistas.set(clave, nivel);
    if (!/\?$/.test(q.trim())) fila(nivel, q, 'no termina en «?»');

    const r = analyze(q);
    if (!r.ok) { fila(nivel, q, `el analizador la rechaza (${r.msg || 'sin motivo'}) → nunca aparece en la app`); continue; }
    ok++;

    const tid = tenseIdOf(r.tense);
    tiempos[tid] = (tiempos[tid] || 0) + 1;
    const abierta = r.type.includes('Abierta');
    abierta ? abiertas++ : cerradas++;

    /* Una pregunta "incompleta" pasa el `r.ok` pero no tiene tiempo: entra al
       pool y en Identifica no hay nada correcto que marcar. */
    const nt = nivelDe(tid);
    if (!nt) fila(nivel, q, `deriva a "${tid}", que no está en ID_TENSES — no se puede marcar en Identifica`);
    else if (idx(nt) > idx(nivel)) fila(nivel, q, `deriva a "${tid}", que es de ${nt}: un alumno de ${nivel} no lo tiene disponible`);

    /* Responde necesita saber qué se devuelve. */
    if (abierta) {
      if (!openExpected(r)) fila(nivel, q, 'abierta sin inicio de respuesta esperado → Responde no la puede corregir');
      const base = whBaseOf(q);
      if (!WH_HINTS[base]) fila(nivel, q, `el wh «${base}» no está en WH_HINTS → Responde cae al comodín "tu información"`);
    } else if (!expectedAnswers(r).length) {
      fila(nivel, q, 'cerrada sin respuesta corta esperada → Responde no la puede corregir');
    }
  }

  resumen.push({ nivel, total: qs.length, ok, cerradas, abiertas, tiempos });
}

console.log('\n  nivel         total  usables  cerradas  abiertas  tiempos   pool del alumno');
let acum = 0;
for (const r of resumen) {
  acum += r.ok;
  console.log(`  ${r.nivel.padEnd(13)} ${String(r.total).padStart(4)}  ${String(r.ok).padStart(6)}  ${String(r.cerradas).padStart(8)}  ${String(r.abiertas).padStart(8)}  ${String(Object.keys(r.tiempos).length).padStart(6)}  ${String(acum).padStart(10)}`);
}
console.log('  («pool del alumno» es acumulativo: cada nivel practica el suyo y los anteriores)');

/* ¿Qué tiempos enseña el curso y el banco no practica? */
console.log('\nCobertura (tiempos disponibles en el nivel sin ninguna pregunta):');
const conPregunta = new Set(resumen.flatMap(r => Object.keys(r.tiempos)));
for (const nivel of LV) {
  const faltan = ID_TENSES.filter(o => idx(o.cefr) <= idx(nivel) && !conPregunta.has(o.id)).map(o => o.id);
  if (faltan.length) problemas++;
  console.log(`  ${nivel.padEnd(13)} ${faltan.length ? '✗ ' + faltan.join(', ') : '✓ completo'}`);
}

/* Los tipos de dato que Responde enseña a distinguir salen de los wh usados. */
const whUsados = {};
for (const nivel of LV) for (const q of (BANK[nivel] || [])) {
  const r = analyze(q);
  if (r.ok && r.type.includes('Abierta')) { const b = whBaseOf(q); whUsados[b] = (whUsados[b] || 0) + 1; }
}
const sinUsar = Object.keys(WH_HINTS).filter(k => !whUsados[k]);
console.log('\nwh cubiertos: ' + Object.entries(whUsados).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`${k} ${n}`).join(' · '));
if (sinUsar.length) console.log('wh de la tabla sin preguntas (no es un error, es margen): ' + sinUsar.join(' · '));

console.log(`\n${problemas === 0 ? `BANCO OK — ${acum} preguntas, todas llegan a la app` : problemas + ' PROBLEMAS'}`);
process.exit(problemas ? 1 : 0);
