# Spec: Interfaz Web para Análisis de Waterpolo (GER)

## Objetivo
Construir una plataforma pública (v1) para el Club GER que permita ver partidos y clips de waterpolo, agregar anotaciones con marcas de tiempo, permitir comentarios públicos por minuto, y mostrar un dashboard de estadísticas manuales del partido.

## Arquitectura y Stack
- **Frontend / Backend**: Next.js (App Router) + React.
- **Base de Datos y Auth**: Supabase (PostgreSQL, Supabase Auth con Magic Links).
- **Hosting**: Vercel o Netlify.
- **Reproductor de Video**: Adaptador dual para YouTube IFrame API y HTML5 `<video>` (para MP4 directos).

## Modelo de Datos y Permisos

### 1. Entidades Principales
- **Partidos (`matches`)**: Entidad base. Contiene 1 video continuo (YouTube ID o URL directa de MP4).
- **Clips (`clips`)**: Segmentos virtuales dentro de un partido. Tienen `partido_id`, `inicio_segundos` y `fin_segundos`. Poseen URL propia (`/clips/:id`).
- **Marcadores de Cuarto (`match_markers`)**: Timestamps manuales para indicar fin del 1er, 2do, 3er cuarto, etc.
- **Anotaciones de Editores (`annotations`)**: Comentarios técnicos hechos por editores en un minuto específico del partido.
- **Tags (`tags` / `annotation_tags`)**: Etiquetas reutilizables (con autocompletado) aplicadas a las anotaciones (ej. "contraataque").
- **Comentarios Públicos (`comments`)**: Aportes de usuarios no logueados. Tienen `autor_nombre`, `texto`, `minuto_partido` (segundos), y `parent_id` para hilos. Las respuestas (replies) heredan el minuto del padre.
- **Estadísticas (`match_stats`)**: Dashboard manual. Define valores para "GER" y "Rival". Catálogo de métricas fijas activables por partido, más opciones "custom". Para las métricas 6v5/5v6, se guarda `intentos` y `goles`, y se calcula `% efectividad` (si intentos es 0, muestra "N/A").

### 2. Permisos y Seguridad
- **Público (Read-Only + Comments)**: Cualquier visitante puede ver todo y dejar comentarios/respuestas. La creación de comentarios pasa por un Endpoint de Next.js (`/api/comments`) que aplica Rate Limiting por IP para evitar spam mínimo.
- **Editores (Supabase Auth)**: Usuarios autorizados (via email/Magic Link) que pueden:
  - Crear/editar partidos, clips, y marcadores.
  - Crear/editar sus anotaciones y tags.
  - Editar el dashboard de estadísticas (GER vs Rival).
  - Moderar (borrar) comentarios públicos.

## Interfaz de Usuario y Flujos

### 1. Vistas Públicas
- **Home (`/`)**: Lista de partidos disponibles.
- **Partido (`/partidos/:id`)**:
  - Reproductor de video principal.
  - **Timeline**: Línea de tiempo que muestra marcadores de cuarto, anotaciones y comentarios ordenados cronológicamente. Hacer click en un minuto (ej. `[12:34]`) dispara un `seekTo(tiempo)` en el video.
  - **Dashboard de Estadísticas**: Dos columnas (GER vs `[Nombre_Rival]`) mostrando totales del partido.
  - **Lista de Clips**: Enlaces a los segmentos destacados.
- **Clip (`/clips/:id`)**: Reproduce solo el segmento `inicio` a `fin` del partido. Muestra anotaciones y comentarios acotados a ese rango.

### 2. Vistas de Editor
- Acceso a controles de edición in-line en la página del partido (si está logueado).
- Formularios para cargar partido, marcar inicio/fin de clip, y actualizar el dashboard de estadísticas.