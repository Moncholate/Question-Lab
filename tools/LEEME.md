# Herramientas visuales de Question Lab

Dibujan cosas que **no se pueden juzgar sin mirarlas**. Necesitan
`npm i @resvg/resvg-js` (no hay package.json aquí: QL es HTML plano, así que se
instala donde se corran).

| Archivo | Qué hace |
|---|---|
| `maqueta-piezas.mjs` | Réplica en SVG de la geometría del CSS de `.block`, en los dos temas. **No es una captura del navegador**: es el mismo cálculo dibujado a mano. Sirve para juzgar proporción y si la pieza lee como ladrillo. |
| `iconos-guia.mjs` | Los 3 iconos de los desplegables de la Guía, rasterizados **a 20px reales** y ampliados con vecino más cercano. |

## Por qué existen

Las piezas y los iconos comparten el lenguaje visual del generador de los logos
(`Grammar HUB/tools/dino/render.mjs`). Ahí las proporciones están en función de
`u` = media altura del ladrillo, y trasladarlas a CSS es donde se rompe.

**Iterar mirando el PNG no es opcional, es el único método.** Lo que se corrigió
así, en orden: studs demasiado chicos (leían como una línea de puntos), studs
sin cuerpo de cilindro (dos discos apilados con un hueco), el icono de
intercambio con una sola flecha, y el reloj del sello como un borrón.

## Dos reglas que salieron de esto

- **Bajo 32px el 3D se hace papilla.** Los iconos de la Guía van planos por eso,
  igual que los favicon. Ver la memoria de los logos.
- **Rasterizar al tamaño REAL y ampliar con `image-rendering:pixelated`.**
  Mirarlos grandes no dice nada: a 20px se pierde justo lo que uno cree que se
  ve bien.
