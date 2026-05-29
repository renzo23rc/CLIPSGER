"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Trophy, ChevronRight } from "lucide-react";
import { Partido } from "@/lib/data";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MatchCardProps {
  partido: Partido;
  index?: number;
}

const customEaseOut = [0.23, 1, 0.32, 1] as const;

export default function MatchCard({ partido, index = 0 }: MatchCardProps) {
  const reduced = useReducedMotion();

  const fecha = new Date(partido.fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, transform: "translateY(20px)" }
      }
      whileInView={{ opacity: 1, transform: "translateY(0)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduced
          ? { duration: 0.3 }
          : { delay: index * 0.06, duration: 0.25, ease: customEaseOut }
      }
    >
      <Link href={`/partidos/${partido.id}`}>
        <div className="press-feedback group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-[2px]">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{fecha}</span>
                <span className="text-border">|</span>
                <span>{partido.torneo}</span>
              </div>

              <h3 className="text-xl font-bold text-foreground">
                GER <span className="text-primary">vs</span> {partido.rival}
              </h3>

              {partido.resultado && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-primary">
                    {partido.resultado}
                  </span>
                </div>
              )}
            </div>

            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
              whileHover={
                reduced ? undefined : { transform: "scale(1.05)" }
              }
              transition={{ duration: 0.16, ease: customEaseOut }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{partido.jugadores.length} jugadores</span>
            <span>{partido.comentarios.length} comentarios</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
