import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const RATE_LIMIT_SECONDS = 5

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT || 'dev-salt')).digest('hex')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  const ipHash = hashIP(ip)

  const body = await request.json()
  const { match_id, author_name, timestamp_seconds, body: commentBody, parent_id } = body

  if (!match_id || !author_name || commentBody == null || timestamp_seconds == null) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  if (typeof timestamp_seconds !== 'number' || timestamp_seconds < 0) {
    return NextResponse.json({ error: 'timestamp inválido' }, { status: 400 })
  }

  if (author_name.trim().length < 2) {
    return NextResponse.json({ error: 'El nombre debe tener al menos 2 caracteres' }, { status: 400 })
  }

  const { data: recent } = await supabase
    .from('comments')
    .select('created_at')
    .eq('ip_hash', ipHash)
    .order('created_at', { ascending: false })
    .limit(1)

  if (recent && recent.length > 0) {
    const lastComment = new Date(recent[0].created_at).getTime()
    const diff = (Date.now() - lastComment) / 1000
    if (diff < RATE_LIMIT_SECONDS) {
      return NextResponse.json({ error: 'Demasiados comentarios. Esperá unos segundos.' }, { status: 429 })
    }
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      match_id,
      parent_id: parent_id || null,
      author_name: author_name.trim(),
      body: commentBody,
      timestamp_seconds,
      ip_hash: ipHash,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: comment }, { status: 201 })
}
