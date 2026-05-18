"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Users, CalendarDays } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import { Partido, Jugador } from "@/lib/data";

export default function HomePage() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, jRes] = await Promise.all([
          fetch("/api/partidos"),
          fetch("/api/jugadores"),
        ]);
        const pData = await pRes.json();
        const jData = await jRes.json();
        setPartidos(Array.isArray(pData) ? pData : []);
        setJugadores(Array.isArray(jData) ? jData : []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const ultimosPartidos = partidos.slice(0, 3);

  // Calcular top goleadores
  const statsJugadores = jugadores
    .map((jugador) => {
      let goles = 0;
      let partidosJugados = 0;

      partidos.forEach((partido) => {
        const stats = partido.jugadores.find(
          (j) => j.jugador.id === jugador.id
        );
        if (stats) {
          goles += stats.goles;
          partidosJugados++;
        }
      });

      return { jugador, goles, partidosJugados };
    })
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-2xl bg-muted" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-border p-8 md:p-12"
      >
        <Image
          src="/header-bg.jpg"
          alt="Waterpolo GER"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Trophy className="h-4 w-4" />
            Temporada 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
          >
            Waterpolo{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GER
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-muted-foreground mb-6"
          >
            Gimnasia y Esgrima de Rosario. Seguimos cada partido, cada jugada,
            cada gol.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center gap-2 rounded-lg bg-card/80 px-4 py-2 border border-border">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{partidos.length}</p>
                <p className="text-xs text-muted-foreground">Partidos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/80 px-4 py-2 border border-border">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">{jugadores.length}</p>
                <p className="text-xs text-muted-foreground">Jugadores</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/80 px-4 py-2 border border-border">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">
                  {statsJugadores[0]?.goles || 0}
                </p>
                <p className="text-xs text-muted-foreground">Goles líder</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
      </motion.section>

      {/* Últimos Partidos */}
      <section>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 flex items-center gap-3"
        >
          <CalendarDays className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Últimos Partidos</h2>
        </motion.div>

        {partidos.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No hay partidos cargados</p>
            <p className="text-sm">
              Andá al panel de admin para cargar tu primer partido
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ultimosPartidos.map((partido, index) => (
              <MatchCard key={partido.id} partido={partido} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Top Goleadores */}
      <section>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-6 flex items-center gap-3"
        >
          <TrendingUp className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Top Goleadores</h2>
        </motion.div>

        {statsJugadores.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No hay estadísticas</p>
            <p className="text-sm">
              Cargá stats de jugadores desde el panel de admin
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-border bg-muted/50">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-7">Jugador</div>
              <div className="col-span-2 text-center">Partidos</div>
              <div className="col-span-2 text-center">Goles</div>
            </div>

            {statsJugadores.map((stat, index) => (
              <motion.div
                key={stat.jugador.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-1 text-center">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-500/20 text-yellow-500"
                        : index === 1
                        ? "bg-gray-400/20 text-gray-400"
                        : index === 2
                        ? "bg-orange-700/20 text-orange-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="col-span-7">
                  <p className="font-medium">{stat.jugador.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.jugador.posiciones.join(", ")}
                  </p>
                </div>
                <div className="col-span-2 text-center text-muted-foreground">
                  {stat.partidosJugados}
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-lg font-bold text-primary">
                    {stat.goles}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
