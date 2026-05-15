"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import { Partido } from "@/lib/data";

export default function PartidosPage() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartidos() {
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
    loadPartidos();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Partidos</h1>
        </div>
        <p className="text-muted-foreground">
          Todos los partidos de la temporada 2026
        </p>
      </motion.div>

      {loading ? (
        <div className="animate-pulse grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted" />
          ))}
        </div>
      ) : partidos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No hay partidos cargados</p>
          <p className="text-sm">
            Andá al panel de admin para cargar tu primer partido
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {partidos.map((partido, index) => (
            <MatchCard key={partido.id} partido={partido} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
