"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarDays, Users, TrendingUp } from "lucide-react";

interface HeroSectionProps {
  partidosCount: number;
  jugadoresCount: number;
  topGoleadorGoles: number;
}

const stars = Array.from({ length: 13 }, (_, i) => i);

export default function HeroSection({
  partidosCount,
  jugadoresCount,
  topGoleadorGoles,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-[#0f1f45] to-background">
      {/* Fondo: foto del equipo */}
      <Image
        src="/tomi.jpg"
        alt="Waterpolo GER"
        fill
        className="object-cover opacity-20"
        priority
      />

      {/* Decorative blur circles */}
      <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Escudo — grande, con glow */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 14,
              duration: 0.9,
            }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-[60px] scale-[1.8]" />
            <Image
              src="/escudo.jpeg"
              alt="Escudo GER"
              width={120}
              height={120}
              className="rounded-2xl object-cover ring-4 ring-primary/30 shadow-[0_0_40px_rgba(201,168,76,0.3)] relative z-10"
              priority
            />
          </motion.div>

          {/* 13 estrellas escalonadas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-1 mb-6"
          >
            {stars.map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.6 + i * 0.06,
                  type: "spring",
                  stiffness: 250,
                  damping: 12,
                }}
                className="text-primary text-base md:text-lg leading-none"
              >
                ★
              </motion.span>
            ))}
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-4"
          >
            Waterpolo{" "}
            <span className="text-primary">GER</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mb-10"
          >
            Gimnasia y Esgrima de Rosario. Los más grandes somos nosotros.
          </motion.p>

          {/* Stats pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <div className="flex items-center gap-2 rounded-lg bg-card/60 backdrop-blur-sm px-4 py-2.5 border border-border/50">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{partidosCount}</p>
                <p className="text-xs text-muted-foreground">Partidos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/60 backdrop-blur-sm px-4 py-2.5 border border-border/50">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">{jugadoresCount}</p>
                <p className="text-xs text-muted-foreground">Jugadores</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card/60 backdrop-blur-sm px-4 py-2.5 border border-border/50">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">{topGoleadorGoles}</p>
                <p className="text-xs text-muted-foreground">Goles líder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
