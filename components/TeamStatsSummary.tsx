"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Shield, Swords, AlertTriangle, Activity, Eye, Goal } from "lucide-react";
import { PartidoJugador } from "@/lib/data";

interface TeamStatsSummaryProps {
  jugadores: PartidoJugador[];
}

export default function TeamStatsSummary({ jugadores }: TeamStatsSummaryProps) {
  const totales = {
    goles: jugadores.reduce((sum, j) => sum + j.goles, 0),
    asistencias: jugadores.reduce((sum, j) => sum + j.asistencias, 0),
    robos: jugadores.reduce((sum, j) => sum + j.robos, 0),
    bloqueos: jugadores.reduce((sum, j) => sum + j.bloqueos, 0),
    exclusiones: jugadores.reduce((sum, j) => sum + j.exclusiones, 0),
    exclusionesGeneradas: jugadores.reduce((sum, j) => sum + j.exclusionesGeneradas, 0),
    perdidas: jugadores.reduce((sum, j) => sum + j.perdidas, 0),
    tirosTotales: jugadores.reduce((sum, j) => sum + j.tirosTotales, 0),
    atajadas: jugadores.reduce((sum, j) => sum + j.atajadas, 0),
  };

  const efectividad = totales.tirosTotales > 0
    ? ((totales.goles / totales.tirosTotales) * 100).toFixed(1)
    : "—";

  const jugadoresQueAnotaron = jugadores.filter((j) => j.goles > 0).length;

  const mvp = jugadores.reduce((max, j) => (j.goles > max.goles ? j : max), jugadores[0]);

  const stats = [
    { label: "Goles", value: totales.goles, icon: Goal, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Asistencias", value: totales.asistencias, icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Tiros Totales", value: totales.tirosTotales, icon: Target, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Efectividad", value: efectividad === "—" ? "—" : `${efectividad}%`, icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Robos", value: totales.robos, icon: Shield, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Bloqueos", value: totales.bloqueos, icon: Swords, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Exclusiones", value: totales.exclusiones, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
    { label: "Exp. Generadas", value: totales.exclusionesGeneradas, icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-400/10" },
    { label: "Pérdidas", value: totales.perdidas, icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Atajadas", value: totales.atajadas, icon: Eye, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Team totals grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-lg ${stat.bg} border border-border/50 p-3 text-center`}
            >
              <Icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Extra info row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
      >
        {jugadoresQueAnotaron > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5">
            <Goal className="h-3.5 w-3.5 text-yellow-500" />
            <span><strong className="text-foreground">{jugadoresQueAnotaron}</strong> jugadores anotaron</span>
          </span>
        )}
        {mvp && mvp.goles > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-3 py-1.5">
            <Trophy className="h-3.5 w-3.5 text-yellow-500" />
            <span>MVP: <strong className="text-yellow-500">{mvp.jugador.nombre}</strong> ({mvp.goles} goles)</span>
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
