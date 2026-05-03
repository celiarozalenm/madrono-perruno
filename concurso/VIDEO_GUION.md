# Guion vídeo demo — Madroño Perruno

**Duración objetivo: 2:40 min** (máximo permitido: 3 min)
**Plataforma: YouTube unlisted**
**Herramienta sugerida: Loom o Cmd+Shift+5 → grabación de pantalla**

---

## Antes de grabar

1. Cierra todas las pestañas innecesarias del navegador
2. Modo incógnito (sin extensiones que aparezcan)
3. Resolución de pantalla normal — no zoomees el navegador
4. Ten preparada una dirección concreta para "Mi barrio canino" (ej. "Calle Alcalá 100")
5. Ten lista una papelera concreta del mapa para hacer un reporte
6. Idioma de la app: **español**
7. Si grabas con Loom, modo "screen only" (sin cámara) para que no compita con la UI

---

## Estructura por secciones

### 0:00 - 0:15 — Apertura (15s)

**Pantalla:** Landing page https://madrono-perruno.vercel.app
**Voz:**
> "Madroño Perruno es un atlas canino de Madrid construido con ocho conjuntos de datos abiertos del Ayuntamiento. Cruza papeleras, áreas caninas, parques, veterinarios, fuentes de agua, calidad del aire, censo de animales y estadísticas del centro de protección animal para resolver preguntas que ninguna app oficial responde."

**Acción:** scroll suave por la landing mostrando hero y features.

---

### 0:15 - 0:35 — Mapa con las 5 capas (20s)

**Pantalla:** click en "Abrir atlas" → mapa principal
**Voz:**
> "Capas combinables sobre el mapa: papeleras con bolsas, áreas caninas, parques, centros veterinarios, fuentes de agua para hidratar al perro y calidad del aire en tiempo real con código de color WHO."

**Acción:** activar/desactivar las capas en el panel CAPAS para que se vea el cambio visual. Hacer zoom a un distrito.

---

### 0:35 - 1:10 — Reportes ciudadanos (35s) 🌟 MOMENTO CLAVE

**Pantalla:** click en una papelera concreta → popup con histórico de reportes
**Voz:**
> "Esta es la característica diferencial: el dato municipal nos dice que hay seis mil papeleras, pero no si tienen bolsas ahora mismo. Madroño Perruno deja a cualquier vecino reportar el estado en un clic, sin registro, con anti-spam por IP. Y en parques y áreas caninas se pueden dejar comentarios con valoración positiva o negativa."

**Acción:**
1. Mostrar popup de papelera con reportes recientes
2. Hacer click en "Tiene bolsas" o "No tiene bolsas" → mostrar feedback inmediato
3. Cambiar a un parque o área canina y dejar un comentario corto (👍 + texto)

---

### 1:10 - 1:35 — Mi barrio canino (25s)

**Pantalla:** sección "Mi barrio canino"
**Voz:**
> "Introduces una dirección y obtienes una puntuación de cero a cien con la infraestructura canina disponible a cinco, diez y quince minutos andando, más la calidad del aire de la estación más cercana. Y se comparte como tarjeta lista para redes."

**Acción:**
1. Escribir dirección (ej. "Calle Alcalá 100")
2. Mostrar el scoring con desglose
3. Hacer click en el botón "Compartir" → mostrar la tarjeta PNG generada

---

### 1:35 - 1:55 — Ruta bolsa-amigable (20s)

**Pantalla:** sección "Ruta bolsa-amigable"
**Voz:**
> "Para el paseo del día: introduces una ubicación y la duración deseada, y la app genera una ruta en bucle por calles reales que pasa por papeleras y áreas caninas cercanas. Usa OSRM para rutas peatonales auténticas."

**Acción:** generar una ruta de 20-30 min y enseñar el polígono dibujado en el mapa.

---

### 1:55 - 2:10 — Hilo en vivo "Últimos reportes" (15s)

**Pantalla:** menú lateral → click en "Últimos reportes"
**Voz:**
> "Y la novedad más reciente: un hilo en vivo con los últimos reportes y comentarios de toda la ciudad. Refresco automático. La ciudad mantenida por la propia ciudad, en tiempo real."

**Acción:** mostrar la lista cronológica con los reportes/comentarios que hayas dejado durante la grabación.

---

### 2:10 - 2:25 — Comparativa por distrito (15s)

**Pantalla:** sección "Estadísticas"
**Voz:**
> "Comparativa cruzada por los veintiún distritos: mapa coropleta o tabla ordenada, con datos de censo histórico desde 2014. Visibiliza desigualdades territoriales que hoy no muestra ningún cuadro de mando municipal."

**Acción:**
1. Cambiar entre mapa coropleta y tabla
2. Cambiar el indicador (papeleras → áreas caninas → perros censados)
3. Mover el selector de año del censo (ej. 2014 → 2024)

---

### 2:25 - 2:40 — Cierre (15s)

**Pantalla:** volver a landing → scroll a sección de privacidad y open source
**Voz:**
> "Web instalable como app, bilingüe español-inglés, sin tracking, sin cookies, código abierto en GitHub. Madroño Perruno demuestra que con datos abiertos y AI-assisted development una persona puede entregar un servicio público útil en pocos días. Gracias."

**Acción:** mostrar URL `madrono-perruno.vercel.app` y `github.com/celiarozalenm/madrono-perruno` en pantalla.

---

## Tips de grabación

- **Habla pausada y clara**: 2:30 da margen para no acelerar
- **No hagas pausas largas** entre secciones — corta y monta si hace falta
- **Cursor visible**: en macOS activa "Mostrar cursor en grabaciones" en Loom o usa la opción de Cmd+Shift+5
- **No muestres pestañas abiertas, marcadores ni notificaciones**
- **Audio**: graba con micro decente (auriculares con micro mejor que el del Mac integrado)

## Después de grabar

1. Subir a YouTube como **Unlisted** (no público, no privado)
2. Título: "Madroño Perruno — Atlas Canino de Madrid (II Premios Reutilización Datos Abiertos 2026)"
3. Descripción breve con los enlaces (web + repo)
4. Copiar la URL `https://youtu.be/XXXXX`
5. Pegarla en `concurso/Anexo_III_Memoria.md` línea 16, sustituyendo `[PENDIENTE]`
6. Regenerar el PDF: `cd concurso && pandoc Anexo_III_Memoria.md -o memoria.html --standalone --metadata title="Anexo III" --css=memoria-print.css && "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf=memoria.pdf file://"$(pwd)/memoria.html"`
