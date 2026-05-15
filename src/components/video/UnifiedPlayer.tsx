'use client'

interface Props {
  videoUrl: string;
  type: 'youtube' | 'mp4';
}

export function UnifiedPlayer({ videoUrl, type }: Props) {
  if (type === 'mp4') {
    return (
      <video data-testid="html5-player" controls className="w-full aspect-video">
        <source src={videoUrl} type="video/mp4" />
      </video>
    );
  }

  return (
    <iframe
      data-testid="youtube-player"
      className="w-full aspect-video"
      src={`https://www.youtube.com/embed/${videoUrl}?enablejsapi=1`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
