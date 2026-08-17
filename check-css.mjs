/* Clases CSS de Question Lab: las que el marcado usa sin que exista regla, y
   las reglas que ya no usa nadie.

   Correr:  node check-css.mjs      (desde la carpeta de Question Lab)

   POR QUÉ: QL es un solo archivo con ~120 clases GLOBALES. Una clase mal
   escrita no da error, simplemente no pinta; y una regla huérfana sobrevive a
   los renombres para siempre. Las dos fallan en silencio.

   LO QUE ESTE CHEQUEO **NO** HACE, a propósito: detectar que un nombre nuevo ya
   pertenece a otro componente (el caso de `.gicon`, que era del toast y se
   reusó para la Guía). Se midió: 34 de las 92 clases de QL tienen la misma
   forma estructural que ese bug y todas son correctas, así que el aviso tendría
   un 3% de acierto. Un aviso ruidoso enseña a ignorar la herramienta. Para eso
   la medida es `grep -n '\.nombre' index.html app.js` ANTES de nombrar una clase.

   TRAMPA al escribirlo: hay clases SIN CSS que están perfectas — son ganchos
   que el JS consulta (`querySelector(".glabel")`). Marcarlas sería mentir, así
   que los selectores dentro del JS también cuentan como uso. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aquí = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(aquí, 'index.html'), 'utf8');
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
/* Dónde se USAN las clases: el marcado del <body> y la app. Van juntos porque
   app.js está lleno de plantillas con `class="…"` y de ganchos
   `querySelector(".x")` — antes vivían dentro de este mismo HTML, y sin ellos
   este chequeo denunciaba como huérfanas 53 clases que se usan a diario. */
const cuerpo = html.slice(html.indexOf('<body'))
  + '\n' + readFileSync(join(aquí, 'app.js'), 'utf8');
/* tokens.css lo genera design-tokens y trae reglas propias (el anillo de foco,
   el chip `.ghf`). Sin leerlo, toda clase generada se denunciaba como «no pinta
   nada» — que era mentira. Va en un conjunto APARTE porque el reporte de reglas
   huérfanas no puede tocarlo: que Question Lab no use una clase compartida no es
   un error de Question Lab, y borrarla de aquí no la borraría de ninguna parte. */
const generado = readFileSync(join(aquí, 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/* ---- definidas: toda clase que aparezca en un selector ---- */
const reglas = (fuente, sink) => {
  for (const m of fuente.matchAll(/(?:^|[};])\s*([^{};@]+?)\s*\{/g))
    for (const c of m[1].matchAll(/\.([A-Za-z_][\w-]*)/g))
      if (!sink.has(c[1])) sink.set(c[1], m[1].trim().split('\n')[0].slice(0, 46));
};
const definidas = new Map();               // clase -> primer selector donde sale
const compartidas = new Map();             // las de tokens.css (generadas)
reglas(css, definidas);
reglas(generado, compartidas);

/* ---- usadas ---- */
const usadas = new Set();
const limpio = s => s.replace(/\$\{[^}]*\}/g, ' ');   // fuera las interpolaciones
const suelta = t => /^[A-Za-z_][\w-]*$/.test(t);

// atributos class="..." tanto del HTML como de las plantillas del JS
for (const m of cuerpo.matchAll(/class(?:Name)?\s*=\s*["'`]([^"'`]*)["'`]/g))
  limpio(m[1]).split(/\s+/).forEach(t => suelta(t) && usadas.add(t));
// classList.add/remove/toggle/contains("x")
for (const m of cuerpo.matchAll(/classList\.\w+\(\s*["']([^"']+)["']/g))
  limpio(m[1]).split(/\s+/).forEach(t => suelta(t) && usadas.add(t));
// selectores dentro del JS: querySelector(".x"), closest(".x"), matches(".x .y")
// Van en su propio conjunto: cuentan como USO (así no salen de regla huérfana)
// pero además quedan EXENTAS de necesitar regla — son ganchos, no estilo.
const ganchosJS = new Set();
for (const m of cuerpo.matchAll(/(?:querySelector(?:All)?|closest|matches)\(\s*[`"']([^`"']+)[`"']/g))
  for (const c of limpio(m[1]).matchAll(/\.([A-Za-z_][\w-]*)/g)) { usadas.add(c[1]); ganchosJS.add(c[1]); }

/* ---- informe ---- */
const sinRegla = [...usadas].filter(c => !definidas.has(c) && !compartidas.has(c) && !ganchosJS.has(c)).sort();
const sinUso = [...definidas.keys()].filter(c => !usadas.has(c)).sort();

console.log(`CSS de Question Lab · ${definidas.size} clases con regla · ${compartidas.size} generadas en tokens.css · ${usadas.size} usadas\n`);
let fallos = 0;

if (sinRegla.length) {
  fallos += sinRegla.length;
  console.log(`  ✗ ${sinRegla.length} EN EL MARCADO SIN REGLA NI USO EN JS (no pintan nada):`);
  sinRegla.forEach(c => console.log(`      .${c}`));
} else console.log('  ✓ toda clase del marcado tiene regla o la consulta el JS');

if (sinUso.length) {
  fallos += sinUso.length;
  console.log(`\n  ✗ ${sinUso.length} REGLAS QUE NO USA NADIE:`);
  sinUso.forEach(c => console.log(`      .${c}   ←   ${definidas.get(c)}`));
} else console.log('  ✓ ninguna regla huérfana');

console.log(fallos ? `\n${fallos} por limpiar` : '\nCSS OK');
process.exit(fallos ? 1 : 0);
