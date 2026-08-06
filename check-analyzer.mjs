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

console.log('\n4 · el banco entero sigue analizándose');
const todas = Object.values(BANK).flat();
const rotas = todas.filter(q => !analyze(q).ok);
rotas.forEach(q => console.log('  ✗ ' + q));
if (rotas.length) fail += rotas.length;
console.log(`  ${rotas.length ? '✗' : '✓'} ${todas.length} preguntas del banco`);

console.log(`\n${fail === 0 ? 'ANALIZADOR OK' : fail + ' FALLOS'}`);
process.exit(fail ? 1 : 0);
