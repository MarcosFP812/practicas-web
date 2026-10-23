/* =========================================================
   test/verificar-respuestas.js — verifica que el índice "correcta" de
   cada pregunta apunta a la respuesta REAL de Marcos (preguntas.txt).
   Complementa test/smoke.js (que valida la estructura pero no puede
   saber cuál es la respuesta correcta semánticamente).
   Uso: node test/verificar-respuestas.js  → exit 0 si todo cuadra.
   ========================================================= */

"use strict";

global.window = {};
require("../logica.js");
require("../data.js");

var data = window.GAME_DATA;
var fallos = [];

/** Comprueba que la opción correcta de la pregunta i cumple "regexps". */
function comprobar(i, nombreCorto, regexps) {
  var p = data.preguntas[i];
  if (!p) {
    fallos.push("P" + (i + 1) + " (" + nombreCorto + "): no existe");
    return;
  }
  var elegida = p.opciones[p.correcta];
  if (elegida == null) {
    fallos.push("P" + (i + 1) + " (" + nombreCorto + "): correcta=" + p.correcta + " fuera de rango");
    return;
  }
  var ok = regexps.every(function (re) { return re.test(elegida); });
  if (!ok) {
    fallos.push("P" + (i + 1) + " (" + nombreCorto + "): la opción correcta NO es la esperada. correcta=" + p.correcta + " → \"" + elegida + "\"");
  }
}

comprobar(0, "trabaja", [/ilustre investigador/i, /reparación automática/i, /fabada/i]);
comprobar(1, "preocupación", [/calvicie/i]);
comprobar(2, "subdelegada", [/palomitas/i]);
comprobar(3, "lugar", [/baño/i]);
comprobar(4, "graduación", [/iria/i, /rafa/i, /rosa/i]);
comprobar(5, "bocata", [/tortilla/i]);
comprobar(6, "artículo", [/^repaca$/i]);
comprobar(7, "ya no tiene", [/^pelo$/i]);
comprobar(8, "se vendería", [/fabada/i, /rosa/i]);
comprobar(9, "quiere", [/novia/i, /suegros/i]);

if (fallos.length > 0) {
  console.error("VERIFICAR-RESPUESTAS: FALLA");
  fallos.forEach(function (f) { console.error("  - " + f); });
  process.exit(1);
}

console.log("VERIFICAR-RESPUESTAS: PASS — las 10 correctas apuntan a la respuesta de Marcos");
