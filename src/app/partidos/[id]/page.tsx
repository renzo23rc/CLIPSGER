import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UnifiedPlayer } from '@/components/video/UnifiedPlayer'
import { MatchTimeline } from '@/components/video/MatchTimeline'
import { CommentSection } from '@/components/comments/CommentSection'
import { MatchStats } from '@/components/stats/MatchStats'
import { AnnotationSection } from '@/components/annotations/AnnotationSection'

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
    { data: statDefs },
    { data: enabled },
    { data: statValues },
    { data: stat65 },
    { data: annotationsData },
  ] = await Promise.all([
    supabase.from('match_markers').select('*').eq('match_id', id).order('timestamp_seconds', { ascending: true }),
    supabase.from('clips').select('*').eq('match_id', id).order('start_seconds', { ascending: true }),
    supabase.from('comments').select('*').eq('match_id', id).order('timestamp_seconds', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('match_stats_definition').select('*').order('display_order'),
    supabase.from('match_stats_enabled').select('definition_id').eq('match_id', id),
    supabase.from('match_stats_values').select('*').eq('match_id', id),
    supabase.from('match_stats_6v5').select('*').eq('match_id', id),
    supabase.from('annotations').select('*, annotation_tags(tags(*))').eq('match_id', id),
  ])

  const enabledIds = new Set(enabled?.map(e => e.definition_id) || [])
  const enabledDefs = statDefs?.filter(d => enabledIds.has(d.id)) || []

  const annotations = annotationsData?.map(a => ({
    id: a.id,
    body: a.body,
    timestamp_seconds: a.timestamp_seconds,
    editor_id: a.editor_id,
    tags: (a.annotation_tags || []).map((at: any) => at.tags),
  })) || []

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{match.title}</h1>
        {match.rival_name && (
          <p className="text-sm text-gray-500 mt-1">
            vs {match.rival_name}
            {match.match_date && ` · ${new Date(match.match_date).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        )}
        {match.description && (
          <p className="text-sm text-gray-400 mt-1">{match.description}</p>
        )}
      </div>
      
      <UnifiedPlayer videoUrl={match.video_url} type={match.video_type} />

      <MatchStats 
        definitions={enabledDefs}
        values={statValues ?? []}
        sixFive={stat65 ?? []}
      />
      
      <MatchTimeline 
        markers={markers ?? []} 
        clips={clips ?? []} 
        currentTime={0}
      />

      <AnnotationSection
        annotations={annotations}
      />

      <CommentSection 
        comments={commentsData ?? []}
        matchId={id}
      />
    </div>
  )
}
