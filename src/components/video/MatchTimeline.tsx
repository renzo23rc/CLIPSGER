'use client'

interface Marker {
  id: string
  label: string
  timestamp_seconds: number
}

interface Clip {
  id: string
  title: string
  start_seconds: number
  end_seconds: number
}

interface Props {
  markers: Marker[]
  clips: Clip[]
  currentTime: number
  onSeek: (seconds: number) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MatchTimeline({ markers, clips, currentTime, onSeek }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
        Línea de Tiempo
      </h3>
      
      {markers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Cuartos</h4>
          <div className="flex flex-wrap gap-2">
            {markers.map(m => (
              <button
                key={m.id}
                onClick={() => onSeek(m.timestamp_seconds)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  currentTime >= m.timestamp_seconds
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {m.label} ({formatTime(m.timestamp_seconds)})
              </button>
            ))}
          </div>
        </div>
      )}
      
      {clips.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2">Clips</h4>
          <div className="flex flex-wrap gap-2">
            {clips.map(c => (
              <a
                key={c.id}
                href={`/clips/${c.id}`}
                className="text-xs px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-colors"
              >
                {c.title} ({formatTime(c.start_seconds)}–{formatTime(c.end_seconds)})
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
