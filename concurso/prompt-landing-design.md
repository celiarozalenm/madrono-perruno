# Prompt para diseñar la landing en Pencil

> Pega esto dentro de Pencil (con su asistente de IA activado). Descripción puramente visual de la landing — sin código, solo diseño.

---

Diseña la landing page de **Madroño Perruno**, un atlas canino de Madrid construido con datos abiertos. Proyecto presentado a los Premios a la Reutilización de Datos Abiertos del Ayuntamiento de Madrid 2026. Es una PWA gratuita y open source. Tono: institucional pero cálido, civic-tech moderno con un toque madrileño discreto.

## Frame y dimensiones

Crea un frame mobile principal de **390 × 2400 px** (iPhone 14 Pro vertical scroll) y, si quieres, otro frame desktop de **1280 × 2800 px** para versión escritorio.

## Sistema de diseño

### Colores
- **Naranja principal** `#ed731f` (CTAs, marca, marcadores papelera)
- **Naranja oscuro** `#b84314` (hover, gradientes)
- **Naranja claro fondo píldora** `#fdecd6`
- **Verde madroño** `#2f7d3a` (áreas caninas)
- **Marrón tronco** `#5b3a1e` (parques, texto secundario destacado)
- **Cyan veterinario** `#0e7490`
- **Crema fondo página** `#faf7f2`
- **Negro texto** `#1a1a1a`
- **Gris medio** `#4b5563`
- **Gris suave** `#6b7280`
- **Gris muy claro borde** `#e7e5e4`
- **Negro sección oscura** `#1c1917`

### Tipografía
- Fuente: **Inter** (toda la página)
- H1 hero: **48px / 56px desktop**, 800 weight, line-height 1.05, letter-spacing -1px
- H2 secciones: **28px**, 700 weight
- H3 cards: **18px**, 600 weight
- Body: **15px**, 400 weight, line-height 1.6
- Lede párrafo: **17px**, 400 weight, color `#4b5563`
- Caption / metadata: **12px**, 500 weight, uppercase, letter-spacing 0.05em
- Tag píldora: **11px**, 700 weight, uppercase

### Componentes base
- **Esquinas**: 12px (cards), 16px (cards grandes), 20px (botones grandes), 100px (píldoras)
- **Sombras**:
  - Suave: `0 4px 12px rgba(0,0,0,0.06)`
  - Media (cards hover): `0 10px 25px rgba(0,0,0,0.10)`
  - CTA naranja: `0 12px 30px rgba(237,115,31,0.30)`
- **Espaciado vertical** entre secciones: 64px mobile, 96px desktop
- **Padding interno cards**: 20-24px
- **Botón principal**: fondo naranja `#ed731f`, texto blanco bold 15px, padding 14×24px, esquina 12px, sombra naranja
- **Botón secundario**: borde 1.5px gris `#e7e5e4`, texto `#1a1a1a`, fondo blanco

### Logo
Cuadrado redondeado naranja `#ed731f` de 40×40px (en hero, 56px). Dentro:
- Madroño centrado: copa verde `#2f7d3a` con frutos rojos `#c8252b`, tronco marrón `#5b3a1e`
- Silueta minimalista de perro negro abrazando la base del tronco
Estilo: vector geométrico, sin fotorrealismo.

## Estructura por secciones (orden vertical)

### 1. Top bar (altura 64px)
Fondo blanco translúcido con border-bottom 1px gris claro.
- Izquierda: logo 40px + "Madroño Perruno" (bold 15px) y debajo "Atlas Canino de Madrid" (12px gris)
- Derecha: pill toggle idioma con texto "EN" mono 11px uppercase, fondo blanco con borde

### 2. Hero (altura ~520px en mobile)
Fondo: gradiente vertical sutil de naranja muy claro `#fef7ee` → crema `#faf7f2` → blanco. Padding 32px arriba y abajo, contenido centrado.
- Píldora superior: fondo `#fdecd6`, texto naranja oscuro `#b84314`, "DATOS ABIERTOS · MADRID · PWA", 11px uppercase
- Título grande negro `#1a1a1a`: **Madroño Perruno** (48px, 800 weight)
- Subtítulo en naranja `#ed731f` justo debajo: **Atlas Canino de Madrid** (40px, 800 weight)
- Lede párrafo gris `#4b5563`, 17px, max-width 600px, centrado: "Reutiliza cuatro conjuntos de datos abiertos del Ayuntamiento de Madrid para resolver preguntas que ninguna app oficial responde sobre la vida con perro en la ciudad."
- Espaciado 32px
- Dos botones lado a lado:
  - Principal: fondo naranja `#ed731f`, "Abrir atlas →" texto blanco bold, padding 16×28px, sombra naranja
  - Secundario outline: "Ver código en GitHub ↗"

### 3. Hero card destacada — REPORTES COLABORATIVOS (full-width banner)
Card con gradiente diagonal de naranja `#ed731f` arriba-izquierda → naranja oscuro `#b84314` abajo-derecha. Padding 28px. Esquina 16px. Sombra suave.
- Esquina superior izquierda: cuadrado translúcido blanco/20% con icono "Users" (lucide) blanco 28px
- Junto al icono:
  - Mini badge blanco 10% opacidad: "NOVEDAD — ÚNICO SERVICIO QUE LO OFRECE", 10px bold blanco uppercase
  - Título blanco bold 22px: "Reportes en vivo de la comunidad"
  - Texto blanco 90% opacidad 15px: "La queja n.º 1: existen las papeleras pero a menudo están vacías. Aquí cualquier vecino puede reportar en un click si hay bolsas o no. Verás el último reporte y el balance de los últimos días. Sin registro, sin spam."

### 4. Sección "¿Qué encontrarás?" — 4 cards en grid 2×2
Título centrado H2: "¿Qué encontrarás?"
Cuatro cards blancas con borde 1px gris muy claro, padding 20px, esquina 16px:

**Card 1 — Mapa multi-capa**
- Cuadrado redondeado naranja `#ed731f` 44×44px con icono Map blanco
- H3: "Mapa multi-capa"
- Body 14px gris: "Más de 6.000 papeleras con dispensador de bolsas, 150 áreas caninas, 200 parques y 600 veterinarios inspeccionados en un único mapa con clustering y mapa de calor."

**Card 2 — Mi barrio canino**
- Cuadrado verde `#2f7d3a` 44×44px con icono Compass blanco
- H3: "Mi barrio canino"
- Body: "Introduce una dirección y obtén una puntuación 0-100 con la infraestructura canina disponible a 5, 10 y 15 minutos andando."

**Card 3 — Ruta bolsa-amigable**
- Cuadrado marrón `#5b3a1e` 44×44px con icono Footprints blanco
- H3: "Ruta bolsa-amigable"
- Body: "Genera un paseo en bucle por calles reales que pasa por papeleras y áreas caninas cercanas, con duración configurable."

**Card 4 — Comparativa por distrito**
- Cuadrado cyan `#0e7490` 44×44px con icono BarChart blanco
- H3: "Comparativa por distrito"
- Body: "Visualiza qué distritos lideran en cada tipo de infraestructura. Argumentos basados en datos para asociaciones vecinales y periodismo local."

### 5. Sección "Datasets utilizados"
Título H2 centrado: "Datasets utilizados"
Lede 15px gris centrado: "Datos descargados del Portal de Datos Abiertos del Ayuntamiento de Madrid y republicados como JSON limpios y versionados."

Lista de 4 items en cards horizontales blancas con borde gris claro, padding 14×16px:
1. Papeleras con dispensador de bolsas para excrementos caninos · "datos.madrid.es ↗"
2. Áreas caninas · "datos.madrid.es ↗"
3. Principales parques y jardines · "datos.madrid.es ↗"
4. Inspecciones a centros de animales de compañía · "datos.madrid.es ↗"

Cada item: nombre del dataset arriba (15px medium negro), link "datos.madrid.es ↗" debajo (12px naranja `#ed731f`).

### 6. Sección Privacidad
Card crema/beige `#f5f1ea` con borde 1px gris muy claro, padding 28px, esquina 20px. Centrado.
- Píldora superior: fondo naranja claro `#fdecd6`, "🔒 PRIVACIDAD", 11px naranja oscuro `#b84314` bold uppercase
- H2 negro 22px: "Sin servidor propio para tus datos, sin tracking"
- Body 14px gris: "Madroño Perruno no guarda ningún dato personal tuyo. No hay base de datos personal, ni cookies, ni analíticas. Tu ubicación y dirección, si las introduces, se procesan únicamente en tu navegador. Las únicas peticiones a terceros son al portal de datos.madrid.es, OpenStreetMap y OSRM."

### 7. Sección instalación PWA (oscura, full-width)
Fondo `#1c1917` (negro cálido), padding 56px arriba/abajo, texto blanco.
- H2 blanco centrado: "Instala la app en tu móvil"
- Lede `#a8a29e` 15px centrado max-width 500px: "Madroño Perruno es una PWA: puedes guardarla en la pantalla de inicio y abrirla como una app sin pasar por la tienda."
- Botón naranja con icono Download: "Instalar ahora", centrado
- Grid 3 cards oscuras (`#292524`), padding 16px, esquina 12px:
  - **Android (Chrome)** — icono Smartphone naranja claro 20px en esquina sup. izq. — H3 blanca 14px — "Pulsa el menú ⋮ y elige 'Añadir a la pantalla de inicio' o 'Instalar app'." (gris claro 13px)
  - **iPhone / iPad (Safari)** — icono Apple naranja claro — "Pulsa el icono compartir y elige 'Añadir a la pantalla de inicio'."
  - **Ordenador (Chrome / Edge)** — icono Monitor naranja claro — "Verás un icono de instalación a la derecha de la barra de direcciones. Pulsa para instalar."

### 8. CTA final
Centrado en fondo crema, padding 56px.
Botón GRANDE: fondo naranja `#ed731f`, texto blanco bold 18px, "Abrir atlas →", padding 18×36px, esquina 20px, sombra naranja generosa `0 14px 40px rgba(237,115,31,0.35)`.

### 9. Footer
Border-top 1px gris claro, fondo blanco, padding 32px, texto centrado, gris pequeño 12px:
- Línea 1: "Reutilización de datos abiertos · Ayuntamiento de Madrid"
- Línea 2: "Por **celiarozalenm** · **GitHub**" (los dos en naranja, links)

## Inspiración tonal

- **Sí**: Stripe, Linear, Vercel docs, Apple Maps, Resend — clarity + warmth + generous space
- **No**: Bootstrap genérico, plantillas SaaS recicladas, gradientes morados típicos de IA
- **Madrileñismo discreto**: el madroño solo aparece en el logo. La marca es civic-tech moderno con toque local, NO folclore.

## Notas de jerarquía visual

- La feature **Reportes en vivo** es la estrella — debe ser visualmente la más impactante después del hero (de ahí el banner gradiente).
- Las 4 features del grid son secundarias, equivalentes entre sí.
- Privacy se destaca con su propia card cálida pero no compite con la feature estrella.
- El CTA final es el segundo botón más importante después del primer "Abrir atlas".

## Lo que NO hay que hacer

- Nada de stock photos de perros: queremos vector limpio
- Nada de degradados arcoíris ni morados
- Nada de iconos infantiles o emojis grandes (los emojis pequeños en píldoras sí)
- Nada de elementos animados/3D
- Nada de hero photo de Madrid (la marca es la propia tipografía + logo)
