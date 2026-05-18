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

const bubbles = [
  { size: 16, left: "10%", delay: 0, duration: 6 },
  { size: 12, left: "22%", delay: 1.2, duration: 7.5 },
  { size: 20, left: "38%", delay: 2, duration: 5.5 },
  { size: 8, left: "52%", delay: 0.5, duration: 8 },
  { size: 14, left: "65%", delay: 1.8, duration: 6.5 },
  { size: 10, left: "78%", delay: 3, duration: 7 },
  { size: 18, left: "88%", delay: 2.5, duration: 5 },
  { size: 6, left: "45%", delay: 0.8, duration: 9 },
];

export default function HeroSection({
  partidosCount,
  jugadoresCount,
  topGoleadorGoles,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-[#0f1f45] to-background">
      {/* Decorative blur circles */}
      <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

      {/* Animated Waves */}
      <div className="absolute bottom-0 left-0 h-56 w-full overflow-hidden pointer-events-none">
        {/* Wave 1 — dorado, lento */}
        <div
          className="absolute inset-0 animate-wave-slow"
          style={{ animationDuration: "22s" }}
        >
          <svg
            viewBox="0 0 2880 200"
            className="h-56 w-[200%]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 C240,200 480,40 720,120 C960,200 1200,40 1440,120 C1680,200 1920,40 2160,120 C2400,200 2640,40 2880,120 L2880,200 L0,200 Z"
              fill="#c9a84c"
              opacity="0.08"
            />
          </svg>
        </div>

        {/* Wave 2 — azul agua, medio */}
        <div
          className="absolute inset-0 animate-wave-medium"
          style={{ animationDuration: "16s" }}
        >
          <svg
            viewBox="0 0 2880 180"
            className="h-56 w-[200%]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 C360,180 720,20 1080,100 C1440,180 1800,20 2160,100 C2520,180 2880,100 2880,100 L2880,180 L0,180 Z"
              fill="#0ea5e9"
              opacity="0.1"
            />
          </svg>
        </div>

        {/* Wave 3 — dorado/agua mixto, rápido */}
        <div
          className="absolute inset-0 animate-wave-fast"
          style={{ animationDuration: "10s" }}
        >
          <svg
            viewBox="0 0 2880 160"
            className="h-56 w-[200%]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 C300,160 600,0 900,80 C1200,160 1500,0 1800,80 C2100,160 2400,0 2700,80 C2880,120 2880,160 2880,160 L0,160 Z"
              fill="#c9a84c"
              opacity="0.06"
            />
          </svg>
        </div>
      </div>

      {/* Floating Bubbles */}
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            bottom: "5%",
          }}
          animate={{
            y: [0, -300, -600],
            x: [0, 20, -10, 15, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 1.1, 0.8],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        />
      ))}

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
