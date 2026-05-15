"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Trophy, Target, Calendar } from "lucide-react";
import { Jugador, Partido } from "@/lib/data";

interface JugadorStats {
  jugador: Jugador;
  goles: number;
  asistencias: number;
  robos: number;
  bloqueos: number;
  partidosJugados: number;
}

export default function JugadoresPage() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [jRes, pRes] = await Promise.all([
          fetch("/api/jugadores"),
          fetch("/api/partidos"),
        ]);
        const jData = await jRes.json();
        const pData = await pRes.json();
        setJugadores(Array.isArray(jData) ? jData : jData.jugadores || []);
        setPartidos(Array.isArray(pData) ? pData : []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calcular estadísticas acumuladas
  const jugadoresConStats: JugadorStats[] = jugadores
    .map((jugador) => {
      let goles = 0;
      let asistencias = 0;
      let robos = 0;
      let bloqueos = 0;
      let partidosJugados = 0;

      partidos.forEach((partido) => {
        const stats = partido.jugadores.find(
          (j) => j.jugador.id === jugador.id
        );
        if (stats) {
          goles += stats.goles;
          asistencias += stats.asistencias;
          robos += stats.robos;
          bloqueos += stats.bloqueos;
          partidosJugados++;
        }
      });

      return { jugador, goles, asistencias, robos, bloqueos, partidosJugados };
    })
    .sort((a, b) => b.goles - a.goles);

  const posicionesColores: Record<string, string> = {
    Arquero: "bg-emerald-500/20 text-emerald-500",
    Defensa: "bg-blue-500/20 text-blue-500",
    Centro: "bg-purple-500/20 text-purple-500",
    Boya: "bg-yellow-500/20 text-yellow-500",
    Wing: "bg-orange-500/20 text-orange-500",
    "1": "bg-blue-500/20 text-blue-500",
    "2": "bg-orange-500/20 text-orange-500",
    "4": "bg-purple-500/20 text-purple-500",
    "5": "bg-green-500/20 text-green-500",
    "Marcador de boya": "bg-red-500/20 text-red-500",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Plantel</h1>
        </div>
        <p className="text-muted-foreground">
          Jugadores de Waterpolo GER - Temporada 2026
        </p>
      </motion.div>

      {loading ? (
        <div className="animate-pulse grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted" />
          ))}
        </div>
      ) : jugadoresConStats.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No hay jugadores cargados</p>
          <p className="text-sm">
            Andá al panel de admin para agregar jugadores
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jugadoresConStats.map((stats, index) => (
            <motion.div
              key={stats.jugador.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/jugadores/${stats.jugador.id}`}>
                <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl font-bold text-primary">
                      {stats.jugador.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex gap-1">
                      {stats.jugador.posiciones.map((pos) => (
                        <span
                          key={pos}
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            posicionesColores[pos] ||
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                    {stats.jugador.nombre}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                        <Trophy className="h-3 w-3" />
                        Goles
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {stats.goles}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                        <Target className="h-3 w-3" />
                        Asistencias
                      </div>
                      <p className="text-xl font-bold text-accent">
                        {stats.asistencias}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                        <Calendar className="h-3 w-3" />
                        Partidos
                      </div>
                      <p className="text-xl font-bold">
                        {stats.partidosJugados}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                        <Users className="h-3 w-3" />
                        Robos
                      </div>
                      <p className="text-xl font-bold">{stats.robos}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
