"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Jugador } from "@/lib/data";

interface RosterListProps {
  jugadores: Jugador[];
}

export default function RosterList({ jugadores }: RosterListProps) {
  const posicionesColores: Record<string, string> = {
    "Arquero": "bg-emerald-500/20 text-emerald-500",
    "Defensa": "bg-blue-500/20 text-blue-500",
    "Centro": "bg-purple-500/20 text-purple-500",
    "Boya": "bg-yellow-500/20 text-yellow-500",
    "Wing": "bg-orange-500/20 text-orange-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {jugadores.map((jugador, index) => (
        <motion.div
          key={jugador.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{jugador.nombre}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {jugador.posiciones.map((pos) => (
                <span
                  key={pos}
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    posicionesColores[pos] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
