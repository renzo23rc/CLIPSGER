"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Clock, MessageCircle } from "lucide-react";
import { Comentario } from "@/lib/data";

interface CommentSectionProps {
  comentarios: Comentario[];
  partidoId: string;
}

export default function CommentSection({ comentarios: initialComments, partidoId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comentario[]>(initialComments);
  const [nombre, setNombre] = useState("");
  const [texto, setTexto] = useState("");
  const [minuto, setMinuto] = useState("");

  const formatMinuto = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !texto.trim() || submitting) return;

    // Convertir minuto a segundos
    let minutoSegundos = 0;
    if (minuto) {
      const parts = minuto.split(":");
      if (parts.length === 2) {
        minutoSegundos = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else {
        minutoSegundos = parseInt(minuto) * 60;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partidoId,
          autorNombre: nombre.trim(),
          texto: texto.trim(),
          minuto: minutoSegundos,
        }),
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments([savedComment, ...comments]);
        setTexto("");
        setMinuto("");
      } else {
        console.error("Error al guardar comentario");
      }
    } catch (error) {
      console.error("Error al guardar comentario:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMinutoClick = (seconds: number) => {
    if (typeof window !== "undefined" && (window as any).seekVideo) {
      (window as any).seekVideo(seconds);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Agregar comentario
        </h3>
        
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Tu nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Minuto (opcional)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={minuto}
                onChange={(e) => setMinuto(e.target.value)}
                placeholder="12:30"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Comentario</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="¿Qué te pareció la jugada?"
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
        
        <button
          type="submit"
          disabled={!nombre.trim() || !texto.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
          Comentar
        </button>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-3">
        <AnimatePresence>
          {comments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((comentario, index) => (
            <motion.div
              key={comentario.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comentario.autorNombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comentario.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comentario.texto}</p>
                </div>
                {comentario.minuto > 0 && (
                  <button
                    onClick={() => handleMinutoClick(comentario.minuto)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
                  >
                    <Clock className="h-3 w-3" />
                    {formatMinuto(comentario.minuto)}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Sé el primero en comentar</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
