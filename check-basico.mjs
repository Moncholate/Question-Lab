/* ============================================================================
   LO BÁSICO · Question Lab · `node check-basico.mjs` desde esta carpeta.
   ----------------------------------------------------------------------------
   Tercero de la serie, y existe por lo mismo que sus hermanos: un fallo de clase
   en Desgramatizador («She works in Santiago» daba el verbo «works in») dejó
   claro que teníamos muchas pruebas de casos finos y ninguna de lo primero que
   alguien escribe. Palabra del profesor: el idioma es ambiguo y eso se acepta,
   pero fallar en lo básico le quita valor a la propuesta.

   Lo básico de ESTA app es otra cosa que en las otras dos. Grammaster GENERA,
   así que su suelo es no conjugar mal. Desgramatizador ANALIZA una oración
   cualquiera. Question Lab analiza PREGUNTAS, y además reparte sus piezas por
   rol, así que su suelo es: la pregunta más simple del mundo, escrita a mano,
   sale con cada palabra en su sitio.

   `check-bank` ya recorre las 300 del banco, pero el banco lo escribimos
   nosotros: son las preguntas que sabemos que funcionan. Aquí van preguntas
   ESCRITAS A MANO para este chequeo, incluidas las que un alumno teclea mal.

   Regla para agregar: solo lo indiscutible. Si hay que pensarlo, va a
   check-analyzer con su explicación.
   ============================================================================ */
import { QL } from './check-env.mjs';

const { analyze, tenseIdOf, whBaseOf, expectedAnswers, LV, setLevel, setUnidad } = QL;
setLevel(LV[LV.length - 1]); setUnidad('');

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const piezas = (q) => {
  const r = analyze(q);
  if (!r.ok) return { ok: false, msg: r.error || r.msg || 'rechazada' };
  const out = {};
  for (const p of (r.parts || [])) (out[p.role] ||= []).push(p.text);
  return { ok: true, r, rol: (rol) => (out[rol] || []).join(' ') };
};

console.log('QUESTION LAB · lo básico\n');

/* ── 1. La pregunta más simple sale entera y bien repartida ──────────────── */
console.log('1 · cada palabra en su rol');
const REPARTO = [
  // pregunta,                     wh,        aux,    sujeto, verbo
  ['Where do you live?',           'Where',   'do',   'you',  'live'],
  ['What do you do?',              'What',    'do',   'you',  'do'],
  ['Where does she work?',         'Where',   'does', 'she',  'work'],
  ['When did they arrive?',        'When',    'did',  'they', 'arrive'],
  ['Do you like coffee?',          '',        'Do',   'you',  'like'],
  ['Does he speak English?',       '',        'Does', 'he',   'speak'],
  ['Did she call you?',            '',        'Did',  'she',  'call'],
  ['Are you working?',             '',        'Are',  'you',  'working'],
  ['Have you finished?',           '',        'Have', 'you',  'finished'],
  ['Will she come?',               '',        'Will', 'she',  'come'],
];
for (const [q, wh, aux, subj, verb] of REPARTO) {
  const p = piezas(q);
  if (!p.ok) { fallo(`«${q}» → el analizador la rechaza (${p.msg})`); continue; }
  const mal = [];
  if (wh && p.rol('wh').toLowerCase() !== wh.toLowerCase()) mal.push(`wh=«${p.rol('wh')}» ≠ «${wh}»`);
  if (p.rol('aux').toLowerCase() !== aux.toLowerCase()) mal.push(`aux=«${p.rol('aux')}» ≠ «${aux}»`);
  if (p.rol('subj').toLowerCase() !== subj.toLowerCase()) mal.push(`subj=«${p.rol('subj')}» ≠ «${subj}»`);
  if (!p.rol('verb').toLowerCase().startsWith(verb.toLowerCase())) mal.push(`verb=«${p.rol('verb')}» ≠ «${verb}»`);
  if (mal.length) fallo(`«${q}» → ${mal.join(' · ')}`);
}
if (!problemas) console.log(`   ✓ ${REPARTO.length} preguntas, wh/aux/sujeto/verbo en su sitio`);

/* ── 2. Abierta y cerrada, que es el eje de la app ───────────────────────── */
console.log('\n2 · abierta o cerrada');
const TIPOS = [
  ['Where do you live?', 'open'], ['What time is it?', 'open'],
  ['How old are you?', 'open'],   ['Who called you?', 'open'],
  ['Do you like coffee?', 'closed'], ['Is she a teacher?', 'closed'],
  ['Can you swim?', 'closed'],       ['Have you been there?', 'closed'],
];
let malTipo = 0;
for (const [q, tipo] of TIPOS) {
  const r = analyze(q);
  if (!r.ok) { fallo(`«${q}» → rechazada`); malTipo++; continue; }
  if (r.qtipo !== tipo) { fallo(`«${q}» → la da por ${r.qtipo} y es ${tipo}`); malTipo++; }
}
if (!malTipo) console.log(`   ✓ ${TIPOS.length} preguntas clasificadas`);

/* ── 3. El tiempo verbal de la pregunta más simple ───────────────────────── */
console.log('\n3 · el tiempo verbal');
const TIEMPOS = [
  ['Do you like coffee?', 'simple-present'],
  ['Does she work here?', 'simple-present'],
  ['Is she a teacher?', 'to-be-pres'],
  ['Was he tired?', 'to-be-past'],
  ['Did you call her?', 'simple-past'],
  ['Are you working?', 'present-continuous'],
  ['Were they sleeping?', 'past-continuous'],
  ['Have you finished?', 'present-perfect'],
  ['Had she left?', 'past-perfect'],
  ['Will you come?', 'simple-future'],
  ['Are you going to travel?', 'future-going-to'],
  ['Can you swim?', 'modal'],
];
let malT = 0;
for (const [q, tid] of TIEMPOS) {
  const r = analyze(q);
  if (!r.ok) { fallo(`«${q}» → rechazada`); malT++; continue; }
  const dio = tenseIdOf(r.tense);
  if (dio !== tid) { fallo(`«${q}» → ${dio}, y es ${tid}`); malT++; }
}
if (!malT) console.log(`   ✓ ${TIEMPOS.length} tiempos reconocidos`);

/* ── 4. La wh se lee entera, también las de dos palabras ─────────────────── */
console.log('\n4 · la wh de dos palabras no se parte');
const WHS = [['How old are you?', 'how old'], ['What time is it?', 'what time'],
             ['How many books do you have?', 'how many'], ['How long have you waited?', 'how long'],
             ['How often do you cook?', 'how often'], ['What kind of music do you like?', 'what kind'],
             ["What's your name?", 'what'], ['Where do you live?', 'where']];
let malW = 0;
for (const [q, wh] of WHS) if (whBaseOf(q) !== wh) { fallo(`«${q}» → wh «${whBaseOf(q)}», y es «${wh}»`); malW++; }
if (!malW) console.log(`   ✓ ${WHS.length} wh leídas enteras`);

/* ── 5. La respuesta corta devuelve el auxiliar que toca ─────────────────── */
console.log('\n5 · la respuesta corta');
const RESP = [
  ['Do you like coffee?', 'Yes, I do.'],
  ['Does she work here?', 'Yes, she does.'],
  ['Did you call her?', 'Yes, I did.'],
  ['Is she a teacher?', 'Yes, she is.'],
  ['Are you tired?', 'Yes, I am.'],
  ['Can you swim?', 'Yes, I can.'],
  ['Have you finished?', 'Yes, I have.'],
  ['Will you come?', 'Yes, I will.'],
];
let malR = 0;
for (const [q, esperada] of RESP) {
  const r = analyze(q);
  const dio = (expectedAnswers(r) || [])[0];
  if (dio !== esperada) { fallo(`«${q}» → «${dio}», y es «${esperada}»`); malR++; }
}
if (!malR) console.log(`   ✓ ${RESP.length} respuestas cortas`);

/* ── 6. Lo que el alumno teclea MAL se detecta ───────────────────────────── */
console.log('\n6 · los errores del alumno se cazan');
const MALAS = [
  ['Where do live?', 'falta el sujeto'],
  ['Do like coffee?', 'falta el sujeto'],
  ['Where you live?', 'falta el auxiliar'],
  ['Do you coffee?', 'falta el verbo'],
];
let malM = 0;
for (const [q, motivo] of MALAS) {
  const r = analyze(q);
  /* No se exige el texto exacto del aviso, solo que la app NO la dé por buena
     y completa: darla por buena es el fallo que le quita valor a la app. */
  if (r.ok && !r.incomplete) { fallo(`«${q}» → la da por correcta, y ${motivo}`); malM++; }
}
if (!malM) console.log(`   ✓ ${MALAS.length} preguntas incompletas señaladas`);

/* ── 7. Y lo que está BIEN no se marca mal ───────────────────────────────── */
console.log('\n7 · ninguna pregunta correcta se rechaza');
const BUENAS = [
  'Where do you live?', 'What is your name?', 'Do you have a car?',
  'How much does it cost?', 'Who painted the Mona Lisa?', 'What are you doing?',
  'Why did she leave?', 'Which one do you prefer?', 'Whose book is this?',
  'Are there any questions?', 'How are you?', 'What would you do?',
];
let malB = 0;
for (const q of BUENAS) {
  const r = analyze(q);
  if (!r.ok) { fallo(`«${q}» → rechazada: ${r.error || r.msg || '?'}`); malB++; }
  else if (r.incomplete) { fallo(`«${q}» → la da por incompleta y está bien`); malB++; }
}
if (!malB) console.log(`   ✓ ${BUENAS.length} preguntas correctas aceptadas`);

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nBÁSICO OK');
process.exit(problemas ? 1 : 0);
