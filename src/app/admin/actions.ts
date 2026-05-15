'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const videoUrl = formData.get('video_url') as string
  const videoType = formData.get('video_type') as string
  
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
  
  await supabase.from('match_markers').insert({
    match_id: matchId,
    label,
    timestamp_seconds: timestamp,
  })
  
  revalidatePath(`/partidos/${matchId}`)
}

export async function createClip(formData: FormData) {
  const supabase = await createClient()
  
  const matchId = formData.get('match_id') as string
  const title = formData.get('title') as string
  const startSeconds = parseInt(formData.get('start_seconds') as string)
  const endSeconds = parseInt(formData.get('end_seconds') as string)
  
  await supabase.from('clips').insert({
    match_id: matchId,
    title,
    start_seconds: startSeconds,
    end_seconds: endSeconds,
  })
  
  revalidatePath(`/partidos/${matchId}`)
}

export async function deleteComment(formData: FormData) {
  const supabase = await createClient()
  
  const commentId = formData.get('comment_id') as string
  const matchId = formData.get('match_id') as string
  
  await supabase.from('comments').delete().eq('id', commentId)
  
  revalidatePath(`/partidos/${matchId}`)
  revalidatePath(`/admin/partidos/${matchId}`)
}
