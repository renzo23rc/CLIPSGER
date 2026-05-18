"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, CalendarDays } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import HeroSection from "@/components/HeroSection";
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
      <div className="animate-pulse">
        <div className="h-[90vh] bg-muted" />
        <div className="container mx-auto px-4 py-8">
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
    <div>
      <HeroSection
        partidosCount={partidos.length}
        jugadoresCount={jugadores.length}
        topGoleadorGoles={statsJugadores[0]?.goles || 0}
      />

      <div className="container mx-auto px-4 py-8 space-y-12">
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
    </div>
  );
}
