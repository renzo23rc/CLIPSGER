"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  TrendingUp,
  Trophy,
  Users,
  Target,
  Calendar,
  BarChart3,
  Shield,
  Goal,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Partido } from "@/lib/data";

interface JugadorStats {
  jugadorId: string;
  nombre: string;
  posiciones: string[];
  goles: number;
  asistencias: number;
  robos: number;
  bloqueos: number;
  exclusiones: number;
  perdidas: number;
  tirosTotales: number;
  atajadas: number;
  partidosJugados: number;
}

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

const statColumns = [
  { key: "goles", label: "G", color: "text-yellow-500" },
  { key: "asistencias", label: "A", color: "text-blue-400" },
  { key: "robos", label: "R", color: "text-green-400" },
  { key: "bloqueos", label: "B", color: "text-purple-400" },
  { key: "exclusiones", label: "E", color: "text-red-400" },
  { key: "perdidas", label: "P", color: "text-orange-400" },
  { key: "tirosTotales", label: "TOT", color: "text-cyan-400" },
  { key: "atajadas", label: "ATJ", color: "text-emerald-400" },
  { key: "partidosJugados", label: "PJ", color: "text-muted-foreground" },
];

function computeJugadorStats(partidos: Partido[]): JugadorStats[] {
  const map = new Map<string, JugadorStats>();

  for (const partido of partidos) {
    for (const pj of partido.jugadores) {
      const id = pj.jugador.id;
      if (!map.has(id)) {
        map.set(id, {
          jugadorId: id,
          nombre: pj.jugador.nombre,
          posiciones: pj.jugador.posiciones,
          goles: 0,
          asistencias: 0,
          robos: 0,
          bloqueos: 0,
          exclusiones: 0,
          perdidas: 0,
          tirosTotales: 0,
          atajadas: 0,
          partidosJugados: 0,
        });
      }
      const stats = map.get(id)!;
      stats.goles += pj.goles;
      stats.asistencias += pj.asistencias;
      stats.robos += pj.robos;
      stats.bloqueos += pj.bloqueos;
      stats.exclusiones += pj.exclusiones;
      stats.perdidas += pj.perdidas;
      stats.tirosTotales += pj.tirosTotales;
      stats.atajadas += pj.atajadas;
      stats.partidosJugados += 1;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.goles - a.goles);
}

interface PartidoAgg {
  partidoId: string;
  rival: string;
  fecha: string;
  fechaObj: Date;
  goles: number;
  asistencias: number;
  robos: number;
  bloqueos: number;
  exclusiones: number;
  perdidas: number;
  tirosTotales: number;
  atajadas: number;
}

function computePartidoAggs(partidos: Partido[]): PartidoAgg[] {
  return partidos.map((p) => {
    const totales = p.jugadores.reduce(
      (acc, j) => ({
        goles: acc.goles + j.goles,
        asistencias: acc.asistencias + j.asistencias,
        robos: acc.robos + j.robos,
        bloqueos: acc.bloqueos + j.bloqueos,
        exclusiones: acc.exclusiones + j.exclusiones,
        perdidas: acc.perdidas + j.perdidas,
        tirosTotales: acc.tirosTotales + j.tirosTotales,
        atajadas: acc.atajadas + j.atajadas,
      }),
      {
        goles: 0, asistencias: 0, robos: 0, bloqueos: 0,
        exclusiones: 0, perdidas: 0, tirosTotales: 0, atajadas: 0,
      }
    );
    return {
      partidoId: p.id,
      rival: p.rival,
      fecha: p.fecha,
      fechaObj: new Date(p.fecha),
      ...totales,
    };
  }).sort((a, b) => b.fechaObj.getTime() - a.fechaObj.getTime());
}

interface TeamTotals {
  goles: number;
  asistencias: number;
  robos: number;
  bloqueos: number;
  exclusiones: number;
  perdidas: number;
  tirosTotales: number;
  atajadas: number;
  efectividad: string;
  partidosJugados: number;
  jugadoresQueAnotaron: number;
}

function computeTeamTotals(partidos: Partido[]): TeamTotals {
  const totales = partidos.reduce(
    (acc, p) => {
      const totals = p.jugadores.reduce(
        (t, j) => ({
          goles: t.goles + j.goles,
          asistencias: t.asistencias + j.asistencias,
          robos: t.robos + j.robos,
          bloqueos: t.bloqueos + j.bloqueos,
          exclusiones: t.exclusiones + j.exclusiones,
          perdidas: t.perdidas + j.perdidas,
          tirosTotales: t.tirosTotales + j.tirosTotales,
          atajadas: t.atajadas + j.atajadas,
        }),
        {
          goles: 0, asistencias: 0, robos: 0, bloqueos: 0,
          exclusiones: 0, perdidas: 0, tirosTotales: 0, atajadas: 0,
        }
      );
      return {
        goles: acc.goles + totals.goles,
        asistencias: acc.asistencias + totals.asistencias,
        robos: acc.robos + totals.robos,
        bloqueos: acc.bloqueos + totals.bloqueos,
        exclusiones: acc.exclusiones + totals.exclusiones,
        perdidas: acc.perdidas + totals.perdidas,
        tirosTotales: acc.tirosTotales + totals.tirosTotales,
        atajadas: acc.atajadas + totals.atajadas,
        partidosJugados: acc.partidosJugados + 1,
      };
    },
    {
      goles: 0, asistencias: 0, robos: 0, bloqueos: 0,
      exclusiones: 0, perdidas: 0, tirosTotales: 0, atajadas: 0,
      partidosJugados: 0,
    }
  );

  // Unique players who scored
  const anotaron = new Set<string>();
  for (const p of partidos) {
    for (const j of p.jugadores) {
      if (j.goles > 0) anotaron.add(j.jugador.id);
    }
  }

  const efectividad =
    totales.tirosTotales > 0
      ? ((totales.goles / totales.tirosTotales) * 100).toFixed(1)
      : "—";

  return { ...totales, efectividad, jugadoresQueAnotaron: anotaron.size };
}

const PIE_COLORS = ["#c9a84c", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#6b7280"];

export default function EstadisticasPage() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/partidos");
        const data = await res.json();
        setPartidos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading partidos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const jugadoresStats = useMemo(() => computeJugadorStats(partidos), [partidos]);
  const topScorer = jugadoresStats[0];
  const partidoAggs = useMemo(() => computePartidoAggs(partidos), [partidos]);
  const teamTotals = useMemo(() => computeTeamTotals(partidos), [partidos]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Estadísticas</h1>
        </div>
        <p className="text-muted-foreground">
          Análisis de rendimiento - Temporada 2026
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          <div className="animate-pulse grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted" />
            ))}
          </div>
          <div className="animate-pulse h-96 rounded-xl bg-muted" />
        </div>
      ) : jugadoresStats.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No hay estadísticas disponibles</p>
          <p className="text-sm">
            Cargá partidos en el panel de admin para ver las estadísticas
          </p>
        </div>
      ) : (
        <Tabs defaultValue="jugador" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="jugador" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span>Por jugador</span>
            </TabsTrigger>
            <TabsTrigger value="partido" className="gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Por partido</span>
            </TabsTrigger>
            <TabsTrigger value="totales" className="gap-1.5">
              <Shield className="h-4 w-4" />
              <span>Totales</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── Por jugador ─── */}
          <TabsContent value="jugador" className="space-y-6">
            {topScorer && (
              <div className="grid gap-4 md:grid-cols-3">
                <motion.div
                  initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Goleador
                  </div>
                  <p className="text-xl font-bold">{topScorer.nombre}</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {topScorer.goles}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      goles
                    </span>
                  </p>
                </motion.div>

                <motion.div
                  initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    Jugadores
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {jugadoresStats.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    con estadísticas registradas
                  </p>
                </motion.div>

                <motion.div
                  initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Target className="h-4 w-4 text-green-400" />
                    Goles del equipo
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {jugadoresStats.reduce((s, j) => s + j.goles, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    en {partidos.length} partidos
                  </p>
                </motion.div>
              </div>
            )}

            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.25, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold">
                  Tabla de estadísticas por jugador
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ordenado por goles descendente. Promedios entre paréntesis.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Jugador
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap">
                        Pos
                      </th>
                      {statColumns.map((stat) => (
                        <th
                          key={stat.key}
                          className="p-3 text-center text-sm font-medium text-muted-foreground whitespace-nowrap w-14"
                        >
                          <span className="hidden sm:inline">{stat.label}</span>
                          <span className="sm:hidden text-xs">{stat.label}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jugadoresStats.map((stats, index) => (
                      <motion.tr
                        key={stats.jugadorId}
                        initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateX(-10px)" }}
                        whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateX(0px)" }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
                            )}
                            <span className="font-medium">{stats.nombre}</span>
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex gap-1">
                            {stats.posiciones.map((pos) => (
                              <span
                                key={pos}
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  posicionesColores[pos] ||
                                  "bg-muted text-muted-foreground"
                                }`}
                              >
                                {pos}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className={`p-3 text-center font-bold ${statColumns[0].color}`}>
                          {stats.goles}
                          {stats.partidosJugados > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {(stats.goles / stats.partidosJugados).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-center ${statColumns[1].color}`}>
                          {stats.asistencias}
                          {stats.partidosJugados > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {(stats.asistencias / stats.partidosJugados).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-center ${statColumns[2].color}`}>
                          {stats.robos}
                          {stats.partidosJugados > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {(stats.robos / stats.partidosJugados).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-center ${statColumns[3].color}`}>
                          {stats.bloqueos}
                          {stats.partidosJugados > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {(stats.bloqueos / stats.partidosJugados).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-center ${statColumns[4].color}`}>
                          {stats.exclusiones}
                          {stats.partidosJugados > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {(stats.exclusiones / stats.partidosJugados).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-center ${statColumns[5].color}`}>
                          {stats.perdidas}
                          {stats.partidosJugados > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {(stats.perdidas / stats.partidosJugados).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-center ${statColumns[6].color}`}>
                          {stats.tirosTotales}
                          {stats.partidosJugados > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {(stats.tirosTotales / stats.partidosJugados).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-center ${statColumns[7].color}`}>
                          {stats.atajadas}
                          {stats.partidosJugados > 0 && (
                            <span className="block text-[10px] font-normal text-muted-foreground">
                              {(stats.atajadas / stats.partidosJugados).toFixed(1)}
                            </span>
                          )}
                        </td>
                        <td className={`p-3 text-center ${statColumns[8].color}`}>
                          {stats.partidosJugados}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabsContent>

          {/* ─── Por partido ─── */}
          <TabsContent value="partido" className="space-y-6">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                {/* Bar chart: goles por partido */}
                <motion.div
                  initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Goles por partido
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={partidoAggs}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="rival"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar dataKey="goles" fill="#c9a84c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Line chart: tendencia de goles */}
                <motion.div
                  initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Tendencia de goles
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={[...partidoAggs].reverse()}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="rival"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="goles"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ fill: "#60a5fa", strokeWidth: 0, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Tabla resumen por partido */}
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="mt-6 rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="p-4 border-b border-border">
                  <h3 className="text-lg font-semibold">Resumen por partido</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="p-3 text-left text-sm font-medium text-muted-foreground">Rival</th>
                        <th className="p-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                        {statColumns.filter(s => s.key !== "partidosJugados").map((s) => (
                          <th key={s.key} className="p-3 text-center text-sm font-medium text-muted-foreground w-12">
                            {s.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {partidoAggs.map((pa, i) => (
                        <motion.tr
                          key={pa.partidoId}
                          initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateX(-10px)" }}
                          whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateX(0px)" }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 font-medium whitespace-nowrap">{pa.rival}</td>
                          <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                            {pa.fechaObj.toLocaleDateString("es-AR", {
                              day: "numeric", month: "short",
                            })}
                          </td>
                          <td className={`p-3 text-center font-bold ${statColumns[0].color}`}>{pa.goles}</td>
                          <td className={`p-3 text-center ${statColumns[1].color}`}>{pa.asistencias}</td>
                          <td className={`p-3 text-center ${statColumns[2].color}`}>{pa.robos}</td>
                          <td className={`p-3 text-center ${statColumns[3].color}`}>{pa.bloqueos}</td>
                          <td className={`p-3 text-center ${statColumns[4].color}`}>{pa.exclusiones}</td>
                          <td className={`p-3 text-center ${statColumns[5].color}`}>{pa.perdidas}</td>
                          <td className={`p-3 text-center ${statColumns[6].color}`}>{pa.tirosTotales}</td>
                          <td className={`p-3 text-center ${statColumns[7].color}`}>{pa.atajadas}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ─── Totales ─── */}
          <TabsContent value="totales" className="space-y-6">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* MVP card */}
              {topScorer && (
                <motion.div
                  initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent p-5 mb-6"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">MVP de la Temporada</p>
                      <p className="text-xl font-bold text-yellow-500">{topScorer.nombre}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-3xl font-bold text-yellow-500">{topScorer.goles}</p>
                      <p className="text-sm text-muted-foreground">goles</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Goles", value: teamTotals.goles, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                  { label: "Asistencias", value: teamTotals.asistencias, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Robos", value: teamTotals.robos, color: "text-green-400", bg: "bg-green-400/10" },
                  { label: "Bloqueos", value: teamTotals.bloqueos, color: "text-purple-400", bg: "bg-purple-400/10" },
                  { label: "Tiros", value: teamTotals.tirosTotales, color: "text-cyan-400", bg: "bg-cyan-400/10" },
                  { label: "Efectividad", value: `${teamTotals.efectividad}%`, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { label: "Exclusiones", value: teamTotals.exclusiones, color: "text-red-400", bg: "bg-red-400/10" },
                  { label: "Atajadas", value: teamTotals.atajadas, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "scale(0.95)" }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "scale(1)" }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className={`rounded-lg ${stat.bg} border border-border/50 p-3 text-center`}
                  >
                    <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Pie chart: distribución de goles + extra info */}
              <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                  initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateY(20px)" }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateY(0px)" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Distribución de goles
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          const top5 = jugadoresStats.slice(0, 5).map((j) => ({
                            name: j.nombre.split(" ")[0],
                            value: j.goles,
                          }));
                          const otrosGoles = jugadoresStats.slice(5).reduce((s, j) => s + j.goles, 0);
                          if (otrosGoles > 0) top5.push({ name: "Otros", value: otrosGoles });
                          return top5;
                        })()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {jugadoresStats.slice(0, 5).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                        {jugadoresStats.length > 5 && (
                          <Cell fill={PIE_COLORS[5]} />
                        )}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <div className="space-y-3">
                  <motion.div
                    initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateX(20px)" }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateX(0px)" }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <Activity className="h-4 w-4" />
                      Resumen de temporada
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Partidos jugados</span>
                        <span className="font-bold">{teamTotals.partidosJugados}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Promedio de goles x partido</span>
                        <span className="font-bold">
                          {teamTotals.partidosJugados > 0
                            ? (teamTotals.goles / teamTotals.partidosJugados).toFixed(1)
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jugadores que anotaron</span>
                        <span className="font-bold">{teamTotals.jugadoresQueAnotaron}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Efectividad de tiro</span>
                        <span className="font-bold text-emerald-400">{teamTotals.efectividad}%</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={shouldReduceMotion ? undefined : { opacity: 0, transform: "translateX(20px)" }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, transform: "translateX(0px)" }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                      <Goal className="h-4 w-4 text-yellow-500" />
                      Top 3 goleadores
                    </div>
                    <div className="space-y-2">
                      {jugadoresStats.slice(0, 3).map((j, i) => (
                        <div key={j.jugadorId} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-700"}`}>
                              #{i + 1}
                            </span>
                            <span className="text-sm">{j.nombre}</span>
                          </div>
                          <span className="text-sm font-bold">{j.goles} goles</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
