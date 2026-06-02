"use client";

import { motion } from "framer-motion";
import {
  Target, Shield, Swords, Goal, Eye, Activity,
  BarChart3, TrendingUp, Timer, BookOpen,
} from "lucide-react";
import type {
  AdvancedStatsV1,
  AdvancedStatsEquipo,
  AdvancedStatsJugador,
  AdvancedStatsArquero,
} from "@/lib/data";

interface Props {
  stats: AdvancedStatsV1;
}

export default function AdvancedStatsViewer({ stats }: Props) {
  if (!stats?.equipos?.length) return null;

  return (
    <div className="space-y-6">
      {stats.equipos.map((equipo, i) => (
        <EquipoSection key={i} equipo={equipo} index={i} />
      ))}
      <LegendSection />
    </div>
  );
}

function LegendSection() {
  const legendItems = [
    { code: "A", desc: "Action shot — tiro en jugada abierta" },
    { code: "C", desc: "Centre shot — tiro del centro (boya)" },
    { code: "D", desc: "Driving shot — tiro en penetración" },
    { code: "X", desc: "Extra player shot — tiro en superioridad numérica" },
    { code: "6m", desc: "6 metre shot — tiro libre directo desde 6m" },
    { code: "PS", desc: "Penalty shot — penal de 5m" },
    { code: "CA", desc: "Counter attack shot — tiro de contraataque" },
    { code: "AA", desc: "All action shots — suma de A + C + D + 6m + CA" },
    { code: "EPS", desc: "Extra Player Situation — situación de power play" },
    { code: "TO", desc: "Turnover — pérdida de posesión" },
    { code: "ST", desc: "Steal — robo de pelota" },
    { code: "RB", desc: "Rebound — rebote" },
    { code: "BL", desc: "Blocked shot — bloqueo de tiro" },
    { code: "SP", desc: "Sprint — sprint ganado / total (salto inicial)" },
    { code: "CP", desc: "Centre forward position exclusion — exclusión del boya" },
    { code: "FP", desc: "Field exclusion — exclusión en el campo" },
    { code: "DS", desc: "Driving situation exclusion — exclusión en penetración" },
    { code: "M6", desc: "Exclusion in 6m — exclusión en tiro libre de 6m" },
    { code: "CS", desc: "Counter attacking exclusion — exclusión en contraataque" },
    { code: "DE", desc: "Double exclusion — doble exclusión" },
    { code: "P", desc: "Penalty foul — falta que concede penal" },
    { code: "EX", desc: "Exclusion — exclusión temporal (S: con cambio, N: sin cambio 4')" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <details className="group">
        <summary className="flex items-center gap-2 p-4 cursor-pointer hover:bg-muted/20 transition-colors">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold">Guía de abreviaturas</span>
          <span className="ml-auto text-xs text-muted-foreground group-open:hidden">Expandir</span>
          <span className="ml-auto text-xs text-muted-foreground hidden group-open:inline">Cerrar</span>
        </summary>
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
            {legendItems.map((item) => (
              <div key={item.code} className="flex gap-2 py-0.5 text-xs">
                <code className="font-bold text-primary shrink-0 w-8">{item.code}</code>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </details>
    </motion.div>
  );
}

function EquipoSection({ equipo, index }: { equipo: AdvancedStatsEquipo; index: number }) {
  const isLocal = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="p-4 border-b border-border flex items-center gap-2">
        <span className="text-lg font-bold">{equipo.nombre}</span>
        <span className="text-xs text-muted-foreground">({equipo.pais})</span>
      </div>

      <div className="p-4 space-y-6">
        {/* Team summary cards */}
        <TeamTotalsCards equipo={equipo} />

        {/* Shot type breakdown per player */}
        <PlayerShotTable jugadores={equipo.jugadores} />

        {/* Goalkeeper stats */}
        {equipo.arqueros.length > 0 && (
          <GoalieTable arqueros={equipo.arqueros} />
        )}
      </div>
    </motion.div>
  );
}

function TeamTotalsCards({ equipo }: { equipo: AdvancedStatsEquipo }) {
  const jug = equipo.jugadores;
  const team = equipo.equipo;

  const totalGoles = jug.reduce((s, j) => s + j.tiros.total.goles, 0);
  const totalTiros = jug.reduce((s, j) => s + j.tiros.total.tiros, 0);
  const efectividad = totalTiros > 0 ? Math.round((totalGoles / totalTiros) * 100) : 0;

  const shotTypes = ["A", "C", "D", "X", "6m", "PS", "CA"] as const;
  const shotLabels: Record<string, string> = {
    A: "Action", C: "Centre", D: "Driving", X: "Extra Player",
    "6m": "6m", PS: "Penalty", CA: "Counter Attack",
  };

  const typeTotals: Record<string, { g: number; t: number }> = {};
  for (const st of shotTypes) {
    typeTotals[st] = { g: 0, t: 0 };
  }
  for (const j of jug) {
    for (const st of shotTypes) {
      const s = j.tiros[st];
      if (s) { typeTotals[st].g += s.goles; typeTotals[st].t += s.tiros; }
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <StatCard icon={Goal} label="Goles" value={totalGoles} color="text-yellow-500" bg="bg-yellow-500/10" />
        <StatCard icon={Target} label="Tiros" value={totalTiros} color="text-cyan-400" bg="bg-cyan-400/10" />
        <StatCard icon={TrendingUp} label="Efectividad" value={`${efectividad}%`} color="text-emerald-400" bg="bg-emerald-400/10" />
        <StatCard icon={Activity} label="Robos" value={team.robos} color="text-green-400" bg="bg-green-400/10" />
        <StatCard icon={Shield} label="Bloqueos" value={team.bloqueos} color="text-purple-400" bg="bg-purple-400/10" />
        <StatCard icon={Swords} label="Rebotes" value={team.rebotes} color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard icon={Timer} label="Timeouts" value={team.timeouts} color="text-orange-400" bg="bg-orange-400/10" />
      </div>

      {/* Shot type breakdown */}
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Tiros por tipo
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {shotTypes.map((st) => {
            const t = typeTotals[st];
            if (t.t === 0) return null;
            const pct = Math.round((t.g / t.t) * 100);
            return (
              <div key={st} className="text-xs">
                <span className="text-muted-foreground">{shotLabels[st]}: </span>
                <span className="font-bold text-foreground">
                  {t.g}/{t.t}
                </span>
                <span className="text-muted-foreground ml-1">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; color: string; bg: string;
}) {
  return (
    <div className={`rounded-lg ${bg} border border-border/50 p-3 text-center`}>
      <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

const SHOT_COLORS: Record<string, string> = {
  A: "text-blue-400", C: "text-purple-400", D: "text-yellow-400",
  X: "text-orange-400", "6m": "text-pink-400", PS: "text-red-400", CA: "text-emerald-400",
};

function PlayerShotTable({ jugadores }: { jugadores: AdvancedStatsJugador[] }) {
  const shotTypes = ["A", "C", "D", "X", "6m", "PS", "CA"] as const;

  if (!jugadores.length) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        Tiros por jugador y tipo
      </h4>
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-2 text-left font-medium text-muted-foreground">#</th>
              <th className="p-2 text-left font-medium text-muted-foreground">Jugador</th>
              <th className="p-2 text-center font-medium text-muted-foreground">Tpo</th>
              <th className="p-2 text-center font-medium text-muted-foreground" colSpan={2}>Total</th>
              {shotTypes.map((st) => (
                <th key={st} className={`p-2 text-center font-medium ${SHOT_COLORS[st]}`}>{st}</th>
              ))}
            </tr>
            <tr className="border-b border-border/50 bg-muted/30 text-[10px]">
              <th colSpan={3} />
              <th colSpan={2} className="p-1 text-center text-muted-foreground font-medium">G/Sh</th>
              {shotTypes.map((st) => (
                <th key={`sh-${st}`} className={`p-1 text-center text-muted-foreground font-medium ${SHOT_COLORS[st]}`}>G/Sh</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jugadores.map((j, idx) => {
              const pct = j.tiros.total.porcentaje;
              return (
                <motion.tr
                  key={`${j.numero}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-2 text-muted-foreground">{j.numero}</td>
                  <td className="p-2 font-medium whitespace-nowrap">
                    {j.titular && <span className="text-primary mr-1">★</span>}
                    {j.nombre}
                  </td>
                  <td className="p-2 text-muted-foreground text-[10px]">{j.tiempoJugado}</td>
                  <td className={`p-2 text-center font-bold ${pct >= 50 ? "text-emerald-400" : pct >= 25 ? "text-yellow-400" : "text-red-400"}`}>
                    {j.tiros.total.goles}
                  </td>
                  <td className="p-2 text-center text-muted-foreground text-[10px]">
                    /{j.tiros.total.tiros}
                  </td>
                  {shotTypes.map((st) => {
                    const s = j.tiros[st];
                    return (
                      <td key={st} className={`p-2 text-center ${SHOT_COLORS[st]}`}>
                        {s ? `${s.goles}/${s.tiros}` : "—"}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Personal Fouls */}
      <FoulsTable jugadores={jugadores} />
    </div>
  );
}

const FOUL_LABELS: Record<string, string> = {
  TO: "TO", ST: "ST", RB: "RB", BL: "BL", SP: "SP",
  CP: "CP", FP: "FP", DS: "DS", M6: "M6",
  CS: "CS", DE: "DE", P: "P", EX: "EX",
};

const FOUL_TOOLTIPS: Record<string, string> = {
  TO: "Turnovers", ST: "Steals", RB: "Rebounds", BL: "Blocked shots",
  SP: "Sprints", CP: "Centre forward exclusion", FP: "Field exclusion",
  DS: "Driving exclusion", M6: "Exclusion 6m", CS: "Counterattack exclusion",
  DE: "Double exclusion", P: "Penalty foul", EX: "Exclusion",
};

function FoulsTable({ jugadores }: { jugadores: AdvancedStatsJugador[] }) {
  const foulKeys = ["TO", "ST", "RB", "BL", "SP", "CP", "FP", "DS", "M6", "CS", "DE", "P", "EX"];

  // Check if any player has foul data
  const hasFouls = jugadores.some((j) => Object.keys(j.faltas).length > 0);
  if (!hasFouls) return null;

  return (
    <div className="mt-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Faltas personales
      </h4>
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-2 text-left font-medium text-muted-foreground w-8">#</th>
              <th className="p-2 text-left font-medium text-muted-foreground">Jugador</th>
              {foulKeys.map((key) => (
                <th
                  key={key}
                  className="p-2 text-center font-medium text-muted-foreground cursor-help"
                  title={FOUL_TOOLTIPS[key]}
                >
                  {FOUL_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jugadores.map((j, idx) => {
              const hasAny = foulKeys.some((k) => (j.faltas[k] ?? 0) > 0);
              if (!hasAny) return null;
              return (
                <motion.tr
                  key={`fouls-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-2 text-muted-foreground">{j.numero}</td>
                  <td className="p-2 font-medium whitespace-nowrap">{j.nombre}</td>
                  {foulKeys.map((key) => (
                    <td key={key} className="p-2 text-center">
                      {(j.faltas[key] ?? 0) > 0 ? j.faltas[key] : "—"}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GoalieTable({ arqueros }: { arqueros: AdvancedStatsArquero[] }) {
  const shotTypes = ["A", "C", "D", "X", "6m", "PS", "CA"] as const;
  const shotLabels: Record<string, string> = {
    A: "Action", C: "Centre", D: "Driving", X: "Extra Player",
    "6m": "6m", PS: "Penalty", CA: "C.Attack",
  };

  if (!arqueros.length) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Eye className="h-4 w-4 text-emerald-400" />
        Arqueros — Atajadas por tipo
      </h4>
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-2 text-left font-medium text-muted-foreground">#</th>
              <th className="p-2 text-left font-medium text-muted-foreground">Arquero</th>
              <th className="p-2 text-center font-medium text-muted-foreground" colSpan={2}>Total</th>
              {shotTypes.map((st) => (
                <th key={st} className={`p-2 text-center font-medium ${SHOT_COLORS[st]}`}>
                  <span className="hidden sm:inline">{shotLabels[st]}</span>
                  <span className="sm:hidden">{st}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {arqueros.map((g, idx) => {
              const t = g.atajadas.total;
              const pct = t.porcentaje;
              return (
                <motion.tr
                  key={`gk-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-2 text-muted-foreground">{g.numero}</td>
                  <td className="p-2 font-medium whitespace-nowrap">{g.nombre}</td>
                  <td className={`p-2 text-center font-bold ${pct >= 50 ? "text-emerald-400" : pct >= 30 ? "text-yellow-400" : "text-red-400"}`}>
                    {t.atajadas}
                  </td>
                  <td className="p-2 text-center text-muted-foreground text-[10px]">
                    /{t.tiros}
                  </td>
                  {shotTypes.map((st) => {
                    const a = g.atajadas[st as keyof typeof g.atajadas];
                    return (
                      <td key={st} className={`p-2 text-center ${SHOT_COLORS[st]}`}>
                        {a ? `${a.atajadas}/${a.tiros}` : "—"}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
