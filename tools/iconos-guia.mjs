/* Los 3 iconos de los desplegables de la Guía de QL.
   PLANOS a propósito: el 3D se hace papilla bajo 32px (lección de los logos).
   Se rasterizan al tamaño REAL (20px) y se amplían con vecino más cercano para
   juzgar si se leen; verlos grandes no dice nada. */
import { writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const P = { indigo: '#6366F1', coral: '#FB7185', amber: '#FBBF24', teal: '#2DD4BF', tinta: '#334155' };

/* ladrillo plano: cuerpo + studs, en una caja de 24 de alto */
const ladrillo = (x, y, w, h, c, studs = 2) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${(h * .16).toFixed(1)}" fill="${c}"/>`;
  const sw = w / (studs * 2 + 1), sh = h * .34;
  for (let i = 0; i < studs; i++) {
    const sx = x + sw * (i * 2 + 1) + sw * .1;
    s += `<rect x="${sx.toFixed(1)}" y="${(y - sh * .78).toFixed(1)}" width="${(sw * 1.8).toFixed(1)}" height="${(sh * 1.1).toFixed(1)}" rx="${(sw * .5).toFixed(1)}" fill="${c}"/>`;
  }
  return s;
};

const ICONS = {
  // 1 · una pieza
  pieza: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    ${ladrillo(3, 8.5, 18, 11, P.teal, 2)}
  </svg>`,

  // 2 · dos piezas que se devuelven: UN arco con punta en los dos extremos.
  // Dos flechas separadas no caben en 24px de alto sin volverse ruido.
  intercambio: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 24" width="26" height="24">
    ${ladrillo(0.5, 13, 11, 9.5, P.indigo, 2)}
    ${ladrillo(14.5, 13, 11, 9.5, P.coral, 2)}
    <path d="M5 8.4 A 8 4.6 0 0 1 21 8.4" fill="none" stroke="${P.tinta}" stroke-width="1.4" stroke-linecap="round"/>
    <polygon points="5,10.6 2.9,7.1 7.6,6.6" fill="${P.tinta}"/>
    <polygon points="21,10.6 23.1,7.1 18.4,6.6" fill="${P.tinta}"/>
  </svg>`,

  // 3 · el sello: IMPRESO en la cara (tampografía), no un sticker pegado.
  // El reloj va en negativo —círculo lleno oscuro, agujas del color del
  // ladrillo— porque a 20px un contorno fino se cierra y queda un borrón.
  sello: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    ${ladrillo(3, 8.5, 18, 11, P.amber, 2)}
    <circle cx="12" cy="14" r="4.2" fill="${P.tinta}"/>
    <path d="M12 11.6 V14 h2" fill="none" stroke="${P.amber}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};

/* tira de comparación: cada icono a 20px real, y ampliado x6 sin suavizado */
const REAL = 20, ZOOM = 6;
let tira = '', x = 10;
const png = (svg, w) => new Resvg(svg, { fitTo: { mode: 'height', value: w } }).render().asPng();
const b64 = b => 'data:image/png;base64,' + b.toString('base64');

for (const [nombre, svg] of Object.entries(ICONS)) {
  const chico = b64(png(svg, REAL));
  tira += `<image x="${x}" y="30" width="${REAL * 1.3}" height="${REAL}" href="${chico}" preserveAspectRatio="xMidYMid meet"/>`;
  tira += `<image x="${x}" y="60" width="${REAL * 1.3 * ZOOM}" height="${REAL * ZOOM}" href="${chico}" preserveAspectRatio="xMidYMid meet" style="image-rendering:pixelated"/>`;
  tira += `<text x="${x}" y="24" font-family="Verdana" font-size="11" fill="#161927">${nombre} · 20px</text>`;
  x += REAL * 1.3 * ZOOM + 20;
}
const W = x, H = 60 + REAL * ZOOM + 20;
const hoja = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#ffffff"/>${tira}</svg>`;
writeFileSync('iconos.png', new Resvg(hoja, { fitTo: { mode: 'width', value: W } }).render().asPng());
console.log('iconos.png ' + W + 'x' + H);
