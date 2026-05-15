import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UnifiedPlayer } from '@/components/video/UnifiedPlayer'

interface PageProps {
  params: Promise<{ id: string }>
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
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
      <a href={`/partidos/${match.id}`} className="text-sm text-blue-600 hover:underline inline-block">
        ← Volver al partido
      </a>
      <h1 className="text-2xl font-bold">{clip.title}</h1>
      <p className="text-sm text-gray-500">
        {match.title} · {formatTime(clip.start_seconds)} – {formatTime(clip.end_seconds)}
      </p>
      
      <UnifiedPlayer
        videoUrl={match.video_url}
        type={match.video_type}
        startSeconds={clip.start_seconds}
        endSeconds={clip.end_seconds}
      />
    </div>
  )
}
