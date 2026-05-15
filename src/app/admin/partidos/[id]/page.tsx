import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { createMarker, createClip, deleteComment, createAnnotation } from '@/app/admin/actions'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
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
        <form action={createMarker} className="flex gap-2 items-end flex-wrap">
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
            <span key={m.id} className="text-xs bg-gray-100 px-2 py-1 rounded">{m.label} ({fmt(m.timestamp_seconds)})</span>
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
              {c.title} ({fmt(c.start_seconds)}–{fmt(c.end_seconds)})
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Anotación</h2>
        <form action={createAnnotation} className="flex gap-2 items-end flex-wrap">
          <input type="hidden" name="match_id" value={id} />
          <label className="flex flex-col gap-1 text-xs">
            Texto
            <input name="body" className="p-1 border rounded w-64" required />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Segundos
            <input name="timestamp_seconds" type="number" className="p-1 border rounded w-24" required />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Tags (coma)
            <input name="tags" className="p-1 border rounded w-40" placeholder="contraataque, gol" />
          </label>
          <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Agregar</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Comentarios ({comments?.length || 0})</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {comments?.map(c => (
            <div key={c.id} className="bg-white border rounded p-3 flex justify-between items-start gap-2">
              <div>
                <div className="text-xs text-gray-400">
                  {c.author_name} · {fmt(c.timestamp_seconds)}
                </div>
                <p className="text-sm mt-1">{c.body}</p>
              </div>
              <form action={deleteComment}>
                <input type="hidden" name="comment_id" value={c.id} />
                <input type="hidden" name="match_id" value={id} />
                <button className="text-xs text-red-500 hover:underline">Borrar</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
