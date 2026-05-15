"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import { partidosMock } from "@/lib/data";

export default function PartidosPage() {
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {partidosMock.map((partido, index) => (
          <MatchCard key={partido.id} partido={partido} index={index} />
        ))}
      </div>
    </div>
  );
}
