/* ============================================================================
   PUBLICAR QUESTION LAB SIN LOS COMENTARIOS · `node build.mjs`
   ----------------------------------------------------------------------------
   Question Lab es el único de los cuatro que se sirve TAL CUAL: es un archivo
   HTML escrito a mano, sin Vite, así que lo que descarga el alumno son 253 KB de
   los que 60 son comentarios. Las otras tres van compiladas y no publican ni uno.

   Esto lo iguala: `dist/` lleva el mismo código sin comentarios. El fuente NO se
   toca — se edita `index.html` como siempre, con sus comentarios en su sitio,
   que es donde sirven.

   POR QUÉ UN TOKENIZADOR Y NO UNA EXPRESIÓN REGULAR. Un `/\*[\s\S]*?\*\//g` se
   come cualquier `/*` que viva dentro de una cadena o de una expresión regular,
   y este archivo tiene las dos cosas a montones. Ya pasó algo así con un
   reemplazo mecánico que metió comillas dentro de una cadena y rompió el
   archivo. Aquí se recorre carácter a carácter sabiendo en qué se está.

   LO DIFÍCIL ES LA BARRA. `/` abre una expresión regular o divide, y solo se
   distingue mirando lo que vino antes. La heurística de abajo es la de siempre y
   funciona con código normal, pero NO SE CONFÍA EN ELLA: `check-build.mjs`
   comprueba que el resultado se comporta igual que el fuente sobre las 300
   preguntas del banco y le pasa los 9 chequeos. Una corrupción o revienta al
   parsear o cambia una respuesta, y las dos cosas se cazan.

   SIN DEPENDENCIAS a propósito. Meter esbuild sería más corto, pero Question Lab
   no tiene `package.json` y esa simpleza es la razón de que sus chequeos corran
   el código de verdad. Un tokenizador de 60 líneas que se verifica sola cuesta
   menos que un `node_modules`.
   ============================================================================ */
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('./', import.meta.url));

/* Palabras tras las que un `/` SIEMPRE abre expresión regular. */
const ANTES_DE_REGEX = new Set(['return','typeof','instanceof','in','of','new','delete',
  'void','throw','do','else','case','yield','await']);

/** Quita los comentarios de un trozo de JavaScript sin tocar cadenas ni regex. */
export function sinComentariosJS(src) {
  let out = '', i = 0;
  /* Último carácter significativo emitido: decide si `/` es regex o división. */
  let prev = '';
  const ultimaPalabra = () => (out.match(/([A-Za-z_$][\w$]*)\s*$/) || [])[1] || '';
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    // Comentarios
    if (c === '/' && d === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;                                   // el \n se emite en la vuelta siguiente
    }
    if (c === '/' && d === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // Cadenas
    if (c === '"' || c === "'") {
      const cierre = c; out += c; i++;
      while (i < src.length) {
        if (src[i] === '\\') { out += src[i] + (src[i + 1] ?? ''); i += 2; continue; }
        out += src[i];
        if (src[i] === cierre) { i++; break; }
        i++;
      }
      prev = cierre;
      continue;
    }
    // Plantillas, con sus `${ }` anidados
    if (c === '`') {
      out += c; i++;
      let prof = 0;
      while (i < src.length) {
        if (src[i] === '\\') { out += src[i] + (src[i + 1] ?? ''); i += 2; continue; }
        if (src[i] === '$' && src[i + 1] === '{') { prof++; out += '${'; i += 2; continue; }
        if (src[i] === '}' && prof > 0) { prof--; out += '}'; i++; continue; }
        if (src[i] === '`' && prof === 0) { out += '`'; i++; break; }
        out += src[i]; i++;
      }
      prev = '`';
      continue;
    }
    // Expresión regular, si lo anterior deja claro que no es una división
    if (c === '/') {
      const abre = prev === '' || '(,=:[!&|?{};+-*%~^<>'.includes(prev) || ANTES_DE_REGEX.has(ultimaPalabra());
      if (abre) {
        out += c; i++;
        let clase = false;
        while (i < src.length) {
          if (src[i] === '\\') { out += src[i] + (src[i + 1] ?? ''); i += 2; continue; }
          if (src[i] === '[') clase = true;
          else if (src[i] === ']') clase = false;
          else if (src[i] === '/' && !clase) { out += '/'; i++; break; }
          else if (src[i] === '\n') break;         // no era regex: se corta y se sigue
          out += src[i]; i++;
        }
        while (i < src.length && /[a-z]/.test(src[i])) { out += src[i]; i++; }  // banderas
        prev = '/';
        continue;
      }
    }
    out += c;
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out;
}

/** CSS: solo hay `/* *​/` y cadenas. */
export function sinComentariosCSS(src) {
  let out = '', i = 0;
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'") {
      const cierre = c; out += c; i++;
      while (i < src.length) {
        if (src[i] === '\\') { out += src[i] + (src[i + 1] ?? ''); i += 2; continue; }
        out += src[i];
        if (src[i] === cierre) { i++; break; }
        i++;
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}

/* Líneas que quedan vacías tras quitar un comentario que ocupaba la línea
   entera. Se colapsan los huecos de más de una línea, no todas: el archivo
   servido tiene que seguir siendo legible para depurar. CRLF a propósito, que es
   como está escrito este archivo. */
const compactar = (s) => s.replace(/(\r?\n)[ \t]*(\r?\n)[ \t]*(\r?\n)+/g, '$1$2');

/** El documento entero, tratando cada trozo según lo que sea. */
export function construir(html) {
  const partes = [];
  const RE = /(<script(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)|(<style[^>]*>)([\s\S]*?)(<\/style>)/g;
  let ultimo = 0, m;
  while ((m = RE.exec(html))) {
    partes.push({ tipo: 'html', txt: html.slice(ultimo, m.index) });
    if (m[1]) partes.push({ tipo: 'js', abre: m[1], txt: m[2], cierra: m[3] });
    else      partes.push({ tipo: 'css', abre: m[4], txt: m[5], cierra: m[6] });
    ultimo = m.index + m[0].length;
  }
  partes.push({ tipo: 'html', txt: html.slice(ultimo) });

  return partes.map(p => {
    if (p.tipo === 'js')  return p.abre + compactar(sinComentariosJS(p.txt)) + p.cierra;
    if (p.tipo === 'css') return p.abre + compactar(sinComentariosCSS(p.txt)) + p.cierra;
    /* Los comentarios HTML se van todos MENOS el de copyright: ese está puesto
       justo para quien abre el inspector, que es por donde empieza el que
       copia. */
    return p.txt.replace(/<!--[\s\S]*?-->/g, (c) =>
      /derechos reservados|rights reserved/i.test(c) ? c : '');
  }).join('');
}

/* ---- Escribir dist/ ------------------------------------------------------ */
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`
    || process.argv[1].endsWith('build.mjs')) {
  const salida = dir + 'dist/';
  if (existsSync(salida)) rmSync(salida, { recursive: true });
  mkdirSync(salida, { recursive: true });

  const fuente = readFileSync(dir + 'index.html', 'utf8');
  const listo = construir(fuente);
  writeFileSync(salida + 'index.html', listo);

  /* Todo lo demás se copia tal cual. Los .js de datos llevan 2,6 KB de
     comentarios entre los dos: no compensa el riesgo de tocarlos. */
  const ACTIVOS = ['answers.js', 'bank.js', 'cefr.generated.js', 'gamification.generated.js',
    'phrasal.generated.js', 'tokens.css', 'sw.js', 'site.webmanifest', 'logo.svg',
    'favicon.ico', 'favicon.svg', 'favicon-96x96.png', 'apple-touch-icon.png',
    'og-image.png', 'maskable-192x192.png', 'maskable-512x512.png',
    'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png', 'fonts'];
  for (const a of ACTIVOS) {
    if (!existsSync(dir + a)) { console.error(`  ✗ falta ${a}`); process.exit(1); }
    cpSync(dir + a, salida + a, { recursive: true });
  }

  const antes = (fuente.length / 1024).toFixed(1), despues = (listo.length / 1024).toFixed(1);
  console.log(`  ✓ dist/index.html  ${antes} KB → ${despues} KB  (−${(100 - listo.length / fuente.length * 100).toFixed(0)}%)`);
  console.log(`  ✓ ${ACTIVOS.length} activos copiados`);
}
