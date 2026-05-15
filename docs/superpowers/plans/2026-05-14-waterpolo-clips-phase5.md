# GER Waterpolo - Fase 5: Completar v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cerrar v1: comentarios en la página de partido, dashboard stats, form nuevo partido, anotaciones de editores con tags, y RLS para editores.

**Tech Stack:** Next.js 15, Supabase, Tailwind.

---

### Task 1: RLS para Editores y Fix Schema

**Files:**
- Create: `supabase/migrations/0005_editor_rls.sql`

- [ ] **Step 1: Políticas para que editores puedan escribir**
```sql
-- supabase/migrations/0005_editor_rls.sql
CREATE POLICY "Editores insertan partidos" ON matches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()) AND editors.is_active = true)
);
CREATE POLICY "Editores actualizan partidos" ON matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()) AND editors.is_active = true)
);
CREATE POLICY "Editores borran partidos" ON matches FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()) AND editors.is_active = true)
);

CREATE POLICY "Editores insertan clips" ON clips FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores actualizan clips" ON clips FOR UPDATE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores borran clips" ON clips FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores insertan marcadores" ON match_markers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores borran marcadores" ON match_markers FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores insertan stats" ON match_stats_enabled FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores borran stats" ON match_stats_enabled FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores insertan stats values" ON match_stats_values FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores actualizan stats values" ON match_stats_values FOR UPDATE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores insertan 6v5" ON match_stats_6v5 FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores actualizan 6v5" ON match_stats_6v5 FOR UPDATE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);

CREATE POLICY "Editores leen editors" ON editors FOR SELECT USING (true);
```

- [ ] **Step 2: Commit**
```bash
git add supabase/ && git commit -m "db: politicas RLS para editores en todas las tablas"
```

### Task 2: Comentarios en la Página de Partido

**Files:**
- Modify: `src/app/partidos/[id]/page.tsx`
- Create: `src/components/comments/CommentSection.tsx`

- [ ] **Step 1: Escribir componente CommentSection**
```tsx
// src/components/comments/CommentSection.tsx
'use client'

import { useState, useOptimistic } from 'react'

interface Comment {
  id: string
  author_name: string
  body: string
  timestamp_seconds: number
  parent_id: string | null
  created_at: string
  replies?: Comment[]
}

interface Props {
  comments: Comment[]
  matchId: string
  onSeek: (seconds: number) => void
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function buildThreads(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>()
  const roots: Comment[] = []
  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] })
  }
  for (const c of comments) {
    const node = map.get(c.id)!
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots.sort((a, b) => a.timestamp_seconds - b.timestamp_seconds || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function CommentSection({ comments, matchId, onSeek }: Props) {
  const threads = buildThreads(comments)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0)

  async function submitComment(parentId?: number) {
    if (!name.trim() || !body.trim()) return
    setStatus('loading')
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: matchId,
        author_name: name.trim(),
        timestamp_seconds: currentTimestamp,
        body: body.trim(),
        parent_id: parentId || null,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      setStatus('error')
      setErrorMsg(err.error)
      return
    }
    setBody('')
    setReplyTo(null)
    setStatus('idle')
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Comentarios ({comments.length})</h3>

      <div className="bg-white border rounded-lg p-4 space-y-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full p-2 border rounded text-sm"
          minLength={2}
        />
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={currentTimestamp}
            onChange={e => setCurrentTimestamp(Number(e.target.value))}
            placeholder="Segundos"
            className="w-24 p-2 border rounded text-sm"
          />
          <button
            onClick={() => onSeek(currentTimestamp)}
            className="text-xs text-blue-600 hover:underline"
            type="button"
          >
            Ir a {fmt(currentTimestamp)}
          </button>
        </div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={replyTo ? 'Escribí tu respuesta...' : 'Escribí un comentario...'}
          className="w-full p-2 border rounded text-sm"
          rows={3}
        />
        {status === 'error' && <p className="text-red-500 text-xs">{errorMsg}</p>}
        <button
          onClick={() => submitComment(replyTo || undefined)}
          disabled={status === 'loading'}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
        >
          {status === 'loading' ? 'Enviando...' : 'Comentar'}
        </button>
      </div>

      <div className="space-y-2">
        {threads.map(c => (
          <div key={c.id} className="space-y-1">
            <div className="bg-white border rounded p-3">
              <div className="flex gap-2 items-baseline">
                <button onClick={() => onSeek(c.timestamp_seconds)} className="text-xs text-blue-600 hover:underline font-mono">
                  [{fmt(c.timestamp_seconds)}]
                </button>
                <span className="text-xs text-gray-400">{c.author_name}</span>
              </div>
              <p className="text-sm mt-1">{c.body}</p>
              <button
                onClick={() => { setReplyTo(c.id); setCurrentTimestamp(c.timestamp_seconds) }}
                className="text-xs text-gray-400 hover:text-blue-600 mt-1"
              >
                Responder
              </button>
            </div>
            {c.replies?.map(r => (
              <div key={r.id} className="bg-gray-50 border rounded p-3 ml-6">
                <div className="flex gap-2 items-baseline">
                  <button onClick={() => onSeek(r.timestamp_seconds)} className="text-xs text-blue-600 hover:underline font-mono">
                    [{fmt(r.timestamp_seconds)}]
                  </button>
                  <span className="text-xs text-gray-400">{r.author_name}</span>
                </div>
                <p className="text-sm mt-1">{r.body}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Actualizar página de partido con comentarios**
```tsx
// src/app/partidos/[id]/page.tsx — añadir al final del return
{/* Después de MatchTimeline */}
<CommentSection
  comments={commentsData ?? []}
  matchId={id}
  onSeek={(seconds) => { /* TODO: integración con el player ref */ }}
/>
```

*El fetch de comentarios se agrega arriba:*
```typescript
const { data: commentsData } = await supabase
  .from('comments')
  .select('*')
  .eq('match_id', id)
  .order('timestamp_seconds', { ascending: true })
  .order('created_at', { ascending: true })
```

- [ ] **Step 3: Commit**
```bash
git add src/components/comments/ src/app/partidos/
git commit -m "feat: comentarios publicos en pagina de partido con respuestas"
```

### Task 3: Form Nuevo Partido en Admin

**Files:**
- Create: `src/app/admin/partidos/nuevo/page.tsx`

- [ ] **Step 1: Escribir form de nuevo partido**
```tsx
// src/app/admin/partidos/nuevo/page.tsx
import { createMatch } from '@/app/admin/actions'
import Link from 'next/link'

export default function NewMatchPage() {
  return (
    <div className="py-6 max-w-lg">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Panel</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">Nuevo Partido</h1>
      <form action={createMatch} className="space-y-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Título</span>
          <input name="title" className="p-2 border rounded" placeholder="GER vs Rival — Fecha" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Video URL/ID</span>
          <input name="video_url" className="p-2 border rounded" placeholder="YouTube ID o URL MP4" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Tipo de Video</span>
          <select name="video_type" className="p-2 border rounded" required>
            <option value="youtube">YouTube</option>
            <option value="mp4">MP4 (link directo)</option>
          </select>
        </label>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Crear Partido</button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/admin/partidos/nuevo/
git commit -m "feat: formulario para crear nuevo partido en admin"
```

### Task 4: Stats Dashboard en Página de Partido

**Files:**
- Create: `src/components/stats/MatchStats.tsx`

- [ ] **Step 1: Escribir componente de stats**
```tsx
// src/components/stats/MatchStats.tsx
interface StatDef {
  id: string
  key: string
  label: string
}

interface StatValue {
  definition_id: string
  team: 'ger' | 'rival'
  value: string
}

interface SixFiveStat {
  team: 'ger' | 'rival'
  phase: '6v5' | '5v6'
  intentos: number
  goles: number
}

interface Props {
  definitions: StatDef[]
  values: StatValue[]
  sixFive: SixFiveStat[]
  rivalName?: string
}

export function MatchStats({ definitions, values, sixFive, rivalName }: Props) {
  const valMap = new Map<string, string>()
  for (const v of values) {
    valMap.set(`${v.definition_id}:${v.team}`, v.value)
  }

  const sixFiveMap = new Map<string, SixFiveStat>()
  for (const s of sixFive) {
    sixFiveMap.set(`${s.team}:${s.phase}`, s)
  }

  const ger65 = sixFiveMap.get('ger:6v5')
  const ger56 = sixFiveMap.get('ger:5v6')
  const rival65 = sixFiveMap.get('rival:6v5')
  const rival56 = sixFiveMap.get('rival:5v6')

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="bg-blue-800 text-white px-4 py-3">
        <h3 className="font-semibold text-lg">Estadísticas del Partido</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Métrica</th>
              <th className="text-center px-4 py-2 font-medium text-blue-800">GER</th>
              <th className="text-center px-4 py-2 font-medium text-gray-600">{rivalName || 'Rival'}</th>
            </tr>
          </thead>
          <tbody>
            {definitions.map(d => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{d.label}</td>
                <td className="text-center px-4 py-2 font-mono">{valMap.get(`${d.id}:ger`) || '-'}</td>
                <td className="text-center px-4 py-2 font-mono">{valMap.get(`${d.id}:rival`) || '-'}</td>
              </tr>
            ))}
            {ger65 && (
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">6v5 a favor</td>
                <td className="text-center px-4 py-2 font-mono">{ger65.goles}/{ger65.intentos} ({ger65.intentos > 0 ? Math.round((ger65.goles / ger65.intentos) * 100) : 'N/A'}%)</td>
                <td className="text-center px-4 py-2 font-mono">{rival56 ? `${rival56.goles}/${rival56.intentos}` : '-'}</td>
              </tr>
            )}
            {ger56 && (
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">5v6 en contra</td>
                <td className="text-center px-4 py-2 font-mono">{ger56.goles}/{ger56.intentos} ({ger56.intentos > 0 ? Math.round((ger56.goles / ger56.intentos) * 100) : 'N/A'}%)</td>
                <td className="text-center px-4 py-2 font-mono">{rival65 ? `${rival65.goles}/${rival65.intentos}` : '-'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Integrar en la página de partido**
*En `src/app/partidos/[id]/page.tsx`, agregar el fetch y el componente:*
```typescript
// Fetch stats definitions
const { data: statDefs } = await supabase
  .from('match_stats_definition')
  .select('*')
  .order('display_order')
  
// Fetch enabled stats for this match
const { data: enabled } = await supabase
  .from('match_stats_enabled')
  .select('definition_id')
  .eq('match_id', id)
  
const enabledIds = new Set(enabled?.map(e => e.definition_id) || [])
const enabledDefs = statDefs?.filter(d => enabledIds.has(d.id))

// Fetch stats values
const { data: statValues } = await supabase
  .from('match_stats_values')
  .select('*')
  .eq('match_id', id)

// Fetch 6v5/5v6 stats
const { data: stat65 } = await supabase
  .from('match_stats_6v5')
  .select('*')
  .eq('match_id', id)
```

- [ ] **Step 3: Commit**
```bash
git add src/components/stats/ src/app/partidos/
git commit -m "feat: dashboard de estadisticas en pagina de partido"
```

### Task 5: Anotaciones de Editores con Tags

**Files:**
- Create: `supabase/migrations/0006_annotations.sql`
- Create: `src/components/annotations/AnnotationSection.tsx`

- [ ] **Step 1: Escribir migración**
```sql
-- supabase/migrations/0006_annotations.sql
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    editor_id UUID REFERENCES editors(id),
    body TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE annotation_tags (
    annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (annotation_id, tag_id)
);

ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotation_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anotaciones lectura publica" ON annotations FOR SELECT USING (true);
CREATE POLICY "Tags lectura publica" ON tags FOR SELECT USING (true);
CREATE POLICY "Annotation tags lectura publica" ON annotation_tags FOR SELECT USING (true);

CREATE POLICY "Editores insertan anotaciones" ON annotations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores borran anotaciones" ON annotations FOR DELETE USING (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores insertan tags" ON tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
CREATE POLICY "Editores insertan annotation tags" ON annotation_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM editors WHERE editors.user_id = (SELECT auth.uid()))
);
```

- [ ] **Step 2: Commit migración**
```bash
git add supabase/
git commit -m "db: agregar anotaciones de editores con tags"
```
```

- [ ] **Step 3: Escribir server actions para anotaciones**
```typescript
// Añadir a src/app/admin/actions.ts
export async function createAnnotation(formData: FormData) {
  const supabase = await createClient()
  
  const matchId = formData.get('match_id') as string
  const body = formData.get('body') as string
  const timestamp = parseInt(formData.get('timestamp_seconds') as string)
  const tags = formData.getAll('tags') as string[]
  
  const { data: editor } = await supabase
    .from('editors')
    .select('id')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id!)
    .single()
  
  if (!editor) return
  
  const { data: annotation } = await supabase
    .from('annotations')
    .insert({
      match_id: matchId,
      editor_id: editor.id,
      body,
      timestamp_seconds: timestamp,
    })
    .select()
    .single()
  
  if (annotation && tags.length > 0) {
    for (const tagName of tags) {
      const t = tagName.trim()
      if (!t) continue
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', t)
        .single()
      
      let tagId: string
      if (existingTag) {
        tagId = existingTag.id
      } else {
        const { data: newTag } = await supabase.from('tags').insert({ name: t }).select().single()
        tagId = newTag!.id
      }
      
      await supabase.from('annotation_tags').insert({
        annotation_id: annotation.id,
        tag_id: tagId,
      })
    }
  }
  
  revalidatePath(`/partidos/${matchId}`)
}
```

- [ ] **Step 4: Commit server actions**
```bash
git add src/app/admin/actions.ts
git commit -m "feat: server action para crear anotaciones con tags"
```
