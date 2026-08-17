/* Que el service worker precachee lo que la app necesita para arrancar sin red.
   Correr:  node check-sw.mjs      (desde la carpeta de Question Lab)

   POR QUÉ EXISTE: `phrasal.generated.js` estuvo fuera de `urlsToCache` desde que
   se añadió. No lo vio nadie porque el service worker es NETWORK-FIRST: con red
   el archivo llega igual y queda cacheado de camino, así que el hueco solo
   asomaba en el caso justo —instalar la app y quedarse sin señal antes de tocar
   un phrasal verb— y ahí «get up» se partía en dos. Un fallo que solo aparece
   sin cobertura no lo encuentra nadie probando; lo encuentra una lista.

   LA PARTE QUE NO ES OBVIA, y la razón de la segunda comprobación: `addAll()` es
   TODO O NADA. Si una sola entrada de la lista no se puede descargar, la promesa
   se rechaza entera y NO se cachea nada entre las quince. Y en sw.js ese rechazo
   lo recoge un `.catch` que solo escribe en consola, así que la instalación se
   da por buena. Un archivo renombrado sin tocar la lista —o una letra de más—
   deja a todos los alumnos sin modo offline sin romper nada visible ni dejar un
   error a la vista. Por eso aquí se comprueba que cada ruta de la lista EXISTE.

   Respeta QL_DIR como los demás: `QL_DIR=dist node check-sw.mjs` mira lo que se
   publica. La ruta se calcula aquí y no se importa de check-env a propósito —
   ese arranca app.js entera, y este chequeo tiene que poder correr y decir algo
   útil aunque el JavaScript de la app esté roto. */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dir = fileURLToPath(new URL('./', import.meta.url))
  + (process.env.QL_DIR ? process.env.QL_DIR.replace(/[\\/]*$/, '/') : '');

let problemas = 0;
const fallo = (m) => { console.log('  ✗ ' + m); problemas++; };

const html = readFileSync(join(dir, 'index.html'), 'utf8');
const sw = readFileSync(join(dir, 'sw.js'), 'utf8');

/* ---- La lista del service worker ---- */
const bloque = sw.match(/const urlsToCache = \[([\s\S]*?)\];/);
if (!bloque) { console.log('✗ no encuentro urlsToCache en sw.js'); process.exit(1); }
const lista = [...bloque[1].matchAll(/`\$\{BASE\}([^`]*)`/g)].map(m => m[1]);
const traeRaiz = /^\s*BASE\s*,/m.test(bloque[1]);

console.log('QUESTION LAB · el precache contra lo que la app carga\n');

/* ---- 1. Lo que el HTML pide al arrancar ---- */
console.log('1 · todo lo que index.html carga está en la lista');
const pedidos = [
  ...[...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]),
  ...[...html.matchAll(/<link[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g)].map(m => m[1]),
];
/* Las fuentes van en @font-face dentro del <style>, no en un tag: sin ellas la
   app abre sin red pero con la tipografía de respaldo, y la elección de fuente
   aquí es una decisión de accesibilidad (Lexend, Atkinson), no un adorno. */
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
const fuentes = [...css.matchAll(/url\(\s*['"]([^'")]+)['"]\s*\)/g)].map(m => m[1])
  .filter(u => !/^(data:|https?:|\/\/)/.test(u));

const externos = [...new Set([...pedidos, ...fuentes])].filter(u => !/^(data:|https?:|\/\/)/.test(u));
const faltan = externos.filter(u => !lista.includes(u));
if (faltan.length) faltan.forEach(u => fallo(`fuera del precache: ${u}`));
else console.log(`  ✓ ${externos.length} archivos (${pedidos.length} scripts y hojas, ${fuentes.length} fuentes)`);
if (!traeRaiz) fallo('la lista no incluye BASE (la raíz), y es lo que pide una navegación');

/* ---- 2. Que cada ruta de la lista exista ---- */
console.log('\n2 · cada ruta de la lista existe (addAll es todo o nada)');
const fantasmas = lista.filter(p => !existsSync(join(dir, p)));
if (fantasmas.length) {
  fantasmas.forEach(p => fallo(`en urlsToCache pero no en disco: ${p}`));
  console.log('     una sola de estas tumba el precache ENTERO, sin error visible');
} else {
  console.log(`  ✓ las ${lista.length} rutas de urlsToCache están en disco`);
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nSERVICE WORKER OK · la app arranca sin red');
process.exit(problemas ? 1 : 0);
