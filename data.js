/* =========================================================
   data.js — TODO el contenido de texto del juego (window.GAME_DATA).
   Contenido final redactado por Marcos (conversación.txt + preguntas.txt)
   con pulido de estilo. Los diálogos de resultado admiten los tokens
   {nombre} y {nota}, que el juego sustituye por los del jugador.
   ========================================================= */

window.GAME_DATA = {
  titulo: "EL EXCELENTÍSIMO DON MARCOS",
  subtitulo: "Primera Clase — Examen Sorpresa",

  /* Pantalla inicial única: el título y el subtítulo del juego encima,
     las normas de la clase en medio (texto de Marcos, tildes arregladas)
     y el botón ENTRAR AL AULA que arranca la clase directamente. */
  normas: {
    intro: "¿Estáis preparados para asistir a la clase del ilustre profesor Marcos? Vuestras únicas normas serán:",
    lista: [
      "Prestarás atención en clase.",
      "Nunca insultarás al profesor ni te reirás de su alopecia.",
      "Llevaréis el mismo ritmo todos vosotros: ninguno se puede adelantar al resto."
    ],
    cierre: "Espero que disfrutéis de la clase magistral.",
    boton: "ENTRAR AL AULA"
  },

  /* Escena de la clase: saludo → peluquín → anuncio del examen sorpresa.
     Cada línea: { sprite, texto, efecto? } con efecto "zoom"|"shake".
     Sprites válidos: normal, feliz, triste, enfadado, soprendido, asustado. */
  dialogos: [
    { sprite: "normal", texto: "Buenos días, mis estimados alumnos." },
    { sprite: "normal", texto: "Me llamo Marcos Fuster y seré vuestro profesor sustituto por hoy." },
    { sprite: "feliz", texto: "Sé que soy demasiado guapo y que tengo un pelazo, pero no hace falta que me acribilléis: los autógrafos, al final de la clase." },
    { sprite: "soprendido", texto: "¿EH? ¡OYE!" },
    { sprite: "enfadado", texto: "VOSOTROS TRES, AL FONDO... ¿CÓMO OS LLAMÁIS?", efecto: "shake" },
    { sprite: "enfadado", texto: "LA ENFADICA, LA ORANGUTANA Y EL ARTRÍTICO... SÍ... SÍ... SÍ... ¡VOSOTROS!" },
    { sprite: "enfadado", texto: "YA ME HABÉIS TOCADO LAS NARICES. ME PARECE INACEPTABLE QUE LLAMÉIS A VUESTRO PROFESOR 'PELÓN CABEZÓN'." },
    { sprite: "enfadado", texto: "¡TODO EL MUNDO TIENE DERECHO A LLEVAR PELUQUÍN CUANDO ES UN TOBOGÁN DE PIOJOS!" },
    { sprite: "asustado", texto: "AHORA SÍ QUE OS VAIS A ENTERAR..." },
    { sprite: "enfadado", texto: "¡¡EXAMEN SORPRESA!!", efecto: "zoom" },
    { sprite: "enfadado", texto: "Y si no lo aprobáis: os quedáis sin torreznos, os paso la convocatoria y... ¡a pagar la matrícula que tendré que comer yo!" },
    { sprite: "feliz", texto: "Aunque no la necesito, porque soy rico... será por el dinero..." },
    { sprite: "enfadado", texto: "Os lo he puesto EXTREMADAMENTE difícil. Para que no apruebe ni uno." },
    { sprite: "soprendido", texto: "Y el tema del examen es sobre..." },
    { sprite: "feliz", texto: "¡SOBRE MÍ: EL EXCELENTÍSIMO DON DOCENTE INVESTIGADOR MATRÍCULO MARCOS!" },
    { sprite: "normal", texto: "Ahora os reparto los folios del examen. No vale copiar con chuletas... ni con florita." },
    { sprite: "enfadado", texto: "Y no os olvidéis del nombre y los apellidos... ¡que resto nota!" }
  ],

  examen: {
    tituloHoja: "EXAMEN SORPRESA DE DON MARCOS I",
    etiquetaNombre: "NOMBRE:",
    etiquetaApellidos: "APELLIDOS:",
    etiquetaFecha: "FECHA:",
    avisoSinNombre: "¡Eh, tú! Que en MI clase no se entra en el examen de incógnito... ESCRÍBELO, que resto nota.",
    avisoFaltanPreguntas: "¿Eh? Hay preguntas SIN responder. En mi asignatura no se deja ni una en blanco. Al primer hueco, andando."
  },

  /* Las 10 preguntas del examen. Cada una: { enunciado, opciones: [4], correcta: 0..3 }. */
  preguntas: [
    {
      enunciado: "¿De qué trabaja Marcos?",
      opciones: [
        "Agricultor",
        "Es un ilustre investigador con fructíferos resultados en el área de reparación automática de código con Inteligencia Artificial, así como un gran docente y amante de la fabada",
        "Carpintero",
        "Nini profesional"
      ],
      correcta: 1
    },
    {
      enunciado: "¿Cuál es la mayor preocupación de Marcos?",
      opciones: [
        "El hambre en el mundo",
        "No llegar tarde al trabajo",
        "Ver a su novia",
        "Su calvicie"
      ],
      correcta: 3
    },
    {
      enunciado: "¿Qué le ofreció la subdelegada a Marcos?",
      opciones: [
        "Su capibara",
        "Palomitas",
        "Un beso",
        "Unas lentejas"
      ],
      correcta: 1
    },
    {
      enunciado: "¿Cuál es el lugar que más frecuenta Marcos en la universidad?",
      opciones: [
        "La cafetería",
        "No va a la universidad",
        "Las aulas",
        "El baño"
      ],
      correcta: 3
    },
    {
      enunciado: "¿A quién ha decidido invitar a la graduación?",
      opciones: [
        "A sus papuchis y a su tete",
        "A su novia, Iria, y a sus suegris, Rafa y Rosa",
        "A su novia y a la subde",
        "Solo a sus papitos"
      ],
      correcta: 1
    },
    {
      enunciado: "¿Qué bocata se ha comido más veces Marcos en la cafetería?",
      opciones: [
        "Lomo",
        "Oreja picante",
        "De tortilla",
        "Atún"
      ],
      correcta: 2
    },
    {
      enunciado: "¿Cómo se llama el primer artículo de Marcos?",
      opciones: [
        "Remedios",
        "Refrancisca",
        "Resiellas",
        "Repaca"
      ],
      correcta: 3
    },
    {
      enunciado: "¿Qué tenía Marcos al principio de la carrera que ya no tiene?",
      opciones: [
        "La pareja",
        "La felicidad",
        "Pelo",
        "El futuro"
      ],
      correcta: 2
    },
    {
      enunciado: "¿Por qué se vendería Marcos?",
      opciones: [
        "No se vendería: es una persona íntegra",
        "Absolutamente nada",
        "Por un plato de fabada y unas salchichas al vino de Rosa",
        "Cero patatero, se regala gratis"
      ],
      correcta: 2
    },
    {
      enunciado: "¿A quiénes quiere con toda su alma, está profundamente agradecido por todo lo que han hecho por él durante estos años de carrera y desea que le acompañen el resto de su vida?",
      opciones: [
        "A nadie, es un solitario amargado",
        "A él mismo, obviamente",
        "A la fabada (obviamente)",
        "A su novia y a sus suegros"
      ],
      correcta: 3
    }
  ],

  resultados: {
    /* Momento de corrección: se juega ANTES de revelar la nota. */
    corrigiendo: [
      { sprite: "normal", texto: "A ver, a ver, a ver... dejadme que corrija los exámenes." },
      { sprite: "soprendido", texto: "Uy, uy, uy... no sé si aprobaréis..." },
      { sprite: "normal", texto: "Eh..." }
    ],
    /* Tokens: {nombre} = nombre del jugador, {nota} = nota sobre 10. */
    aprobado: [
      { sprite: "feliz", texto: "ENHORABUENA, {nombre}. HAS SACADO UN {nota}/10." },
      { sprite: "feliz", texto: "De verdad me conoces... qué emoción." },
      { sprite: "feliz", texto: "Hoy, para celebrarlo: ¡a comer como gorrinos!" }
    ],
    suspenso: [
      { sprite: "triste", texto: "Un... UN SUSPENSO. Ay, no, no, no..." },
      { sprite: "triste", texto: "Y yo que pensaba que me conocíais bien... Me habéis fallado (y me habéis roto el corazón)." },
      { sprite: "normal", texto: "Pero soy un profesor comprensivo: REPITES CONVOCATORIA. Y esta vez te dejo las respuestas bien chivadas... que en el fondo quiero verte aprobar." }
    ],
    botonReintentar: "REPETIR CONVOCATORIA",
    matriculaHonor: "¡¿UN 10?! ¡MATRÍCULA DE HONOR! Ni yo mismo me conozco tan bien... Oficialmente eres mi alumno favorito.",
    diploma: {
      titulo: "DIPLOMA DE DONMARCOLOGÍA",
      cuerpo: "Por sus grandes méritos soportando al niño pedorro durante todos estos 4 años de carrera. Ha sido un verdadero honor compartir tantas experiencias juntos: el señor Don Marcos se siente extremadamente orgulloso de haberlos vivido junto a vosotros. Este título acredita que eres una persona maravillosa y concede la posibilidad de continuar en la vida del ilustre profesor hasta un periodo de: TODA LA VIDA.",
      firma: "Atte.: Don Marcos — Os quiero infinito."
    },

    /* Última escena, tras el diploma: despedida de Marcos fuera de
       personaje. Texto de Marcos ("dale un poquito de gracia, sin fabada").
       Mismo formato que los diálogos: { sprite, texto, efecto? } */
    despedida: [
      { sprite: "normal", texto: "Bueno... ahora sí: me dejo de tonterías y ya os dejo en paz." },
      { sprite: "feliz", texto: "Solo espero que disfrutéis el día y la graduación tanto como lo voy a disfrutar yo." },
      { sprite: "feliz", texto: "Y sobre todo: ¡aprovechad muchísimo la comida! Que para eso hemos venido, ¿no?" },
      { sprite: "normal", texto: "Es un honor teneros aquí hoy, y estoy deseando compartir cada minuto con vosotros." },
      { sprite: "feliz", texto: "Os quiero mucho." },
      { sprite: "soprendido", texto: "Ah, y por cierto... creo que SE ME HA PERDIDO algo por vuestra casa. A la vuelta... miradlo, jeje.", efecto: "shake" },
      { sprite: "feliz", texto: "¡ADIOOOOS!", efecto: "zoom" }
    ],
    botonDespedida: "UNA ÚLTIMA COSA...",
    textoFin: "FIN",
    botonFin: "VOLVER AL INICIO"
  }
};
