'use client'

interface Props {
  videoUrl: string;
  type: 'youtube' | 'mp4';
  startSeconds?: number;
  endSeconds?: number;
}

export function UnifiedPlayer({ videoUrl, type, startSeconds, endSeconds }: Props) {
  if (type === 'mp4') {
    const fragment = startSeconds != null
      ? `#t=${startSeconds}${endSeconds != null ? ',' + endSeconds : ''}`
      : ''
    return (
      <video data-testid="html5-player" controls className="w-full aspect-video">
        <source src={`${videoUrl}${fragment}`} type="video/mp4" />
      </video>
    );
  }

  const params = new URLSearchParams()
  params.set('enablejsapi', '1')
  if (startSeconds != null) params.set('start', String(startSeconds))
  if (endSeconds != null) params.set('end', String(endSeconds))

  return (
    <iframe
      data-testid="youtube-player"
      className="w-full aspect-video"
      src={`https://www.youtube.com/embed/${videoUrl}?${params.toString()}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
