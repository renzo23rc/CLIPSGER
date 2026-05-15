# GER Waterpolo - Fase 4: Comentarios Públicos, Panel Admin y Stats Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar sistema de comentarios públicos con rate limiting, panel admin básico para CRUD de partidos/clips/marcadores, y dashboard de estadísticas GER vs Rival.

**Architecture:** Server Actions para admin CRUD, API route con rate limiting para comentarios anónimos, Server Components para fetch de datos con Client interactive onde necesario.

**Tech Stack:** Next.js 15, Supabase, Tailwind.

---

### Task 1: Schema de Comentarios y Stats

**Files:**
- Create: `supabase/migrations/0003_comments.sql`
- Create: `supabase/migrations/0004_match_stats.sql`

- [ ] **Step 1: Escribir migración de comentarios**
```sql
-- supabase/migrations/0003_comments.sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    body TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_match_time ON comments(match_id, timestamp_seconds, created_at);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentarios lectura publica" ON comments FOR SELECT USING (true);
CREATE POLICY "Comentarios delete solo editores" ON comments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM editors
    WHERE editors.user_id = (SELECT auth.uid())
    AND editors.is_active = true
  )
);

CREATE TABLE editors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE editors ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 2: Escribir migración de stats**
```sql
-- supabase/migrations/0004_match_stats.sql
CREATE TABLE match_stats_definition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

INSERT INTO match_stats_definition (key, label, display_order) VALUES
  ('goles', 'Goles', 1),
  ('tiros', 'Tiros totales', 2),
  ('bloqueos', 'Bloqueos', 3),
  ('atajadas', 'Atajadas del arquero', 4),
  ('exclusiones_favor', 'Exclusiones a favor', 5),
  ('exclusiones_contra', 'Exclusiones en contra', 6),
  ('penales_favor', 'Penales a favor', 7),
  ('penales_contra', 'Penales en contra', 8),
  ('contraataques', 'Contraataques', 9),
  ('perdidas_robos', 'Pérdidas / Robos', 10);

CREATE TABLE match_stats_enabled (
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    definition_id UUID REFERENCES match_stats_definition(id) ON DELETE CASCADE,
    PRIMARY KEY (match_id, definition_id)
);

CREATE TABLE match_stats_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    definition_id UUID REFERENCES match_stats_definition(id),
    team TEXT NOT NULL CHECK (team IN ('ger', 'rival')),
    value TEXT NOT NULL
);

CREATE TABLE match_stats_6v5 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team TEXT NOT NULL CHECK (team IN ('ger', 'rival')),
    phase TEXT NOT NULL CHECK (phase IN ('6v5', '5v6')),
    intentos INTEGER DEFAULT 0,
    goles INTEGER DEFAULT 0
);

ALTER TABLE match_stats_enabled ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats_6v5 ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_stats_definition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stats lectura publica" ON match_stats_definition FOR SELECT USING (true);
CREATE POLICY "Stats enabled lectura publica" ON match_stats_enabled FOR SELECT USING (true);
CREATE POLICY "Stats values lectura publica" ON match_stats_values FOR SELECT USING (true);
CREATE POLICY "Stats 6v5 lectura publica" ON match_stats_6v5 FOR SELECT USING (true);
```

- [ ] **Step 3: Commit**
```bash
git add supabase/
git commit -m "db: agregar tablas de comentarios, editores y stats"
```

### Task 2: API de Comentarios con Rate Limit

**Files:**
- Create: `src/app/api/comments/route.ts`

- [ ] **Step 1: Escribir endpoint con rate limiting**
```typescript
// src/app/api/comments/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const RATE_LIMIT_SECONDS = 5

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT || 'dev-salt')).digest('hex')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  const ipHash = hashIP(ip)

  const body = await request.json()
  const { match_id, author_name, timestamp_seconds, body: commentBody, parent_id } = body

  if (!match_id || !author_name || commentBody == null || timestamp_seconds == null) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  if (typeof timestamp_seconds !== 'number' || timestamp_seconds < 0) {
    return NextResponse.json({ error: 'timestamp inválido' }, { status: 400 })
  }

  if (author_name.trim().length < 2) {
    return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 })
  }

  const { data: recent } = await supabase
    .from('comments')
    .select('created_at')
    .eq('ip_hash', ipHash)
    .order('created_at', { ascending: false })
    .limit(1)

  if (recent && recent.length > 0) {
    const lastComment = new Date(recent[0].created_at).getTime()
    const diff = (Date.now() - lastComment) / 1000
    if (diff < RATE_LIMIT_SECONDS) {
      return NextResponse.json({ error: 'Demasiados comentarios. Esperá unos segundos.' }, { status: 429 })
    }
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      match_id,
      parent_id: parent_id || null,
      author_name: author_name.trim(),
      body: commentBody,
      timestamp_seconds,
      ip_hash: ipHash,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: comment }, { status: 201 })
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/api/
git commit -m "feat: endpoint de comentarios con rate limit por IP"
```

### Task 3: Panel Admin — Server Actions CRUD

**Files:**
- Create: `src/app/admin/actions.ts`

- [ ] **Step 1: Escribir server actions de admin**
```typescript
// src/app/admin/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'

type VideoType = Database['public']['Enums']['video_type'] | 'youtube' | 'mp4'

export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const videoUrl = formData.get('video_url') as string
  const videoType = formData.get('video_type') as VideoType
  
  const { error } = await supabase.from('matches').insert({
    title,
    video_url: videoUrl,
    video_type: videoType,
  })
  
  if (error) return { error: error.message }
  
  revalidatePath('/')
  redirect('/')
}

export async function createMarker(formData: FormData) {
  const supabase = await createClient()
  
  const matchId = formData.get('match_id') as string
  const label = formData.get('label') as string
  const timestamp = parseInt(formData.get('timestamp_seconds') as string)
  
  const { error } = await supabase.from('match_markers').insert({
    match_id: matchId,
    label,
    timestamp_seconds: timestamp,
  })
  
  if (error) return { error: error.message }
  
  revalidatePath(`/partidos/${matchId}`)
}

export async function createClip(formData: FormData) {
  const supabase = await createClient()
  
  const matchId = formData.get('match_id') as string
  const title = formData.get('title') as string
  const startSeconds = parseInt(formData.get('start_seconds') as string)
  const endSeconds = parseInt(formData.get('end_seconds') as string)
  
  const { error } = await supabase.from('clips').insert({
    match_id: matchId,
    title,
    start_seconds: startSeconds,
    end_seconds: endSeconds,
  })
  
  if (error) return { error: error.message }
  
  revalidatePath(`/partidos/${matchId}`)
}

export async function deleteComment(commentId: string, matchId: string) {
  const supabase = await createClient()
  
  await supabase.from('comments').delete().eq('id', commentId)
  
  revalidatePath(`/partidos/${matchId}`)
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/admin/
git commit -m "feat: server actions CRUD para admin"
```

### Task 4: Páginas de Admin

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/partidos/[id]/page.tsx`

- [ ] **Step 1: Escribir dashboard admin**
```tsx
// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel Editor</h1>
        <a href="/admin/partidos/nuevo" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          + Nuevo Partido
        </a>
      </div>

      <div className="grid gap-4">
        {matches?.map(m => (
          <div key={m.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
            <div>
              <h2 className="font-semibold">{m.title}</h2>
              <span className="text-xs text-gray-400 capitalize">{m.video_type}</span>
            </div>
            <Link href={`/admin/partidos/${m.id}`} className="text-sm text-blue-600 hover:underline">
              Gestionar
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Escribir página de gestión por partido**
```tsx
// src/app/admin/partidos/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { createMarker, createClip, deleteComment } from '@/app/admin/actions'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ManageMatchPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: match } = await supabase.from('matches').select('*').eq('id', id).single()
  if (!match) notFound()

  const { data: markers } = await supabase.from('match_markers').select('*').eq('match_id', id).order('timestamp_seconds')
  const { data: clips } = await supabase.from('clips').select('*').eq('match_id', id).order('start_seconds')
  const { data: comments } = await supabase.from('comments').select('*').eq('match_id', id).order('created_at', { ascending: false })

  return (
    <div className="py-6 space-y-8">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Panel</Link>
      <h1 className="text-2xl font-bold">{match.title}</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Marcadores de Cuarto</h2>
        <form action={createMarker} className="flex gap-2 items-end">
          <input type="hidden" name="match_id" value={id} />
          <label className="flex flex-col gap-1 text-xs">
            Etiqueta
            <input name="label" className="p-1 border rounded w-32" placeholder="Fin 1er" required />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Segundos
            <input name="timestamp_seconds" type="number" className="p-1 border rounded w-24" required />
          </label>
          <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Agregar</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {markers?.map(m => (
            <span key={m.id} className="text-xs bg-gray-100 px-2 py-1 rounded">{m.label} ({m.timestamp_seconds}s)</span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Clips</h2>
        <form action={createClip} className="flex gap-2 items-end flex-wrap">
          <input type="hidden" name="match_id" value={id} />
          <label className="flex flex-col gap-1 text-xs">
            Título
            <input name="title" className="p-1 border rounded w-40" required />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Inicio (s)
            <input name="start_seconds" type="number" className="p-1 border rounded w-20" required />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Fin (s)
            <input name="end_seconds" type="number" className="p-1 border rounded w-20" required />
          </label>
          <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Agregar</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {clips?.map(c => (
            <a key={c.id} href={`/clips/${c.id}`} className="text-xs bg-green-50 border border-green-200 px-2 py-1 rounded">
              {c.title} ({c.start_seconds}s–{c.end_seconds}s)
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Comentarios ({comments?.length || 0})</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {comments?.map(c => (
            <div key={c.id} className="bg-white border rounded p-3 flex justify-between items-start gap-2">
              <div>
                <div className="text-xs text-gray-400">
                  {c.author_name} · {Math.floor(c.timestamp_seconds / 60)}:{String(c.timestamp_seconds % 60).padStart(2, '0')}
                </div>
                <p className="text-sm mt-1">{c.body}</p>
              </div>
              <form action={deleteComment.bind(null, c.id, id)}>
                <button className="text-xs text-red-500 hover:underline">Borrar</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/admin/
git commit -m "feat: panel admin con CRUD de marcadores, clips y moderación de comentarios"
```
