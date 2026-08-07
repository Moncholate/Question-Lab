/* Réplica en SVG de la geometría EXACTA del CSS de `.block`, para poder mirarla.
   No es una captura del navegador: es el mismo cálculo (elipses, radios, paso)
   dibujado a mano. Sirve para juzgar proporción y si lee como ladrillo. */
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const R = 16;                                  // 1rem = 16px
const mix = (h, p) => {                        // p>0 hacia blanco, p<0 hacia negro
  const c = i => parseInt(h.slice(i, i + 2), 16);
  const f = v => Math.round(p >= 0 ? v + (255 - v) * p : v * (1 + p)).toString(16).padStart(2, '0');
  return '#' + f(c(1)) + f(c(3)) + f(c(5));
};

const ROLES = [
  ['Where', 'wh-word', '#0f766e'], ['do', 'auxiliar', '#e11d48'],
  ['you', 'sujeto', '#2563eb'], ['live', 'verbo', '#b91c1c'],
  ['now?', 'complemento', '#475569'],
];

/* Una pieza, con los MISMOS números que el CSS */
function pieza(x, y, texto, etiqueta, c, tinta = '#fff') {
  const padX = 0.78 * R, padTop = 0.98 * R, padBot = 0.5 * R;
  const anchoTexto = Math.max(2.6 * R, texto.length * 0.62 * R, etiqueta.length * 0.42 * R);
  const w = anchoTexto + padX * 2, h = padTop + 1.05 * R + padBot;
  const edge = mix(c, -0.34), f1 = mix(c, 0.04), f2 = mix(c, -0.08);
  const sTop = mix(c, 0.34), sBot = mix(c, -0.26);
  const id = 'g' + Math.random().toString(36).slice(2, 8);

  let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${f1}"/><stop offset="1" stop-color="${f2}"/></linearGradient></defs>`;
  // sombra inferior (el `0 1.5px 0` del box-shadow)
  s += `<rect x="${x}" y="${y + 1.5}" width="${w}" height="${h}" rx="${0.2 * R}" fill="${edge}"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${0.2 * R}" fill="url(#${id})" stroke="${edge}" stroke-width="1"/>`;

  // studs: mosaico de `paso`, sólo enteros, sobrante repartido (background-repeat: space)
  const paso = 1.26 * R, ins = 0.30 * R, tira = w - ins * 2, top = y + 0.14 * R, alto = 0.68 * R;
  const n = Math.max(1, Math.floor(tira / paso));
  const hueco = n > 1 ? (tira - n * paso) / (n - 1) : 0;
  for (let i = 0; i < n; i++) {
    const cx = x + ins + i * (paso + hueco) + paso / 2;
    const rx = 0.29 * R, ry = 0.145 * R;
    const yCap = top + alto * 0.21, yBot = top + alto * 0.79;
    // cuerpo del cilindro: banda entre los dos centros; las elipses le redondean las puntas
    s += `<rect x="${cx - rx}" y="${yCap}" width="${2 * rx}" height="${yBot - yCap}" fill="${mix(c, -0.02)}"/>`;
    s += `<rect x="${cx + rx * 0.30}" y="${yCap}" width="${rx * 0.70}" height="${yBot - yCap}" fill="${mix(c, -0.18)}"/>`;
    s += `<ellipse cx="${cx}" cy="${yBot}" rx="${rx}" ry="${ry}" fill="${sBot}"/>`;
    s += `<ellipse cx="${cx}" cy="${yCap}" rx="${rx}" ry="${ry}" fill="${sTop}"/>`;
    s += `<ellipse cx="${cx - rx * 0.28}" cy="${top + alto * 0.15}" rx="${0.10 * R}" ry="${0.05 * R}" fill="#fff" opacity=".55"/>`;
  }
  s += `<text x="${x + w / 2}" y="${y + padTop + 0.72 * R}" text-anchor="middle" font-family="Verdana" font-weight="700" font-size="${R}" fill="${tinta}">${texto}</text>`;
  s += `<text x="${x + w / 2}" y="${y + padTop + 1.5 * R}" text-anchor="middle" font-family="Verdana" font-weight="600" font-size="${0.62 * R}" fill="${tinta}" opacity=".85">${etiqueta.toUpperCase()}</text>`;
  return { svg: s, w, h };
}

function fila(y, tinta, fondo) {
  let s = '', x = 24;
  for (const [t, l, c] of ROLES) { const p = pieza(x, y, t, l, c, tinta); s += p.svg; x += p.w + 0.45 * R; }
  return { svg: s, ancho: x };
}

const DARK = [
  ['Where', 'wh-word', '#2dd4bf'], ['do', 'auxiliar', '#fb7185'],
  ['you', 'sujeto', '#60a5fa'], ['live', 'verbo', '#ef4444'],
  ['now?', 'complemento', '#cbd5e1'],
];
function filaCon(roles, y, tinta) {
  let s = '', x = 24;
  for (const [t, l, c] of roles) { const p = pieza(x, y, t, l, c, tinta); s += p.svg; x += p.w + 0.45 * R; }
  return { svg: s, ancho: x };
}
const claro = filaCon(ROLES, 60, '#fff');
const oscuro = filaCon(DARK, 190, '#141826');
const W = Math.max(claro.ancho, oscuro.ancho) + 24, H = 270;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="130" fill="#f5f6fb"/>
<rect y="130" width="${W}" height="${H - 130}" fill="#0c0e15"/>
<text x="24" y="34" font-family="Verdana" font-size="15" font-weight="700" fill="#161927">tema claro · tinta blanca</text>
<text x="24" y="164" font-family="Verdana" font-size="15" font-weight="700" fill="#eceff8">tema oscuro · tinta oscura (antes era blanca: 1,5 a 3,8:1)</text>
${claro.svg}${oscuro.svg}
</svg>`;
writeFileSync('maqueta.svg', svg);
writeFileSync('maqueta.png', new Resvg(svg, { fitTo: { mode: 'width', value: W * 2 } }).render().asPng());
console.log('maqueta.png ' + W * 2 + 'px');
