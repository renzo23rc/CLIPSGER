"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VideoPlayerProps {
  youtubeUrl?: string | null;
  startTime?: number;
}

type VideoSource =
  | { type: "youtube"; id: string }
  | { type: "drive"; id: string }
  | null;

function parseVideoUrl(url: string): VideoSource {
  // YouTube: watch, short, o embed
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/
  );
  if (ytMatch) return { type: "youtube", id: ytMatch[1] };

  // Google Drive: /file/d/{id}/view  o  /open?id={id}
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)\//);
  if (driveFileMatch) return { type: "drive", id: driveFileMatch[1] };

  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
  if (driveOpenMatch) return { type: "drive", id: driveOpenMatch[1] };

  return null;
}

export default function VideoPlayer({ youtubeUrl, startTime = 0 }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [source, setSource] = useState<VideoSource>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (youtubeUrl) {
      setSource(parseVideoUrl(youtubeUrl));
      setLoaded(false);
    } else {
      setSource(null);
    }
  }, [youtubeUrl]);

  // Seek a un minuto específico (solo YouTube)
  const seekTo = (seconds: number) => {
    if (iframeRef.current && source?.type === "youtube") {
      iframeRef.current.src = `https://www.youtube.com/embed/${source.id}?autoplay=1&start=${seconds}`;
    }
  };

  // Exponer seekTo globalmente para comentarios con timestamp
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).seekVideo = seekTo;
    }
  }, [source]);

  // Empty state: sin URL
  if (!source) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/60 border border-dashed border-border">
        <div className="text-center px-4">
          <svg
            className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-muted-foreground text-sm">No hay video disponible</p>
        </div>
      </div>
    );
  }

  // Loading state (se muestra mientras no ha cargado el iframe)
  const loadingOverlay = !loaded && (
    <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">
          {source.type === "drive" ? "Cargando video de Drive..." : "Cargando video..."}
        </p>
      </div>
    </div>
  );

  const embedUrl =
    source.type === "youtube"
      ? `https://www.youtube.com/embed/${source.id}?start=${startTime}`
      : `https://drive.google.com/file/d/${source.id}/preview`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="aspect-video relative">
        {loadingOverlay}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="Video del partido"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Badge indicador de la fuente */}
      <div className="absolute top-2 left-2">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            source.type === "youtube"
              ? "bg-red-600/90 text-white"
              : "bg-emerald-600/90 text-white"
          }`}
        >
          {source.type === "youtube" ? (
            <>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube
            </>
          ) : (
            <>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Drive
            </>
          )}
        </span>
      </div>
    </motion.div>
  );
}
