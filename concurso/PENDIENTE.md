# Pendiente — Madroño Perruno → II Premios Reutilización Datos Abiertos Madrid 2026

**Deadline:** 4 mayo 2026, 23:59 (telemático en sede.madrid.es)
**Recomendado enviar:** antes de las 18:00 del 4 mayo para evitar caídas de la sede

---

## 🟢 HECHO

- [x] App desplegada en https://madrono-perruno.vercel.app
- [x] Repo público https://github.com/celiarozalenm/madrono-perruno
- [x] Landing page con hero, features, datasets, instrucciones PWA
- [x] Mapa interactivo (papeleras, áreas caninas, parques, veterinarios, calidad del aire)
- [x] Mi barrio canino (scoring 0-100 con dirección o geolocalización)
- [x] Ruta bolsa-amigable con OSRM
- [x] Comparativa por distrito con doble vista (coropleta + tabla)
- [x] Censo histórico 2014-2024 con selector de año
- [x] PWA instalable + service worker offline
- [x] Bilingüe ES/EN (defecto español)
- [x] Datos pre-fetched en build (CORS resuelto)
- [x] Reportes colaborativos (Vercel Edge Function + Upstash Redis) — feature estrella
- [x] Geocoding de 528/615 veterinarios (86%)
- [x] Sección de privacidad explícita "no guardamos datos"
- [x] Memoria (Anexo III) en `concurso/Anexo_III_Memoria.md` — corregida
- [x] README del repo alineado con la app actual

---

## 🔴 PENDIENTE CRÍTICO

### 1. Vídeo demo (hasta 3 min — guion en `concurso/VIDEO_GUION.md`)
- Sube a YouTube como **unlisted**
- Pega URL en la memoria (línea 16, sustituye `[PENDIENTE]`)
- Herramientas: Loom o grabador de pantalla nativo Mac (Cmd+Shift+5)

### 2. Memoria a PDF
- Convertir `Anexo_III_Memoria.md` a PDF
  - Fuente: **Lato 11** (Helvetica/Arial son equivalentes aceptados)
  - Interlineado sencillo
  - A4, una cara
  - Máximo **10 páginas**
- Insertar URL del vídeo en línea 16 antes de exportar
- Si pasa de 10 págs, recortar primero "Propuestas de mejora y ampliaciones futuras"

### 3. Solicitud de participación (formulario oficial)
- Descargar **únicamente** el "Solicitud de participación en los premios a la reutilización de datos abiertos del Ayuntamiento de Madrid" desde https://sede.madrid.es
- ⚠️ NO descargar Anexo I ni Anexo II — son solo para AGRUPACIONES, te presentas sola
- Las declaraciones responsables (b-g del apartado 8) ya van **dentro de la solicitud**
- Rellenar con:
  - Datos personales
  - Título del proyecto: "Madroño Perruno — Atlas Canino de Madrid"
  - Categoría: Servicios web, aplicaciones y visualizaciones
  - URL despliegue: https://madrono-perruno.vercel.app
  - URL repo: https://github.com/celiarozalenm/madrono-perruno
  - URL vídeo: (la de YouTube unlisted)
- Marcar la casilla de **autorización de consulta de datos** (AEAT, TGSS, ATM) — te ahorra adjuntar certificados
- Firmar electrónicamente con certificado digital o Cl@ve

### 4. Presentación telemática
- Plataforma: https://sede.madrid.es
- Documentos a subir:
  1. **Solicitud de participación** firmada (PDF)
  2. **Anexo III: Memoria del proyecto** firmada (PDF)
- Plazo: hasta 4 mayo 2026, 23:59
- Recomendación: **enviar antes de las 18:00** del día 4. Las sedes electrónicas suelen colapsar las últimas horas.

---

## ⚠️ REQUISITOS ADMINISTRATIVOS (apartado 7 de las bases)

Antes de presentar, asegúrate de estar al corriente con:
- [ ] Hacienda (AEAT)
- [ ] Seguridad Social (autónomos)
- [ ] Agencia Tributaria del Ayuntamiento de Madrid (IBI, basuras…)
- [ ] Sin reintegros pendientes de subvenciones

Si autorizas la consulta en la solicitud, el órgano instructor lo verifica de oficio. Si no, hay que adjuntar certificados vigentes.

---

## 📦 RECURSOS

- **Web**: https://madrono-perruno.vercel.app
- **Repo**: https://github.com/celiarozalenm/madrono-perruno
- **Vercel dashboard**: https://vercel.com/celiarozalenms-projects/madrono-perruno
- **Upstash (reportes)**: integrado vía Vercel Marketplace (env vars KV_*)
- **Bases del concurso**: https://datos.madrid.es/pages/premios-de-reutilizacion-2026
- **Sede electrónica**: https://sede.madrid.es

---

## 💡 OPCIONAL (si sobra tiempo)

- [ ] Comprar dominio propio (madroñoperruno.com o subdominio celiarozalenm.com)
- [ ] Lighthouse audit y screenshot para incluir en memoria
- [ ] Compartir en redes (LinkedIn, Twitter) tras presentar
