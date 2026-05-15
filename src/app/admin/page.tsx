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
