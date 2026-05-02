# Pendiente — Madroño Perruno → II Premios Reutilización Datos Abiertos Madrid 2026

**Deadline:** 4 mayo 2026, 23:59 (telemático en sede.madrid.es)

---

## 🟢 HECHO

- [x] App desplegada en https://madrono-perruno.vercel.app
- [x] Repo público https://github.com/celiarozalenm/madrono-perruno
- [x] Landing page con hero, features, datasets, instrucciones PWA
- [x] Mapa interactivo (papeleras, áreas caninas, parques)
- [x] Mi barrio canino (scoring 0-100 con dirección o geolocalización)
- [x] Ruta bolsa-amigable con OSRM
- [x] Comparativa por distrito con gráficos
- [x] PWA instalable + service worker offline
- [x] Bilingüe ES/EN (defecto español)
- [x] Datos pre-fetched en build (CORS resuelto)
- [x] Reportes colaborativos (Vercel Edge Function + Upstash Redis) — feature estrella
- [x] Geocoding de 528/615 veterinarios (86%)
- [x] Sección de privacidad explícita "no guardamos datos"

---

## 🟡 EN PROCESO

- [ ] **Capa de veterinarios en el mapa** — geocoding terminado, falta:
  - Code: añadir layer en Map.tsx
  - LayerToggle: habilitar el toggle de vets
  - Test
  - Deploy

---

## 🔴 PENDIENTE CRÍTICO

### 1. Memoria del proyecto (Anexo III)
- Ubicación borrador: `concurso/Anexo_III_Memoria.md`
- Limita: **máximo 10 páginas, fuente Lato 11, interlineado sencillo, A4 una cara**
- TODO:
  - [ ] Convertir Markdown a Word/Pages
  - [ ] Aplicar fuente Lato 11
  - [ ] Verificar que no excede 10 páginas
  - [ ] Insertar URL del vídeo demo (cuando esté grabado)
  - [ ] Exportar a PDF firmado electrónicamente

### 2. Vídeo demo (60-90 segundos)
- Sube a YouTube como **unlisted**
- Pega URL en la memoria (campo "Vídeo (opcional)")
- Guion sugerido:
  - 0-10s: Mostrar landing → "Madroño Perruno, atlas canino de Madrid construido con datos abiertos"
  - 10-25s: Click en "Abrir atlas" → mapa con 3 capas → toggle layers
  - 25-45s: Click en una papelera → mostrar **reportes en vivo + voto** (este es EL momento clave)
  - 45-60s: "Mi barrio canino" → introducir dirección → scoring
  - 60-75s: "Ruta bolsa-amigable" → generar paseo
  - 75-90s: Comparativa distritos + GitHub + cierre
- Herramientas: Loom o grabador de pantalla nativo Mac (Cmd+Shift+5)

### 3. Documentos sede.madrid.es
- Necesitas: certificado digital o Cl@ve
- URL: https://sede.madrid.es/portal/site/tramites/menuitem.62876cb64654a55e2dbd7003a8a409a0/?vgnextoid=4c0731b003027910VgnVCM1000001d4a900aRCRD
- TODO:
  - [ ] Localizar y descargar **formulario principal de solicitud** (no es ninguno de los Anexos I/II)
  - [ ] Localizar y descargar **declaración responsable individual** (los Anexos I/II que tenías son para AGRUPACIONES, no aplican porque te presentas sola)
  - [ ] Rellenar formulario principal con datos personales + datos del proyecto + URL despliegue + URL repo + URL vídeo
  - [ ] Rellenar declaración responsable
  - [ ] Firmar electrónicamente cada documento (certificado digital)

### 4. Presentación telemática
- Plataforma: https://sede.madrid.es
- Documentos a subir:
  1. Formulario principal firmado
  2. Declaración responsable individual firmada
  3. Anexo III: Memoria del proyecto firmada (PDF)
- Plazo: hasta 4 mayo 2026, 23:59
- Recomendación: **NO esperar al último día**. Las sedes electrónicas suelen colapsar las últimas horas.

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

- [ ] Diseñar mejora de landing en Pencil
- [ ] Comprar dominio propio (madroñoperruno.com o subdominio celiarozalenm.com)
- [ ] Lighthouse audit y screenshot para incluir en memoria
- [ ] Compartir en redes (LinkedIn, Twitter) tras presentar
