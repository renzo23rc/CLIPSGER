# GER Waterpolo - Fase 1: Setup y Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inicializar el proyecto Next.js, configurar Supabase, crear el esquema inicial de base de datos para partidos/clips y construir el componente reproductor de video (YouTube/MP4) con control de timestamps.

**Architecture:** Next.js App Router, componentes React (Client Components para el player), Supabase DB (PostgreSQL).

**Tech Stack:** Next.js 15, React 19, Supabase JS Client, Tailwind CSS, TypeScript, Jest/React Testing Library.

---

### Task 1: Setup del Proyecto Next.js y Supabase Client

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/lib/supabase/client.ts`
- Create: `.env.local`

- [ ] **Step 1: Scaffolding inicial del proyecto**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
npm install @supabase/supabase-js @supabase/ssr
npm install -D jest @testing-library/react @testing-library/jest-dom @types/jest jest-environment-jsdom
```

- [ ] **Step 2: Configurar Supabase Client**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "chore: inicializar Next.js app y Supabase client"
```

### Task 2: Esquema de Base de Datos Inicial (Migración)

**Files:**
- Create: `supabase/migrations/0001_initial_schema.sql`

- [ ] **Step 1: Escribir migración SQL inicial**
```sql
-- supabase/migrations/0001_initial_schema.sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'mp4')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_seconds INTEGER NOT NULL,
    end_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Básico (Lectura pública)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partidos son publicos" ON matches FOR SELECT USING (true);
CREATE POLICY "Clips son publicos" ON clips FOR SELECT USING (true);
```

- [ ] **Step 2: Aplicar migración (si Supabase CLI está disponible) o documentar requerimiento**
```bash
# Nota para ejecución: se asume que supabase local start fue ejecutado
supabase db push
```

- [ ] **Step 3: Commit**
```bash
git add supabase/
git commit -m "db: crear tablas matches y clips con políticas de lectura pública"
```

### Task 3: Componente Shared Video Player (YouTube & MP4)

**Files:**
- Create: `src/components/video/UnifiedPlayer.tsx`
- Create: `src/components/video/__tests__/UnifiedPlayer.test.tsx`

- [ ] **Step 1: Escribir test fallido**
```typescript
// src/components/video/__tests__/UnifiedPlayer.test.tsx
import { render, screen } from '@testing-library/react'
import { UnifiedPlayer } from '../UnifiedPlayer'

describe('UnifiedPlayer', () => {
  it('renderiza video HTML5 cuando type es mp4', () => {
    render(<UnifiedPlayer videoUrl="http://test.com/v.mp4" type="mp4" />)
    expect(screen.getByTestId('html5-player')).toBeInTheDocument()
  })

  it('renderiza iframe cuando type es youtube', () => {
    render(<UnifiedPlayer videoUrl="xyz123" type="youtube" />)
    expect(screen.getByTestId('youtube-player')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar test para verificar falla**
Ejecutar: `npm run test -- UnifiedPlayer.test.tsx`
Esperado: FAIL porque `UnifiedPlayer` no existe.

- [ ] **Step 3: Implementación mínima**
```typescript
// src/components/video/UnifiedPlayer.tsx
'use client'

interface Props {
  videoUrl: string;
  type: 'youtube' | 'mp4';
}

export function UnifiedPlayer({ videoUrl, type }: Props) {
  if (type === 'mp4') {
    return (
      <video data-testid="html5-player" controls className="w-full aspect-video">
        <source src={videoUrl} type="video/mp4" />
      </video>
    );
  }

  return (
    <iframe
      data-testid="youtube-player"
      className="w-full aspect-video"
      src={`https://www.youtube.com/embed/${videoUrl}?enablejsapi=1`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
```

- [ ] **Step 4: Ejecutar test para verificar que pase**
Ejecutar: `npm run test -- UnifiedPlayer.test.tsx`
Esperado: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/video/
git commit -m "feat: crear UnifiedPlayer para YouTube y MP4"
```