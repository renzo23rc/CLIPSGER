"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VideoPlayerProps {
  youtubeUrl?: string | null;
  startTime?: number;
}

export default function VideoPlayer({ youtubeUrl, startTime = 0 }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoId, setVideoId] = useState<string>("");

  useEffect(() => {
    if (youtubeUrl) {
      // Extraer video ID de diferentes formatos de URL
      const match = youtubeUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/
      );
      if (match) {
        setVideoId(match[1]);
      }
    }
  }, [youtubeUrl]);

  // Función para saltar a un tiempo específico
  const seekTo = (seconds: number) => {
    if (iframeRef.current && videoId) {
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${seconds}`;
    }
  };

  // Exponer la función globalmente para que los comentarios la usen
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).seekVideo = seekTo;
    }
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted border border-border">
        <div className="text-center">
          <p className="text-muted-foreground">No hay video disponible</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="aspect-video">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?start=${startTime}`}
          title="Video del partido"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </motion.div>
  );
}
