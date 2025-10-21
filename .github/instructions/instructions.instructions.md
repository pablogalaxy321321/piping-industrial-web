---
applyTo: '# Instrucciones del Proyecto: Sitio Web de Piping Industrial

## 1. Contexto del Proyecto

Estoy construyendo un sitio web de alta gama para una empresa chilena de ingeniería y fabricación de piping para la minería. El objetivo principal es mostrar precisión técnica y una imagen de vanguardia.

## 2. Guía de Estilo Visual (¡Muy Importante!)

El diseño está fuertemente inspirado en `terminal-industries.com`.

* **Estética General:** Modo oscuro (Dark Mode), futurista, profesional y minimalista.
* **Paleta de Colores:**
    * **Fondo Principal:** Negro (`#000000` o `#050505`).
    * **Texto Principal:** Gris claro (`#E5E7EB` o `#F3F4F6`).
    * **Color de Acento:** Cian brillante (`#0891b2` o `#06b6d4`). Usar para botones, enlaces activos y efectos de "brillo".
* **Tipografía:** Usar fuentes Sans-Serif limpias (como la `Inter` que ya está configurada).
* **Efectos:** Usar sutiles efectos de "brillo" (glow) en los títulos o acentos, similar al sitio de referencia.

## 3. Stack Tecnológico y Reglas de Código

* **Framework:** El proyecto está construido con **React + Vite**.
* **Componentes:** Usa siempre **componentes funcionales** y **React Hooks** (ej. `useState`, `useEffect`). Nunca uses componentes de clase.
* **Estilos:** Usa **Tailwind CSS** para todos los estilos. No escribas CSS tradicional en archivos `.css` a menos que sea para animaciones complejas o estilos globales en `index.css`.
* **Atributos HTML:** Recuerda que en JSX se usa `className` en lugar de `class` y `htmlFor` en lugar de `for`.
* **Navegación:** Usamos **`react-router-dom`**. Para la navegación interna, usa siempre el componente `<Link to="...">` en lugar de etiquetas `<a>`.

## 4. Funcionalidades Clave

* **Página Principal:** Contiene una animación de video controlada por scroll (scroll-scrubbing). Para cualquier animación compleja, la librería a usar es **GSAP (GreenSock)**.
* **Página "Configurador":** Esta es una página futura muy importante. Será un configurador de flanges 3D. Para cualquier código relacionado con 3D, usaremos **`react-three-fiber`** (`@react-three/fiber`) y **`@react-three/drei`**.
* **IA:** El objetivo final es conectar el configurador a un asistente de IA (probablemente Vapi) para generar cotizaciones. El código debe ser modular y fácil de mantener.'
---

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.
