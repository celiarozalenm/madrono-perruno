# Madroño Perruno — Atlas Canino de Madrid

[![Demo](https://img.shields.io/badge/demo-madrono--perruno.vercel.app-ed731f?style=flat-square)](https://madrono-perruno.vercel.app)
[![Datos abiertos](https://img.shields.io/badge/datos-Madrid-ed731f?style=flat-square)](https://datos.madrid.es)
[![PWA](https://img.shields.io/badge/PWA-instalable-2a6f35?style=flat-square)](https://madrono-perruno.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-5a3f2a?style=flat-square)](LICENSE)

> **🌐 [madrono-perruno.vercel.app](https://madrono-perruno.vercel.app)** · web instalable como app, sin tienda, sin tracking

Observatorio ciudadano construido con **datos abiertos del Ayuntamiento de Madrid**: cruza papeleras con dispensador de bolsas, áreas caninas, parques, veterinarios, fuentes de agua, calidad del aire y censo canino para responder preguntas que ninguna app oficial resuelve. La diferencial: **¿la papelera más cercana tiene bolsas ahora mismo?** — solo lo saben los vecinos que pasan por ahí, así que la app les permite reportarlo en un toque, sin registro.

Proyecto presentado a los **II Premios a la Reutilización de Datos Abiertos del Ayuntamiento de Madrid 2026**, categoría *Servicios web, aplicaciones y visualizaciones*.

## Funcionalidades

- 🗺️ **Mapa interactivo** con 5 capas combinables (papeleras, áreas caninas, parques, veterinarios, calidad del aire)
- 💬 **Reportes ciudadanos en tiempo real**: cualquier vecino puede reportar en un clic si una papelera tiene bolsas, y dejar comentarios 👍/👎 en parques y áreas caninas (sin registro, anti-spam por IP)
- 🐾 **Mi barrio canino**: introduces una dirección y obtienes una puntuación 0-100 con la infraestructura canina disponible a 5/10/15 min andando, complementada con calidad del aire y tarjeta compartible para redes sociales
- 👟 **Ruta bolsa-amigable**: genera un paseo en bucle que pasa por papeleras y áreas caninas cercanas, con duración configurable. Usa OSRM para rutas reales por calle
- 📊 **Comparativa por distrito** con doble vista (mapa coropleta o tabla) y censo histórico 2014-2024
- 🌐 **Bilingüe ES/EN** (útil para visitantes con perro)
- 📱 **PWA instalable**, funciona offline tras la primera carga
- 🆓 **Open source** y **sin tracking**

## Datasets utilizados

| Dataset | Records | Origen |
|---------|--------:|--------|
| Papeleras con dispensador de bolsas para excrementos caninos | ~6.000 | [datos.madrid.es](https://datos.madrid.es) |
| Áreas caninas | ~150 | [datos.madrid.es](https://datos.madrid.es) |
| Principales parques y jardines | ~210 | [datos.madrid.es](https://datos.madrid.es) |
| Inspecciones a centros de animales de compañía (veterinarios) | ~615 | [datos.madrid.es](https://datos.madrid.es) |
| Fuentes de agua para beber | ~2.100 | [datos.madrid.es](https://datos.madrid.es) |
| Calidad del aire — datos en tiempo real | 24 estaciones | [datos.madrid.es](https://datos.madrid.es) |
| Censo de animales domésticos por distrito (2014-2024) | 21 distritos × 11 años | [datos.madrid.es](https://datos.madrid.es) |
| Estadísticas del Centro de Protección Animal | anual | [datos.madrid.es](https://datos.madrid.es) |

Los datos se descargan en CSV desde el portal y se parsean en cliente (ISO-8859-1, separador `;`). Cache 24h en localStorage para no machacar el servidor del Ayuntamiento.

## Stack técnico

- **React 19 + TypeScript** + Vite
- **MapLibre GL JS** + OpenStreetMap (sin API key)
- **Tailwind CSS** + Lucide icons
- **Recharts** para visualizaciones
- **Papa Parse** para CSVs
- **Nominatim** (OSM) para geocoding
- **OSRM** público para rutas peatonales
- **vite-plugin-pwa** + Workbox para PWA y service worker

Sin backend propio. Toda la lógica corre en el navegador del usuario.

## Desarrollo local

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # genera dist/
npm run preview
```

## Despliegue

Cualquier hosting estático sirve: Vercel, Netlify, Cloudflare Pages, GitHub Pages.

```bash
npm run build
# subir contenido de dist/
```

## Licencia

Código bajo licencia **MIT**. Datos: Ayuntamiento de Madrid (datos.madrid.es) bajo licencia abierta. Tiles: © OpenStreetMap contributors.

## Autora

[Celia Rozalén Maquedano](https://celiarozalenm.com) — Madrid, 2026.
