"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createPartido(data: {
  rival: string;
  fecha: string;
  torneo: string;
  resultado?: string;
  youtubeUrl?: string;
}) {
  try {
    const partido = await prisma.partido.create({
      data: {
        rival: data.rival,
        fecha: new Date(data.fecha),
        torneo: data.torneo,
        resultado: data.resultado || null,
        youtubeUrl: data.youtubeUrl || null,
      },
    });
    return { success: true, partido };
  } catch (error) {
    console.error("Error creating partido:", error);
    return { success: false, error: "Error al crear partido" };
  }
}

export async function createJugador(data: {
  nombre: string;
  posiciones: string[];
}) {
  try {
    const jugador = await prisma.jugador.create({
      data: {
        nombre: data.nombre,
        posiciones: data.posiciones,
      },
    });
    return { success: true, jugador };
  } catch (error) {
    console.error("Error creating jugador:", error);
    return { success: false, error: "Error al crear jugador" };
  }
}

export async function createPartidoJugador(data: {
  jugadorId: string;
  partidoId: string;
  goles: number;
  asistencias: number;
  robos: number;
  bloqueos: number;
  exclusiones: number;
  turnovers: number;
  tirosArco: number;
  atajadas: number;
}) {
  try {
    const stats = await prisma.partidoJugador.create({
      data: {
        jugadorId: data.jugadorId,
        partidoId: data.partidoId,
        goles: data.goles,
        asistencias: data.asistencias,
        robos: data.robos,
        bloqueos: data.bloqueos,
        exclusiones: data.exclusiones,
        turnovers: data.turnovers,
        tirosArco: data.tirosArco,
        atajadas: data.atajadas,
      },
    });
    return { success: true, stats };
  } catch (error) {
    console.error("Error creating stats:", error);
    return { success: false, error: "Error al cargar estadísticas" };
  }
}

export async function getPartidos() {
  try {
    const partidos = await prisma.partido.findMany({
      orderBy: { fecha: "desc" },
      include: {
        jugadores: {
          include: {
            jugador: true,
          },
        },
        comentarios: true,
      },
    });
    return { success: true, partidos };
  } catch (error) {
    console.error("Error fetching partidos:", error);
    return { success: false, error: "Error al obtener partidos" };
  }
}

export async function getJugadores() {
  try {
    const jugadores = await prisma.jugador.findMany({
      orderBy: { nombre: "asc" },
    });
    return { success: true, jugadores };
  } catch (error) {
    console.error("Error fetching jugadores:", error);
    return { success: false, error: "Error al obtener jugadores" };
  }
}
