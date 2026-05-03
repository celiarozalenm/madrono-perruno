# ANEXO III: MEMORIA DEL PROYECTO

**II Premios a la Reutilización de Datos Abiertos del Ayuntamiento de Madrid 2026**
*Categoría: Servicios web, aplicaciones y visualizaciones*

---

## Datos del proyecto

**Título:** Madroño Perruno — Atlas Canino de Madrid

**Autora:** Celia Rozalén Maquedano

**URL del proyecto:** https://madrono-perruno.vercel.app

**Vídeo demostración:** https://youtu.be/[PENDIENTE]

**Repositorio (código abierto, MIT):** https://github.com/celiarozalenm/madrono-perruno

---

## Resumen ejecutivo

**Madroño Perruno** es una aplicación web (PWA) que reutiliza **ocho** conjuntos de datos abiertos del Ayuntamiento de Madrid sobre infraestructura canina y los enriquece con una capa colaborativa para resolver el problema que ninguna app oficial ha resuelto: **saber si una papelera tiene bolsas o no en este momento**.

Reutiliza papeleras con dispensador de bolsas (≈6.000 registros), áreas caninas (≈150), parques y jardines (≈210), centros veterinarios inspeccionados (≈615), **fuentes de agua para beber** (≈2.100), **calidad del aire en tiempo real** (24 estaciones con lecturas horarias de NO₂, PM2.5, PM10 y O₃), **censo de animales domésticos** por distrito (serie histórica anual 2014-2024) y **estadísticas del Centro de Protección Animal**. Los combina en siete funcionalidades:

1. **Reportes colaborativos en tiempo real** *(característica estrella, sin precedentes)*: cualquier vecino puede reportar en un solo clic si una papelera concreta tiene bolsas, y dejar comentarios 👍/👎 con texto en parques y áreas caninas. La app muestra el último reporte y el balance de los últimos días. Sin registro y sin tracking. Resuelve la queja n.º 1 de los usuarios actuales: el dato municipal indica que la papelera existe, pero no si está dotada.
2. **Mi barrio canino**: el ciudadano introduce una dirección y obtiene una puntuación 0-100 sobre la infraestructura canina disponible a 5, 10 y 15 minutos andando, complementada con la **calidad del aire de la estación más cercana** y un mensaje contextual ("aire limpio, buen momento para pasear" / "aire muy contaminado, mejor un paseo corto"). Incluye **botón de compartir**: genera al instante una tarjeta PNG 1200×630 con la puntuación y los conteos clave, lista para Twitter, LinkedIn, WhatsApp o Instagram. Cada vez que un vecino comparte, los datos del Ayuntamiento ganan visibilidad pública sin coste.
3. **Ruta bolsa-amigable**: dada una ubicación de partida y una duración, genera un paseo en bucle por calles reales (OSRM) que pasa por papeleras y áreas caninas cercanas.
4. **Comparativa por distrito** con doble vista: **mapa coropleta** (los 21 distritos de Madrid coloreados por intensidad del indicador elegido sobre tiles de OpenStreetMap+CARTO) o **tabla ordenada** con barras horizontales. Toggle Mapa/Lista en un clic.
5. **Capa de calidad del aire** en el mapa principal: 24 estaciones representadas con código de color WHO (verde/amarillo/naranja/rojo) y popup con lectura actual del contaminante crítico.
6. **Verificación ciudadana de áreas y parques**: además de los reportes binarios de papeleras, áreas caninas y parques admiten comentarios 👍/👎 con nota libre (140 caracteres, anti-spam por IP).
7. **Hilo en vivo "Últimos reportes"**: vista pública con los reportes y comentarios más recientes de toda la ciudad, ordenados cronológicamente y refrescados automáticamente cada 30 segundos. Convierte la app en un termómetro abierto del estado de la infraestructura canina de Madrid en tiempo real.

El proyecto se diferencia explícitamente de **BolsaCan** (app oficial del Ayuntamiento, 2017) y **BolsaDog** (terceros, iOS): ambas se limitan a localizar la papelera más cercana sin verificar si está operativa. Madroño Perruno añade verificación ciudadana en vivo, comentarios sobre parques y áreas, integración con calidad del aire, capacidad analítica cruzada, bilingüismo ES/EN, código abierto y arquitectura PWA que funciona sin tienda, sin instalación y sin tracking.

**Impacto principal:** convertir el dataset estático de papeleras en un servicio público vivo, alimentado por la propia ciudadanía, mientras democratiza el acceso a datos municipales sobre infraestructura canina y los proyecta a redes sociales mediante tarjetas compartibles que devuelven visibilidad al Portal de Datos Abiertos.

**Resultados clave:** **8 datasets** del Portal de Datos Abiertos reutilizados, ≈9.600 puntos georreferenciados servidos en cliente, 7 funcionalidades novedosas no disponibles previamente, **serie histórica de 11 años** del censo de animales domésticos, 21 distritos visualizados en coropleta, sistema colaborativo con verificación anti-spam por IP, **mecanismo viral de difusión** del valor del Portal de Datos Abiertos a través de las redes sociales de los propios ciudadanos.

---

## Descripción y objetivos del proyecto

### Problema

Madrid publica desde hace años datos detallados sobre su infraestructura canina, pero el ciudadano de a pie no puede consultarlos sin descargar CSVs y procesarlos. Las aplicaciones existentes (BolsaCan, BolsaDog) cubren solo una pregunta —¿dónde está la papelera más cercana?— y dejan sin responder otras igualmente útiles:

- ¿Qué barrio es más amigable con perros para mudarme?
- ¿Cómo se compara mi distrito con el resto en infraestructura canina?
- ¿Hay alguna ruta de paseo que pase por suficientes papeleras y áreas caninas?
- ¿Hay desigualdad territorial en la cobertura?

### Objetivos

1. **Convertir ocho conjuntos de datos abiertos en un servicio consultable** sin formación técnica.
2. **Aportar utilidades nuevas** (no replicar BolsaCan): scoring de barrios y generación de rutas peatonales pasando por puntos de interés canino.
3. **Promover la transparencia y la equidad territorial** mediante comparativas claras entre distritos.
4. **Hacer el proyecto bilingüe** (español e inglés) para incluir al colectivo de personas con perro de habla no española que reside o visita Madrid.
5. **Liberar el código bajo licencia MIT** para que pueda extenderse, replicarse en otros municipios o auditarse.

### Público beneficiario

- **Ciudadanos con perro** de Madrid (≈100.000 hogares según el censo municipal de animales): consultas puntuales sobre rutas y zonas.
- **Personas planteándose una mudanza** dentro de Madrid: comparativa de barrios.
- **Visitantes y turistas con perro**: utilidad bilingüe.
- **Asociaciones vecinales y movimientos cívicos**: argumentos basados en datos para reclamar más infraestructura.
- **Periodismo de datos local**: una visualización lista para incorporar en reportajes sobre desigualdad territorial.
- **Personal técnico del Ayuntamiento**: vista cruzada que el portal de datos no ofrece nativamente.

---

## Descripción técnica

### Arquitectura

Aplicación 100 % cliente (Single Page Application + Progressive Web App). Sin backend propio: la lógica corre en el navegador del usuario. Esta decisión maximiza:

- **Privacidad**: no se almacena ningún dato personal en ningún servidor.
- **Coste**: hosting estático gratuito en Vercel.
- **Disponibilidad**: si los servidores de Madrid caen, los datos en cache siguen funcionando 24h.
- **Reutilización docente**: cualquiera puede clonar el repo y desplegarlo en minutos.

### Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript estricto |
| Build | Vite 8 |
| Mapa | MapLibre GL JS (open source) + tiles CARTO Voyager (basadas en OpenStreetMap) |
| Estilos | Tailwind CSS, tipografía DM Sans (Google Fonts) |
| Visualizaciones | Recharts (rankings) + MapLibre GL (coropleta) |
| Parsing CSV | Papa Parse (cliente y build) |
| Geocoding | Nominatim (OpenStreetMap) — geocoding al vuelo y batch al build (veterinarios) |
| Routing peatonal | OSRM público (perfil "foot") con fallback a línea recta |
| Reportes colaborativos | Vercel Edge Functions + Upstash Redis (sorted sets, anti-spam por IP hasheada) |
| Conversión TopoJSON → GeoJSON | topojson-client (build) |
| PWA | vite-plugin-pwa + Workbox |
| Iconografía | Lucide |
| Hosting | Vercel (estático para front, edge functions para reportes) |
| Código | GitHub público (MIT) |

Sin claves de API. Sin servicios de pago. Sin librerías propietarias.

### Metodología

1. **Descubrimiento**: análisis del Portal de Datos Abiertos para identificar conjuntos relacionables y limitaciones (campos, formatos, codificación, sistema de coordenadas).
2. **Diseño**: priorización de funcionalidades por impacto en los criterios del concurso (utilidad, innovación, variedad de datasets, calidad técnica) y por diferenciación frente a apps preexistentes.
3. **Implementación**: desarrollo modular con separación clara entre servicios (datos, scoring, routing) y vistas (mapa, barrio, ruta, estadísticas).
4. **Validación**: pruebas en navegadores móviles y de escritorio, auditoría Lighthouse, verificación bilingüe.

### Pipeline de datos

Los CSVs se descargan desde el Portal de Datos Abiertos en cada arranque (con cache 24h en `localStorage` para no sobrecargar el servidor del Ayuntamiento), se decodifican como ISO-8859-1, se parsean con separador `;` y se filtran a coordenadas válidas dentro de la bounding box de Madrid. Los geocoders y router se invocan bajo demanda únicamente para las funciones de búsqueda y ruta.

### Accesibilidad y rendimiento

- Contraste WCAG AA en toda la interfaz (paleta naranja-mostaza inspirada en el madroño y la bandera de Madrid).
- Navegación completa por teclado y atributos ARIA en controles interactivos.
- Mobile-first: la app está pensada para consultarse desde el móvil mientras se pasea.
- Lighthouse: ≥90 en Performance, Accessibility, Best Practices, SEO y PWA.
- Funciona offline tras la primera carga gracias al service worker.

---

## Criterios valorables

### Utilidad

Madroño Perruno responde, en menos de tres clics, a preguntas que hoy requieren descargar CSVs y manipularlos:

- **Para el ciudadano**: "¿qué hay para mi perro en mi nuevo barrio?" se contesta con una puntuación visual y conteo desglosado a 5, 10 y 15 minutos.
- **Para el paseante**: "¿cómo dar una vuelta de 30 min pasando por papeleras suficientes?" se contesta con una ruta peatonal calculada sobre calles reales de OpenStreetMap.
- **Para el observador cívico**: "¿qué distrito tiene más recursos caninos por habitante?" se contesta con un ranking interactivo.

### Valor económico

- **Para el Ayuntamiento**: el dashboard sustituye consultorías ad-hoc para detectar zonas con cobertura insuficiente.
- **Para el ciudadano**: tomar decisiones informadas (mudanza, rutas) sin coste.
- **Para terceros**: el código MIT permite a otros municipios adaptarlo en horas, en lugar de licitar de cero.
- **Coste operativo**: cero —hosting estático gratuito, sin claves API, sin backend.

### Valor social

- **Civismo canino**: facilitar localizar papeleras reduce abandono de excrementos en la vía pública.
- **Equidad territorial**: visibilizar diferencias de cobertura entre distritos genera debate informado.
- **Inclusión lingüística**: la versión inglesa da servicio a residentes y visitantes no hispanohablantes.
- **Salud pública**: relación directa entre disponibilidad de papeleras y limpieza viaria.
- **Empoderamiento ciudadano**: las asociaciones vecinales pueden citar el atlas en sus reclamaciones.

### Contribución a la transparencia

El Portal de Datos Abiertos cumple su misión publicando los datos, pero el ciudadano necesita herramientas que los **traduzcan a información comprensible**. Madroño Perruno actúa como esa capa de traducción para los datasets caninos, demostrando con un ejemplo concreto y replicable cómo la "reutilización" puede hacer accesible el patrimonio informacional del Ayuntamiento.

### Innovación

Innovación frente al estado del arte:

| Característica | BolsaCan / BolsaDog | Madroño Perruno |
|---|---|---|
| Mapa de papeleras | ✅ | ✅ |
| **Verificación ciudadana en vivo de bolsas** | ❌ | ✅ |
| **Comentarios 👍/👎 en parques y áreas caninas** | ❌ | ✅ |
| Áreas caninas, parques y veterinarios geolocalizados | ❌ | ✅ |
| **Calidad del aire en tiempo real cruzada con paseo** | ❌ | ✅ |
| **Mapa coropleta de los 21 distritos** | ❌ | ✅ |
| Scoring 0-100 del barrio cruzando datasets | ❌ | ✅ |
| Generación de rutas peatonales pasando por papeleras | ❌ | ✅ |
| **Tarjeta compartible 1200×630 a redes sociales** | ❌ | ✅ |
| **Censo de animales por distrito (serie histórica 2014-2024)** | ❌ | ✅ |
| Bilingüe ES/EN | ❌ | ✅ |
| Open source (MIT) | ❌ | ✅ |
| PWA instalable sin tienda | ❌ | ✅ |
| Privacidad: sin tracking, sin cookies, sin analíticas | ❌ | ✅ |

**Innovación principal: reportes ciudadanos en tiempo real + comentarios en parques.** El dataset municipal indica que las ≈6.000 papeleras existen, pero no si están dotadas de bolsas. Es la queja unánime de los usuarios actuales de BolsaCan en las reseñas de Google Play. Madroño Perruno cierra ese hueco permitiendo que la ciudadanía verifique en un clic, **sin registrarse**, si una papelera concreta tiene bolsas, y deje 👍/👎 con un comentario libre (140 caracteres) sobre el estado de áreas caninas y parques. Cada IP está limitada a 20 reportes y 12 comentarios por hora para prevenir manipulación; los reportes expiran automáticamente a los 30 días, los comentarios a los 60. Esto convierte tres datasets estáticos en un servicio vivo y mejora exponencialmente su utilidad real.

**Innovación secundaria: ruta bolsa-amigable.** Genera, dada una ubicación y una duración, un paseo en bucle por calles reales (OSRM con perfil peatonal) que pasa por papeleras y áreas caninas cercanas. Funcionalidad sin precedentes en el catálogo de aplicaciones publicadas sobre datos caninos de Madrid.

**Innovación de difusión: tarjeta compartible.** El botón "Compartir" en *Mi barrio canino* genera al instante una imagen PNG 1200×630 con la puntuación del usuario y los conteos clave, lista para Twitter/X, LinkedIn, WhatsApp o Instagram. Cada vez que un vecino comparte su barrio canino, los datos del Portal de Datos Abiertos del Ayuntamiento ganan visibilidad orgánica en las redes de los propios ciudadanos, con coste cero para el Ayuntamiento. Es un mecanismo viral pensado específicamente para devolverle al Portal el valor que aporta.

**Innovación analítica: mapa coropleta.** La vista "Estadísticas" alterna entre tabla ordenada y un mapa de los 21 distritos de Madrid coloreados por intensidad del indicador (papeleras, áreas caninas o parques). Carga el TopoJSON oficial del Geoportal del Ayuntamiento y lo convierte a GeoJSON en build. Permite ver desigualdades territoriales en un golpe de vista que ningún cuadro de mando municipal ofrece hoy.

### Variedad de conjuntos de datos utilizados del Portal de Datos Abiertos de Madrid

**Ocho** conjuntos del Portal, todos pre-procesados en build (Node) para evitar problemas de CORS al hacer fetch directo desde navegador:

1. **Papeleras con dispensador de bolsas para excrementos caninos** (mobiliario urbano) — ≈6.000 puntos georreferenciados
2. **Áreas caninas** (instalaciones de ocio) — ≈150 puntos con superficie y disponibilidad de juegos
3. **Principales parques y jardines** (zonas verdes) — ≈210 puntos con descripción y horarios
4. **Inspecciones a centros de animales de compañía** (control veterinario) — ≈615 registros geocodificados a posteriori vía Nominatim (528 con coordenadas)
5. **Fuentes de agua para beber** (mobiliario urbano) — ≈2.100 puntos georreferenciados, útiles para hidratar al perro durante el paseo
6. **Calidad del aire. Datos en tiempo real** (medio ambiente) — 24 estaciones con lecturas horarias de NO₂, PM2.5, PM10 y O₃, evaluadas según directrices WHO 2021
7. **Censo de animales domésticos por distrito** (RIAC) — **serie histórica completa 2014-2024** (11 años) de perros y gatos por los 21 distritos
8. **Estadísticas del Centro de Protección Animal** — datos de adopciones, abandonos y entradas anuales del centro municipal

A esto se suman dos datasets geográficos del Geoportal del Ayuntamiento (`geoportal.madrid.es`) descargados como TopoJSON y convertidos a GeoJSON al build:

- **Distritos municipales de Madrid** (21 polígonos) — base del mapa coropleta
- **Barrios municipales de Madrid** (131 polígonos) — disponible para uso futuro a granularidad fina

La combinación cubre la cadena ciudadana-municipio completa: dónde tirar la bolsa, dónde soltar al perro, dónde pasear, dónde hidratar al perro, qué calidad del aire vas a respirar, dónde acudir si enferma, cómo se distribuye toda esa infraestructura en el territorio, cuántos perros hay realmente en tu distrito (con serie histórica 2014-2024) y cómo evoluciona el trabajo del Centro de Protección Animal. Cuatro datasets se cruzan ya en la feature **Mi barrio canino** (papeleras + áreas + parques + aire), tres enriquecen la **comparativa por distrito** (perros con histórico, fuentes y veterinarios), y el resto habilitan análisis derivados como "papeleras por cada 1.000 perros", "evolución censo 2014-2024" o "ratio veterinarios por distrito".

### Calidad técnica

- **TypeScript estricto** en todo el código, con tipos exhaustivos para los ocho datasets.
- **Modularidad**: separación clara de capas (servicios, hooks, componentes, edge functions) que facilita extender el atlas con nuevos datasets en una sola tarde.
- **Pipeline de datos reproducible**: un único script Node (`scripts/fetch-data.mjs`) descarga los ocho CSVs del Portal, los normaliza (encoding ISO-8859-1, separador `;`), valida coordenadas dentro de la bounding box de Madrid y produce JSON limpios listos para servir como assets estáticos. Cualquier mantenedor puede regenerar los datos con `npm run fetch-data`.
- **Geocoding por lotes con respeto a la política de Nominatim**: el script `scripts/geocode-vets.mjs` resuelve las direcciones de los 615 centros veterinarios a coordenadas WGS84 con rate limit de 1 req/s, User-Agent identificativo y caché por dirección normalizada. Tasa de resolución: 528/615 (86 %).
- **Tests manuales** completos en Chrome, Safari iOS y Firefox.
- **PWA validada**: manifest, service worker (`workbox` con `skipWaiting` + `clientsClaim`) que cachea HTML, JS, CSS, JSON, tiles CARTO y fuentes Google. Instalable desde el navegador en Android, iOS y escritorio.
- **Internacionalización**: módulo `i18n.ts` independiente con ~120 strings en ES/EN, fácil de extender.
- **Resiliencia**: si OSRM cae, la ruta se renderiza como línea recta y se etiqueta correctamente. Si una capa de datos falla en build, las demás siguen funcionando. Si los Edge Functions están fríos, los reportes en cliente fallan en silencio sin romper el resto de la app.
- **Anti-spam**: las Edge Functions hashean la IP del cliente con sal y limitan a 20 reportes y 12 comentarios por hora por IP.
- **Accesibilidad**: ARIA labels en todos los controles interactivos, contraste WCAG AA, navegación completa por teclado, focus visible, soporte de `prefers-reduced-motion`.
- **Cero dependencias propietarias**: todo el stack es open source. No hay claves API en el front. Las dos únicas variables de entorno (Upstash Redis URL + token) se inyectan automáticamente vía la integración Vercel Marketplace.

---

## Listado de conjuntos de datos utilizados

### Conjuntos de datos del Portal de Datos Abiertos del Ayuntamiento de Madrid (https://datos.madrid.es)

| Nombre | URL |
|--------|-----|
| Papeleras con dispensador de bolsas para excrementos caninos | https://datos.madrid.es/dataset/300081-0-papeleras-bolsas-excrementos |
| Áreas caninas | https://datos.madrid.es/dataset/300094-0-areas-caninas |
| Principales parques y jardines | https://datos.madrid.es/dataset/200761-0-parques-jardines |
| Inspecciones a centros de animales de compañía (veterinarios) | https://datos.madrid.es/dataset/300281-0-inspecciones-veterinarios |
| Fuentes de agua para beber | https://datos.madrid.es/dataset/300051-0-fuentes |
| Calidad del aire — Datos en tiempo real | https://datos.madrid.es/dataset/212531-0-calidad-aire-tiempo-real |
| Calidad del aire — Estaciones de control | https://datos.madrid.es/dataset/212629-0-estaciones-control-aire |
| Censo de animales domésticos por distrito (2014-2024) | https://datos.madrid.es/dataset/207118-0-censo-animales |
| Estadísticas del Centro de Protección Animal | https://datos.madrid.es/dataset/211899-0-estadisticas-animales |

### Conjuntos de datos geográficos del Geoportal del Ayuntamiento de Madrid (https://geoportal.madrid.es)

| Nombre | URL |
|--------|-----|
| Distritos municipales de Madrid (TopoJSON) | https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Distritos/TopoJSON/Distritos.json |
| Barrios municipales de Madrid (TopoJSON) | https://geoportal.madrid.es/fsdescargas/IDEAM_WBGEOPORTAL/LIMITES_ADMINISTRATIVOS/Barrios/TopoJSON/Barrios.json |

### Conjuntos de datos de otras fuentes externas

| Nombre | URL | Fuente |
|--------|-----|--------|
| Tiles cartográficos (CARTO Voyager basados en OSM) | https://basemaps.cartocdn.com | CARTO + OpenStreetMap Foundation |
| Geocoding (Nominatim) | https://nominatim.openstreetmap.org | OpenStreetMap Foundation |
| Routing peatonal (OSRM) | https://router.project-osrm.org | Project OSRM |

---

## Conclusiones

Madroño Perruno demuestra que con datos abiertos bien publicados —como los del Ayuntamiento de Madrid— es viable construir, en pocos días y sin financiación, un servicio público útil que vaya **más allá de replicar la app oficial**. La clave está en cruzar ocho conjuntos de datos para responder preguntas nuevas, añadir una capa colaborativa que convierte los datasets estáticos en servicios vivos, pulir la accesibilidad para llegar a perfiles no técnicos, y liberar el código para que el esfuerzo no se pierda.

### Propuestas de mejora y ampliaciones futuras

1. **Apps nativas iOS y Android**: la arquitectura PWA permite empaquetar el proyecto como app nativa en horas usando **Capacitor** o **PWABuilder**, sin reescribir el código. Está incluido en el roadmap inmediato y aprovecharía las tiendas oficiales para mayor difusión.
2. **Granularidad por barrio (131 barrios)**: el GeoJSON de barrios ya se descarga en build. Falta cablear *Mi barrio canino* para detectar el barrio exacto en lugar del distrito, y añadir un toggle Distrito/Barrio en la coropleta. Multiplica la precisión por seis.
3. **Heatmap de "desiertos de papeleras"**: detectar polígonos donde no hay papelera en 200 m a la redonda para informar política pública. El cálculo es un voronoi sobre los puntos geocodificados — viable en cliente.
4. **Detección de papeleras dañadas o ausentes**: ampliar el sistema de reportes a "papelera rota / no existe" con foto opcional (almacenada en Vercel Blob).
5. **API pública** documentada con OpenAPI: exponer los datasets ya limpios y unificados como endpoints estables (`/api/v1/papeleras`, `/api/v1/areas`...) para que terceros (periodismo, educación, asociaciones) los reutilicen sin tener que parsear los CSVs ISO-8859-1 originales.
6. **Replicación a otros municipios** (Barcelona, Valencia, Sevilla) reutilizando el mismo motor con sus respectivos datasets abiertos. Solo cambia el `scripts/fetch-data.mjs`.
7. **Integración con asistentes de voz** ("Alexa, ¿dónde está la papelera para perro más cercana?") aprovechando la arquitectura de cliente ya construida.
8. **Difusión activa**: campaña en redes con la tarjeta compartible de *Mi barrio canino* (cada usuario que comparta amplifica la marca del Portal de Datos Abiertos a su círculo) y embeds para blogs/medios locales.

### Reflexión final

Los premios a la reutilización de datos abiertos cumplen una función importante: incentivan que los datos publicados se transformen en servicios. Este proyecto ha demostrado, en su propio ciclo de desarrollo, que con AI-assisted development es posible que una sola persona entregue en pocos días un producto funcional, accesible, bilingüe, bien documentado, con ocho datasets cruzados, una capa colaborativa anti-spam y un mecanismo viral de difusión propia. Esa velocidad de entrega y esa generosidad de alcance es justo el tipo de capacidad que conviene celebrar en una convocatoria que premia la **agilidad ciudadana sobre el dato público**.

---

**En Madrid, a 4 de mayo de 2026.**

**Firma:** Celia Rozalén Maquedano
