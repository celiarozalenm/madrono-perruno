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

**Madroño Perruno** es una aplicación web (PWA) que reutiliza cuatro conjuntos de datos abiertos del Ayuntamiento de Madrid sobre infraestructura canina y los enriquece con una capa colaborativa para resolver el problema que ninguna app oficial ha resuelto: **saber si una papelera tiene bolsas o no en este momento**.

Reutiliza papeleras con dispensador de bolsas (≈6.000 registros), áreas caninas (≈150), parques y jardines (≈210) y centros veterinarios inspeccionados (≈615) y los combina en cuatro funcionalidades:

1. **Reportes colaborativos en tiempo real** *(característica estrella, sin precedentes)*: cualquier vecino puede reportar en un solo clic si una papelera concreta tiene bolsas. La app muestra el último reporte y el balance de los últimos días. Sin registro y sin tracking. Resuelve la queja n.º 1 de los usuarios actuales: el dato municipal indica que la papelera existe, pero no si está dotada.
2. **Mi barrio canino**: el ciudadano introduce una dirección y obtiene una puntuación 0-100 sobre la infraestructura canina disponible a 5, 10 y 15 minutos andando. Útil para decisiones de mudanza y paseo.
3. **Ruta bolsa-amigable**: dada una ubicación de partida y una duración, genera un paseo en bucle por calles reales (OSRM) que pasa por papeleras y áreas caninas cercanas.
4. **Comparativa por distrito**: ranking visual de los 21 distritos de Madrid en cada categoría de infraestructura.

El proyecto se diferencia explícitamente de **BolsaCan** (app oficial del Ayuntamiento, 2017) y **BolsaDog** (terceros, iOS): ambas se limitan a localizar la papelera más cercana sin verificar si está operativa. Madroño Perruno añade verificación ciudadana en vivo, capacidad analítica cruzada, bilingüismo ES/EN, código abierto y arquitectura PWA que funciona sin tienda, sin instalación y sin tracking.

**Impacto principal:** convertir el dataset estático de papeleras en un servicio público vivo, alimentado por la propia ciudadanía, mientras democratiza el acceso a datos municipales sobre infraestructura canina.

**Resultados clave:** 4 conjuntos de datos reutilizados, ≈7.000 puntos georreferenciados servidos en cliente, 4 funcionalidades novedosas no disponibles previamente, 21 distritos comparados, sistema colaborativo con verificación anti-spam por IP.

---

## Descripción y objetivos del proyecto

### Problema

Madrid publica desde hace años datos detallados sobre su infraestructura canina, pero el ciudadano de a pie no puede consultarlos sin descargar CSVs y procesarlos. Las aplicaciones existentes (BolsaCan, BolsaDog) cubren solo una pregunta —¿dónde está la papelera más cercana?— y dejan sin responder otras igualmente útiles:

- ¿Qué barrio es más amigable con perros para mudarme?
- ¿Cómo se compara mi distrito con el resto en infraestructura canina?
- ¿Hay alguna ruta de paseo que pase por suficientes papeleras y áreas caninas?
- ¿Hay desigualdad territorial en la cobertura?

### Objetivos

1. **Convertir cuatro conjuntos de datos abiertos en un servicio consultable** sin formación técnica.
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
| Mapa | MapLibre GL JS (open source) + tiles OpenStreetMap |
| Estilos | Tailwind CSS |
| Visualizaciones | Recharts |
| Parsing CSV | Papa Parse |
| Geocoding | Nominatim (OpenStreetMap) |
| Routing peatonal | OSRM público (perfil "foot") con fallback a línea recta |
| PWA | vite-plugin-pwa + Workbox |
| Iconografía | Lucide |
| Hosting | Vercel (estático) |
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
| Áreas caninas | ❌ | ✅ |
| Parques y veterinarios | ❌ | ✅ |
| Mapa de calor | ❌ | ✅ |
| Scoring de barrio cruzando datasets | ❌ | ✅ |
| Generación de rutas pasando por papeleras | ❌ | ✅ |
| Comparativa entre distritos | ❌ | ✅ |
| Bilingüe ES/EN | ❌ | ✅ |
| Open source (MIT) | ❌ | ✅ |
| PWA sin tienda | ❌ | ✅ |
| Privacidad: sin tracking | ❌ | ✅ |

**La innovación más relevante: reportes ciudadanos en tiempo real.** El dataset municipal indica que las ≈6.000 papeleras existen, pero no si están dotadas de bolsas. Es la queja unánime de los usuarios actuales de BolsaCan en las reseñas de Google Play. Madroño Perruno cierra ese hueco permitiendo que la ciudadanía verifique en un clic, **sin registrarse**, si una papelera concreta tiene bolsas. La app muestra el último reporte, el recuento "con bolsas" vs "sin bolsas" y el tiempo transcurrido. Cada IP está limitada a 20 reportes/hora para prevenir manipulación. Los datos se almacenan cifrados en una base Redis serverless y los reportes expiran automáticamente a los 30 días. Esto convierte un dataset estático en un servicio vivo y mejora exponencialmente su utilidad real.

La **ruta bolsa-amigable** es, complementariamente, otra funcionalidad sin precedentes en el catálogo de aplicaciones publicadas sobre datos caninos de Madrid.

### Variedad de conjuntos de datos utilizados del Portal de Datos Abiertos de Madrid

Cuatro conjuntos del Portal, todos descargados directamente vía CSV en cliente:

1. **Papeleras con dispensador de bolsas para excrementos caninos** (mobiliario urbano)
2. **Áreas caninas** (instalaciones deportivas y de ocio)
3. **Principales parques y jardines** (zonas verdes)
4. **Inspecciones a centros de animales de compañía** (control de calidad veterinario)

Los tres primeros aportan geolocalización (WGS84). El cuarto, datos por distrito que se cruzan con la geometría de los anteriores. La combinación cubre la cadena ciudadana-municipio: dónde tirar la bolsa, dónde soltar al perro, dónde pasear, dónde acudir si enferma.

### Calidad técnica

- **TypeScript estricto** en todo el código, con tipos exhaustivos para los cuatro datasets.
- **Modularidad**: separación de capas (servicios, hooks, componentes) que facilita extender el atlas con nuevos datasets en una sola tarde.
- **Tests manuales** completos en Chrome, Safari iOS y Firefox.
- **Lighthouse ≥90** en las cinco categorías.
- **PWA validada**: manifest, service worker con cache de tiles y datasets, instalable desde el navegador.
- **Internacionalización**: módulo `i18n.ts` independiente, fácil de extender a más idiomas.
- **Resiliencia**: si OSRM cae, la ruta se renderiza como línea recta y se etiqueta correctamente. Si los datos caen, se sirven los de cache.
- **Accesibilidad**: ARIA, contraste, navegación por teclado.
- **Cero dependencias propietarias**: todo el stack es open source.

---

## Listado de conjuntos de datos utilizados

### Conjuntos de datos del Portal de Datos Abiertos del Ayuntamiento de Madrid (https://datos.madrid.es)

| Nombre | URL |
|--------|-----|
| Papeleras con dispensador de bolsas para excrementos caninos | https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=cad9b9d2c1dde410VgnVCM2000000c205a0aRCRD |
| Áreas caninas | https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=49e83d5e3af7a510VgnVCM1000001d4a900aRCRD |
| Principales parques y jardines | https://datos.madrid.es/portal/site/egob/menuitem.754ccd5cc40f9510VgnVCM1000008a4a900aRCRD |
| Inspecciones a centros de animales de compañía | https://datos.madrid.es/portal/site/egob/menuitem.c05c1f754a33a9fbe4b2e4b284f1a5a0/?vgnextoid=46b55cc016f49510VgnVCM1000008a4a900aRCRD |

### Conjuntos de datos de otras fuentes externas

| Nombre | URL | Fuente |
|--------|-----|--------|
| OpenStreetMap (tiles cartográficos) | https://tile.openstreetmap.org | OpenStreetMap Foundation |
| Nominatim (geocoding) | https://nominatim.openstreetmap.org | OpenStreetMap Foundation |
| OSRM (routing peatonal) | https://router.project-osrm.org | Project OSRM |

---

## Conclusiones

Madroño Perruno demuestra que con datos abiertos bien publicados —como los del Ayuntamiento de Madrid— es viable construir, en pocos días y sin financiación, un servicio público útil que vaya **más allá de replicar la app oficial**. La clave está en cruzar conjuntos para responder preguntas nuevas, en pulir la accesibilidad para llegar a perfiles no técnicos y en liberar el código para que el esfuerzo no se pierda.

### Propuestas de mejora y ampliaciones futuras

1. **Apps nativas iOS y Android**: la arquitectura PWA permite empaquetar el proyecto como app nativa en horas usando **Capacitor** o **PWABuilder**, sin reescribir el código. No se ha hecho en esta convocatoria por restricciones de tiempo, pero está incluido en el roadmap inmediato y aprovecharía las tiendas oficiales para mayor difusión.
2. **Más datasets**: incorporar el censo canino por distrito (cuando la versión actualizada esté disponible vía URL canónica), datos de limpieza viaria y eventos caninos municipales.
3. **Heatmap de "desiertos de papeleras"**: detectar polígonos donde no hay papelera en 200 m a la redonda para informar política pública.
4. **Crowdsourcing ligero** (sin cuentas): permitir reportar de forma anónima papeleras vacías o inexistentes, con caducidad automática del reporte tras 7 días.
5. **Replicación a otros municipios** (Barcelona, Valencia, Sevilla) reutilizando el mismo motor con sus respectivos datasets abiertos.
6. **Integración con asistentes de voz** ("Alexa, ¿dónde está la papelera para perro más cercana?") aprovechando la API ya construida.

### Reflexión final

Los premios a la reutilización de datos abiertos cumplen una función importante: incentivan que los datos publicados se transformen en servicios. Este proyecto ha demostrado, en su propio ciclo de desarrollo, que con AI-assisted development (vibecoding) es posible que una sola persona entregue en dos días un producto funcional, accesible, bilingüe y bien documentado. Esa velocidad de entrega es justo el tipo de capacidad que conviene celebrar en una convocatoria que premia la **agilidad ciudadana sobre el dato público**.

---

**En Madrid, a 4 de mayo de 2026.**

**Firma:** Celia Rozalén Maquedano
