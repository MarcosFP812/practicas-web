/* =========================================================
   game.js — Motor DOM del juego.
   Tasks 2: irAPantalla, Typewriter, DialoguePlayer, el módulo
   audio, la pantalla inicial (normas) y la escena de la clase.
   Task 3: examen (renderExamen, leerRespuestas, terminarExamen).
   Task 4: resultado (mostrarResultado, confeti, diploma,
   reintento), sobre las mismas piezas de Task 2:
     - window.irAPantalla(id)
     - new window.Typewriter(elemento, opciones)
     - new window.DialoguePlayer(spriteEl, dialogoEl, lineas, opciones)
     - window.audio.{bip, jingle, triste, estaSilenciado, toggle, preparar}
   La lógica pura sigue en logica.js (sin DOM).
   ========================================================= */
(function () {
  "use strict";

  /* =======================================================
     Utilidades
     ======================================================= */

  // Lista EXACTA de sprites, tomada de logica.js (no se duplica aquí).
  var SPRITES_VALIDOS = (window.Logica && window.Logica.SPRITES_VALIDOS) || [];

  function esSpriteValido(nombre) {
    return typeof nombre === "string" && SPRITES_VALIDOS.indexOf(nombre) !== -1;
  }

  /**
   * irAPantalla(id) — muestra la sección .pantalla indicada y oculta las demás.
   * Task 3 y Task 4 la usan con este nombre exacto.
   */
  /* Transición de pantallas: fundido rápido a negro que tapa el corte.
     El swap es síncrono (debajo del velo) y el velo se levanta después. */
  var transicionEl = null;
  var transicionTimer = null;
  function asegurarTransicion() {
    if (transicionEl) return transicionEl;
    transicionEl = document.createElement("div");
    transicionEl.id = "transicion-pantalla";
    document.body.appendChild(transicionEl);
    return transicionEl;
  }

  function irAPantalla(id) {
    var overlay = asegurarTransicion();
    overlay.classList.add("encendida"); // tapa el corte entre pantallas
    if (transicionTimer) clearTimeout(transicionTimer);

    var destino = null;
    var pantallas = document.querySelectorAll(".pantalla");
    Array.prototype.forEach.call(pantallas, function (p) {
      if (p.id === id) {
        destino = p;
        p.classList.add("activa");
      } else {
        p.classList.remove("activa");
      }
    });
    if (!destino) {
      // Alias corto de defensa (Task 3): si el id exacto no existe se
      // prueba con el prefijo "pantalla-" ("examen" → "pantalla-examen").
      var porPrefijo = document.getElementById("pantalla-" + id);
      if (porPrefijo) {
        destino = porPrefijo;
        porPrefijo.classList.add("activa");
      }
    }
    if (!destino) {
      console.warn("[irAPantalla] No existe ninguna pantalla con id \"" + id + "\"");
    }

    transicionTimer = setTimeout(function () {
      overlay.classList.remove("encendida"); // fundido de salida
    }, 170);
    return destino;
  }
  window.irAPantalla = irAPantalla;

  /* =======================================================
     Módulo audio — WebAudio puro, sin ficheros.
     El AudioContext se crea tras el primer gesto del usuario
     (lo prepara el botón EMPEZAR; los sonidos lo reaseguran).
     El silencio persiste en localStorage.
     ======================================================= */
  var audio = (function () {
    var CLAVE_SILENCIO = "donMarcosSilencio"; // localStorage "1" = silenciado
    var ctx = null;

    function estaSilenciado() {
      try {
        return window.localStorage.getItem(CLAVE_SILENCIO) === "1";
      } catch (e) {
        return false; // almacenamiento no disponible: suena por defecto
      }
    }

    /** Alterna el silencio, lo persiste y devuelve el nuevo estado. */
    function toggle() {
      var nuevo = !estaSilenciado();
      try {
        window.localStorage.setItem(CLAVE_SILENCIO, nuevo ? "1" : "0");
      } catch (e) { /* sin persistencia: se mantiene solo en esta sesión */ }
      return nuevo;
    }

    /**
     * Crea (o reanuda) el AudioContext. Debe llamarse dentro de un
     * gesto del usuario (iOS exige que el contexto nazca de un tap).
     * Extra no contractual: Task 3/4 pueden llamarla tras cualquier tap.
     */
    function preparar() {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null; // sin WebAudio: el juego sigue sin sonido
        try {
          ctx = new AC();
        } catch (e) {
          return null;
        }
      }
      if (ctx.state === "suspended" && typeof ctx.resume === "function") {
        ctx.resume();
      }
      return ctx;
    }

    /** Una nota 8-bit: onda cuadrada con envolvente rápida (sin clics). */
    function tono(frecuencia, cuando, duracion, volumen) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(frecuencia, cuando);
      gain.gain.setValueAtTime(0.0001, cuando);
      gain.gain.linearRampToValueAtTime(volumen, cuando + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, cuando + duracion);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(cuando);
      osc.stop(cuando + duracion + 0.02);
    }

    /** Blip corto (~8 ms) de onda cuadrada ~600 Hz con tono variable. */
    function bip() {
      if (estaSilenciado()) return;
      if (!preparar()) return;
      var frecuencia = 600 * (0.94 + Math.random() * 0.12); // 564–636 Hz
      tono(frecuencia, ctx.currentTime, 0.008, 0.05);
    }

    /** Secuencia ascendente de ~6 notas (victoria / aprobado). */
    function jingle() {
      if (estaSilenciado()) return;
      if (!preparar()) return;
      var notas = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5→G6
      var inicio = ctx.currentTime + 0.02;
      notas.forEach(function (f, i) {
        tono(f, inicio + i * 0.11, 0.1, 0.06);
      });
    }

    /** Secuencia descendente de ~6 notas (derrota / suspenso). */
    function triste() {
      if (estaSilenciado()) return;
      if (!preparar()) return;
      var notas = [783.99, 659.25, 523.25, 440, 349.23, 261.63]; // G5→C4
      var inicio = ctx.currentTime + 0.02;
      notas.forEach(function (f, i) {
        tono(f, inicio + i * 0.16, 0.15, 0.06);
      });
    }

    return {
      bip: bip,
      jingle: jingle,
      triste: triste,
      estaSilenciado: estaSilenciado,
      toggle: toggle,
      preparar: preparar
    };
  })();
  window.audio = audio;

  /* =======================================================
     Typewriter — escribe texto letra a letra en un elemento.
       escribir(texto)  → empieza (o reinicia) la escritura
       completar()      → termina la línea al instante
       estaEscribiendo()→ true mientras queda texto por pintar
     Opciones: { msPorLetra = 35, onLetra(letraIndice), onFin() }
     onLetra NO se dispara para las letras que completa():
     así no hay bips duplicados.
     ======================================================= */
  function Typewriter(elemento, opciones) {
    opciones = opciones || {};
    this.elemento = elemento;
    this.msPorLetra = typeof opciones.msPorLetra === "number" && opciones.msPorLetra >= 0
      ? opciones.msPorLetra
      : 35;
    this.onLetra = typeof opciones.onLetra === "function" ? opciones.onLetra : null;
    this.onFin = typeof opciones.onFin === "function" ? opciones.onFin : null;
    this._texto = "";
    this._indice = 0;
    this._timer = null;
    this._finalizado = true;
  }

  Typewriter.prototype._pararTimer = function () {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  };

  /** Avisa onFin una única vez por línea. */
  Typewriter.prototype._avisarFin = function () {
    if (this._finalizado) return;
    this._finalizado = true;
    this._pararTimer();
    if (this.onFin) this.onFin();
  };

  Typewriter.prototype.escribir = function (texto) {
    this._pararTimer();
    this._texto = String(texto == null ? "" : texto);
    this._indice = 0;
    this._finalizado = false;
    this.elemento.textContent = "";
    if (this._texto.length === 0) {
      this._avisarFin();
      return;
    }
    var self = this;
    this._timer = setInterval(function () { self._paso(); }, this.msPorLetra);
  };

  Typewriter.prototype._paso = function () {
    this._indice += 1;
    this.elemento.textContent = this._texto.slice(0, this._indice);
    if (this.onLetra) this.onLetra(this._indice);
    if (this._indice >= this._texto.length) {
      this._avisarFin();
    }
  };

  /** Completa la línea al instante (un tap = completar, nunca bips extra). */
  Typewriter.prototype.completar = function () {
    if (!this.estaEscribiendo()) return;
    this._indice = this._texto.length;
    this.elemento.textContent = this._texto;
    this._avisarFin();
  };

  Typewriter.prototype.estaEscribiendo = function () {
    return this._timer !== null;
  };

  /** Corta la escritura en curso sin disparar onFin ni onLetra (uso interno). */
  Typewriter.prototype._cancelar = function () {
    this._pararTimer();
    this._finalizado = true;
  };

  /* =======================================================
     DialoguePlayer — reproduce una escena de líneas
     { sprite, texto, efecto? } sobre un sprite y un elemento
     de texto. Importante: dialogoEl debe ser un elemento
     DEDICADO al texto (su contenido se sustituye con textContent).
     Opciones: { onFin(), caretEl?, msPorLetra? }
       avanzar() → un tap = una acción:
                   escribiendo → completa la línea;
                   parado      → pasa a la línea siguiente.
       saltar()  → completa la escena al instante y llama onFin().
       lineaActual → objeto de la línea en curso (null al acabar).
     Sprite inválido → aviso por consola y defensa con "normal".
     ======================================================= */
  function DialoguePlayer(spriteEl, dialogoEl, lineas, opciones) {
    opciones = opciones || {};
    this.spriteEl = spriteEl || null;
    this.dialogoEl = dialogoEl || null;
    this.lineas = Array.isArray(lineas) ? lineas : [];
    this.onFin = typeof opciones.onFin === "function" ? opciones.onFin : null;
    this.caretEl = opciones.caretEl || null;
    this.lineaActual = null;
    this._indice = -1;
    this._terminado = false;
    this._contadorBip = 0;

    var self = this;
    this.typewriter = new Typewriter(this.dialogoEl, {
      msPorLetra: typeof opciones.msPorLetra === "number" ? opciones.msPorLetra : 35,
      onLetra: function (i) { self._alLetra(); },
      onFin: function () { self._alTerminarLinea(); }
    });
  }

  /** Bips: uno cada 2 letras visibles (no cada letra). */
  DialoguePlayer.prototype._alLetra = function () {
    this._contadorBip += 1;
    if (this._contadorBip % 2 === 0) audio.bip();
  };

  DialoguePlayer.prototype._alTerminarLinea = function () {
    if (this._terminado) return;
    this._mostrarCaret(); // línea terminada: caret ▼ parpadeando
  };

  DialoguePlayer.prototype._ponerSprite = function (sprite) {
    if (this.spriteEl) {
      if (esSpriteValido(sprite)) {
        this.spriteEl.src = "sprites/yo/" + sprite + ".png";
      } else {
        // Defensa: aviso y no crash (no interrumpe la escena).
        console.warn(
          "[DialoguePlayer] Sprite inválido \"" + sprite + "\" (válidos: " +
          SPRITES_VALIDOS.join(", ") + "). Se usa \"normal\"."
        );
        this.spriteEl.src = "sprites/yo/normal.png";
      }
    }
  };

  DialoguePlayer.prototype._aplicarEfecto = function (efecto) {
    if (!this.spriteEl) return;
    // Quitar efectos previos y forzar reflow para que la animación
    // se dispare de nuevo aunque la línea anterior tuviera la misma.
    this.spriteEl.classList.remove("efecto-zoom", "efecto-shake");
    void this.spriteEl.offsetWidth;
    if (efecto === "zoom") {
      this.spriteEl.classList.add("efecto-zoom");
    } else if (efecto === "shake") {
      this.spriteEl.classList.add("efecto-shake");
    }
    // Efecto ausente o inválido: sin animación (validarDatos ya avisa).
  };

  DialoguePlayer.prototype._mostrarCaret = function () {
    if (this.caretEl) this.caretEl.style.display = "inline-block";
  };

  DialoguePlayer.prototype._ocultarCaret = function () {
    if (this.caretEl) this.caretEl.style.display = "none";
  };

  DialoguePlayer.prototype._irALinea = function (indice) {
    if (indice >= this.lineas.length) {
      this._terminarEscena();
      return;
    }
    this._indice = indice;
    var linea = this.lineas[indice];
    this.lineaActual = linea;
    this._ponerSprite(linea && linea.sprite);
    this._aplicarEfecto(linea && linea.efecto);
    this._contadorBip = 0;
    this._ocultarCaret();
    this.typewriter.escribir(linea ? linea.texto : "");
  };

  DialoguePlayer.prototype.avanzar = function () {
    if (this._terminado) return;
    if (this.typewriter.estaEscribiendo()) {
      // Un tap = una acción: completar la línea, sin saltarse ninguna.
      this.typewriter.completar();
      return;
    }
    this._irALinea(this._indice + 1);
  };

  DialoguePlayer.prototype._terminarEscena = function () {
    if (this._terminado) return;
    this._terminado = true;
    this._indice = this.lineas.length; // ya no queda nada por reproducir
    this.lineaActual = null;
    this._ocultarCaret();
    if (this.onFin) this.onFin();
  };

  /** Completa la escena al instante y llama onFin (una sola vez). */
  DialoguePlayer.prototype.saltar = function () {
    if (this._terminado) return;
    this._terminado = true;
    this.typewriter._cancelar(); // corta bips y onFin de la línea en curso
    var ultima = this.lineas.length > 0 ? this.lineas[this.lineas.length - 1] : null;
    if (ultima) {
      this._indice = this.lineas.length - 1;
      this._ponerSprite(ultima.sprite);
      if (this.dialogoEl) this.dialogoEl.textContent = String(ultima.texto == null ? "" : ultima.texto);
    }
    this.lineaActual = null;
    this._ocultarCaret();
    if (this.onFin) this.onFin();
  };

  window.Typewriter = Typewriter;
  window.DialoguePlayer = DialoguePlayer;

  /* =======================================================
     Task 3 — Examen sorpresa: render, validación y corrección.
     La lógica PURA (validarExamen, corregir) vive en logica.js;
     aquí solo el motor DOM: pintar el papel, leer los radios,
     avisos inline (sin alert()) y scroll al primer hueco.
     ======================================================= */

  // Nombre guardado al terminar el examen CORRECTAMENTE (validado).
  // Task 4 lo consume para el diploma (mostrarResultado / diploma).
  var nombreAlumno = "";        // nombre de pila (para el token {nombre})
  var apellidosAlumno = "";     // apellidos (para el diploma)
  window.nombreAlumno = "";     // espejo público: NOMBRE COMPLETO (pila + apellidos)
  window.nombrePila = "";       // espejo público: solo el nombre de pila

  // Fecha guardada en el mismo momento que el nombre, SOLO al terminar
  // el examen correctamente. FIX Task 5: el reintento la repone (antes
  // solo se reponía el nombre y la FECHA tocaba reescribirla a mano).
  var fechaAlumno = "";

  var LETRAS_OPCION = ["A", "B", "C", "D"];
  var PREFIJO_RADIO = "examen-p"; // radios: examen-p0 .. examen-p9, value = 0..3

  /** Oculta el aviso inline (se muestra al fallar la validación). */
  function ocultarAvisoExamen() {
    var aviso = document.getElementById("examen-aviso");
    if (aviso) aviso.classList.remove("visible");
  }

  /** Campo NOMBRE/FECHA: label + input de texto. */
  function crearCampoExamen(id, etiqueta, valor) {
    var campo = document.createElement("div");
    campo.className = "examen-campo";

    var label = document.createElement("label");
    label.className = "examen-campo-label";
    label.setAttribute("for", id);
    label.textContent = etiqueta;

    var input = document.createElement("input");
    input.id = id;
    input.type = "text";
    input.maxLength = 60;
    input.autocomplete = "off";

    if (valor) input.value = valor; // reintento: repone el nombre ya escrito

    campo.appendChild(label);
    campo.appendChild(input);
    return campo;
  }

  /**
   * Una pregunta: enunciado + 4 opciones como labels grandes con el
   * radio DENTRO (tocar el texto marca la casilla, comportamiento
   * nativo del label). Con reintento, la correcta se resalta.
   */
  function crearPreguntaExamen(pregunta, indice, reintento) {
    var bloque = document.createElement("div");
    bloque.className = "pregunta";
    bloque.setAttribute("data-indice", String(indice));

    var enunciado = document.createElement("p");
    enunciado.className = "pregunta-enunciado";
    enunciado.textContent = (indice + 1) + ". " + pregunta.enunciado;
    bloque.appendChild(enunciado);

    var opciones = Array.isArray(pregunta.opciones) ? pregunta.opciones : [];
    opciones.forEach(function (texto, j) {
      var label = document.createElement("label");
      label.className = "opcion";
      if (reintento && j === pregunta.correcta) {
        // Modo reintento: la correcta lleva el resalte verde pixel
        // (las casillas salen sin marcar y marcables con normalidad).
        label.className += " resaltada-correcta";
      }

      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = PREFIJO_RADIO + indice;
      radio.value = String(j);

      var letra = document.createElement("span");
      letra.className = "opcion-letra";
      letra.textContent = LETRAS_OPCION[j] || "?";

      var spanTexto = document.createElement("span");
      spanTexto.className = "opcion-texto";
      spanTexto.textContent = texto;

      label.appendChild(radio);
      label.appendChild(letra);
      label.appendChild(spanTexto);
      bloque.appendChild(label);
    });

    // Al marcar una opción: resalta la elegida, bip de feedback y
    // limpia un aviso inline pendiente (el radio marca por estar
    // dentro del label; el change burbujea hasta el bloque).
    bloque.addEventListener("change", function (evento) {
      var radio = evento.target;
      if (!radio || radio.type !== "radio") return;
      audio.preparar(); // gesto del usuario: reasegura el AudioContext
      audio.bip();
      var labels = bloque.querySelectorAll("label.opcion");
      Array.prototype.forEach.call(labels, function (l) {
        l.classList.remove("marcada");
      });
      var elegida = radio.closest ? radio.closest("label.opcion") : null;
      if (elegida) elegida.classList.add("marcada");
      ocultarAvisoExamen();
    });

    return bloque;
  }

  /**
   * renderExamen({ reintento = false } = {})
   * Pinta la hoja de examen dentro de #pantalla-examen (reconstruida
   * desde cero: en reintento las casillas salen sin marcar y los
   * listeners viejos mueren con los nodos). Si reintento === true, la
   * opción correcta de cada pregunta lleva la clase "resaltada-correcta".
   * NO cambia de pantalla: de eso se encarga irAPantalla("pantalla-examen")
   * (Task 4 usa el mismo patrón renderExamen + irAPantalla).
   */
  function renderExamen(opciones) {
    if (!opciones || typeof opciones !== "object") opciones = {};
    var reintento = opciones.reintento === true;

    var seccion = document.getElementById("pantalla-examen");
    if (!seccion) {
      console.warn("[examen] No existe #pantalla-examen");
      return;
    }
    var datos = window.GAME_DATA && window.GAME_DATA.examen;
    var preguntas = window.GAME_DATA && window.GAME_DATA.preguntas;
    if (!datos || !Array.isArray(preguntas) || preguntas.length === 0) {
      console.warn("[examen] Falta GAME_DATA.examen o GAME_DATA.preguntas");
      return;
    }

    while (seccion.firstChild) seccion.removeChild(seccion.firstChild);

    var papel = document.createElement("div");
    papel.className = "examen-papel";

    // --- Cabecera: título + NOMBRE + FECHA ---
    var titulo = document.createElement("h2");
    titulo.className = "examen-titulo";
    titulo.textContent = datos.tituloHoja;
    papel.appendChild(titulo);

    // --- Aviso inline (oculto, role="alert") — AL PRINCIPIO del papel,
    //     tras el título: position:sticky;top:0 solo ANCLA un elemento
    //     cuando su posición natural queda por encima del borde superior;
    //     nunca lo sube. Al pie del papel (antes del fix round 1) sería
    //     invisible cuando el scroll salta hacia arriba al primer hueco
    //     o al campo NOMBRE.
    var aviso = document.createElement("div");
    aviso.id = "examen-aviso";
    aviso.className = "examen-aviso";
    aviso.setAttribute("role", "alert");
    papel.appendChild(aviso);

    papel.appendChild(crearCampoExamen(
      "examen-nombre", datos.etiquetaNombre, reintento ? nombreAlumno : ""));
    papel.appendChild(crearCampoExamen(
      "examen-apellidos", datos.etiquetaApellidos, reintento ? apellidosAlumno : ""));
    // FIX Task 5: la fecha también se repone en reintento (se guardó al
    // terminar el examen anterior, igual que el nombre).
    papel.appendChild(crearCampoExamen(
      "examen-fecha", datos.etiquetaFecha, reintento ? fechaAlumno : ""));

    // --- 10 preguntas ---
    var contenedor = document.createElement("div");
    contenedor.className = "examen-preguntas";
    preguntas.forEach(function (p, i) {
      contenedor.appendChild(crearPreguntaExamen(p, i, reintento));
    });
    papel.appendChild(contenedor);

    // --- Botón TERMINAR (texto de UI: data.js no trae campo para él) ---
    var boton = document.createElement("button");
    boton.id = "boton-terminar";
    boton.type = "button";
    boton.className = "boton-terminar";
    boton.textContent = "TERMINAR EXAMEN";
    boton.addEventListener("click", terminarExamen);
    papel.appendChild(boton);

    seccion.appendChild(papel);

    // Un reintento llega tras un examen corregido (scroll abajo):
    // la hoja nueva debe verse desde arriba.
    window.scrollTo(0, 0);
  }

  /**
   * leerRespuestas() → number[10]: índice elegido por pregunta
   * (value del radio marcado) o -1 si no está marcada.
   */
  function leerRespuestas() {
    var preguntas = window.GAME_DATA && window.GAME_DATA.preguntas;
    var total = Array.isArray(preguntas) && preguntas.length > 0 ? preguntas.length : 10;
    var respuestas = [];
    for (var i = 0; i < total; i++) respuestas.push(-1);

    var marcados = document.querySelectorAll(
      "#pantalla-examen input[type=\"radio\"]:checked");
    Array.prototype.forEach.call(marcados, function (radio) {
      var m = /^examen-p(\d+)$/.exec(radio.name || "");
      var indice = m ? parseInt(m[1], 10) : -1;
      var valor = parseInt(radio.value, 10);
      if (indice >= 0 && indice < respuestas.length &&
          valor >= 0 && valor <= 3) {
        respuestas[indice] = valor;
      }
    });
    return respuestas;
  }

  /** Botón TERMINAR: valida (sin corregir) o corrige y pasa al resultado. */
  function terminarExamen() {
    audio.preparar(); // gesto del usuario: reasegura el AudioContext

    var inputNombre = document.getElementById("examen-nombre");
    var inputApellidos = document.getElementById("examen-apellidos");
    var nombre = inputNombre ? inputNombre.value : "";
    var apellidos = inputApellidos ? inputApellidos.value : "";
    var nombreCompleto = (nombre + " " + apellidos).replace(/\s+/g, " ").trim();
    var respuestas = leerRespuestas();
    var validacion = window.Logica.validarExamen(respuestas, nombreCompleto);

    if (!validacion.ok) {
      // Aviso inline (nunca alert()) + scroll suave al problema.
      var texto = validacion.motivo === "nombre"
        ? window.GAME_DATA.examen.avisoSinNombre
        : window.GAME_DATA.examen.avisoFaltanPreguntas;
      var aviso = document.getElementById("examen-aviso");
      if (aviso) {
        aviso.textContent = texto;
        aviso.classList.add("visible");
      }
      if (validacion.motivo === "preguntas" && validacion.primerIndice !== null) {
        var hueco = document.querySelector(
          "#pantalla-examen .pregunta[data-indice=\"" + validacion.primerIndice + "\"]");
        if (hueco && hueco.scrollIntoView) {
          hueco.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (inputNombre && inputNombre.scrollIntoView) {
        inputNombre.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return; // sin identidad o con huecos: NO se corrige
    }

    // Todo en orden: guardar identidad y fecha (el reintento las repone).
    // El nombre de pila SOLO se usa en el camino aprobado ({nombre} y
    // diploma); si suspende, no se usa en ningún sitio.
    nombreAlumno = String(nombre).trim();
    apellidosAlumno = String(apellidos).trim();
    window.nombreAlumno = nombreCompleto;   // pila + apellidos (diploma)
    window.nombrePila = nombreAlumno;       // solo pila (token {nombre})
    var inputFecha = document.getElementById("examen-fecha");
    fechaAlumno = inputFecha ? String(inputFecha.value).trim() : "";
    var correccion = window.Logica.corregir(respuestas);

    if (typeof window.mostrarResultado === "function") {
      window.mostrarResultado(correccion, nombreCompleto); // lo implementa Task 4
    } else {
      console.warn("mostrarResultado pendiente (Task 4)");
    }
  }

  window.renderExamen = renderExamen;
  window.leerRespuestas = leerRespuestas;

  /* =======================================================
     Task 4 — Resultado: aprobado (confeti + diploma) y
     suspenso (reintento). Motor DOM aquí; la pureza
     (esMatricula) vive en logica.js.
     Textos de UI que data.js no trae ("APROBADO"/"SUSPENSO",
     "VOLVER AL INICIO", "SE CONCEDE A:", "NOTA FINAL:" y el
     fallback del nombre): pegamento de interfaz, no de la
     historia (mismo criterio que "TERMINAR EXAMEN" de Task 3
     y "SALTAR ⏩" de Task 2).
     ======================================================= */

  var ROTULO_APROBADO = "APROBADO";
  var ROTULO_SUSPENSO = "SUSPENSO";
  var NOMBRE_POR_DEFECTO = "Estimado alumno";
  // FIX Task 5: constante con nombre (antes un literal suelto). Es
  // pegamento de UI, igual que los alt="Don Marcos" estáticos de index.html.
  var ALT_PERSONAJE = "Don Marcos";
  var DURACION_CONFETI_MS = 3000; // ~3 s cayendo y autodestrucción

  var jugadorResultado = null; // DialoguePlayer del resultado (uno por resultado)
  var confeti = { raf: null, timeout: null, fadeTimeout: null, canvas: null, listenerResize: null };

  // requestAnimationFrame con fallback (navegadores sin rAF): el paro
  // usa SIEMPRE la función simétrica a la que arrancó el bucle.
  var CON_RAF = typeof window.requestAnimationFrame === "function";
  function rafArrancar(cb) {
    return CON_RAF ? window.requestAnimationFrame(cb) : setTimeout(cb, 33);
  }
  function rafParar(id) {
    if (CON_RAF) window.cancelAnimationFrame(id);
    else clearTimeout(id);
  }

  /**
   * Para el confeti en curso: bucle, timeout, listener y canvas fuera.
   * FIX Task 5: el canvas ya no desaparece de golpe — baja su opacidad
   * (0.35 s) y el nodo se retira al terminar el fundido. Si llega otra
   * parada mientras funde (pantalla nueva, confeti nuevo), el nodo viejo
   * sale inmediatamente: nunca queda basura viva ni timers huérfanos.
   */
  function pararConfeti() {
    if (confeti.raf !== null) {
      rafParar(confeti.raf);
      confeti.raf = null;
    }
    if (confeti.timeout !== null) {
      clearTimeout(confeti.timeout);
      confeti.timeout = null;
    }
    if (confeti.listenerResize !== null) {
      window.removeEventListener("resize", confeti.listenerResize);
      confeti.listenerResize = null;
    }
    if (confeti.fadeTimeout !== null) {
      // Ya había un fundido pendiente (de un confeti anterior): se corta
      // y el nodo sale YA. La referencia sigue viva en confeti.canvas.
      clearTimeout(confeti.fadeTimeout);
      confeti.fadeTimeout = null;
    }
    if (confeti.canvas && confeti.canvas.parentNode) {
      var canvas = confeti.canvas;
      canvas.style.transition = "opacity 0.35s linear";
      canvas.style.opacity = "0";
      confeti.fadeTimeout = setTimeout(function () {
        confeti.fadeTimeout = null;
        confeti.canvas = null;
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }, 400);
    }
  }

  /**
   * lanzarConfeti(duracionMs) — piezas rectangulares de colores cayendo
   * sobre #pantalla-resultado (por defecto ~3 s, luego se autodestruye).
   * Canvas propio posicionado SOBRE la pantalla: pointer-events:none,
   * los taps atraviesan al diálogo. pararConfeti() lo corta si la
   * pantalla cambia antes (tap rápido: sin basura activa).
   */
  function lanzarConfeti(duracionMs) {
    pararConfeti(); // defensa: nunca dos confetis a la vez

    var seccion = document.getElementById("pantalla-resultado");
    var canvas = document.createElement("canvas");
    canvas.className = "confeti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    var ctx = (seccion && typeof canvas.getContext === "function")
      ? canvas.getContext("2d")
      : null;
    if (!seccion || !ctx) return; // sin canvas 2D: sin confeti, el juego sigue

    function redimensionar() {
      // Buffer del tamaño real de la pantalla (con fallback defensivo)
      canvas.width = seccion.clientWidth || window.innerWidth || 360;
      canvas.height = seccion.clientHeight || window.innerHeight || 640;
    }
    redimensionar();
    window.addEventListener("resize", redimensionar);

    // Paleta pixel del juego + crema del papel
    var COLORES = ["#d43d2a", "#f7c948", "#3a6ea5", "#1e7d32", "#fff8e7"];
    var piezas = [];
    for (var i = 0; i < 90; i++) {
      piezas.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.6, // entran escalonadas
        w: 4 + Math.random() * 5,
        h: 6 + Math.random() * 6,
        vy: 1.6 + Math.random() * 2.4, // px por frame
        vx: -1 + Math.random() * 2,    // deriva lateral
        rot: Math.random() * Math.PI * 2,
        vr: -0.12 + Math.random() * 0.24,
        color: COLORES[i % COLORES.length]
      });
    }

    function paso() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      piezas.forEach(function (p) {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        if (p.y > canvas.height + 20) {
          // Reciclar: sigue lloviendo hasta el final de la duración
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      confeti.raf = rafArrancar(paso);
    }
    confeti.raf = rafArrancar(paso);
    confeti.canvas = canvas;
    confeti.listenerResize = redimensionar;
    seccion.appendChild(canvas);

    // Autodestrucción tras la duración (pararConfeti limpia TODO)
    confeti.timeout = setTimeout(pararConfeti, duracionMs || DURACION_CONFETI_MS);
  }

  /** Cabecera común a las fases: nota grande "X/10" + rótulo de color. */
  function crearNotaResultado(correccion) {
    var cabecera = document.createElement("div");
    cabecera.className = "resultado-cabecera";

    var nota = document.createElement("div");
    nota.className = "resultado-nota";
    nota.textContent = correccion.nota + "/10";
    cabecera.appendChild(nota);

    var rotulo = document.createElement("div");
    rotulo.className = "resultado-rotulo " +
      (correccion.aprueba ? "aprobado" : "suspenso");
    rotulo.textContent = correccion.aprueba ? ROTULO_APROBADO : ROTULO_SUSPENSO;
    cabecera.appendChild(rotulo);

    return cabecera;
  }

  /**
   * Vacía la pantalla de resultado matando lo que pudiera seguir vivo:
   * confeti (bucle/timers/listener/canvas) y typewriter del diálogo en
   * curso (el timer + bips mueren aquí; el objeto viejo muere con su
   * DOM, y sus onFin se autodescartan porque ya no son el actual).
   */
  function limpiarPantallaResultado() {
    pararConfeti();
    if (jugadorResultado) {
      jugadorResultado.typewriter._cancelar();
    }
    jugadorResultado = null;
    var seccion = document.getElementById("pantalla-resultado");
    if (seccion) {
      while (seccion.firstChild) seccion.removeChild(seccion.firstChild);
    }
    return seccion;
  }

  /** Fondo del aula en la pantalla de resultado (también tras el examen). */
  function ponerFondoResultado(seccion) {
    if (!seccion) return;
    var fondo = document.createElement("img");
    fondo.className = "fondo-aula-img";
    fondo.src = "sprites/fondo-clase.jpg";
    fondo.alt = "";
    fondo.setAttribute("aria-hidden", "true");
    seccion.appendChild(fondo); // primera capa (z-index 0)
  }

  /**
   * mostrarResultado(correccion, nombre) — implementación REAL que
   * terminaExamen (Task 3) llama vía window.mostrarResultado.
   * correccion = { aciertos, nota, aprueba } (de Logica.corregir).
   * Se ejecuta DENTRO del gesto del botón TERMINAR (mismo tick del
   * click), así que audio.jingle()/audio.triste() cumplen la política
   * de audio (nace/resume en un gesto de usuario).
   */
  function mostrarResultado(correccion, nombre) {
    if (!correccion || typeof correccion !== "object" ||
        typeof correccion.nota !== "number") {
      console.warn("[resultado] Corrección inválida:", correccion);
      return;
    }
    var resultados = window.GAME_DATA && window.GAME_DATA.resultados;
    if (!resultados) {
      console.warn("[resultado] Falta GAME_DATA.resultados");
      return;
    }

    audio.preparar(); // gesto del usuario (TERMINAR): reasegura el contexto
    limpiarPantallaResultado(); // sin basura de un resultado anterior

    renderResultadoDialogo(correccion, nombre);
    irAPantalla("pantalla-resultado");
    window.scrollTo(0, 0); // el examen pudo dejar la página scrollada
    // (jingle/confeti/triste ahora suenan en la REVELACIÓN de la nota,
    // tras el diálogo de corrección; el tap que lo dispara es un gesto)
  }
  window.mostrarResultado = mostrarResultado;

  /**
   * Fase 1: diálogo de corrección (resultados.corrigiendo) con la nota
   * OCULTA. Al terminar → fase 2: se revela la nota (pop + jingle/confeti
   * o triste, dentro del tap del usuario) y arranca el diálogo de
   * aprobado/suspenso (+ matriculaHonor si nota 10, sprite "soprendido").
   * Los textos admiten los tokens {nombre} y {nota}. Al acabar →
   * diploma (aprobado) o reintento (suspenso).
   */
  function renderResultadoDialogo(correccion, nombre) {
    var seccion = document.getElementById("pantalla-resultado");
    if (!seccion) {
      console.warn("[resultado] No existe #pantalla-resultado");
      return;
    }
    var resultados = window.GAME_DATA.resultados;

    // Nombre para el token {nombre}: SOLO el nombre de pila (el diploma
    // lleva pila + apellidos). Cadena de fallbacks defensiva.
    var nombreSeguro = String(window.nombrePila == null ? "" : window.nombrePila).trim() ||
      (String(nombre == null ? "" : nombre).trim().split(/\s+/)[0] || "") ||
      NOMBRE_POR_DEFECTO;

    /** Sustituye {nombre} y {nota} en un texto de GAME_DATA. */
    function conTokens(texto) {
      return String(texto)
        .replace(/\{nombre\}/g, nombreSeguro)
        .replace(/\{nota\}/g, String(correccion.nota));
    }

    // Fondo del aula también al volver del examen (petición de Marcos)
    ponerFondoResultado(seccion);

    var cabecera = crearNotaResultado(correccion);
    cabecera.classList.add("oculta"); // se revela tras la corrección
    seccion.appendChild(cabecera);

    var escenario = document.createElement("div");
    escenario.className = "resultado-escenario";
    var spriteEl = document.createElement("img");
    spriteEl.id = "resultado-sprite";
    spriteEl.className = "resultado-sprite";
    spriteEl.src = "sprites/yo/normal.png";
    spriteEl.alt = ALT_PERSONAJE;
    escenario.appendChild(spriteEl);
    seccion.appendChild(escenario);

    var caja = document.createElement("div");
    caja.className = "resultado-dialogo";
    var parrafo = document.createElement("p");
    parrafo.className = "clase-parrafo"; // mismo estilo de texto que la clase
    var textoEl = document.createElement("span");
    textoEl.id = "resultado-texto";
    var caretEl = document.createElement("span");
    caretEl.id = "resultado-caret";
    caretEl.className = "clase-caret"; // mismo caret ▼ que la escena de clase
    caretEl.setAttribute("aria-hidden", "true");
    caretEl.textContent = "▼";
    parrafo.appendChild(textoEl);
    parrafo.appendChild(caretEl);
    caja.appendChild(parrafo);
    seccion.appendChild(caja);

    /** Fase 2: revela la nota y encadena el diálogo de resultado. */
    function arrancarResultado() {
      cabecera.classList.remove("oculta");
      cabecera.classList.add("aparece");

      if (correccion.aprueba) {
        audio.jingle();
        lanzarConfeti();
      } else {
        audio.triste();
      }

      var base = correccion.aprueba ? resultados.aprobado : resultados.suspenso;
      var lineas = (Array.isArray(base) ? base.slice() : []).map(function (l) {
        return { sprite: l.sprite, texto: conTokens(l.texto), efecto: l.efecto };
      });
      if (correccion.aprueba &&
          window.Logica.esMatricula(correccion.nota) &&
          typeof resultados.matriculaHonor === "string") {
        lineas.push({
          sprite: "soprendido",
          texto: conTokens(resultados.matriculaHonor)
        });
      }

      var jugador = new DialoguePlayer(spriteEl, textoEl, lineas, {
        caretEl: caretEl,
        onFin: function () {
          if (jugadorResultado !== jugador) return; // quedó obsoleto
          if (correccion.aprueba) {
            renderDiploma(correccion, nombre);
          } else {
            renderReintento(correccion);
          }
        }
      });
      jugadorResultado = jugador;
      jugador.avanzar(); // primera línea ya en marcha
    }

    /** Puerta del intro: descarta onFin obsoletos antes de revelar. */
    function revelarResultado() {
      if (jugadorResultado !== jugadorIntro) return; // quedó obsoleto
      arrancarResultado();
    }

    // Fase 1: corrección (nota oculta). Sin líneas definidas → revela directo.
    var corrigiendo = Array.isArray(resultados.corrigiendo)
      ? resultados.corrigiendo : [];
    if (corrigiendo.length === 0) {
      arrancarResultado();
      return;
    }
    var jugadorIntro = new DialoguePlayer(spriteEl, textoEl, corrigiendo, {
      caretEl: caretEl,
      onFin: function () {
        if (jugadorResultado !== jugadorIntro) return; // quedó obsoleto
        arrancarResultado();
      }
    });
    jugadorResultado = jugadorIntro;
    jugadorIntro.avanzar(); // primera línea ya en marcha
  }

  /**
   * Fase 2 (aprobado): diploma — papel pixel con diploma.titulo, el
   * nombre del examen, la nota, diploma.cuerpo y diploma.firma, más el
   * botón VOLVER AL INICIO (≥44px). "Estimado alumno" si el nombre
   * llega vacío por cualquier vía.
   */
  function renderDiploma(correccion, nombre) {
    limpiarPantallaResultado(); // quita el diálogo y el confeti ya cumplido
    var seccion = document.getElementById("pantalla-resultado");
    var datos = window.GAME_DATA && window.GAME_DATA.resultados &&
      window.GAME_DATA.resultados.diploma;
    if (!seccion || !datos) {
      console.warn("[diploma] Faltan #pantalla-resultado o resultados.diploma");
      return;
    }

    ponerFondoResultado(seccion); // el diploma también sobre el aula

    seccion.appendChild(crearNotaResultado(correccion));

    // Nombre: el del examen (2º argumento); vacío por cualquier vía →
    // espejo window.nombreAlumno → fallback "Estimado alumno".
    var nombreSeguro = String(nombre == null ? "" : nombre).trim() ||
      String(window.nombreAlumno == null ? "" : window.nombreAlumno).trim() ||
      NOMBRE_POR_DEFECTO;

    var papel = document.createElement("div");
    papel.className = "diploma-papel";

    var titulo = document.createElement("div");
    titulo.className = "diploma-titulo";
    titulo.textContent = datos.titulo;
    papel.appendChild(titulo);

    var concede = document.createElement("div");
    concede.className = "diploma-concede";
    concede.textContent = "SE CONCEDE A:";
    papel.appendChild(concede);

    var nombreEl = document.createElement("div");
    nombreEl.className = "diploma-nombre";
    nombreEl.textContent = nombreSeguro;
    papel.appendChild(nombreEl);

    var notaEl = document.createElement("div");
    notaEl.className = "diploma-nota";
    notaEl.textContent = "NOTA FINAL: " + correccion.nota + "/10";
    papel.appendChild(notaEl);

    var cuerpo = document.createElement("div");
    cuerpo.className = "diploma-cuerpo";
    cuerpo.textContent = datos.cuerpo;
    papel.appendChild(cuerpo);

    var firma = document.createElement("div");
    firma.className = "diploma-firma";
    firma.textContent = datos.firma;
    papel.appendChild(firma);

    seccion.appendChild(papel);

    // Botón UNA ÚLTIMA COSA... → la escena de despedida (petición de
    // Marcos: tras el diploma viene una última escena antes del FIN).
    var boton = document.createElement("button");
    boton.id = "boton-despedida";
    boton.type = "button";
    boton.className = "boton-grande"; // ≥44px (estilo compartido con el inicio)
    boton.textContent = (window.GAME_DATA.resultados && window.GAME_DATA.resultados.botonDespedida) ||
      "UNA ÚLTIMA COSA...";
    boton.addEventListener("click", function () {
      audio.preparar(); // gesto del usuario
      renderDespedida();
      irAPantalla("pantalla-resultado"); // la sección es la misma: repone el velo de corte
    });
    seccion.appendChild(boton);
  }

  /**
   * Última escena (tras el diploma): despedida de Marcos fuera de
   * personaje. Reutiliza la estructura de la escena de resultado
   * (escenario + caja de diálogo sobre el aula) y el listener de tap
   * de la sección: los toques avanzan el diálogo. Al terminar → FIN.
   */
  function renderDespedida() {
    limpiarPantallaResultado();
    var seccion = document.getElementById("pantalla-resultado");
    var lineas = window.GAME_DATA && window.GAME_DATA.resultados &&
      window.GAME_DATA.resultados.despedida;
    if (!seccion || !Array.isArray(lineas) || lineas.length === 0) {
      console.warn("[despedida] Faltan #pantalla-resultado o resultados.despedida");
      renderFin(); // sin despedida definida, al cartel de FIN directamente
      return;
    }

    ponerFondoResultado(seccion); // el aula también en la despedida

    var escenario = document.createElement("div");
    escenario.className = "resultado-escenario";
    var spriteEl = document.createElement("img");
    spriteEl.className = "resultado-sprite";
    spriteEl.src = "sprites/yo/" + (lineas[0].sprite || "normal") + ".png";
    spriteEl.alt = ALT_PERSONAJE;
    escenario.appendChild(spriteEl);
    seccion.appendChild(escenario);

    var caja = document.createElement("div");
    caja.className = "resultado-dialogo";
    var parrafo = document.createElement("p");
    parrafo.className = "clase-parrafo"; // mismo estilo de texto que la clase
    var textoEl = document.createElement("span");
    var caretEl = document.createElement("span");
    caretEl.className = "clase-caret"; // mismo caret ▼ que la escena de clase
    caretEl.setAttribute("aria-hidden", "true");
    caretEl.textContent = "▼";
    parrafo.appendChild(textoEl);
    parrafo.appendChild(caretEl);
    caja.appendChild(parrafo);
    seccion.appendChild(caja);

    var jugador = new DialoguePlayer(spriteEl, textoEl, lineas, {
      caretEl: caretEl,
      onFin: function () {
        if (jugadorResultado !== jugador) return; // quedó obsoleto
        renderFin();
      }
    });
    jugadorResultado = jugador; // el tap de la sección avanza este diálogo
    jugador.avanzar(); // primera línea ya en marcha
  }

  /**
   * Cartel de FIN tras la despedida: texto grande y botón VOLVER AL
   * INICIO (location.reload(), la forma más fiable de restaurar TODO
   * el estado inicial sin dejar timers/listeners vivos).
   */
  function renderFin() {
    jugadorResultado = null; // el tap de la sección deja de hacer nada
    limpiarPantallaResultado();
    var seccion = document.getElementById("pantalla-resultado");
    var resultados = window.GAME_DATA && window.GAME_DATA.resultados;
    if (!seccion || !resultados) {
      console.warn("[fin] Faltan #pantalla-resultado o GAME_DATA.resultados");
      return;
    }

    ponerFondoResultado(seccion);

    var fin = document.createElement("div");
    fin.className = "fin-titulo";
    fin.textContent = resultados.textoFin || "FIN";
    seccion.appendChild(fin);

    var boton = document.createElement("button");
    boton.id = "boton-fin";
    boton.type = "button";
    boton.className = "boton-grande";
    boton.textContent = resultados.botonFin || "VOLVER AL INICIO";
    boton.addEventListener("click", function () {
      audio.preparar(); // gesto del usuario
      location.reload();
    });
    seccion.appendChild(boton);
  }

  /**
   * Fase 2 (suspenso): botón GAME_DATA.resultados.botonReintentar →
   * renderExamen({reintento:true}) + irAPantalla("pantalla-examen").
   * Si vuelve a suspender, mostrarResultado corre de nuevo: el bucle
   * se repite sin romperse y sin acumular basura (todo se reconstruye
   * limpio en cada pasada).
   */
  function renderReintento(correccion) {
    limpiarPantallaResultado();
    var seccion = document.getElementById("pantalla-resultado");
    var datos = window.GAME_DATA && window.GAME_DATA.resultados;
    if (!seccion || !datos) {
      console.warn("[reintento] Faltan #pantalla-resultado o GAME_DATA.resultados");
      return;
    }

    ponerFondoResultado(seccion); // el reintento también sobre el aula

    seccion.appendChild(crearNotaResultado(correccion));

    var boton = document.createElement("button");
    boton.id = "boton-reintentar";
    boton.type = "button";
    boton.className = "boton-grande"; // ≥44px
    boton.textContent = datos.botonReintentar;
    boton.addEventListener("click", function () {
      audio.preparar(); // gesto del usuario
      renderExamen({ reintento: true }); // correctas resaltadas y marcables
      irAPantalla("pantalla-examen"); // id canónico (el alias corto también vale)
      window.scrollTo(0, 0);
    });
    seccion.appendChild(boton);
  }

  /**
   * Tap en cualquier parte de la pantalla de resultado: UNA acción por
   * tap (mismo patrón que la escena de clase: "click", que no se
   * duplica como touchend+click). Listener ÚNICO montado una sola vez
   * al arrancar: los renders reconstruyen los hijos, nunca la sección,
   * así no se acumulan listeners. Sin diálogo activo, el tap no hace
   * nada (avanzar() ignora cuando terminó o no hay jugador).
   */
  function montarPantallaResultado() {
    var seccion = document.getElementById("pantalla-resultado");
    if (!seccion) {
      console.warn("[resultado] No existe #pantalla-resultado");
      return;
    }
    seccion.addEventListener("click", function () {
      if (jugadorResultado) jugadorResultado.avanzar();
    });
  }

  /* =======================================================
     Montaje de la pantalla de normas (lo primero que se ve)
     ======================================================= */

  /**
   * Pantalla inicial única: título + subtítulo del juego y, en medio,
   * las normas de la clase (texto de Marcos en data.js). El botón
   * ENTRAR AL AULA arranca la clase directamente (ya no hay portada).
   */
  function montarNormas() {
    var seccion = document.getElementById("pantalla-normas");
    var datos = window.GAME_DATA && window.GAME_DATA.normas;
    if (!seccion || !datos) {
      console.warn("[normas] Faltan #pantalla-normas o GAME_DATA.normas");
      return;
    }

    var titulo = document.getElementById("normas-titulo");
    var subtitulo = document.getElementById("normas-subtitulo");
    var intro = document.getElementById("normas-intro");
    var lista = document.getElementById("normas-lista");
    var cierre = document.getElementById("normas-cierre");
    var boton = document.getElementById("boton-entrar");

    if (titulo) titulo.textContent = window.GAME_DATA.titulo;
    if (subtitulo) subtitulo.textContent = window.GAME_DATA.subtitulo;
    if (intro) intro.textContent = datos.intro;
    if (cierre) cierre.textContent = datos.cierre;
    if (boton) boton.textContent = datos.boton || "ENTRAR AL AULA";
    if (lista) {
      (Array.isArray(datos.lista) ? datos.lista : []).forEach(function (regla) {
        var li = document.createElement("li");
        li.textContent = regla;
        lista.appendChild(li);
      });
    }
    if (boton) {
      boton.addEventListener("click", function () {
        audio.preparar(); // primer gesto: el AudioContext nace aquí (iOS)
        irAPantalla("pantalla-clase");
        arrancarClase(); // el jugador pasa de leer las normas a la clase
      });
    }
  }

  /* =======================================================
     Montaje de la escena de la clase
     ======================================================= */

  var jugadorClase = null; // DialoguePlayer de la clase (se crea al EMPEZAR)

  function precargarSprites() {
    SPRITES_VALIDOS.forEach(function (nombre) {
      var img = new Image();
      img.src = "sprites/yo/" + nombre + ".png";
    });
  }

  function arrancarClase() {
    var spriteEl = document.getElementById("clase-sprite");
    var textoEl = document.getElementById("clase-texto");
    var caretEl = document.getElementById("clase-caret");
    if (!spriteEl || !textoEl) {
      console.warn("[clase] Faltan #clase-sprite o #clase-texto: la escena no arranca.");
      return;
    }
    if (jugadorClase) return; // defensa: un EMPEZAR repetido no reinicia la escena

    jugadorClase = new DialoguePlayer(spriteEl, textoEl, window.GAME_DATA.dialogos, {
      caretEl: caretEl,
      onFin: function () {
        // Task 3: fin de la clase → se pinta el examen (primera vez,
        // sin resaltar correctas) y se entra en su pantalla. Se pinta
        // ANTES de cambiar de pantalla para que la hoja ya esté lista
        // al mostrarse. irAPantalla sigue siendo genérica: Task 4 usa
        // el mismo patrón renderExamen({reintento:true}) + irAPantalla.
        renderExamen({ reintento: false });
        irAPantalla("pantalla-examen"); // FIX Task 3: el id real es "pantalla-examen"
      }
    });
    jugadorClase.avanzar(); // primera línea de la clase
  }

  /**
   * Tap para avanzar: UNA acción por tap. Se usa "click" (se dispara
   * una sola vez por tap, sin duplicarse como touchend+click).
   * El botón SALTAR corta la propagación para no avanzar además el diálogo.
   */
  function montarPantallaClase() {
    var seccion = document.getElementById("pantalla-clase");
    if (!seccion) {
      console.warn("[clase] No existe #pantalla-clase");
      return;
    }
    seccion.addEventListener("click", function () {
      if (jugadorClase) jugadorClase.avanzar();
    });

    var botonSaltar = document.getElementById("boton-saltar");
    if (botonSaltar) {
      botonSaltar.addEventListener("click", function (evento) {
        evento.stopPropagation(); // SALTAR no dispara el avance del diálogo
        if (jugadorClase) jugadorClase.saltar();
      });
    }
  }

  /** Botón fijo de sonido: alterna silencio y refresca su icono. */
  function montarBotonSonido() {
    var boton = document.getElementById("boton-sonido");
    if (!boton) return;
    function refrescar() {
      boton.textContent = audio.estaSilenciado() ? "\uD83D\uDD07" : "\uD83D\uDD0A"; // 🔇 / 🔊
      boton.setAttribute("aria-pressed", audio.estaSilenciado() ? "true" : "false");
    }
    boton.addEventListener("click", function () {
      audio.toggle();
      audio.preparar(); // si se reactiva, el contexto queda listo al gesto
      refrescar();
    });
    refrescar();
  }

  /* =======================================================
     Arranque
     ======================================================= */

  function iniciarJuego() {
    if (!window.Logica || !window.GAME_DATA) {
      console.error("Falta logica.js o data.js: el juego no puede arrancar.");
      return;
    }

    // Validar los datos: si hay problemas, avisar por consola (no bloquear).
    var problemas = window.Logica.validarDatos(window.GAME_DATA);
    if (problemas && problemas.length > 0) {
      console.warn("[GAME_DATA] Hay problemas en los datos:", problemas);
    }

    document.title = window.GAME_DATA.titulo;
    precargarSprites();
    montarNormas(); // pantalla inicial única: título + subtítulo + normas
    montarPantallaClase();
    montarPantallaResultado(); // Task 4: listener único de tap para avanzar el diálogo
    montarBotonSonido();
    // La pantalla de normas ya está visible en el HTML (class="pantalla activa").
  }

  window.iniciarJuego = iniciarJuego;

  window.addEventListener("load", iniciarJuego);
})();
