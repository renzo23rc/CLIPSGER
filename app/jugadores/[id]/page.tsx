"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Trophy, Target, Shield, Calendar, Activity } from "lucide-react";
import { Jugador, Partido } from "@/lib/data";

export default function JugadorDetallePage() {
  const params = useParams();
  const jugadorId = params.id as string;

  const [jugador, setJugador] = useState<Jugador | null>(null);
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

        const jugadores = Array.isArray(jData) ? jData : jData.jugadores || [];
        const partidosArr = Array.isArray(pData) ? pData : [];

        const found = jugadores.find((j: Jugador) => j.id === jugadorId);
        setJugador(found || null);
        setPartidos(partidosArr);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [jugadorId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 rounded-xl bg-muted" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!jugador) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Jugador no encontrado</h1>
          <Link href="/jugadores" className="text-primary hover:underline">
            Volver al plantel
          </Link>
        </div>
      </div>
    );
  }

  // Calcular estadísticas acumuladas
  let goles = 0;
  let asistencias = 0;
  let robos = 0;
  let bloqueos = 0;
  let exclusiones = 0;
  let turnovers = 0;
  let tirosArco = 0;
  let atajadas = 0;
  let partidosJugados = 0;

  const partidosDelJugador = partidos.filter((partido) => {
    const stats = partido.jugadores.find((j) => j.jugador.id === jugador.id);
    if (stats) {
      goles += stats.goles;
      asistencias += stats.asistencias;
      robos += stats.robos;
      bloqueos += stats.bloqueos;
      exclusiones += stats.exclusiones;
      turnovers += stats.turnovers;
      tirosArco += stats.tirosArco;
      atajadas += stats.atajadas;
      partidosJugados++;
      return true;
    }
    return false;
  });

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
        className="mb-6"
      >
        <Link
          href="/jugadores"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al plantel
        </Link>
      </motion.div>

      {/* Perfil Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            {jugador.nombre
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{jugador.nombre}</h1>
            <div className="flex gap-2 mt-2">
              {jugador.posiciones.map((pos) => (
                <span
                  key={pos}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    posicionesColores[pos] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {pos}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: "Partidos", value: partidosJugados, icon: Calendar, color: "text-blue-400" },
          { label: "Goles", value: goles, icon: Trophy, color: "text-yellow-500" },
          { label: "Asistencias", value: asistencias, icon: Target, color: "text-blue-400" },
          { label: "Robos", value: robos, icon: Shield, color: "text-green-400" },
          { label: "Bloqueos", value: bloqueos, icon: Activity, color: "text-purple-400" },
          { label: "Atajadas", value: atajadas, icon: Activity, color: "text-emerald-400" },
          { label: "Tiros al Arco", value: tirosArco, icon: Target, color: "text-cyan-400" },
          { label: "Exclusiones", value: exclusiones, icon: Activity, color: "text-red-400" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                {stat.label}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Partidos jugados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-4">Historial de Partidos</h2>
        {partidosDelJugador.length === 0 ? (
          <p className="text-muted-foreground text-sm">Este jugador no tiene partidos registrados.</p>
        ) : (
          <div className="space-y-3">
            {partidosDelJugador.map((partido, index) => {
              const stats = partido.jugadores.find(
                (j) => j.jugador.id === jugador.id
              );
              return (
                <motion.div
                  key={partido.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Link href={`/partidos/${partido.id}`}>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium">GER vs {partido.rival}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(partido.fecha).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          | {partido.torneo}
                        </p>
                      </div>
                      <div className="flex gap-3 text-sm">
                        {stats && (
                          <>
                            <span className="text-yellow-500 font-medium">
                              {stats.goles}G
                            </span>
                            <span className="text-blue-400">
                              {stats.asistencias}A
                            </span>
                            <span className="text-green-400">
                              {stats.robos}R
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
