/* Que toda clave usada en el HTML de Question Lab exista en LOS DOS idiomas.
   Es justo lo que se rompió con los acordeones de la Guía: quedaron sin
   data-i18n y por eso seguían en español dentro de la app en inglés.

   Correr:  node check-i18n.mjs      (desde la carpeta de Question Lab) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
/* El marcado y la app se leen JUNTOS. Los `data-i18n` están en index.html; los
   `t("…")` y la tabla I18N viven en app.js desde que la app salió del HTML
   (2026-08). Para lo que comprueba este archivo, las dos mitades son una sola
   fuente, así que se concatenan y el resto sigue igual. */
const aquí = dirname(fileURLToPath(import.meta.url));
const h = readFileSync(join(aquí, 'index.html'), 'utf8')
        + '\n' + readFileSync(join(aquí, 'app.js'), 'utf8');

/* Dos formas de usar una clave: marcada en el HTML, o pedida desde JS con
   t("..."). La segunda faltaba y es la que se rompe al RENOMBRAR una clave:
   t() cae al español en silencio, sin error. */
const usadas = [...new Set([
  ...[...h.matchAll(/data-i18n(?:-html|-title)?="([^"]+)"/g)].map(m => m[1]),
  ...[...h.matchAll(/\bt\(\s*["'`]([A-Za-z_]\w*)["'`]\s*\)/g)].map(m => m[1]),
])];

// Los dos diccionarios: es:{...} y en:{...} dentro de la tabla I18N
const iniEs = h.indexOf('\n  es: {');
const iniEn = h.indexOf('\n  en: {');
if (iniEs < 0 || iniEn < 0) { console.log('no encuentro los diccionarios'); process.exit(1); }
const bloqueEs = h.slice(iniEs, iniEn);
const bloqueEn = h.slice(iniEn, h.indexOf('\n};', iniEn));

const tiene = (bloque, k) => new RegExp('(^|[\\s,{])' + k + '\\s*:').test(bloque);

const faltaEs = usadas.filter(k => !tiene(bloqueEs, k));
const faltaEn = usadas.filter(k => !tiene(bloqueEn, k));

console.log(`${usadas.length} claves usadas en el HTML`);
if (faltaEs.length) console.log('  ✗ SIN español: ' + faltaEs.join(', '));
if (faltaEn.length) console.log('  ✗ SIN inglés:  ' + faltaEn.join(', '));
if (!faltaEs.length && !faltaEn.length) console.log('  ✓ todas existen en los dos idiomas');

/* Huérfanas: definidas y que ya nadie usa. Es lo que deja atrás un renombre a
   medias, y no se nota nunca porque no rompe nada visible. */
/* Ojo: varias claves van a media línea («tabAnalyze:"…", tabBuild:"…"»), así
   que anclar la regex al principio de línea se salta la mitad. */
const definidas = [...new Set([...bloqueEs.matchAll(/(?:^\s{4}|,\s*)([A-Za-z_]\w*)\s*:/gm)].map(m => m[1]))];
const huerfanas = definidas.filter(k => !usadas.includes(k));
if (huerfanas.length) console.log('  ✗ HUÉRFANAS (definidas y sin usar): ' + huerfanas.join(', '));

/* Y al revés: texto de la Guía que quedó sin marcar. Un <p> o <summary> con
   letras dentro del panel de la guía y sin data-i18n no se traduce nunca. */
const guia = h.slice(h.indexOf('<div class="panel" id="guide">'), h.indexOf('<div class="panel" id="progress">'));
/* class="ej" son las oraciones de EJEMPLO en inglés: son el contenido que se
   enseña, no interfaz, así que no se traducen.

   Se mira el ELEMENTO COMPLETO y no solo su etiqueta de apertura, porque la
   marca puede estar en un hijo: los <summary> de la Guía llevan un icono SVG
   y el texto dentro de un <span data-i18n>, ya que `data-i18n` escribe
   textContent y borraría el icono. Con la versión anterior —que miraba solo los
   atributos del tag y exigía texto inmediatamente después de `>`— esos tres
   dejaban de revisarse en silencio: pasaban por no coincidir, no por estar bien. */
const sinMarcar = [...guia.matchAll(/<(p|summary|h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/g)]
  .filter(([, , attrs, dentro]) =>
    !/data-i18n/.test(attrs) && !/class="ej"/.test(attrs) && !/data-i18n/.test(dentro)
    && dentro.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length >= 25)
  .map(m => m[3].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 60));
console.log(`\nGuía: ${sinMarcar.length ? sinMarcar.length + ' textos SIN data-i18n' : '✓ todo el texto está marcado'}`);
sinMarcar.forEach(t => console.log('  ✗ ' + t + '…'));

process.exit(faltaEs.length || faltaEn.length || sinMarcar.length || huerfanas.length ? 1 : 0);
