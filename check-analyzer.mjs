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

/* «been» queda fuera del guardia de arriba: no es un sustantivo deverbal, es
   solo verbo. El guardia lo saltaba igual —veía el determinante y otro verbo
   detrás— y el sujeto se quedaba con él: «Have the dogs been working at home?»
   daba sujeto «the dogs been» y, al perderse «been + -ing», el tiempo salía
   perfecto SIMPLE. El fallo llegaba hasta lo que la app le enseña al alumno.

   Con pronombre nunca se vio, porque sin determinante el guardia ni entra: es el
   mismo punto ciego que ya tenían los semi-auxiliares. Por eso los pares de
   abajo llevan siempre las dos versiones, con determinante y sin él.

   Lo encontró el oráculo de paridad de la suite (Grammaster/src/ql.parity.test.js),
   que genera preguntas con Grammaster y comprueba que este analizador devuelva
   el tiempo y el sujeto con que se construyeron. */
console.log('\n   «been» nunca es sustantivo: el perfecto continuo con determinante');
[ ['Have the dogs been working at home?','present-perfect-continuous'],
  ['Have they been working at home?','present-perfect-continuous'],
  ['Have the students been studying?','present-perfect-continuous'],
  ['Have my friends been working?','present-perfect-continuous'],
  ['Has the dog been working at home?','present-perfect-continuous'],
  ['Have dogs been working at home?','present-perfect-continuous'],
  // y el perfecto simple con el mismo sujeto sigue siendo simple
  ['Have the dogs worked at home?','present-perfect'],
  ['Has the dog worked at home?','present-perfect'],
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

/* «How many/much + sustantivo» también puede ser el sujeto, y faltaba: la lista
   de wh-sujeto mira la PRIMERA palabra y ahí dice «how». Sin eso la pregunta se
   iba por la rama normal, que sale a buscar sujeto detrás del auxiliar y se
   queda con lo que haya («working», «been») o, peor, la denuncia como
   incompleta. La versión con auxiliar es la que rompía; la de verbo simple
   («How many people work here?») siempre estuvo bien, y va al lado para que se
   vea que el eje es el auxiliar, no el cuantificador. */
console.log('\n   la wh de sujeto también puede ser «how many / how much»');
[ ['How many people are working?','present-continuous'],
  ['How many people have worked here?','present-perfect'],
  ['How many people have been working?','present-perfect-continuous'],
  ['How much money has been spent?','present-perfect'],
  ['How many students will come?','simple-future'],
  ['How many people work here?','simple-present'],
  ['How many people used to work here?','used-to'],
].forEach(([q,e]) => ok(q,e));

/* El hábito pasado también existe sin auxiliar. Esta rama solo sabía de verbos
   de UNA palabra, así que se quedaba con «used», lo daba por Pasado Simple y
   dejaba «to work» en el complemento: la perífrasis partida por la mitad, el
   mismo fallo que el declarativo del Desgramatizador tenía con «did not use to».
   Ojo con la etiqueta: `tenseIdOf` reconoce el tiempo por el «used to» en
   MINÚSCULA, así que un «Used to» capitalizado se le escapa y cae en el
   simple-present de reserva. */
console.log('\n   pregunta de sujeto con «used to» (sin auxiliar)');
[ ['Who used to work here?','used-to'],             ['Which student used to study here?','used-to'],
  ['What used to happen?','used-to'],
  // el pasado simple con el mismo aire no se contagia
  ['Who used the computer?','simple-past'],         ['Who worked here?','simple-past'],
].forEach(([q,e]) => ok(q,e));

console.log('\n   y lo que NO es pregunta de sujeto');
[ ['What are you doing?','present-continuous'],     ['Who is your teacher?','to-be-pres'],
  ['What is your name?','to-be-pres'],              ['Where is he going?','present-continuous'],
  ['Who is she talking to?','present-continuous'],  ['What have you done today?','present-perfect'],
  ['Does work start at eight?','simple-present'],   ['Is the plan working?','present-continuous'],
  // las cuantificadas de ADJUNTO llevan su propio sujeto y no deben confundirse
  ['How many books did you buy?','simple-past'],    ['How much money do you have?','simple-present'],
  ['How many hours are you working?','present-continuous'],
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

console.log('\n   sin sujeto AVISA, también con modal');
{
  /* Los modales faltaban en el guardia: «What would do?» se daba por buena y
     convertía el verbo en sujeto, mientras que «Where do go?» sí avisaba. */
  const faltaSujeto = ['What would do?', 'What would do if you won the lottery?',
                       'Would travel if you were rich?', 'Where do go?'];
  for (const q of faltaSujeto) {
    const r = analyze(q);
    const bien = r.ok && r.incomplete && r.parts.some(p => p.role === 'gap' && /sujeto|subject/.test(p.label));
    if (!bien) fail++;
    console.log(`  ${bien ? '✓' : '✗'} ${q}  →  ${r.ok ? (r.incomplete ? 'avisa' : 'la da por buena') : 'error'}`);
  }
  /* Y NO se lleva por delante las preguntas de SUJETO con modal, que tienen la
     misma forma: «What will happen?» es válida y «What would do?» no. Lo único
     que las separa es que `do` como verbo principal exige objeto. */
  for (const q of ['Who will come?', 'What will happen?', 'Who can help?',
                   'What would happen if you won the lottery?', 'What would do the job?']) {
    const r = analyze(q);
    const bien = r.ok && !r.incomplete && /sujeto|subject/.test(r.type);
    if (!bien) fail++;
    console.log(`  ${bien ? '✓' : '✗'} ${q}  →  ${r.ok ? (r.incomplete ? 'avisa de más' : r.type) : 'error'}`);
  }
  /* Ni los sujetos que parecen verbo: si hay otro verbo después, la palabra
     pegada al auxiliar era el sujeto. */
  for (const q of ['Would swimming help?', 'Does work start at eight?', 'Is the plan working?']) {
    const r = analyze(q);
    const bien = r.ok && !r.incomplete;
    if (!bien) fail++;
    console.log(`  ${bien ? '✓' : '✗'} ${q}  →  ${r.ok && !r.incomplete ? 'la analiza (correcto)' : 'avisa de más'}`);
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


/* ── Una errata NO es una pieza que falta ────────────────────────────────────
   «Does she wrok at home?» daba «pregunta incompleta: falta el verbo» con el
   verbo delante, a dos letras cruzadas de estar bien. Es el mismo modo de fallo
   que el hueco falso de «How many people have worked…»: decirle al alumno que
   su trabajo correcto está mal armado.

   El pozo de candidatos son SOLO los verbos, no el diccionario entero: lo que
   falta ahí es un verbo POR POSICIÓN, así que el hueco ya dice de qué clase de
   palabra se trata.
   ------------------------------------------------------------------------- */
const sugerenciasDelAviso = (q) => {
  const r = analyze(q);
  const nota = (r.notes || [])[0] || '';
  const m = nota.match(/escribir ([^—]+)—/);
  return m ? m[1].replace(/<[^>]+>/g, '').trim().split(/\s*\/\s*/) : [];
};
const proponer = (q, esperado) => {
  const s = sugerenciasDelAviso(q);
  const bien = esperado === null ? s.length === 0 : s[0] === esperado;
  if (!bien) fail++;
  console.log(`  ${bien ? '✓' : '✗'} ${q.padEnd(32)} ${s.length ? s.join(' / ') : '(sin sugerencia)'}` +
    (bien ? '' : `   (esperado ${esperado === null ? 'ninguna' : esperado})`));
};

console.log('\n7 · una errata no es una pieza que falta');
[ ['Does she wrok at home?', 'work'],   ['Do you liek pizza?', 'like'],
  ['Do you wach TV?', 'watch'],         ['Did he stdy English?', 'study'],
  ['Where do you lveie?', 'lie'],
].forEach(([q, e]) => {
  // «study» compite con «stay» a la misma distancia; basta con que esté entre las tres.
  const s = sugerenciasDelAviso(q);
  const bien = s.includes(e);
  if (!bien) fail++;
  console.log(`  ${bien ? '✓' : '✗'} ${q.padEnd(32)} ${s.join(' / ') || '(nada)'}${bien ? '' : `   (faltaba ${e})`}`);
});

/* Cuando el verbo falta DE VERDAD, el aviso original ya acierta y proponer de
   más lo estropea. Una palabra funcional bien escrita no es un verbo mal
   escrito: sin el guardia, «What do you?» proponía que «you» era errata de
   «do», y «Did he the book?» que «the» lo era de «be». */
console.log('\n   y cuando el verbo falta de verdad, no inventa erratas');
[ 'Does she at home?', 'What do you?', 'Did he the book?',
  'Do they here?', 'What did she very?', 'Do they always?',
].forEach(q => proponer(q, null));

/* El generador de erratas como oráculo, igual que en Grammaster: se parte de un
   verbo del léxico, se le aplica un desliz de teclado y se comprueba que la app
   lo recupere. Nadie escribe la expectativa — la respuesta correcta es, por
   construcción, el verbo del que se partió. El umbral es el suelo medido, no
   una aspiración. */
console.log('\n   generador de erratas sobre el léxico de verbos');
{
  const VECINAS = { q:'wa',w:'qes',e:'wrd',r:'etf',t:'ryg',y:'tuh',u:'yij',i:'uok',o:'ipl',p:'ol',
    a:'qsz',s:'awdx',d:'serfc',f:'drtgv',g:'ftyhb',h:'gyujn',j:'huikm',k:'jiol',l:'kop',
    z:'asx',x:'zsdc',c:'xdfv',v:'cfgb',b:'vghn',n:'bhjm',m:'njk' };
  const DESLICES = {
    'tecla vecina': (w, i) => { const v = VECINAS[w[i]]; return v ? w.slice(0,i)+v[Math.floor(v.length/2)]+w.slice(i+1) : null; },
    'transposición': (w, i) => (i+1 < w.length ? w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2) : null),
    'omisión': (w, i) => w.slice(0,i)+w.slice(i+1),
  };
  /* Suelos medidos sobre los 279 verbos del léxico (98% / 97% / 94%), con
     margen. No son aspiraciones: si alguien vuelve la distancia a Levenshtein,
     la transposición se desploma y esto lo dice en voz alta. */
  const SUELO = { 'tecla vecina': 90, 'transposición': 90, 'omisión': 85 };
  const verbos = [...(QL.VERB_BASES || [])];
  const base = (verbos.length ? verbos : ['work','study','watch','listen','travel','visit','cook','dance','play','live'])
    .filter(v => v.length >= 4 && /^[a-z]+$/.test(v));

  for (const [nombre, desliz] of Object.entries(DESLICES)) {
    let n = 0, ok3 = 0;
    for (const v of base) {
      const e = desliz(v, Math.floor(v.length / 2));
      if (!e || e === v) continue;
      n++;
      if (sugerenciasDelAviso(`Does she ${e} at home?`).includes(v)) ok3++;
    }
    const pct = n ? Math.round(100 * ok3 / n) : 0;
    const bien = pct >= SUELO[nombre];
    if (!bien) fail++;
    console.log(`  ${bien ? '✓' : '✗'} ${nombre.padEnd(15)} ${pct}% entre las tres (suelo ${SUELO[nombre]}%, n=${n})`);
  }
}

console.log(`\n${fail === 0 ? 'ANALIZADOR OK' : fail + ' FALLOS'}`);
process.exit(fail ? 1 : 0);
