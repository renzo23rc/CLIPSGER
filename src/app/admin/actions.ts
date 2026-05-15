'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMatch(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const videoUrl = formData.get('video_url') as string
  const videoType = formData.get('video_type') as string
  const rivalName = formData.get('rival_name') as string
  const matchDate = formData.get('match_date') as string
  const description = formData.get('description') as string
  
  await supabase.from('matches').insert({
    title,
    video_url: videoUrl,
    video_type: videoType,
    rival_name: rivalName || null,
    match_date: matchDate || null,
    description: description || null,
  })
  
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

export async function createAnnotation(formData: FormData) {
  const supabase = await createClient()
  
  const matchId = formData.get('match_id') as string
  const body = formData.get('body') as string
  const timestamp = parseInt(formData.get('timestamp_seconds') as string)
  const tagsRaw = formData.get('tags') as string
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data: editor } = await supabase
    .from('editors')
    .select('id')
    .eq('user_id', user.id)
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
  
  if (annotation && tagsRaw) {
    const tagNames = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    for (const tagName of tagNames) {
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .single()
      
      let tagId: string
      if (existingTag) {
        tagId = existingTag.id
      } else {
        const { data: newTag } = await supabase.from('tags').insert({ name: tagName }).select().single()
        if (!newTag) continue
        tagId = newTag.id
      }
      
      await supabase.from('annotation_tags').insert({
        annotation_id: annotation.id,
        tag_id: tagId,
      })
    }
  }
  
  revalidatePath(`/partidos/${matchId}`)
}
