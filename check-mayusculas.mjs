/* ============================================================================
   MAYÚSCULAS · `node check-mayusculas.mjs` desde aquí.
   ----------------------------------------------------------------------------
   El libro enseña «January NOT january», y el error existe porque el español y
   el inglés NO coinciden ahí: enero/January, lunes/Monday, chileno/Chilean. El
   motor vive en Grammar HUB (`capitals-engine.js`) y su cabecera cuenta el
   porqué largo; aquí solo se comprueba que esta app lo use bien.

   La mitad de este archivo son casos que NO deben avisar, y es a propósito: el
   riesgo de esta regla no es dejar pasar un error, es INVENTARLO. «May I help
   you?» es una pregunta correcta y `may` es un mes; una regla ingenua le diría
   al alumno que su pregunta bien hecha está mal, en la app donde acaba de
   escribirla.
   ============================================================================ */
import { QL } from './check-env.mjs';

const { analyze } = QL;
const aviso = (q) => (analyze(q).warnings || [])
  .filter(w => /mayúscula|capital/i.test(w))
  .map(w => w.replace(/<[^>]+>/g, ''));

let fallos = 0;
const caso = (q, debe, motivo) => {
  const hay = aviso(q).length > 0;
  if (hay === debe) return;
  fallos++;
  console.log(`   ✗ «${q}»`);
  console.log(`       ${debe ? 'debería avisar y no avisa' : 'avisa y NO debería'} — ${motivo}`);
  if (hay) console.log(`       dijo: ${aviso(q)[0]}`);
};

console.log('\n── avisa cuando toca ──');
caso('Do you work in january?', true, 'mes en minúscula');
caso('Does she study on monday?', true, 'día en minúscula');
caso('Is she chilean?', true, 'nacionalidad en minúscula');
caso('Do you speak spanish and english?', true, 'dos idiomas en minúscula');
caso('Did you travel in may?', true, 'mes ambiguo CON preposición de tiempo delante');

console.log('── y se calla cuando no ──');
caso('Do you work in January?', false, 'ya está bien escrito');
caso('May I help you?', false, 'MODAL, no el mes — el caso que justifica toda la maquinaria');
caso('Do the soldiers march every day?', false, 'verbo, no el mes');
caso('Where do you live?', false, 'no hay nada que marcar');
caso('Do you go south?', false, 'dirección, no parte de «North America»');
caso('Do you live in chile?', false, 'los países quedan fuera: el español también los capitaliza');

console.log('── la primera palabra la manda el inicio de oración, no esta regla ──');
caso('january is cold, right?', false, 'iría en mayúscula igual por abrir la pregunta');
caso('monday works for you?', false, 'lo mismo');

console.log(fallos ? `\n✗ ${fallos} caso(s) mal` : '\nMAYÚSCULAS OK · avisa lo que toca y calla lo demás');
process.exit(fallos ? 1 : 0);
