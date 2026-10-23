/* =========================================================
   test/smoke.js — Smoke tests en Node (Tasks 1-3).
   Task 1: contrato de window.GAME_DATA y Logica.validarDatos.
   Task 3: funciones puras del examen (corregir, validarExamen).
   Uso: node test/smoke.js  (exit 1 si algo falla)
   ========================================================= */
"use strict";

var fallos = [];

function comprobar(cond, mensaje) {
  if (!cond) fallos.push(mensaje);
}

function esTextoValido(t) {
  return typeof t === "string" && t.trim().length > 0;
}

// Simular el entorno de navegador ANTES de cargar los módulos
global.window = {};

require("../logica.js");
require("../data.js");

var GAME_DATA = window.GAME_DATA;
var Logica = window.Logica;

comprobar(!!Logica && typeof Logica.validarDatos === "function",
  "window.Logica.validarDatos no existe (revisa logica.js)");
comprobar(!!GAME_DATA && typeof GAME_DATA === "object",
  "window.GAME_DATA no existe (revisa data.js)");

if (GAME_DATA) {
  // --- Contrato general ---
  comprobar(esTextoValido(GAME_DATA.titulo), "GAME_DATA.titulo vacío o ausente");
  comprobar(esTextoValido(GAME_DATA.subtitulo), "GAME_DATA.subtitulo vacío o ausente");

  // --- Diálogos: escena con contenido (>=4 líneas), sprites válidos, sin textos vacíos ---
  // (el límite superior quedó fuera: el guion de Marcos manda sobre el rango)
  var dialogos = GAME_DATA.dialogos || [];
  comprobar(Array.isArray(GAME_DATA.dialogos) && dialogos.length >= 4,
    "dialogos debe tener al menos 4 líneas y tiene " + dialogos.length);

  var SPRITES_VALIDOS = ["normal", "feliz", "triste", "enfadado", "soprendido", "asustado"];

  dialogos.forEach(function (d, i) {
    comprobar(!!d && typeof d.sprite === "string" && SPRITES_VALIDOS.indexOf(d.sprite) !== -1,
      "dialogos[" + i + "]: sprite inválido (" + JSON.stringify(d && d.sprite) + ")");
    comprobar(!!d && esTextoValido(d.texto), "dialogos[" + i + "]: texto vacío o ausente");
    if (d && d.efecto !== undefined) {
      comprobar(d.efecto === "zoom" || d.efecto === "shake",
        "dialogos[" + i + "]: efecto inválido (" + JSON.stringify(d.efecto) + ")");
    }
  });

  // --- Bloque examen ---
  var ex = GAME_DATA.examen || {};
  ["tituloHoja", "etiquetaNombre", "etiquetaFecha", "avisoSinNombre", "avisoFaltanPreguntas"]
    .forEach(function (c) {
      comprobar(esTextoValido(ex[c]), "examen." + c + " vacío o ausente");
    });

  // --- Preguntas: exactamente 10, 4 opciones, correcta 0..3 ---
  var preguntas = GAME_DATA.preguntas || [];
  comprobar(preguntas.length === 10, "Debe haber exactamente 10 preguntas y hay " + preguntas.length);
  preguntas.forEach(function (p, i) {
    comprobar(!!p && esTextoValido(p.enunciado), "preguntas[" + i + "]: enunciado vacío o ausente");
    comprobar(!!p && Array.isArray(p.opciones) && p.opciones.length === 4,
      "preguntas[" + i + "]: debe tener exactamente 4 opciones");
    ((p && p.opciones) || []).forEach(function (o, j) {
      comprobar(esTextoValido(o), "preguntas[" + i + "].opciones[" + j + "]: vacía o ausente");
    });
    comprobar(!!p && typeof p.correcta === "number" && p.correcta >= 0 && p.correcta <= 3 && p.correcta === Math.floor(p.correcta),
      "preguntas[" + i + "]: correcta debe ser un número 0..3");
  });

  // --- Bloque resultados ---
  var res = GAME_DATA.resultados || {};
  ["aprobado", "suspenso"].forEach(function (nombre) {
    var lineas = res[nombre] || [];
    comprobar(Array.isArray(res[nombre]) && lineas.length > 0,
      "resultados." + nombre + " debe ser una lista con al menos una línea");
    lineas.forEach(function (l, i) {
      comprobar(!!l && typeof l.sprite === "string" && SPRITES_VALIDOS.indexOf(l.sprite) !== -1,
        "resultados." + nombre + "[" + i + "]: sprite inválido (" + JSON.stringify(l && l.sprite) + ")");
      comprobar(!!l && esTextoValido(l.texto), "resultados." + nombre + "[" + i + "]: texto vacío o ausente");
    });
  });
  comprobar(esTextoValido(res.botonReintentar), "resultados.botonReintentar vacío o ausente");
  comprobar(esTextoValido(res.matriculaHonor), "resultados.matriculaHonor vacío o ausente");
  var dip = res.diploma || {};
  ["titulo", "cuerpo", "firma"].forEach(function (c) {
    comprobar(esTextoValido(dip[c]), "resultados.diploma." + c + " vacío o ausente");
  });

  // --- validarDatos NO debe dar problemas con los datos reales ---
  var problemasReales = Logica.validarDatos(GAME_DATA);
  comprobar(Array.isArray(problemasReales) && problemasReales.length === 0,
    "validarDatos(GAME_DATA) devolvió problemas: " + JSON.stringify(problemasReales));
}

// --- validarDatos SÍ debe detectar un dato ALTERADO (sprite mal escrito) ---
if (GAME_DATA && Logica) {
  var alterado = JSON.parse(JSON.stringify(GAME_DATA));
  alterado.dialogos[0].sprite = "sorprendido"; // ← grafía incorrecta a propósito
  var problemas = Logica.validarDatos(alterado);
  comprobar(Array.isArray(problemas) && problemas.length > 0,
    "validarDatos NO detectó el sprite mal escrito \"sorprendido\"");
  var mencionoSoprendido = problemas.some(function (p) { return String(p).indexOf("soprendido") !== -1; });
  comprobar(mencionoSoprendido,
    "validarDatos detectó el error pero no menciona la grafía correcta \"soprendido\"");
}

// =========================================================
// Task 3: examen — funciones puras (corregir, validarExamen)
// Se derivan las respuestas de GAME_DATA.preguntas, así los
// tests siguen valiendo aunque Marcos reordene opciones.
// =========================================================
if (GAME_DATA && Logica) {
  var preguntasT3 = GAME_DATA.preguntas || [];
  var bienT3 = preguntasT3.map(function (p) { return p.correcta; });
  var malT3 = preguntasT3.map(function (p) { return (p.correcta + 1) % 4; });
  var NOMBRE_T3 = "Test Alumno";

  comprobar(typeof Logica.corregir === "function",
    "Logica.corregir no existe (Task 3 debe definirla en logica.js)");
  comprobar(typeof Logica.validarExamen === "function",
    "Logica.validarExamen no existe (Task 3 debe definirla en logica.js)");

  if (typeof Logica.corregir === "function") {
    // Todo correcto → 10 aciertos, nota 10, aprueba true
    var cBien = Logica.corregir(bienT3);
    comprobar(!!cBien && cBien.aciertos === 10,
      "corregir(todo correcto): aciertos debería ser 10 y es " + JSON.stringify(cBien));
    comprobar(!!cBien && cBien.nota === 10,
      "corregir(todo correcto): nota debería ser 10");
    comprobar(!!cBien && cBien.aprueba === true,
      "corregir(todo correcto): aprueba debería ser true");

    // Todo mal → 0 aciertos, nota 0, aprueba false
    var cMal = Logica.corregir(malT3);
    comprobar(!!cMal && cMal.aciertos === 0,
      "corregir(todo mal): aciertos debería ser 0 y es " + JSON.stringify(cMal));
    comprobar(!!cMal && cMal.nota === 0,
      "corregir(todo mal): nota debería ser 0");
    comprobar(!!cMal && cMal.aprueba === false,
      "corregir(todo mal): aprueba debería ser false");

    // Mezcla: 6 aciertos exactos
    var mezcla6 = preguntasT3.map(function (p, i) {
      return i < 6 ? p.correcta : (p.correcta + 1) % 4;
    });
    var c6 = Logica.corregir(mezcla6);
    comprobar(!!c6 && c6.aciertos === 6 && c6.nota === 6 && c6.aprueba === true,
      "corregir(6 bien, 4 mal): debería dar aciertos 6, nota 6, aprueba true y es " + JSON.stringify(c6));

    // Límite del aprobado: 5 aciertos aprueba, 4 no
    var mezcla5 = preguntasT3.map(function (p, i) {
      return i < 5 ? p.correcta : (p.correcta + 1) % 4;
    });
    comprobar(Logica.corregir(mezcla5).aprueba === true,
      "corregir(5 aciertos): aprueba debería ser true (límite incluido)");
    var mezcla4 = preguntasT3.map(function (p, i) {
      return i < 4 ? p.correcta : (p.correcta + 1) % 4;
    });
    comprobar(Logica.corregir(mezcla4).aprueba === false,
      "corregir(4 aciertos): aprueba debería ser false");

    // Pura: no debe mutar el array de entrada
    var copiaBien = bienT3.slice();
    Logica.corregir(bienT3);
    comprobar(JSON.stringify(bienT3) === JSON.stringify(copiaBien),
      "corregir no debe mutar el array de respuestas");
  }

  if (typeof Logica.validarExamen === "function") {
    // Todo en orden → ok
    var vOk = Logica.validarExamen(bienT3, NOMBRE_T3);
    comprobar(!!vOk && vOk.ok === true && vOk.motivo === null && vOk.primerIndice === null,
      "validarExamen(todo en orden) debería ser { ok: true, motivo: null, primerIndice: null } y es " + JSON.stringify(vOk));

    // Nombre vacío → ok:false, motivo "nombre"
    var vSinNombre = Logica.validarExamen(bienT3, "");
    comprobar(!!vSinNombre && vSinNombre.ok === false && vSinNombre.motivo === "nombre" && vSinNombre.primerIndice === null,
      "validarExamen(nombre vacío) debería dar motivo \"nombre\" y es " + JSON.stringify(vSinNombre));
    var vNombreBlancos = Logica.validarExamen(bienT3, "   ");
    comprobar(!!vNombreBlancos && vNombreBlancos.ok === false && vNombreBlancos.motivo === "nombre",
      "validarExamen(nombre con solo espacios) debería dar motivo \"nombre\"");

    // Huecos (-1) en los índices 4 y 7 → motivo "preguntas", primer hueco 4
    var conHuecos = bienT3.slice();
    conHuecos[4] = -1;
    conHuecos[7] = -1;
    var vHuecos = Logica.validarExamen(conHuecos, NOMBRE_T3);
    comprobar(!!vHuecos && vHuecos.ok === false && vHuecos.motivo === "preguntas" && vHuecos.primerIndice === 4,
      "validarExamen(huecos en 4 y 7) debería dar motivo \"preguntas\" y primerIndice 4, y es " + JSON.stringify(vHuecos));

    // Sin respuestas → primer hueco 0
    var vVacio = Logica.validarExamen([], NOMBRE_T3);
    comprobar(!!vVacio && vVacio.ok === false && vVacio.motivo === "preguntas" && vVacio.primerIndice === 0,
      "validarExamen(sin respuestas) debería dar motivo \"preguntas\" y primerIndice 0");

    // El nombre se comprueba primero (mismo orden que los avisos del examen)
    var vAmbos = Logica.validarExamen(conHuecos, "");
    comprobar(!!vAmbos && vAmbos.motivo === "nombre",
      "validarExamen(sin nombre y con huecos): el nombre tiene prioridad");
  }
}

// =========================================================
// Task 4: resultados — esMatricula (pura, en logica.js)
// true SOLO con nota 10 (matrícula de honor): es la condición
// que añade la línea matriculaHonor al diálogo de aprobado.
// =========================================================
if (Logica) {
  comprobar(typeof Logica.esMatricula === "function",
    "Logica.esMatricula no existe (Task 4 debe definirla en logica.js)");

  if (typeof Logica.esMatricula === "function") {
    // Los tres casos del brief
    comprobar(Logica.esMatricula(10) === true,
      "esMatricula(10) debería ser true");
    comprobar(Logica.esMatricula(9) === false,
      "esMatricula(9) debería ser false");
    comprobar(Logica.esMatricula(0) === false,
      "esMatricula(0) debería ser false");

    // Defensas: lo no numérico (o decimal) nunca es matrícula
    comprobar(Logica.esMatricula("10") === false,
      "esMatricula(\"10\") debería ser false (string, no número)");
    comprobar(Logica.esMatricula(undefined) === false,
      "esMatricula(undefined) debería ser false");
  }
}

if (fallos.length > 0) {
  console.error("SMOKE TEST: FALLO (" + fallos.length + " errores)");
  fallos.forEach(function (f) { console.error("  - " + f); });
  process.exit(1);
}

console.log("SMOKE TEST: PASS — contrato de GAME_DATA, validarDatos, examen (corregir/validarExamen) y esMatricula OK");
