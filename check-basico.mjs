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

/* ── 8. El hueco de «Falta una pieza» ────────────────────────────────────── */
console.log('\n8 · el hueco tapa la pieza que abre la pregunta');
const { buildFPool, getFPool, partirPregunta, fHueco, FALTA } = QL;
buildFPool();
const pool = getFPool();
let malH = 0;
for (const p of pool) {
  const { pieza } = partirPregunta(p);
  const hueco = fHueco(p);
  if (!pieza) { fallo(`«${p.q}» → no se le puede sacar pieza`); malH++; continue; }
  if (!hueco.includes('____')) { fallo(`«${p.q}» → el hueco no aparece`); malH++; continue; }
  /* La pieza no puede seguir a la vista. Con FRONTERA de palabra: «is» dentro
     de «his car» no la regala, y sin \b eso daba un falso positivo. */
  if (new RegExp(`\\b${pieza.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(hueco)) {
    fallo(`«${p.q}» → el hueco «${hueco}» deja «${pieza}» a la vista`); malH++;
  }
  /* Y el hueco no puede pegarse mal a una contracción: «____ 's your name?». */
  if (/____ ['’]/.test(hueco)) { fallo(`«${p.q}» → «${hueco}» separa la contracción`); malH++; }
}
if (!malH) console.log(`   ✓ ${pool.length} ejercicios (${pool.filter(p => p.k === 'wh').length} abiertas · ${pool.filter(p => p.k === 'ax').length} cerradas)`);

/* ── 10. Los verbos frasales no se parten ───────────────────────────────────
   Reporte del profesor en clase: «What time do you get up during the week?»
   dejaba `get` de verbo y `up during the week` de complemento. Su reacción fue
   «pensé que habíamos solucionado el problema», y tenía razón a medias: estaba
   resuelto en Desgramatizador, y esta app no tenía NINGUNA noción de frasal.
   Ahora la lista es única (Grammar HUB/phrasal-verbs.json) y la consumen las
   dos. Aquí se fija el comportamiento, con los pares que se contradicen. */
console.log('\n10 · la partícula es del verbo, no del complemento');
const FRASALES = [
  // pregunta,                                    verbo,          complemento
  ['What time do you get up during the week?',    'get up',       'during the week'],
  ['What time do you get up?',                    'get up',       ''],
  ['Do you get up early?',                        'get up',       'early'],
  ['What do you look for?',                       'look for',     ''],
  ['What are you looking for?',                   'looking for',  ''],
  ['Do you turn off the light?',                  'turn off',     'the light'],
  ['Do you pick up the kids?',                    'pick up',      'the kids'],
  ['Do you look after the kids?',                 'look after',   'the kids'],
  ['Who picked up the phone?',                    'picked up',    'the phone'],
  ['What do you come up with?',                   'come up with', ''],   // tres palabras
];
/* Y LO QUE NO ES FRASAL, que es la mitad difícil: `in`, `on`, `at`, `to` y `for`
   son partícula A VECES. Delante de un adverbial de tiempo o lugar son
   preposición y el complemento se queda entero. */
const NO_FRASALES = [
  ['Do you go on holiday in summer?', 'go',   'on holiday in summer'],
  ['Did she come in the morning?',    'come', 'in the morning'],
  ['Are you up?',                     'Are',  'up'],            // `be` como verbo principal
];
let malF = 0;
for (const [q, verbo, comp] of [...FRASALES, ...NO_FRASALES]) {
  const p = piezas(q);
  if (!p.ok) { fallo(`«${q}» → rechazada (${p.msg})`); malF++; continue; }
  if (p.rol('verb').toLowerCase() !== verbo.toLowerCase()) {
    fallo(`«${q}» → verbo «${p.rol('verb')}», y es «${verbo}»`); malF++;
  }
  if (p.rol('comp').toLowerCase() !== comp.toLowerCase()) {
    fallo(`«${q}» → complemento «${p.rol('comp')}», y es «${comp || '(ninguno)'}»`); malF++;
  }
}
if (!malF) console.log(`   ✓ ${FRASALES.length} frasales enteros · ${NO_FRASALES.length} que NO lo son`);

/* Toda base de la lista compartida tiene que ser un verbo que ESTA app conozca.
   `turn`, `pick` y `carry` no estaban en su vocabulario, así que la lista traía
   «turn off» y la pregunta ni se parseaba: daba «you turn off the» de sujeto. */
console.log('\n10b · la app conoce todas las bases de la lista compartida');
const bases = [...new Set((globalThis.window.GRAMMAR_PHRASAL || {verbs:[]}).verbs.map(e => e[0]))];
const desconocidas = bases.filter(v => {
  const p = piezas(`Do you ${v} now?`);
  return !p.ok || !p.rol('verb').toLowerCase().startsWith(v);
});
if (desconocidas.length) fallo(`la lista trae verbos que el analizador no conoce: ${desconocidas.join(' ')}`);
else console.log(`   ✓ las ${bases.length} bases se reconocen como verbo`);

/* Añadir un verbo que también es sustantivo puede romper el otro sentido, así
   que va probado en pares mínimos. No es opcional: al meter `turn` para los
   frasales se destapó que «Whose turn is it?» lo leía como verbo — y que `work`,
   `plan` y `call`, que llevaban tiempo en la lista, ya fallaban igual. */
console.log('\n10c · el homónimo sigue siendo sustantivo donde toca');
const HOMONIMOS = [
  ['Whose turn is it?',  'Whose turn'],
  ['Whose work is it?',  'Whose work'],
  ['Whose plan is it?',  'Whose plan'],
  ['Whose call is it?',  'Whose call'],
  ['What time is it?',   'What time'],
  ['Whose book is this?','Whose book'],
];
let malH2 = 0;
for (const [q, wh] of HOMONIMOS) {
  const p = piezas(q);
  if (!p.ok) { fallo(`«${q}» → rechazada`); malH2++; continue; }
  if (p.rol('wh').toLowerCase() !== wh.toLowerCase()) { fallo(`«${q}» → wh «${p.rol('wh')}», y es «${wh}»`); malH2++; }
  if (p.rol('verb').toLowerCase() === wh.split(' ')[1]) { fallo(`«${q}» → lee «${wh.split(' ')[1]}» como verbo`); malH2++; }
}
/* Y las de sujeto no se ven arrastradas: ahí detrás del verbo NO hay auxiliar. */
for (const [q, v] of [['Who painted the Mona Lisa?', 'painted'], ['Who called you?', 'called'], ['Who wants tea?', 'wants']]) {
  const p = piezas(q);
  if (!p.ok || p.rol('verb').toLowerCase() !== v) { fallo(`«${q}» → verbo «${p.ok ? p.rol('verb') : '?'}», y es «${v}»`); malH2++; }
}
if (!malH2) console.log(`   ✓ ${HOMONIMOS.length} sustantivos + 3 preguntas de sujeto intactas`);

/* ── 11. `to be` como verbo principal: sujeto y complemento enteros ─────────
   Salió del reporte de los frasales. Con `is/are/was/were`, cualquier palabra
   que fuera a la vez sustantivo y verbo partía la oración: de 20 probadas,
   rompían 13. «Is the plan ready?» daba sujeto «the» y complemento «plan ready».
   La regla es gramática, no heurística: detrás de `be` el verbo principal es
   siempre -ing, participio o «going to», así que una forma BASE es un
   sustantivo. `be` no admite infinitivo pelado. */
console.log('\n11 · con «to be», el sustantivo-verbo no parte la oración');
const COPULA = [
  // pregunta,                  sujeto,      complemento
  ['Is it your turn?',          'it',        'your turn'],
  ['Was it your call?',         'it',        'your call'],
  ['Is the plan ready?',        'the plan',  'ready'],
  ['Was the call long?',        'the call',  'long'],
  ['Is your work difficult?',   'your work', 'difficult'],
  ['Is he a good cook?',        'he',        'a good cook'],
  ['Is she a teacher?',         'she',       'a teacher'],
];
/* Y lo que NO puede cambiar: detrás de `be` sí hay verbo de verdad cuando viene
   en -ing o participio, y con do-support el verbo en forma base SÍ es el verbo. */
const NO_COPULA = [
  ['Is the plan working?',      'the plan',  'working'],
  ['Are you working?',          'you',       'working'],
  ['Is that changing?',         'that',      'changing'],
  ['Does the bus stop here?',   'the bus',   'stop'],
  ['Does work start at eight?', 'work',      'start'],
];
let malC = 0;
for (const [q, subj, comp] of COPULA) {
  const p = piezas(q);
  if (!p.ok) { fallo(`«${q}» → rechazada`); malC++; continue; }
  if (p.rol('subj').toLowerCase() !== subj) { fallo(`«${q}» → sujeto «${p.rol('subj')}», y es «${subj}»`); malC++; }
  if (p.rol('comp').toLowerCase() !== comp) { fallo(`«${q}» → complemento «${p.rol('comp')}», y es «${comp}»`); malC++; }
}
for (const [q, subj, verbo] of NO_COPULA) {
  const p = piezas(q);
  if (!p.ok) { fallo(`«${q}» → rechazada`); malC++; continue; }
  if (p.rol('subj').toLowerCase() !== subj) { fallo(`«${q}» → sujeto «${p.rol('subj')}», y es «${subj}»`); malC++; }
  if (p.rol('verb').toLowerCase() !== verbo) { fallo(`«${q}» → verbo «${p.rol('verb')}», y es «${verbo}»`); malC++; }
}
if (!malC) console.log(`   ✓ ${COPULA.length} con «be» de verbo principal · ${NO_COPULA.length} donde el verbo sí está`);

console.log('\n9 · con una subordinada al frente, el hueco va en la PREGUNTA');
/* «If I call you, will you answer?» tapaba el «If» y pedía escribirlo como si
   fuera un auxiliar. La pieza es la de la segunda cláusula. */
const cond = pool.find(p => /^if\b/i.test(p.q));
if (!cond) console.log('   — no hay ninguna en el banco ahora mismo');
else if (/^____/.test(fHueco(cond))) fallo(`«${cond.q}» → tapa la conjunción: «${fHueco(cond)}»`);
else console.log(`   ✓ ${fHueco(cond)}  (pieza: «${partirPregunta(cond).pieza}»)`);

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nBÁSICO OK');
process.exit(problemas ? 1 : 0);
