interface Tag {
  id: string
  name: string
}

interface Annotation {
  id: string
  body: string
  timestamp_seconds: number
  editor_id: string
  tags: Tag[]
}

interface Props {
  annotations: Annotation[]
  onSeek: (seconds: number) => void
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AnnotationSection({ annotations, onSeek }: Props) {
  if (annotations.length === 0) return null

  const sorted = [...annotations].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds)

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Anotaciones del Cuerpo Técnico</h3>
      <div className="space-y-2">
        {sorted.map(a => (
          <div key={a.id} className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex gap-2 items-baseline flex-wrap">
              <button
                type="button"
                onClick={() => onSeek(a.timestamp_seconds)}
                className="text-xs text-blue-600 hover:underline font-mono font-bold"
              >
                [{fmt(a.timestamp_seconds)}]
              </button>
              {a.tags.map(t => (
                <span key={t.id} className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                  {t.name}
                </span>
              ))}
            </div>
            <p className="text-sm mt-1">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
