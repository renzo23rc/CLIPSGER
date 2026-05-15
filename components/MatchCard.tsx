"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Trophy, ChevronRight } from "lucide-react";
import { Partido } from "@/lib/data";

interface MatchCardProps {
  partido: Partido;
  index?: number;
}

export default function MatchCard({ partido, index = 0 }: MatchCardProps) {
  const fecha = new Date(partido.fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={`/partidos/${partido.id}`}>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
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
              whileHover={{ scale: 1.1 }}
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
