"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Calendar, Trophy, FileText, ChevronLeft, Activity, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import StatsTable from "@/components/StatsTable";
import TeamStatsSummary from "@/components/TeamStatsSummary";
import RosterList from "@/components/RosterList";
import CommentSection from "@/components/CommentSection";
import PlanillaViewer from "@/components/PlanillaViewer";
import { Partido } from "@/lib/data";

export default function PartidoDetallePage() {
  const params = useParams();
  const partidoId = params.id as string;
  const [partido, setPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("estadisticas");
  const [showPlanilla, setShowPlanilla] = useState(false);

  useEffect(() => {
    async function loadPartido() {
      try {
        const res = await fetch(`/api/partidos`);
        const data = await res.json();
        const found = Array.isArray(data)
          ? data.find((p: Partido) => p.id === partidoId)
          : null;
        setPartido(found || null);
      } catch (error) {
        console.error("Error loading partido:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPartido();
  }, [partidoId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 mx-auto rounded bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!partido) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Partido no encontrado</h1>
          <Link href="/partidos" className="text-primary hover:underline">
            Volver a partidos
          </Link>
        </div>
      </div>
    );
  }

  const fecha = new Date(partido.fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const tabs = [
    { id: "estadisticas", label: "Estadísticas", icon: Activity },
    { id: "roster", label: "Roster", icon: Users },
    { id: "comentarios", label: "Comentarios", icon: MessageSquare },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb y Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          href="/partidos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a partidos
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span>{fecha}</span>
              <span className="text-border">|</span>
              <span>{partido.torneo}</span>
            </div>
            <h1 className="text-3xl font-bold">
              GER <span className="text-primary">vs</span> {partido.rival}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {partido.resultado && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-xl font-bold text-primary">
                  {partido.resultado}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowPlanilla(!showPlanilla)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                showPlanilla
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <FileText className="h-4 w-4" />
              Planilla
            </button>
          </div>
        </div>
      </motion.div>

      {/* Video */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <VideoPlayer youtubeUrl={partido.youtubeUrl} />
      </motion.div>

      {/* Planilla (condicional) */}
      <AnimatePresence>
        {showPlanilla && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <PlanillaViewer planillaUrl={partido.planillaUrl} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Contenido según tab */}
      <AnimatePresence mode="wait">
        {activeTab === "estadisticas" && (
          <motion.div
            key="estadisticas"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <TeamStatsSummary jugadores={partido.jugadores} />
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-bold text-lg">Estadísticas Individuales</h2>
                </div>
                <StatsTable jugadores={partido.jugadores} />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "roster" && (
          <motion.div
            key="roster"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-bold text-lg mb-4">Jugadores Convocados</h2>
              <RosterList jugadores={partido.jugadores.map((j) => j.jugador)} />
            </div>
          </motion.div>
        )}

        {activeTab === "comentarios" && (
          <motion.div
            key="comentarios"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-bold text-lg mb-4">Comentarios</h2>
              <CommentSection comentarios={partido.comentarios} partidoId={partido.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
