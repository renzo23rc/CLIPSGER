import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Últimos Partidos</h1>
      
      {error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded">
          Error al cargar los partidos.
        </div>
      ) : matches?.length === 0 ? (
        <div className="text-gray-500">
          Aún no hay partidos cargados.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches?.map(match => (
            <Link 
              key={match.id} 
              href={`/partidos/${match.id}`}
              className="block bg-white p-6 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h2 className="font-semibold text-lg line-clamp-2 mb-1">{match.title}</h2>
              <p className="text-xs text-gray-400 mb-2">
                {match.match_date && new Date(match.match_date).toLocaleDateString('es-AR')}
                {match.rival_name && ` · vs ${match.rival_name}`}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {match.video_type}
                </span>
                {match.description && (
                  <span className="text-xs text-gray-400 line-clamp-1 max-w-[140px]">{match.description}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
