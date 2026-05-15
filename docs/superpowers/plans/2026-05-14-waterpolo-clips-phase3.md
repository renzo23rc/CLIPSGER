# GER Waterpolo - Fase 3: Página de Partido con Player y Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear la página de detalle de partido (`/partidos/:id`) con reproductor de video, timeline de marcadores de cuarto, y lista de clips asociados.

**Architecture:** Server Component que fetchea del partido, sus clips y marcadores. Pasa datos a Client Components para el player y la timeline interactiva.

**Tech Stack:** Next.js 15 App Router, Supabase, Tailwind.

---

### Task 1: Extender Schema con Marcadores de Cuarto

**Files:**
- Create: `supabase/migrations/0002_match_markers.sql`

- [ ] **Step 1: Escribir migración**
```sql
-- supabase/migrations/0002_match_markers.sql
CREATE TABLE match_markers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE match_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marcadores son publicos" ON match_markers FOR SELECT USING (true);
```

- [ ] **Step 2: Commit**
```bash
git add supabase/
git commit -m "db: agregar tabla match_markers para cortes de cuarto"
```

### Task 2: Página de Partido con Player y Timeline

**Files:**
- Create: `src/app/partidos/[id]/page.tsx`
- Create: `src/components/video/MatchTimeline.tsx`

- [ ] **Step 1: Escribir componente Timeline**
```tsx
// src/components/video/MatchTimeline.tsx
'use client'

interface Marker {
  id: string
  label: string
  timestamp_seconds: number
}

interface Clip {
  id: string
  title: string
  start_seconds: number
  end_seconds: number
}

interface Props {
  markers: Marker[]
  clips: Clip[]
  currentTime: number
  onSeek: (seconds: number) => void
}

export function MatchTimeline({ markers, clips, currentTime, onSeek }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
        Línea de Tiempo
      </h3>
      
      {markers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Cuartos</h4>
          <div className="flex flex-wrap gap-2">
            {markers.map(m => (
              <button
                key={m.id}
                onClick={() => onSeek(m.timestamp_seconds)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  currentTime >= m.timestamp_seconds
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {m.label} ({formatTime(m.timestamp_seconds)})
              </button>
            ))}
          </div>
        </div>
      )}
      
      {clips.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2">Clips</h4>
          <div className="flex flex-wrap gap-2">
            {clips.map(c => (
              <a
                key={c.id}
                href={`/clips/${c.id}`}
                className="text-xs px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-colors"
              >
                {c.title} ({formatTime(c.start_seconds)}–{formatTime(c.end_seconds)})
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
```

- [ ] **Step 2: Escribir página del partido**
```tsx
// src/app/partidos/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UnifiedPlayer } from '@/components/video/UnifiedPlayer'
import { MatchTimeline } from '@/components/video/MatchTimeline'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()
    
  if (!match) notFound()
  
  const { data: markers } = await supabase
    .from('match_markers')
    .select('*')
    .eq('match_id', id)
    .order('timestamp_seconds', { ascending: true })
    
  const { data: clips } = await supabase
    .from('clips')
    .select('*')
    .eq('match_id', id)
    .order('start_seconds', { ascending: true })

  return (
    <div className="py-6 space-y-6">
      <h1 className="text-2xl font-bold">{match.title}</h1>
      
      <UnifiedPlayer videoUrl={match.video_url} type={match.video_type} />
      
      <MatchTimeline 
        markers={markers ?? []} 
        clips={clips ?? []} 
        currentTime={0}
        onSeek={() => {}}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/partidos/ src/components/video/
git commit -m "feat: pagina de partido con player y timeline"
```

### Task 3: Página de Clip (segmento del partido)

**Files:**
- Create: `src/app/clips/[id]/page.tsx`

- [ ] **Step 1: Escribir página de clip**
```tsx
// src/app/clips/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UnifiedPlayer } from '@/components/video/UnifiedPlayer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClipPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: clip } = await supabase
    .from('clips')
    .select('*, matches(*)')
    .eq('id', id)
    .single()
    
  if (!clip || !clip.matches) notFound()
  
  const match = clip.matches

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-3">
        <a href={`/partidos/${match.id}`} className="text-sm text-blue-600 hover:underline">
          ← Volver al partido
        </a>
      </div>
      <h1 className="text-2xl font-bold">{clip.title}</h1>
      <p className="text-sm text-gray-500">
        {match.title} · {formatTime(clip.start_seconds)} – {formatTime(clip.end_seconds)}
      </p>
      
      <UnifiedPlayer videoUrl={match.video_url} type={match.video_type} />
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/clips/
git commit -m "feat: pagina de clip con segmento del partido"
```
