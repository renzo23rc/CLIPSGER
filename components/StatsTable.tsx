"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { PartidoJugador } from "@/lib/data";

interface StatsTableProps {
  jugadores: PartidoJugador[];
}

export default function StatsTable({ jugadores }: StatsTableProps) {
  // Encontrar MVP (más goles)
  const mvp = jugadores.reduce((max, j) => j.goles > max.goles ? j : max, jugadores[0]);

  const stats = [
    { key: "goles", label: "G", color: "text-yellow-500" },
    { key: "asistencias", label: "A", color: "text-blue-400" },
    { key: "robos", label: "R", color: "text-green-400" },
    { key: "bloqueos", label: "B", color: "text-purple-400" },
    { key: "exclusiones", label: "E", color: "text-red-400" },
    { key: "perdidas", label: "P", color: "text-orange-400" },
    { key: "tirosTotales", label: "TOT", color: "text-cyan-400" },
    { key: "atajadas", label: "ATJ", color: "text-emerald-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-x-auto"
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Jugador</th>
            <th className="p-3 text-left text-sm font-medium text-muted-foreground">Pos</th>
            {stats.map((stat) => (
              <th key={stat.key} className="p-3 text-center text-sm font-medium text-muted-foreground w-12">
                <span className="hidden sm:inline">{stat.label}</span>
                <span className="sm:hidden text-xs">{stat.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jugadores.map((pj, index) => (
            <motion.tr
              key={pj.jugador.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                pj.jugador.id === mvp?.jugador.id ? "bg-yellow-500/5" : ""
              }`}
            >
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {pj.jugador.id === mvp?.jugador.id && (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="font-medium">{pj.jugador.nombre}</span>
                </div>
              </td>
              <td className="p-3 text-sm text-muted-foreground">
                {pj.jugador.posiciones.join(", ")}
              </td>
              <td className={`p-3 text-center font-bold ${stats[0].color}`}>{pj.goles}</td>
              <td className={`p-3 text-center ${stats[1].color}`}>{pj.asistencias}</td>
              <td className={`p-3 text-center ${stats[2].color}`}>{pj.robos}</td>
              <td className={`p-3 text-center ${stats[3].color}`}>{pj.bloqueos}</td>
              <td className={`p-3 text-center ${stats[4].color}`}>{pj.exclusiones}</td>
              <td className={`p-3 text-center ${stats[5].color}`}>{pj.perdidas}</td>
              <td className={`p-3 text-center ${stats[6].color}`}>{pj.tirosTotales}</td>
              <td className={`p-3 text-center ${stats[7].color}`}>{pj.atajadas}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
