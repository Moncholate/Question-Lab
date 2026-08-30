/* ============================================================================
   EL REPORTE · Question Lab · `node check-reporte.mjs` desde esta carpeta.
   ----------------------------------------------------------------------------
   Existe por un fallo real y de la peor especie: el reporte NO SE ROMPE cuando
   le falta algo, simplemente sale corto. El profesor reportó un problema desde
   «Falta una pieza» y el correo que llegó decía «— FILLPIECE —» y nada más: el
   modo se creó después que el reporte y nadie volvió a mirar esta función.
   Un reporte incompleto se ve exactamente igual que uno completo hasta que lo
   necesitas, y para entonces el ejercicio que fallaba ya no existe.

   Y el segundo fallo del mismo día: el reporte de Analiza traía la oración pero
   no las ETIQUETAS que la app le había puesto. O sea, contaba de qué se queja el
   alumno pero no CONTRA QUÉ se queja, que es la mitad que sirve.

   Regla para agregar: cada panel tiene que aportar las tres cosas que hacen
   falta para reproducir un fallo — QUÉ había delante, QUÉ hizo el alumno y QUÉ
   dijo la app. Si un campo no está, aquí falla.
   ============================================================================ */
import { QL } from './check-env.mjs';

const { construirReporte, hayQueReportar, goAnalyze, setLevel, setUnidad, LV,
        buildIdPool, buildRPool, buildFPool, renderId, renderR, renderF,
        loadChallenge, getFPool } = QL;

setLevel(LV[LV.length - 1]); setUnidad('');

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const doc = globalThis.document;
/* El panel activo se lee del DOM con `.panel.active`, así que hay que fingirlo:
   el arnés no tiene querySelector de verdad. */
const enPanel = (id) => { doc.querySelector = () => ({ id }); };

console.log('QUESTION LAB · el reporte\n');

/* Los datos van ANTES del «—» que separa; después vienen el navegador y el
   hueco que el profesor rellena a mano, que termina en «:» a propósito. */
const datos = (txt) => txt.split('\n—\n')[0];
const exige = (etiqueta, txt, campos) => {
  const cuerpo = datos(txt);
  const faltan = campos.filter(c => !new RegExp(`^${c}:`, 'm').test(cuerpo));
  if (faltan.length) fallo(`${etiqueta} → sin ${faltan.join(', ')}`);
  /* Un campo presente pero vacío es PEOR que ausente: aparenta información. */
  const vacios = (cuerpo.match(/^[^:\n]+: *$/gm) || []);
  if (vacios.length) fallo(`${etiqueta} → campos vacíos: ${vacios.join(' | ')}`);
  return !faltan.length && !vacios.length;
};

/* ── 1. Siempre, en cualquier panel: quién y dónde ───────────────────────── */
console.log('1 · la cabecera va en todos');
enPanel('analyze');
const cabecera = construirReporte();
exige('cabecera', cabecera, ['Curso', 'Unidad', 'Idioma']);
if (!/^Question Lab /.test(cabecera)) fallo('no empieza por la app y su versión');
if (!/Navegador:/.test(cabecera)) fallo('sin el navegador');
if (!problemas) console.log('   ✓ app, versión, curso, unidad, idioma y navegador');

/* ── 2. Analiza: la oración Y lo que la app leyó ─────────────────────────── */
console.log('\n2 · Analiza dice qué escribió y qué leyó la app');
doc.getElementById('qin').value = 'Where do you live?';
goAnalyze('Where do you live?');
enPanel('analyze');
const rep2 = construirReporte();
if (exige('Analiza', rep2, ['Escrito', 'La app leyó', 'Tipo', 'Tiempo'])) {
  /* Las etiquetas de verdad, no una lista de palabras: sin el rol no se puede
     entender el desacuerdo, que es justo lo que se reporta. */
  if (!/La app leyó:.*\bWhere=wh\b/.test(rep2)) fallo(`sin el rol de cada pieza: ${(/La app leyó:.*/.exec(rep2) || [''])[0]}`);
  if (!/Tipo: abierta/.test(rep2)) fallo('no dice si la dio por abierta o cerrada');
  else console.log('   ✓ escrito, roles pieza a pieza, tipo y tiempo');
}

/* ── 3. Los cuatro modos de práctica ─────────────────────────────────────── */
console.log('\n3 · cada modo de práctica aporta ejercicio, respuesta y criterio');
/* QUÉ había delante · QUÉ hizo el alumno · QUÉ daba por bueno la app. */
const MODOS = [
  ['build',     () => { buildIdPool(); loadChallenge(); }, ['Desafío', 'Puesto', 'Orden correcto', 'Corregido', 'Ronda']],
  ['identify',  () => { buildIdPool(); renderId(true); },  ['Pregunta', 'Es', 'Marcó', 'Corregido', 'Ronda']],
  ['respond',   () => { buildRPool(); renderR(true); },    ['Pregunta', 'Es', 'Esperaba', 'Corregido', 'Ronda']],
  ['fillpiece', () => { buildFPool(); renderF(true); },    ['Hueco', 'Pregunta entera', 'Pieza que falta',
                                                            'Evidencia mostrada', 'Aceptaba', 'Corregido', 'Ronda']],
];
for (const [panel, preparar, campos] of MODOS) {
  preparar();
  enPanel(panel);
  let txt;
  try { txt = construirReporte(); }
  catch (e) { fallo(`${panel} → el reporte REVIENTA: ${e.message}`); continue; }
  if (!new RegExp(`— ${panel.toUpperCase()} —`).test(txt)) fallo(`${panel} → no dice en qué modo estaba`);
  if (exige(panel, txt, campos)) console.log(`   ✓ ${panel.padEnd(10)} ${campos.length} campos`);
}

/* ── 3b. El reporte viaja como TEXTO en un correo ────────────────────────── */
console.log('\n3b · nada de HTML dentro del reporte');
/* Los avisos del analizador llevan `<b>` para la pantalla. Pegados en un correo
   se leen literales y ensucian justo el campo que explica el fallo. */
doc.getElementById('qin').value = 'She works in Santiago?';
goAnalyze('She works in Santiago?');
enPanel('analyze');
const rep3b = construirReporte();
if (/<[a-z/][^>]*>/i.test(rep3b)) fallo(`lleva etiquetas HTML: ${(/^.*<[a-z\/][^>]*>.*$/im.exec(rep3b) || [''])[0]}`);
else if (!/^Aviso: /m.test(rep3b)) fallo('con una pregunta que el analizador rechaza, no dice por qué');
else console.log('   ✓ el aviso del analizador llega en texto plano');

/* ── 4. Un pozo vacío se DICE, no se calla ──────────────────────────────── */
console.log('\n4 · sin ejercicio, el reporte lo dice');
/* Básico I unidad 1A no tiene con qué practicar todavía. Antes eso daba un
   reporte mudo, que es indistinguible de un reporte roto. */
setLevel('basico1'); setUnidad('1A');
buildFPool(); buildRPool();
enPanel('fillpiece');
const vacio = construirReporte();
if (getFPool().length) console.log('   — en 1A ya hay ejercicios, no se puede probar el pozo vacío');
else if (!/Ejercicio: ninguno/.test(vacio)) fallo('con el pozo vacío no explica por qué no hay nada');
else console.log('   ✓ lo dice en vez de salir mudo');
setLevel(LV[LV.length - 1]); setUnidad('');

/* ── 5. El final que hace falta para responder ───────────────────────────── */
console.log('\n5 · termina pidiendo lo que la app no puede saber');
enPanel('analyze');
const fin = construirReporte();
if (!/Qué esperaba en vez de eso:|What I expected instead:/.test(fin))
  fallo('no deja el hueco para que el profesor escriba qué esperaba');
else console.log('   ✓ «Qué esperaba en vez de eso»');

/* ── El botón solo cuando hay algo que contar ─────────────────────────────
   El profesor lo dijo mirando la app: «aparece siempre en todas las pestañas y
   en esos casos no reporta nada». Y era verdad — desde la Guía o Progreso el
   informe salía con el encabezado y el nombre del panel, nada más. Un botón que
   no hace nada enseña a no tocarlo, y el día que sí haga falta ya nadie lo usa.
   Esto fija la regla: se reporta lo que la app puso delante. */
console.log('\n6 · el botón solo aparece cuando hay algo que reportar');
{
  const antes = problemas;
  enPanel('guide');
  if (hayQueReportar()) fallo('en la Guía no hay nada que reportar');
  enPanel('progress');
  if (hayQueReportar()) fallo('en Progreso no hay nada que reportar');
  enPanel('practice');
  if (hayQueReportar()) fallo('en el menú de práctica todavía no hay ejercicio');

  enPanel('analyze');
  goAnalyze('Where do you work?');
  if (!hayQueReportar()) fallo('con un análisis hecho SÍ hay que poder reportar');

  enPanel('build');
  loadChallenge(0);
  if (!hayQueReportar()) fallo('con un desafío en pantalla SÍ hay que poder reportar');

  enPanel('identify');
  buildIdPool(); renderId(true);
  if (!hayQueReportar()) fallo('con una pregunta de identificar SÍ hay que poder reportar');

  enPanel('respond');
  buildRPool(); renderR(true);
  if (!hayQueReportar()) fallo('con una pregunta de responder SÍ hay que poder reportar');

  enPanel('fillpiece');
  buildFPool(); renderF(true);
  if (!hayQueReportar()) fallo('con un hueco en pantalla SÍ hay que poder reportar');

  if (problemas === antes) console.log('   ✓ callado en guía, progreso y menú · disponible en los cinco con ejercicio');
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nREPORTE OK');
process.exit(problemas ? 1 : 0);
