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
  return null;   // gradientes, rgba… fuera de alcance
};

const mezclar = (a, b, p) => '#' + [1, 3, 5]
  .map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p))
    .toString(16).padStart(2, '0')).join('');

/** `color-mix(in srgb, X n%, transparent)` sobre una superficie concreta.
    Sin esto, el fondo del `.badge` —un tinte del 14%— no se medía nunca. */
const resolverFondo = (valor, vars, superficie) => {
  const directo = resolver(valor, vars);
  if (directo) return directo;
  const m = (valor || '').match(/color-mix\(\s*in srgb\s*,\s*([^,]+?)\s+([\d.]+)%\s*,\s*([^)]+)\)/);
  if (!m) return null;
  const c1 = resolver(m[1], vars);
  const c2 = m[3].trim() === 'transparent' ? superficie : resolver(m[3], vars);
  return c1 && c2 ? mezclar(c1, c2, parseFloat(m[2]) / 100) : null;
};

/* ---------- reglas: selector -> {color, fondo} ----------
   La regex NO puede anclarse en el `}` de la regla anterior: al consumirlo como
   separador se salta una regla sí y otra no. Con eso veía 116 de 237 y dejaba
   pasar, por ejemplo, `.buildmsg.ok`. Se apoya en que `[^{}]` no cruza llaves,
   así que cada bloque se delimita solo. Las cabeceras de @media se quitan para
   que sus reglas interiores también entren. */
const reglas = [];
const planas = cssApp.replace(/@(?:media|supports)[^{]*\{/g, '');
for (const m of planas.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const cuerpo = m[2];
  /* Un ::before/::after con `content:""` no pinta texto: es una barra, un punto
     o una línea. Heredan el `color` del elemento y salían como «texto gris
     sobre el acento» — el subrayado de la pestaña activa daba 1,76:1 sin que
     haya una sola letra ahí. */
  if (/::(?:before|after)/.test(m[1]) && /content\s*:\s*(""|'')/.test(cuerpo)) continue;
  const color = (cuerpo.match(/(?:^|[;\s])color\s*:\s*([^;]+)/) || [])[1];
  const fondo = (cuerpo.match(/(?:^|[;\s])background(?:-color)?\s*:\s*([^;]+)/) || [])[1];
  if (!color && !fondo) continue;
  for (const sel of m[1].split(',')) reglas.push({ sel: sel.trim(), color, fondo });
}

/* Lo que declara la clase base a secas (`.block{}`), para las reglas que solo
   tocan una parte: `.block{color:#fff}` da el color a `.block.wh`, y
   `.block{background:…}` dice que `:root[data-theme=dark] .block{color:…}` NO
   se apoya en el fondo de la página sino en el suyo propio. Sin lo segundo, el
   chequeo medía la tinta de las piezas contra el fondo y daba 1,00:1. */
const colorDe = new Map(), fondoDe = new Map();
for (const r of reglas) if (/^\.[\w-]+$/.test(r.sel)) {
  if (r.color) colorDe.set(r.sel.slice(1), r.color);
  if (r.fondo) fondoDe.set(r.sel.slice(1), r.fondo);
}
const clasesDe = sel => [...sel.matchAll(/\.([\w-]+)/g)].map(m => m[1]);

/* ---------- pares a medir ---------- */
const pares = [];
for (const r of reglas) {
  const clases = clasesDe(r.sel);
  let color = r.color;
  if (!color && r.fondo) {                        // ¿lo hereda de su clase base?
    const b = clases.find(c => colorDe.has(c));
    if (b) color = colorDe.get(b);
  }
  if (!color) continue;
  if (r.fondo) { pares.push({ sel: r.sel, color, fondo: r.fondo }); continue; }
  /* Regla que solo pinta TEXTO. Si alguna de sus clases ya trae fondo propio,
     ese es el fondo; si no, lo pone el padre y se mide contra las superficies
     reales de la app — eso es lo que faltaba para ver la pestaña activa y el
     `.badge`, que fallaban y salían limpios. */
  const conFondo = clases.find(c => fondoDe.has(c));
  if (conFondo) pares.push({ sel: r.sel, color, fondo: fondoDe.get(conFondo) });
  else pares.push({ sel: r.sel, color, superficies: true });
}

/* Las 4 superficies sobre las que se apoya el texto de esta app. */
const SUPERFICIES = ['--card', '--bg'];

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
    /* Una regla acotada a un tema solo existe en ESE tema. Sin esto se medía
       `:root[data-theme="dark"] .block.new` contra el fondo claro, que es una
       combinación que nunca ocurre. */
    const acota = p.sel.match(/\[data-theme="(light|dark)"\]/);
    if (acota && acota[1] !== t) continue;
    const c = resolver(p.color, tema[t]);
    if (!c) continue;
    // Cada superficie posible: la declarada, o las de la app si el fondo es del padre
    const sups = SUPERFICIES.map(v => resolver(`var(${v})`, tema[t])).filter(Boolean);
    const fondos = p.superficies ? sups
      : sups.map(s => resolverFondo(p.fondo, tema[t], s)).filter(Boolean);
    for (const f of [...new Set(fondos)]) {
      medidos++;
      const r = ratio(c, f);
      if (r < MIN) fallos.push({ sel: p.sel, tema: t, c, f, r });
    }
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
