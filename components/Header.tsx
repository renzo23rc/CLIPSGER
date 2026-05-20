"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Users, Calendar, Settings } from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio", icon: Trophy },
  { href: "/partidos", label: "Partidos", icon: Calendar },
  { href: "/jugadores", label: "Jugadores", icon: Users },
  { href: "/admin", label: "Admin", icon: Settings },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md"
    >
      {/* Subtle golden bottom border that fades in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />

      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/escudo.jpeg"
              alt="Escudo GER"
              width={52}
              height={52}
              className="rounded-lg object-cover ring-2 ring-primary/50 shadow-[0_0_15px_rgba(201,168,76,0.3)]"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold leading-tight">Waterpolo GER</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary ring-1 ring-primary/30">
                <Trophy className="h-3 w-3" />
                13x
              </span>
            </div>
            <p className="hidden sm:block text-xs text-muted-foreground leading-tight">
              Gimnasia y Esgrima de Rosario
            </p>
            <div className="hidden sm:block mt-1 h-px w-16 bg-gradient-to-r from-primary to-transparent" />
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
                {/* Animated underline */}
                <span
                  className={`absolute bottom-1 left-3 right-3 h-0.5 rounded-full transition-transform duration-300 origin-center ${
                    isActive
                      ? "bg-primary scale-x-100"
                      : "bg-primary/40 scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
