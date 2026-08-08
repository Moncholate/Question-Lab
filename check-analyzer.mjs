/* ============================================================================
   Ambigüedad léxica del analizador · `node check-analyzer.mjs` desde aquí.
   ----------------------------------------------------------------------------
   Todo lo que hay acá son PARES MÍNIMOS: la misma palabra en sus dos lecturas.
   Están así a propósito. Un "arreglo" de ambigüedad que solo mira un lado
   siempre parece funcionar — arregla «Is the map confusing?» y rompe «Am I
   confusing you?», y nadie se entera porque nadie prueba la otra mitad.

   Cubre tres mecanismos del analizador que se ven raros si no se sabe para qué
   están, y que por eso son candidatos a que alguien los "simplifique":

   1. Homónimo sustantivo-verbo (stop, pass, watch, order…). El verbo VA en el
      léxico: sacarlo no evita el problema, impide que la pregunta se parsee.
   2. Verbos psicológicos en -ing (PSY_TRANS / PSY_INTRANS + adjEnIng). En
      progresivo piden objeto; sin nada detrás, la lectura es adjetiva.
   3. Sustantivo deverbal dentro del sujeto («Is the plan working?»). Si hay
      determinante abriendo el sintagma y otro verbo detrás, el primero era
      sustantivo.
   ============================================================================ */
import { QL, BANK } from './check-env.mjs';
const { analyze, tenseIdOf } = QL;

let fail = 0;
const t = q => { const r = analyze(q); return r.ok ? tenseIdOf(r.tense) : 'RECHAZADA'; };
const ok = (q, esp) => {
  const got = t(q);
  const bien = got === esp;
  if (!bien) fail++;
  console.log(`  ${bien ? '✓' : '✗'} ${q.padEnd(38)} ${got}${bien ? '' : `   (esperado ${esp})`}`);
};

console.log('AMBIGÜEDAD LÉXICA · pares mínimos\n');

console.log('1 · sustantivo o verbo (la misma palabra, las dos lecturas)');
[ ['Does the bus stop here?','simple-present'],   ['Where is the bus stop?','to-be-pres'],
  ['Did you pass the exam?','simple-past'],       ['Is your pass valid?','to-be-pres'],
  ['Do you watch TV?','simple-present'],          ['Is your watch expensive?','to-be-pres'],
  ['Did you order a coffee?','simple-past'],      ['Is the order ready?','to-be-pres'],
  ['Did she call you?','simple-past'],            ['Was the call important?','to-be-past'],
  ['Do you plan your week?','simple-present'],    ['Is the plan ready?','to-be-pres'],
  ['Did you change jobs?','simple-past'],         ['Do you have change?','simple-present'],
  ['Did he answer the phone?','simple-past'],     ['Is the answer correct?','to-be-pres'],
  ['Do you work here?','simple-present'],         ['Does work start at eight?','simple-present'],
].forEach(([q,e]) => ok(q,e));

console.log('\n2 · adjetivo en -ing o gerundio (verbos psicológicos)');
[ ['Is the map confusing?','to-be-pres'],         ['Am I confusing you?','present-continuous'],
  ['Is the music relaxing?','to-be-pres'],        ['Are you relaxing?','present-continuous'],
  ['Is your job interesting?','to-be-pres'],      ['Are you interesting the client?','present-continuous'],
  ['Is she boring?','to-be-pres'],                ['Is the teacher boring the class?','present-continuous'],
  ['Is the noise annoying?','to-be-pres'],        ['Am I annoying you?','present-continuous'],
  ['Is the result surprising?','to-be-pres'],     ['Are you surprising her?','present-continuous'],
  ['Is it embarrassing?','to-be-pres'],           ['Are you embarrassing me?','present-continuous'],
  ['Is the delay worrying?','to-be-pres'],        ['Are you worrying about it?','present-continuous'],
  ['Was the film disappointing?','to-be-past'],   ['Was he disappointing his parents?','past-continuous'],
  ['Was the trip tiring?','to-be-past'],          ['Was the noise tiring the students?','past-continuous'],
  // un adverbio final no es objeto
  ['Is the music relaxing tonight?','to-be-pres'],['Are you relaxing tonight?','present-continuous'],
].forEach(([q,e]) => ok(q,e));

console.log('\n   la lista es de verbos QUE PIDEN OBJETO, no de «psicológicos»');
// «move» estuvo en la lista y rompió esto: un tren se mueve solo. La pregunta
// para agregar una palabra es si la acción puede no llevar objeto.
[ ['Is the train moving?','present-continuous'],  ['Are you moving?','present-continuous'],
  ['Is the line moving?','present-continuous'],   ['Are they moving the sofa?','present-continuous'],
].forEach(([q,e]) => ok(q,e));

console.log('\n   -ing adjetivos frecuentes, con su lectura verbal al lado');
[ ['Is the work demanding?','to-be-pres'],        ['Is he demanding a refund?','present-continuous'],
  ['Is the show entertaining?','to-be-pres'],     ['Are they entertaining guests?','present-continuous'],
  ['Is the result promising?','to-be-pres'],      ['Are you promising too much?','present-continuous'],
  ['Is the drink refreshing?','to-be-pres'],      ['Is the sign misleading?','to-be-pres'],
  ['Is the news alarming?','to-be-pres'],         ['Is the view stunning?','to-be-pres'],
].forEach(([q,e]) => ok(q,e));

console.log('\n   adverbio de grado: zanja sin consultar ninguna lista');
// «soothing» no está en PSY_TRANS y aun así sale bien.
[ ['Is the water very soothing?','to-be-pres'],   ['Is the movie quite boring?','to-be-pres'],
  ['Is it too demanding?','to-be-pres'],
  // «really» queda fuera a propósito: sí puede ir delante de un progresivo
  ['Are you really working?','present-continuous'],['Is she really studying?','present-continuous'],
].forEach(([q,e]) => ok(q,e));

console.log('\n   la regla debe ABSTENERSE cuando el verbo no es psicológico');
[ ['Are you working?','present-continuous'],      ['Is she cooking dinner?','present-continuous'],
  ['Are they building a house?','present-continuous'], ['Is it raining?','present-continuous'],
  ['What are you doing?','present-continuous'],    ['Is your phone charging?','present-continuous'],
  ['Why is the bus stopping?','present-continuous'],['Are you studying English?','present-continuous'],
].forEach(([q,e]) => ok(q,e));

console.log('\n3 · sustantivo deverbal como sujeto («the plan», «your watch»)');
[ ['Is the plan working?','present-continuous'],  ['Is your watch working?','present-continuous'],
  ['Was the call helping?','past-continuous'],    ['Is the change helping?','present-continuous'],
  ['Is the answer changing?','present-continuous'],['Was the order arriving?','past-continuous'],
  ['Is the new plan working?','present-continuous'],['Did the plan work?','simple-past'],
].forEach(([q,e]) => ok(q,e));

console.log('\n   sin otro verbo detrás no se toca nada');
[ ['Is the plan ready?','to-be-pres'],            ['Does the bus stop here?','simple-present'],
  ['Where is the bus stop?','to-be-pres'],        ['Is your watch expensive?','to-be-pres'],
].forEach(([q,e]) => ok(q,e));

/* La pregunta de sujeto no es ambigüedad léxica, pero comparte el problema de
   fondo: un hueco que parece un error y no lo es. «Who is coming?» no tiene
   sujeto entre el auxiliar y el verbo porque la wh-word YA es el sujeto.
   Antes daba dos resultados malos, y el segundo era el peor posible en una app
   de enseñanza: decirle al alumno que su pregunta correcta está mal armada. */
console.log('\n4 · pregunta de sujeto con tiempo compuesto');
[ ['Who is coming tonight?','present-continuous'],  ['Who is calling?','present-continuous'],
  ['What is happening?','present-continuous'],      ['Who was waiting?','past-continuous'],
  ['Who has called?','present-perfect'],            ['What has changed?','present-perfect'],
  ['Who is going to pay?','future-going-to'],       ['Who has been waiting?','present-perfect-continuous'],
  ['Who is going to the party?','present-continuous'], ['Which student has finished?','present-perfect'],
  // las de verbo simple, que ya funcionaban por otro camino
  ['Who lives here?','simple-present'],             ['Who called you?','simple-past'],
  ['What happened?','simple-past'],                 ['Who will come?','simple-future'],
].forEach(([q,e]) => ok(q,e));

console.log('\n   y lo que NO es pregunta de sujeto');
[ ['What are you doing?','present-continuous'],     ['Who is your teacher?','to-be-pres'],
  ['What is your name?','to-be-pres'],              ['Where is he going?','present-continuous'],
  ['Who is she talking to?','present-continuous'],  ['What have you done today?','present-perfect'],
  ['Does work start at eight?','simple-present'],   ['Is the plan working?','present-continuous'],
].forEach(([q,e]) => ok(q,e));

console.log('\n   la respuesta NOMBRA al sujeto, no agrega un dato al final');
{
  const r = analyze('Who is coming tonight?');
  const largo = (r.answer?.lines || []).map(l => l.pieces.map(p => p.text).join(' ')).join(' | ');
  const bien = r.answer?.kind === 'subject' && largo.includes('[sujeto real] is coming tonight');
  if (!bien) fail++;
  console.log(`  ${bien ? '✓' : '✗'} Who is coming tonight? → ${largo}`);
}

console.log('\n5 · condicionales: la condición es pieza propia, no bloque gris');
{
  const casos = [
    ['What would you do if you won the lottery?', 'if you won the lottery'],
    ['Would you travel if you were rich?',        'if you were rich'],
    ['What would you have done if she had called?', 'if she had called'],
    ['If it rains, will you stay?',               'If it rains'],   // condición al frente
  ];
  for (const [q, esperada] of casos) {
    const r = analyze(q);
    const c = r.ok && r.parts.find(p => p.role === 'cond');
    const bien = c && c.text === esperada;
    if (!bien) fail++;
    console.log(`  ${bien ? '✓' : '✗'} ${q}  →  ${c ? '«' + c.text + '»' : 'sin pieza de condición'}`);
  }
}

console.log('\n   sin verbo principal AVISA, en vez de tomar el de la condición');
{
  /* «What would you if you won the lottery?» daba sujeto «you if you» y verbo
     «won»: una estructura inventada. Peor que no analizar, porque enseña algo
     falso en vez de decir qué falta. El verbo principal va ANTES del `if`. */
  for (const q of ['What would you if you won the lottery?', 'What would you if I left?', 'Would you if I asked?']) {
    const r = analyze(q);
    const bien = r.ok && r.incomplete && r.parts.some(p => p.role === 'gap');
    if (!bien) fail++;
    console.log(`  ${bien ? '✓' : '✗'} ${q}  →  ${r.ok ? (r.incomplete ? 'incompleta, con hueco' : 'la da por buena') : 'error'}`);
  }
}

console.log('\n   el infinitivo perfecto no se desarma («would have done»)');
{
  /* Fallaba en TODA la app, no solo en la 3ª condicional: tomaba `have` como
     verbo principal y dejaba el participio en el complemento. */
  const casos = [['What would you have done?', 'done'], ['Where would she have gone?', 'gone'],
                 ['Should you have called?', 'called'], ['What have you done?', 'done']];
  for (const [q, verbo] of casos) {
    const r = analyze(q);
    const v = r.ok && r.parts.find(p => p.role === 'verb');
    const sinResto = r.ok && !r.parts.some(p => p.role === 'comp');
    const bien = v && v.text === verbo && sinResto;
    if (!bien) fail++;
    console.log(`  ${bien ? '✓' : '✗'} ${q}  →  verbo «${v ? v.text : '—'}»`);
  }
}

console.log('\n   el sujeto de la subordinada se voltea POR SU CUENTA');
{
  /* «What would you do if I left?» se responde «…if YOU left»: el `I` de la
     condición es quien pregunta. Sin esto salían «if I left» y, peor,
     «if I call me». Vale para cualquier subordinada, no solo para `if`. */
  const casos = [
    ['What would you do if I left?',        'if you left'],
    ['What will you do if I call you?',     'if you call me'],
    ['Where do you go when I am busy?',     'when you are busy'],
    ['What would you do if you were rich?', 'if I were rich'],   // subjuntivo intacto
  ];
  for (const [q, esperado] of casos) {
    const r = analyze(q);
    const texto = r.ok && r.answer ? r.answer.lines.map(l => l.pieces.map(p => p.text).join(' ')).join(' ') : '';
    const bien = texto.includes(esperado);
    if (!bien) fail++;
    console.log(`  ${bien ? '✓' : '✗'} ${q}  →  ${texto || 'sin respuesta'}`);
  }
}

console.log('\n6 · el banco entero sigue analizándose');
const todas = Object.values(BANK).flat();
const rotas = todas.filter(q => !analyze(q).ok);
rotas.forEach(q => console.log('  ✗ ' + q));
if (rotas.length) fail += rotas.length;
console.log(`  ${rotas.length ? '✗' : '✓'} ${todas.length} preguntas del banco`);

console.log(`\n${fail === 0 ? 'ANALIZADOR OK' : fail + ' FALLOS'}`);
process.exit(fail ? 1 : 0);
