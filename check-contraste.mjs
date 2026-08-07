/* Contraste del texto sobre su fondo en Question Lab, EN LOS DOS TEMAS.
   Correr:  node check-contraste.mjs      (desde la carpeta de Question Lab)

   POR QUÉ EXISTE: `design-tokens/check-dark.mjs` solo audita las 3 apps
   Tailwind, porque busca clases utilitarias. QL es HTML plano con variables
   CSS y quedaba FUERA DE TODA HERRAMIENTA. Ahí vivió un defecto real y viejo:
   las piezas de la oración tenían `color:#fff` sobre `background:var(--rol)`, y
   como en oscuro los colores de rol se ACLARAN, el texto quedaba en 1,48:1
   (`comp`) y 1,86:1 (`wh`). Ilegible, y nada lo iba a avisar.

   LA PARTE QUE NO ES OBVIA: el color y el fondo casi nunca están en la misma
   regla. El bug real era `.block{color:#fff}` + `.block.wh{background:var(--wh)}`
   — dos reglas distintas. Por eso se emparejan las reglas COMPUESTAS
   (`.block.wh`) con la clase base que les da el color (`.block`). Sin eso el
   chequeo no habría encontrado nada.

   ALCANCE, para no creerle de más: mide los pares EXPLÍCITOS (una regla con
   `color` y `background`, o una compuesta que hereda el color de su clase
   base). NO simula la cascada completa ni el color heredado del `body`, y se
   saltea lo que no resuelve a un hex: gradientes, `transparent`, `color-mix`.
   Un ✓ significa «ningún par declarado falla», no «la app entera cumple».

   Probado en negativo contra `c86076b^`, la versión anterior a rehacer las
   piezas: encuentra `.mini.comp` en 1,48:1 y solo en oscuro, que es lo real. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const aquí = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(aquí, 'index.html'), 'utf8');
const tokens = readFileSync(join(aquí, 'tokens.css'), 'utf8');
const cssApp = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

/* ---------- variables por tema ---------- */
// tokens.css trae :root, [data-theme=light] y [data-theme=dark]; la app añade
// las suyas en :root (con indirección: --bg:var(--n-bg)).
const varsDe = (css, selector) => {
  const mapa = new Map();
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'g');
  for (const m of css.matchAll(re))
    for (const d of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) mapa.set(d[1], d[2].trim());
  return mapa;
};
/* TRAMPA: tokens.css trae un `:root` normal Y otro dentro de
   `@media (prefers-color-scheme:dark)`. Buscando ':root' a secas se capturan
   los dos, y como el del media va después, el tema CLARO terminaba resuelto
   con los valores OSCUROS — el chequeo daba el mismo número en ambos temas y
   parecía correcto. Los bloques @media se quitan antes de leer la base; cada
   tema se arma con su bloque [data-theme] explícito, que trae el juego completo. */
const sinMedia = css => css.replace(/@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, '');
// Los selectores van SIN escapar: de eso se encarga `varsDe`. Escaparlos aquí
// además los rompe (los `\[` terminan buscando una barra invertida literal) y
// el bloque no matchea: los dos temas salían idénticos, en silencio.
const base = new Map([...varsDe(sinMedia(tokens), ':root'), ...varsDe(sinMedia(cssApp), ':root')]);
const tema = {
  light: new Map([...base, ...varsDe(tokens, ':root[data-theme="light"]')]),
  dark: new Map([...base, ...varsDe(tokens, ':root[data-theme="dark"]'), ...varsDe(cssApp, ':root[data-theme="dark"]')]),
};
// Red de seguridad: si los dos temas resolvieran igual, el chequeo estaría ciego.
if (tema.light.get('--comp') === tema.dark.get('--comp'))
  throw new Error('los dos temas resuelven igual: revisar el parseo de variables');

/** Resuelve var(--x) en cadena hasta dar con un color; null si no es un color. */
const resolver = (valor, vars, salto = 0) => {
  if (!valor || salto > 8) return null;
  let v = valor.trim();
  const m = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/);
  if (m) return resolver(vars.get(m[1]) ?? m[2], vars, salto + 1);
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + [...v.slice(1)].map(c => c + c).join('').toLowerCase();
  if (v === '#fff' || v === 'white') return '#ffffff';
  if (v === '#000' || v === 'black') return '#000000';
  return null;   // gradientes, transparent, color-mix, rgba… fuera de alcance
};

/* ---------- reglas: selector -> {color, fondo} ---------- */
const reglas = [];
for (const m of cssApp.matchAll(/(?:^|[};])\s*([^{};@]+?)\s*\{([^}]*)\}/g)) {
  const cuerpo = m[2];
  const color = (cuerpo.match(/(?:^|[;\s])color\s*:\s*([^;]+)/) || [])[1];
  const fondo = (cuerpo.match(/(?:^|[;\s])background(?:-color)?\s*:\s*([^;]+)/) || [])[1];
  if (!color && !fondo) continue;
  for (const sel of m[1].split(',')) reglas.push({ sel: sel.trim(), color, fondo });
}

/* Color heredado de la clase base: `.block{color:#fff}` alimenta a `.block.wh`. */
const colorDe = new Map();
for (const r of reglas) if (r.color && /^\.[\w-]+$/.test(r.sel)) colorDe.set(r.sel, r.color);

/* ---------- pares a medir ---------- */
const pares = [];
for (const r of reglas) {
  if (!r.fondo) continue;
  let color = r.color;
  if (!color) {                                   // ¿lo hereda de su clase base?
    const b = r.sel.match(/^(\.[\w-]+)(?:\.[\w-]+)+$/);
    if (b && colorDe.has(b[1])) color = colorDe.get(b[1]);
  }
  if (color) pares.push({ sel: r.sel, color, fondo: r.fondo });
}

/* ---------- contraste ---------- */
const lum = h => {
  const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const MIN = 4.5;                                  // AA texto normal
const fallos = [];
let medidos = 0;
for (const p of pares) {
  for (const t of ['light', 'dark']) {
    const c = resolver(p.color, tema[t]), f = resolver(p.fondo, tema[t]);
    if (!c || !f) continue;                       // no medible: gradiente, transparent…
    medidos++;
    const r = ratio(c, f);
    if (r < MIN) fallos.push({ sel: p.sel, tema: t, c, f, r });
  }
}

console.log(`Contraste de Question Lab · ${pares.length} pares texto/fondo · ${medidos} medibles (claro+oscuro)\n`);
if (!fallos.length) console.log(`  ✓ ninguno bajo ${MIN}:1`);
else {
  fallos.sort((a, b) => a.r - b.r);
  console.log(`  ✗ ${fallos.length} BAJO ${MIN}:1 (AA texto normal):`);
  for (const f of fallos)
    console.log(`      ${f.r.toFixed(2)}:1  ${f.sel.padEnd(22)} ${f.c} sobre ${f.f}   [${f.tema}]`);
}
process.exit(fallos.length ? 1 : 0);
