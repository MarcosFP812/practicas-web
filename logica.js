/* =========================================================
   logica.js — Lógica pura del juego (sin DOM).
   Cargado por index.html ANTES de game.js
   y por test/smoke.js en Node (con global.window simulado).
   ========================================================= */
(function () {
  "use strict";

  // Grafías EXACTAS de los sprites (los nombres de archivo distinguen mayúsculas
  // y la carpeta usa "soprendido", con P, no "sorprendido").
  var SPRITES_VALIDOS = ["normal", "feliz", "triste", "enfadado", "soprendido", "asustado"];
  var EFECTOS_VALIDOS = ["zoom", "shake"];
  var NUM_PREGUNTAS = 10;
  var NUM_OPCIONES = 4;
  var NOTA_APROBADO = 5; // aprueba con 5 o más aciertos

  function esTextoValido(texto) {
    return typeof texto === "string" && texto.trim().length > 0;
  }

  function problemaDeSprite(etiqueta, sprite, problemas) {
    if (sprite === "sorprendido") {
      // Error de grafía típico: el sprite se llama "soprendido" (con P).
      problemas.push(etiqueta + ": sprite inválido \"sorprendido\" (¡es con P!: \"soprendido\")");
    } else {
      problemas.push(etiqueta + ": sprite inválido \"" + sprite + "\" (válidos: " + SPRITES_VALIDOS.join(", ") + ")");
    }
  }

  function validarLinea(linea, etiqueta, problemas) {
    if (!linea || typeof linea !== "object") {
      problemas.push(etiqueta + ": no es un objeto { sprite, texto }");
      return;
    }
    if (typeof linea.sprite !== "string" || SPRITES_VALIDOS.indexOf(linea.sprite) === -1) {
      problemaDeSprite(etiqueta, linea.sprite, problemas);
    }
    if (!esTextoValido(linea.texto)) {
      problemas.push(etiqueta + ": texto vacío o ausente");
    }
    if (linea.efecto !== undefined && EFECTOS_VALIDOS.indexOf(linea.efecto) === -1) {
      problemas.push(etiqueta + ": efecto inválido \"" + linea.efecto + "\" (válidos: " + EFECTOS_VALIDOS.join(", ") + ")");
    }
  }

  function validarPreguntas(preguntas, problemas) {
    if (!Array.isArray(preguntas)) {
      problemas.push("preguntas: debe ser una lista");
      return;
    }
    if (preguntas.length !== NUM_PREGUNTAS) {
      problemas.push("preguntas: deben ser exactamente " + NUM_PREGUNTAS + " y hay " + preguntas.length);
    }
    preguntas.forEach(function (p, i) {
      var etiqueta = "preguntas[" + i + "]";
      if (!p || typeof p !== "object") {
        problemas.push(etiqueta + ": no es un objeto");
        return;
      }
      if (!esTextoValido(p.enunciado)) {
        problemas.push(etiqueta + ": enunciado vacío o ausente");
      }
      if (!Array.isArray(p.opciones)) {
        problemas.push(etiqueta + ": opciones debe ser una lista de 4 strings");
      } else {
        if (p.opciones.length !== NUM_OPCIONES) {
          problemas.push(etiqueta + ": deben ser " + NUM_OPCIONES + " opciones y hay " + p.opciones.length);
        }
        p.opciones.forEach(function (o, j) {
          if (!esTextoValido(o)) {
            problemas.push(etiqueta + ".opciones[" + j + "]: opción vacía o ausente");
          }
        });
      }
      if (typeof p.correcta !== "number" || p.correcta < 0 || p.correcta > 3 || p.correcta !== Math.floor(p.correcta)) {
        problemas.push(etiqueta + ": correcta debe ser un número 0..3");
      }
    });
  }

  function validarLineasResultado(lineas, nombre, problemas) {
    if (!Array.isArray(lineas) || lineas.length === 0) {
      problemas.push("resultados." + nombre + ": debe ser una lista con al menos una línea");
      return;
    }
    lineas.forEach(function (l, i) {
      validarLinea(l, "resultados." + nombre + "[" + i + "]", problemas);
    });
  }

  /**
   * validarDatos(data) → lista de strings con los problemas encontrados.
   * Lista vacía = datos correctos.
   */
  function validarDatos(data) {
    var problemas = [];

    if (!data || typeof data !== "object") {
      problemas.push("GAME_DATA: no existe o no es un objeto");
      return problemas;
    }

    // Textos generales
    if (!esTextoValido(data.titulo)) problemas.push("titulo: vacío o ausente");
    if (!esTextoValido(data.subtitulo)) problemas.push("subtitulo: vacío o ausente");

    // Normas (pantalla inicial, antes de la portada)
    if (!data.normas || typeof data.normas !== "object") {
      problemas.push("normas: falta el bloque normas");
    } else {
      var n = data.normas;
      ["titulo", "intro", "cierre", "boton"].forEach(function (campo) {
        if (!esTextoValido(n[campo])) {
          problemas.push("normas." + campo + ": vacío o ausente");
        }
      });
      if (!Array.isArray(n.lista) || n.lista.length === 0) {
        problemas.push("normas.lista: debe ser una lista con al menos una norma");
      } else {
        n.lista.forEach(function (regla, i) {
          if (!esTextoValido(regla)) {
            problemas.push("normas.lista[" + i + "]: vacía o ausente");
          }
        });
      }
    }

    // Diálogos de la clase
    if (!Array.isArray(data.dialogos) || data.dialogos.length === 0) {
      problemas.push("dialogos: debe ser una lista con al menos una línea");
    } else {
      data.dialogos.forEach(function (d, i) {
        validarLinea(d, "dialogos[" + i + "]", problemas);
      });
    }

    // Bloque examen
    if (!data.examen || typeof data.examen !== "object") {
      problemas.push("examen: falta el bloque examen");
    } else {
      ["tituloHoja", "etiquetaNombre", "etiquetaFecha", "avisoSinNombre", "avisoFaltanPreguntas"]
        .forEach(function (campo) {
          if (!esTextoValido(data.examen[campo])) {
            problemas.push("examen." + campo + ": vacío o ausente");
          }
        });
    }

    // Preguntas
    validarPreguntas(data.preguntas, problemas);

    // Bloque resultados
    if (!data.resultados || typeof data.resultados !== "object") {
      problemas.push("resultados: falta el bloque resultados");
    } else {
      var r = data.resultados;
      validarLineasResultado(r.aprobado, "aprobado", problemas);
      validarLineasResultado(r.suspenso, "suspenso", problemas);
      if (!esTextoValido(r.botonReintentar)) problemas.push("resultados.botonReintentar: vacío o ausente");
      if (!esTextoValido(r.matriculaHonor)) problemas.push("resultados.matriculaHonor: vacío o ausente");
      if (!r.diploma || typeof r.diploma !== "object") {
        problemas.push("resultados.diploma: falta");
      } else {
        ["titulo", "cuerpo", "firma"].forEach(function (campo) {
          if (!esTextoValido(r.diploma[campo])) {
            problemas.push("resultados.diploma." + campo + ": vacío o ausente");
          }
        });
      }
      validarLineasResultado(r.despedida, "despedida", problemas);
      if (!esTextoValido(r.botonDespedida)) problemas.push("resultados.botonDespedida: vacío o ausente");
      if (!esTextoValido(r.textoFin)) problemas.push("resultados.textoFin: vacío o ausente");
      if (!esTextoValido(r.botonFin)) problemas.push("resultados.botonFin: vacío o ausente");
    }

    return problemas;
  }

  /* =======================================================
     Task 3 — Examen: validación y corrección (PURAS, sin DOM).
     Leen las respuestas correctas de window.GAME_DATA.preguntas
     (dato fijo cargado antes de usarse; no tocan el DOM).
     ======================================================= */

  /**
   * validarExamen(respuestas, nombre)
   *   → { ok: boolean, motivo: "nombre"|"preguntas"|null, primerIndice: number|null }
   * - Nombre vacío o solo espacios → ok:false, motivo "nombre".
   * - Pregunta sin marcar (respuestas[i] fuera de 0..3, p. ej. -1,
   *   undefined o decimal) → ok:false, motivo "preguntas" y
   *   primerIndice = la primera sin marcar.
   * - El nombre se comprueba PRIMERO (mismo orden que los avisos
   *   del examen: avisoSinNombre antes que avisoFaltanPreguntas).
   */
  function validarExamen(respuestas, nombre) {
    if (!esTextoValido(nombre)) {
      return { ok: false, motivo: "nombre", primerIndice: null };
    }
    var preguntas = window.GAME_DATA && window.GAME_DATA.preguntas;
    var total = Array.isArray(preguntas) ? preguntas.length : NUM_PREGUNTAS;
    for (var i = 0; i < total; i++) {
      var r = Array.isArray(respuestas) ? respuestas[i] : undefined;
      var esElegidaValida = typeof r === "number" &&
        r >= 0 && r <= NUM_OPCIONES - 1 && r === Math.floor(r);
      if (!esElegidaValida) {
        return { ok: false, motivo: "preguntas", primerIndice: i };
      }
    }
    return { ok: true, motivo: null, primerIndice: null };
  }

  /**
   * corregir(respuestas) → { aciertos: number, nota: number, aprueba: boolean }
   * PURA: no muta respuestas. nota = aciertos (sobre 10) y
   * aprueba = aciertos >= NOTA_APROBADO (5).
   */
  function corregir(respuestas) {
    var preguntas = window.GAME_DATA && window.GAME_DATA.preguntas;
    var aciertos = 0;
    if (Array.isArray(respuestas) && Array.isArray(preguntas)) {
      respuestas.forEach(function (r, i) {
        var p = preguntas[i];
        if (p && typeof p.correcta === "number" && r === p.correcta) {
          aciertos += 1;
        }
      });
    }
    return { aciertos: aciertos, nota: aciertos, aprueba: aciertos >= NOTA_APROBADO };
  }

  /**
   * esMatricula(nota) → boolean. PURA.
   * true SOLO con nota 10 (matrícula de honor); cualquier otra cosa
   * (9, 0, decimal, no numérico) → false. Task 4 la usa para añadir
   * al final del diálogo de aprobado la línea matriculaHonor.
   */
  function esMatricula(nota) {
    return typeof nota === "number" && nota === 10;
  }

  window.Logica = {
    validarDatos: validarDatos,
    validarExamen: validarExamen,
    corregir: corregir,
    esMatricula: esMatricula,
    SPRITES_VALIDOS: SPRITES_VALIDOS
  };
})();
