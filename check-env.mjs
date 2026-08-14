/* Arranca el script inline de index.html contra un DOM de mentira y devuelve su
   ámbito. Lo usan check-bank.mjs y check-analyzer.mjs, para probar el
   analizador DE VERDAD y no una copia que se desincroniza con el tiempo. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* Por defecto el fuente. Con `QL_DIR=dist` los MISMOS chequeos corren contra lo
   que se publica, que es como se comprueba que quitar los comentarios no cambió
   nada. Ver build.mjs y check-build.mjs. */
export const dir = fileURLToPath(new URL('./', import.meta.url))
  + (process.env.QL_DIR ? process.env.QL_DIR.replace(/[\\/]*$/, '/') : '');

const nodos = new Map();
function nuevoNodo(id = '') {
  const n = {
    id, tagName: 'DIV', textContent: '', innerHTML: '', value: '', dataset: {},
    style: new Proxy({}, { get: (t, k) => t[k] ?? '', set: (t, k, v) => (t[k] = v, true) }),
    classList: { _s: new Set(), add(...c){c.forEach(x=>this._s.add(x))}, remove(...c){c.forEach(x=>this._s.delete(x))},
                 toggle(c,f){ f===undefined ? (this._s.has(c)?this._s.delete(c):this._s.add(c)) : (f?this._s.add(c):this._s.delete(c)); },
                 contains(c){return this._s.has(c)}, },
    children: [], firstElementChild: null, parentElement: null, _ev: {},
    addEventListener(t, f){ (this._ev[t] ||= []).push(f); }, removeEventListener(){},
    appendChild(c){ this.children.push(c); c.parentElement = this; return c; },
    querySelector(){ return nuevoNodo(); }, querySelectorAll(){ return []; },
    closest(){ return null; }, focus(){}, scrollIntoView(){},
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0 }; },
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    contains(){ return false; }, insertAdjacentHTML(){}, click(){},
  };
  n.firstElementChild = { style: new Proxy({}, { get:(t,k)=>t[k]??'', set:(t,k,v)=>(t[k]=v,true) }) };
  return n;
}

globalThis.document = {
  readyState: 'complete', documentElement: nuevoNodo('html'), body: nuevoNodo('body'), head: nuevoNodo('head'),
  lastModified: '01/01/2026 00:00:00',   // de aquí sale APP_BUILD, que el reporte imprime
  getElementById(id){ if(!nodos.has(id)) nodos.set(id, nuevoNodo(id)); return nodos.get(id); },
  querySelector(){ return nuevoNodo(); }, querySelectorAll(){ return []; },
  createElement(t){ const n = nuevoNodo(); n.tagName = String(t).toUpperCase(); return n; },
  addEventListener(){}, removeEventListener(){},
};
const store = new Map();
globalThis.window = {
  location: { search:'', href:'', pathname:'/', hash:'', origin:'' },
  matchMedia: () => ({ matches:false, addEventListener(){}, addListener(){} }),
  addEventListener(){}, removeEventListener(){}, localStorage: null, self:{}, top:{},
  ghTheme: { get:()=>'auto', effective:()=>'light', toggle(){}, apply(){} },
  /* `userAgent` con valor de verdad: el reporte lo incluye, y sin él ese campo
     se caía solo en el arnés y check-reporte no podía comprobarlo. */
  navigator: { userAgent:'Mozilla/5.0 (arnés de pruebas)',
               serviceWorker:{ register:()=>Promise.resolve() }, clipboard:{ writeText:()=>Promise.resolve() } },
};
globalThis.localStorage = { getItem:k=>store.has(k)?store.get(k):null, setItem:(k,v)=>store.set(k,String(v)), removeItem:k=>store.delete(k) };
globalThis.window.localStorage = globalThis.localStorage;
Object.defineProperty(globalThis, 'navigator', { value: globalThis.window.navigator, configurable: true });
globalThis.location = globalThis.window.location;
globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
globalThis.requestAnimationFrame = f => f();
globalThis.setTimeout = () => 0;

for (const f of ['bank.js', 'answers.js', 'gamification.generated.js', 'cefr.generated.js', 'phrasal.generated.js'])
  try { new Function(readFileSync(dir + f, 'utf8')).call(globalThis); } catch (e) {}

const html = readFileSync(dir + 'index.html', 'utf8');
const bloques = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);

/* Los pozos (`idPool`, `rPool`, `activeChallenges`) se REASIGNAN, así que se
   exponen como funciones: devolver el array una vez daría siempre el primero. */
export const QL = new Function(bloques[bloques.length - 1] + `
;return {analyze, tenseIdOf, ID_TENSES, LV, setLevel, expectedAnswers, openExpected, whBaseOf, WH_HINTS,
         setUnidad, visto, vistoEjercicio, unidadDe, unidadIndice, CONTENT, UNITS, CHALLENGES,
         confirmarUnidad, unidadPorRevisar, renderUnitUI, DIAS_REVISION, leerUnidadFecha,
         construirReporte, goAnalyze, renderId, renderR, renderF, loadChallenge,
         esComplementoDeTiempo, particulasDelVerbo, I18N, renderProgress, MODOS, bumpBestStreak,
         buildIdPool, buildRPool, refilterChallenges,
         getIdPool: () => idPool, getRPool: () => rPool, getChallenges: () => activeChallenges,
         getUnidad: () => curUnidad,
         buildFPool, FALTA, partirPregunta, fHueco, getFPool: () => fEstado.pool};`
).call(globalThis);

export const BANK = globalThis.window.QUESTION_BANK;
