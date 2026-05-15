'use client'

import { useState } from 'react'

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

  async function submitComment() {
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
        parent_id: replyTo || null,
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
            type="button"
            onClick={() => onSeek(currentTimestamp)}
            className="text-xs text-blue-600 hover:underline"
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
          onClick={submitComment}
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
                <button type="button" onClick={() => onSeek(c.timestamp_seconds)} className="text-xs text-blue-600 hover:underline font-mono">
                  [{fmt(c.timestamp_seconds)}]
                </button>
                <span className="text-xs text-gray-400">{c.author_name}</span>
              </div>
              <p className="text-sm mt-1">{c.body}</p>
              <button
                type="button"
                onClick={() => { setReplyTo(c.id); setCurrentTimestamp(c.timestamp_seconds) }}
                className="text-xs text-gray-400 hover:text-blue-600 mt-1"
              >
                Responder
              </button>
            </div>
            {c.replies?.map(r => (
              <div key={r.id} className="bg-gray-50 border rounded p-3 ml-6">
                <div className="flex gap-2 items-baseline">
                  <button type="button" onClick={() => onSeek(r.timestamp_seconds)} className="text-xs text-blue-600 hover:underline font-mono">
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
