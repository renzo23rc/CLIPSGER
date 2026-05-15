import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UnifiedPlayer } from '@/components/video/UnifiedPlayer'
import { MatchTimeline } from '@/components/video/MatchTimeline'
import { CommentSection } from '@/components/comments/CommentSection'

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

  const [
    { data: markers },
    { data: clips },
    { data: commentsData },
  ] = await Promise.all([
    supabase.from('match_markers').select('*').eq('match_id', id).order('timestamp_seconds', { ascending: true }),
    supabase.from('clips').select('*').eq('match_id', id).order('start_seconds', { ascending: true }),
    supabase.from('comments').select('*').eq('match_id', id).order('timestamp_seconds', { ascending: true }).order('created_at', { ascending: true }),
  ])

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

      <CommentSection 
        comments={commentsData ?? []}
        matchId={id}
        onSeek={() => {}}
      />
    </div>
  )
}
