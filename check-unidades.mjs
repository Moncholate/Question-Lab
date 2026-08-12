/* ============================================================================
   Auditoría del filtro por UNIDAD · `node check-unidades.mjs` desde esta carpeta.
   ----------------------------------------------------------------------------
   Existe por la misma razón que check-bank: aquí los errores no dan error, dan
   SILENCIO. Si un contenido lleva una unidad mal escrita, o un id no está en
   curriculum.json, o el filtro se pasa de frenada, el resultado no es una
   excepción: es un ejercicio que no aparece nunca, o uno que aparece cuando la
   clase todavía no lo ha visto. Las dos cosas se ven perfectamente normales
   probando la app a mano.

   El fallo más traicionero es el de `visto()`: ante un id que no conoce
   devuelve `true`, para no estorbar. O sea que una errata en un id no cierra la
   puerta, la ABRE — y en silencio. Eso se comprueba aquí, no en la app.

   Corre el script inline de index.html contra un DOM de mentira, igual que los
   otros chequeos, para probar el filtro DE VERDAD.
   Sale con código 1 si algo no cuadra.
   ============================================================================ */
import { QL } from './check-env.mjs';

const { ID_TENSES, LV, CONTENT, UNITS, CHALLENGES, setLevel, setUnidad,
        unidadDe, unidadIndice, buildIdPool, buildRPool, buildFPool,
        getIdPool, getRPool, getChallenges, getFPool } = QL;

/* Los cuatro pozos, para no repetirlos en cada bloque. «Falta una pieza» también
   corrige y puntúa, así que se acota igual que los otros. */
const rehacer = () => { buildIdPool(); buildRPool(); buildFPool(); };
const pozos = () => [...getIdPool(), ...getRPool(), ...getFPool()];
const total = () => pozos().length + getChallenges().length;

let problemas = 0;
const fallo = (msg) => { console.log('   ✗ ' + msg); problemas++; };

console.log('QUESTION LAB · filtro por unidad del curso\n');

/* ── 1. Todo id que la app gatea tiene que existir en el currículo ──────────
   Si no existe, `visto()` lo deja pasar siempre y el filtro no filtra. */
console.log('1 · todos los ids conocen su unidad');
for (const o of ID_TENSES) {
  if (!CONTENT[o.id]) fallo(`ID_TENSES «${o.id}» no está en curriculum.json → nunca se acota`);
  else if (!unidadDe(o.id)) fallo(`«${o.id}» está en curriculum.json pero sin unidad`);
  if (!o.cefr) fallo(`ID_TENSES «${o.id}» se quedó sin nivel`);
}
for (const ch of CHALLENGES) {
  if (ch.t && !CONTENT[ch.t]) fallo(`Construye: el desafío «${ch.t}» no está en curriculum.json`);
  if (!ch.t && !ch.c) fallo(`Construye: hay un desafío sin contenido ni nivel: «${ch.prompt}»`);
}
if (!CONTENT['subject-question']) fallo('falta «subject-question»: las preguntas sin auxiliar no se acotarían');
if (!problemas) console.log('   ✓ ' + (ID_TENSES.length + CHALLENGES.length) + ' ids cruzados contra el currículo');

/* ── 2. La unidad que usa Question Lab es la de PREGUNTAR ───────────────────
   Del presente simple no vale la 5A —donde solo se ven (+) y (−)— sino la 5B.
   Aquí todo es una pregunta: con la 5A, un alumno de esa clase recibiría
   «Do you like coffee?» una semana antes de que se lo enseñen. */
console.log('\n2 · el presente simple se acota por la unidad de las preguntas');
if (unidadDe('simple-present') !== '5B')
  fallo(`simple-present se acota en «${unidadDe('simple-present')}» y debería ser 5B (Simple present (?))`);
else console.log('   ✓ simple-present → 5B, no 5A');

/* ── 2b. La tercera persona del singular es una clase aparte ────────────────
   Básico I enseña a preguntar en la 5B (con `do`) y he/she/it en la 6A. Entre
   una y otra, «Does he speak English?» pide justo lo que aún no ha visto. */
console.log('\n2b · «does» no llega antes que he/she/it');
const conDoes = () => [...getIdPool(), ...getRPool()].filter(p => /\bdoes(n't)?\b/i.test(p.q));
setLevel('basico1'); setUnidad('5B'); buildIdPool(); buildRPool();
const en5B = conDoes().length;
setUnidad('6A'); buildIdPool(); buildRPool();
const en6A = conDoes().length;
if (en5B) fallo(`en la 5B ya salen ${en5B} preguntas con «does», y eso es la 6A`);
if (!en6A) fallo('en la 6A no aparece ninguna pregunta con «does»: el filtro no las devuelve nunca');
if (!en5B && en6A) console.log(`   ✓ 0 en la 5B, ${en6A} en la 6A`);

/* ── 2c. Reenviar el MISMO nivel no borra la unidad ─────────────────────────
   El Hub manda `GRAMMAR_HUB_LEVEL` por postMessage cada vez que carga el
   iframe, y eso llama a `setLevel` con el nivel que ya estaba. Si ahí se
   reiniciara la unidad, el alumno la pondría y desaparecería sola en la
   siguiente visita, sin ningún mensaje de error. */
console.log('\n2c · el nivel repetido no reinicia la unidad');
setLevel('intermedio2'); setUnidad('9A');
setLevel('intermedio2');                     // lo que hace el Hub al cargar
if (QL.getUnidad() !== '9A') fallo(`reenviar el mismo nivel dejó la unidad en «${QL.getUnidad()}»`);
else {
  setLevel('basico2');                       // cambio de verdad: sí reinicia
  if (QL.getUnidad() !== null) fallo(`cambiar de curso NO reinició la unidad: «${QL.getUnidad()}»`);
  else console.log('   ✓ mismo nivel la conserva, cambio de curso la reinicia');
}

/* ── 2d. La wh también tiene su unidad ──────────────────────────────────────
   En «Falta la wh» la wh ES la respuesta del ejercicio, así que su unidad manda
   tanto como la del tiempo verbal. El grueso es Básico I 2B, pero el libro pone
   varias aparte y ahí estaba el agujero: Básico I en la 2B llegaba a pedir
   «how much», que es la 9B de Elemental II. */
console.log('\n2d · ninguna wh llega antes de su clase');
/* Solo las ABIERTAS del pozo: ahora los dos tipos van mezclados en uno, así que
   se filtra por `k` en vez de tener un pozo aparte. */
const whsEn = (nivel, u) => { setLevel(nivel); setUnidad(u); buildFPool();
  return [...new Set(getFPool().filter(p => p.k === 'wh')
                               .map(p => QL.partirPregunta(p).pieza.toLowerCase()))]; };
const idWh = w => 'wh-' + w.replace(/\s+/g, '-');
let whMal = 0;
for (const nivel of LV) for (const u of (UNITS[nivel] || [])) {
  for (const w of whsEn(nivel, u)) {
    const c = CONTENT[idWh(w)];
    if (!c) { fallo(`la wh «${w}» no está en curriculum.json → nunca se acota`); whMal++; continue; }
    if (c.level !== nivel) continue;                 // curso anterior: vista entera
    if (unidadIndice(c.unit) > unidadIndice(u)) {
      fallo(`[${nivel} ${u}] sale «${w}», que es la ${c.unit}`); whMal++;
    }
  }
}
if (!whMal) console.log('   ✓ las 19 wh cruzadas contra el currículo, curso por curso');
/* Y las cuatro que el temario sitúa aparte no pueden colarse antes de tiempo. */
console.log('\n2e · las cuatro que el libro retrasa, en su sitio');
const tarde = { 'how often': ['basico1', '6B'], whose: ['elemental1', '4A'],
                'how much': ['elemental2', '9B'], 'how long': ['intermedio2', '9B'] };
for (const [w, [niv, u]] of Object.entries(tarde)) {
  const antes = (UNITS[niv] || [])[Math.max(0, (UNITS[niv] || []).indexOf(u) - 1)];
  if (whsEn(niv, antes).includes(w)) fallo(`«${w}» ya sale en ${niv} ${antes} y es la ${u}`);
  if (!whsEn(niv, u).includes(w)) fallo(`«${w}» NO aparece en ${niv} ${u}: el filtro la deja fuera para siempre`);
}
if (!problemas) console.log('   ✓ how often · whose · how much · how long aparecen justo en su unidad');

/* ── 3. Ningún ejercicio se adelanta a su unidad ────────────────────────────
   El recorrido completo: cada curso, unidad por unidad, los tres pozos. */
console.log('\n3 · nada aparece antes de su clase');
const antes = (u, tope) => unidadIndice(u) <= unidadIndice(tope);
let combinaciones = 0;
for (const nivel of LV) {
  setLevel(nivel);
  for (const u of (UNITS[nivel] || [])) {
    setUnidad(u);
    combinaciones++;
    rehacer();
    for (const p of pozos()) {
      const c = CONTENT[p.tid];
      if (!c || c.level !== nivel) continue;              // de curso anterior: visto entero
      if (!antes(unidadDe(p.tid), u))
        fallo(`[${nivel} ${u}] «${p.q}» es ${p.tid}, que es la ${unidadDe(p.tid)}`);
    }
    for (const ch of getChallenges()) {
      const c = ch.t && CONTENT[ch.t];
      if (!c || c.level !== nivel) continue;
      if (!antes(unidadDe(ch.t), u))
        fallo(`[${nivel} ${u}] Construye «${ch.t}» es de la ${unidadDe(ch.t)}`);
    }
  }
}
console.log(`   ✓ ${combinaciones} combinaciones curso×unidad revisadas`);

/* ── 4. Avanzar de unidad nunca quita ejercicios ────────────────────────────
   Un filtro que se pasa de frenada encogería el pozo al avanzar. Nadie lo
   notaría: la app seguiría dando ejercicios, solo que menos. */
console.log('\n4 · avanzar en el curso solo suma');
for (const nivel of LV) {
  setLevel(nivel);
  let prev = -1, prevU = null;
  for (const u of (UNITS[nivel] || [])) {
    setUnidad(u);
    rehacer();
    const n = total();
    if (prev >= 0 && n < prev) fallo(`[${nivel}] de ${prevU} a ${u} el pozo BAJA de ${prev} a ${n}`);
    prev = n; prevU = u;
  }
}
console.log('   ✓ el pozo crece o se queda igual en los 7 cursos');

/* ── 5. «Todo el curso» no pierde nada ──────────────────────────────────────
   Es la regresión que importa: quien no conteste la unidad tiene que seguir
   viendo exactamente lo que veía antes de que existiera este filtro. */
console.log('\n5 · «todo el curso» deja el pozo como estaba');
for (const nivel of LV) {
  setLevel(nivel); setUnidad('');
  rehacer();
  const todo = total();
  setUnidad((UNITS[nivel] || []).slice(-1)[0]);
  rehacer();
  const ultima = total();
  if (todo !== ultima) fallo(`[${nivel}] «todo el curso» da ${todo} y la última unidad ${ultima}`);
}
console.log('   ✓ igual que la última unidad, en los 7 cursos');

/* ── 6. Cada curso llega a tener con qué practicar ──────────────────────────
   Que el primer día no haya nada es correcto y esperado. Que al terminar el
   curso siga sin haber nada sería un contenido inalcanzable. */
console.log('\n6 · ningún curso se queda sin práctica');
for (const nivel of LV) {
  setLevel(nivel); setUnidad('');
  rehacer();
  const [i, r, b, w] = [getIdPool().length, getRPool().length, getChallenges().length, getFPool().length];
  if (!i || !r || !b || !w) fallo(`[${nivel}] pozos vacíos → Identifica ${i} · Responde ${r} · Construye ${b} · Pieza ${w}`);
}
if (!problemas) console.log('   ✓ los 7 cursos tienen ejercicios en los 3 modos');

/* ── Resumen legible: dónde empieza a haber práctica en cada curso ──────── */
console.log('\nCuándo empieza a haber ejercicios en cada curso:');
for (const nivel of LV) {
  setLevel(nivel);
  const us = UNITS[nivel] || [];
  let primera = null;
  for (const u of us) {
    setUnidad(u); rehacer();
    if (total()) { primera = u; break; }
  }
  setUnidad(''); rehacer();
  const detalle = `${getIdPool().length} id · ${getRPool().length} resp · ${getChallenges().length} constr · ${getFPool().length} pieza`;
  console.log(`  ${nivel.padEnd(12)} desde ${String(primera || '—').padEnd(4)} (curso completo: ${detalle})`);
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nUNIDADES OK');
process.exit(problemas ? 1 : 0);
