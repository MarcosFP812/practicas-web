# 🎓 Cómo publicar tu juego (guía paso a paso)

Esta guía pone el juego online en unos **10 minutos**, gratis y sin instalar
nada. Al final tendrás una dirección web que funciona en cualquier móvil.

## Lo que necesitas

- Los archivos de esta carpeta (el juego completo).
- Una cuenta gratuita en **github.com** (con tu correo basta).
- 10 minutos de tranquilidad.

---

## Paso 1: Crea tu repositorio en github.com

1. Entra en **https://github.com** y crea una cuenta (o inicia sesión).
2. Pulsa el botón **+** que está arriba a la derecha y elige **New repository**.
3. En *Repository name* escribe: **regalo-graduacion-marcos**
4. Marca la opción **Public** (es obligatorio para que la página sea gratis).
5. Pulsa el botón verde **Create repository**.

## Paso 2: Sube los archivos del juego

1. En la página del repositorio que acabas de crear, pulsa **Add file** →
   **Upload files**.
2. Arrastra (o elige) estos archivos de la carpeta del proyecto:
   **index.html, style.css, logica.js, data.js, game.js y GUIA-PUBLICACION.md**
3. **MUY IMPORTANTE — la carpeta `sprites/` también se sube, con su estructura:**
   arrastra la **carpeta `sprites` completa** sobre la zona de subida. Dentro
   debe viajar la subcarpeta `yo` con sus 6 imágenes. Al arrastrar la carpeta
   entera, GitHub mantiene las carpetas tal cual.
4. **NO subas** las carpetas **`.superpowers/` ni `.opencode/`** ni el archivo
   **`preguntas.txt`**: son notas internas, no forman parte del juego (además
   el juego ya está marcado para ignorarlas).
5. Baja hasta el final y pulsa **Commit changes** (puedes dejar el mensaje
   tal cual está).

> Comprobación rápida: en el repositorio debes ver la carpeta **sprites** con
> la subcarpeta **yo** dentro y sus 6 imágenes. Si faltara algo, repite
> **Add file → Upload files** y arrastra esa subcarpeta entera.

## Paso 3: Activa la página web (GitHub Pages)

1. En el repositorio, pulsa **Settings** (en la fila de menús de arriba).
2. En el menú de la izquierda, pulsa **Pages**.
3. En la sección *Build and deployment*, en **Branch**, elige **master**
   (o **main**, el nombre que aparezca) y deja la carpeta **/(root)**.
4. Pulsa **Save**.

## Paso 4: Abre tu juego en el móvil

1. Espera **1 minuto** aproximadamente (la primera vez tarda un poco).
2. Abre en el navegador del móvil esta dirección, cambiando **TUUSUARIO** por
   tu nombre de usuario de GitHub:
   **https://TUUSUARIO.github.io/regalo-graduacion-marcos/**
3. Si sale un "404", espera 2-3 minutos más y refresca la página.

> Consejo: pruébalo entero una vez (clase → examen → nota → diploma) antes
> del gran día.

## Paso 5: Genera un código QR para el regalo

1. Entra en **qr-code-generator.com** (o cualquier web similar gratuita) y
   elige el modo **URL**.
2. Pega tu dirección: **https://TUUSUARIO.github.io/regalo-graduacion-marcos/**
3. Descarga el QR en imagen y pégalo donde quieras: cartel, tarjeta,
   presentación...
4. Alternativa sin webs externas: abre tu página en **Chrome** del móvil →
   pulsa **Compartir** → elige la opción del **código QR** que trae el propio
   menú.

---

## ✏️ Cómo editar el contenido (tus textos y preguntas)

**Todo lo que se dice y se pregunta en el juego vive en un único archivo:
`data.js`.**

- Ábrelo con cualquier editor de texto (el Bloc de notas de Windows vale).
- Busca las marcas **`// ← MARCOS: ESCRIBE AQUÍ`**: ahí es donde falta texto
  (está señalado con `[RELLENA: ...]`). Ahí van los avisos del examen, los
  distractores graciosos de las preguntas, el mensaje del diploma, etc.
- Cambia solo el texto **entre comillas** y guarda. La respuesta correcta de
  cada pregunta se marca con el número `correcta: 0..3` (0 = A, 1 = B,
  2 = C, 3 = D).
- Cuando termines, vuelve a subir `data.js` al repositorio (**Add file →
  Upload files → Commit changes**) y la web se actualiza sola en 1-2 minutos.
- Si algo se tuerce, siempre puedes volver a subir la versión anterior:
  GitHub guarda el historial de cada archivo.
