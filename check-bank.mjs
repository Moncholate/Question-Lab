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
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('./', import.meta.url));
const html = readFileSync(dir + 'index.html', 'utf8');

/* ── DOM mínimo: no dibuja nada, solo deja que el script arranque ─────────── */
const nodos = new Map();
function nuevoNodo(id = '') {
  const n = {
    id, tagName: 'DIV', textContent: '', innerHTML: '', value: '', dataset: {},
    style: new Proxy({}, { get: (t, k) => t[k] ?? '', set: (t, k, v) => (t[k] = v, true) }),
    classList: { _s: new Set(), add(...c){c.forEach(x=>this._s.add(x))}, remove(...c){c.forEach(x=>this._s.delete(x))},
                 toggle(c,f){ f===undefined ? (this._s.has(c)?this._s.delete(c):this._s.add(c)) : (f?this._s.add(c):this._s.delete(c)); },
                 contains(c){return this._s.has(c)}, },
    children: [], firstElementChild: null, parentElement: null, _ev: {},
    addEventListener(t, f){ (this._ev[t] ||= []).push(f); }, removeEventListener(){},
    appendChild(c){ this.children.push(c); c.parentElement = this; return c; },
    querySelector(){ return nuevoNodo(); }, querySelectorAll(){ return []; },
    closest(){ return null; }, focus(){}, scrollIntoView(){},
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0 }; },
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    contains(){ return false; }, insertAdjacentHTML(){}, click(){},
  };
  n.firstElementChild = { style: new Proxy({}, { get:(t,k)=>t[k]??'', set:(t,k,v)=>(t[k]=v,true) }) };
  return n;
}
globalThis.document = {
  readyState: 'complete', documentElement: nuevoNodo('html'), body: nuevoNodo('body'), head: nuevoNodo('head'),
  getElementById(id){ if(!nodos.has(id)) nodos.set(id, nuevoNodo(id)); return nodos.get(id); },
  querySelector(){ return nuevoNodo(); }, querySelectorAll(){ return []; },
  createElement(t){ const n = nuevoNodo(); n.tagName = String(t).toUpperCase(); return n; },
  addEventListener(){}, removeEventListener(){},
};
const store = new Map();
globalThis.window = {
  location: { search:'', href:'', pathname:'/', hash:'', origin:'' },
  matchMedia: () => ({ matches:false, addEventListener(){}, addListener(){} }),
  addEventListener(){}, removeEventListener(){}, localStorage: null, self:{}, top:{},
  ghTheme: { get:()=>'auto', effective:()=>'light', toggle(){}, apply(){} },
  navigator: { serviceWorker:{ register:()=>Promise.resolve() }, clipboard:{ writeText:()=>Promise.resolve() } },
};
globalThis.localStorage = { getItem:k=>store.has(k)?store.get(k):null, setItem:(k,v)=>store.set(k,String(v)), removeItem:k=>store.delete(k) };
globalThis.window.localStorage = globalThis.localStorage;
Object.defineProperty(globalThis, 'navigator', { value: globalThis.window.navigator, configurable: true });
globalThis.location = globalThis.window.location;
globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
globalThis.requestAnimationFrame = f => f();
globalThis.setTimeout = () => 0;

for (const f of ['bank.js', 'gamification.generated.js', 'cefr.generated.js'])
  try { new Function(readFileSync(dir + f, 'utf8')).call(globalThis); } catch (e) {}

const bloques = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const api = new Function(bloques[bloques.length - 1] +
  '\n;return {analyze, tenseIdOf, ID_TENSES, LV, setLevel, expectedAnswers, openExpected, whBaseOf, WH_HINTS};'
).call(globalThis);

const { analyze, tenseIdOf, ID_TENSES, LV, setLevel, expectedAnswers, openExpected, whBaseOf, WH_HINTS } = api;
const BANK = globalThis.window.QUESTION_BANK;

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
