export interface Jugador {
  id: string;
  nombre: string;
  posiciones: string[];
  fotoUrl?: string | null;
}

export interface Partido {
  id: string;
  rival: string;
  fecha: string;
  torneo: string;
  resultado?: string | null;
  youtubeUrl?: string | null;
  planillaUrl?: string | null;
  jugadores: PartidoJugador[];
  comentarios: Comentario[];
}

export interface PartidoJugador {
  id?: string;
  jugadorId?: string;
  partidoId?: string;
  jugador: Jugador;
  goles: number;
  asistencias: number;
  robos: number;
  bloqueos: number;
  exclusiones: number;
  turnovers: number;
  tirosArco: number;
  atajadas: number;
}

export interface Comentario {
  id: string;
  autorNombre: string;
  texto: string;
  minuto: number;
  createdAt: string;
}

// Mock data para desarrollo
export const jugadoresMock: Jugador[] = [
  { id: "1", nombre: "Martín Pérez", posiciones: ["Boya"], fotoUrl: "" },
  { id: "2", nombre: "Lucas García", posiciones: ["Wing", "Centro"], fotoUrl: "" },
  { id: "3", nombre: "Juan Rodríguez", posiciones: ["Arquero"], fotoUrl: "" },
  { id: "4", nombre: "Diego Fernández", posiciones: ["Defensa"], fotoUrl: "" },
  { id: "5", nombre: "Nicolás López", posiciones: ["Boya"], fotoUrl: "" },
  { id: "6", nombre: "Tomás Martínez", posiciones: ["Wing"], fotoUrl: "" },
  { id: "7", nombre: "Alejandro Sosa", posiciones: ["Centro"], fotoUrl: "" },
];

export const partidosMock: Partido[] = [
  {
    id: "1",
    rival: "Club Atlético River Plate",
    fecha: "2026-05-10",
    torneo: "Liga Nacional de Waterpolo",
    resultado: "8-5",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    jugadores: [
      { jugador: jugadoresMock[0], goles: 3, asistencias: 1, robos: 2, bloqueos: 0, exclusiones: 1, turnovers: 2, tirosArco: 5, atajadas: 0 },
      { jugador: jugadoresMock[1], goles: 2, asistencias: 2, robos: 1, bloqueos: 1, exclusiones: 0, turnovers: 1, tirosArco: 4, atajadas: 0 },
      { jugador: jugadoresMock[2], goles: 0, asistencias: 0, robos: 0, bloqueos: 0, exclusiones: 0, turnovers: 0, tirosArco: 0, atajadas: 8 },
      { jugador: jugadoresMock[3], goles: 1, asistencias: 1, robos: 3, bloqueos: 2, exclusiones: 2, turnovers: 1, tirosArco: 3, atajadas: 0 },
      { jugador: jugadoresMock[4], goles: 2, asistencias: 0, robos: 1, bloqueos: 1, exclusiones: 0, turnovers: 3, tirosArco: 4, atajadas: 0 },
    ],
    comentarios: [
      { id: "1", autorNombre: "Carlos", texto: "Golazo de Pérez en el tercer cuarto", minuto: 780, createdAt: "2026-05-10T20:30:00Z" },
      { id: "2", autorNombre: "Ana", texto: "Qué atajada del arquero en el final", minuto: 2280, createdAt: "2026-05-10T21:00:00Z" },
      { id: "3", autorNombre: "Pedro", texto: "Gran trabajo defensivo de Fernández", minuto: 1200, createdAt: "2026-05-10T20:45:00Z" },
    ],
  },
  {
    id: "2",
    rival: "Boca Juniors",
    fecha: "2026-05-03",
    torneo: "Liga Nacional de Waterpolo",
    resultado: "6-7",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    jugadores: [
      { jugador: jugadoresMock[0], goles: 2, asistencias: 1, robos: 1, bloqueos: 0, exclusiones: 2, turnovers: 3, tirosArco: 6, atajadas: 0 },
      { jugador: jugadoresMock[1], goles: 1, asistencias: 2, robos: 2, bloqueos: 1, exclusiones: 0, turnovers: 2, tirosArco: 4, atajadas: 0 },
      { jugador: jugadoresMock[2], goles: 0, asistencias: 0, robos: 0, bloqueos: 0, exclusiones: 1, turnovers: 0, tirosArco: 0, atajadas: 6 },
      { jugador: jugadoresMock[3], goles: 2, asistencias: 0, robos: 2, bloqueos: 3, exclusiones: 1, turnovers: 1, tirosArco: 4, atajadas: 0 },
      { jugador: jugadoresMock[5], goles: 1, asistencias: 1, robos: 1, bloqueos: 0, exclusiones: 0, turnovers: 2, tirosArco: 3, atajadas: 0 },
    ],
    comentarios: [
      { id: "4", autorNombre: "María", texto: "Partido reñido hasta el final", minuto: 2400, createdAt: "2026-05-03T21:15:00Z" },
      { id: "5", autorNombre: "José", texto: "Lástima la derrota, pero gran esfuerzo", minuto: 2520, createdAt: "2026-05-03T21:20:00Z" },
    ],
  },
  {
    id: "3",
    rival: "Newell's Old Boys",
    fecha: "2026-04-26",
    torneo: "Copa Provincial",
    resultado: "9-3",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    jugadores: [
      { jugador: jugadoresMock[0], goles: 4, asistencias: 2, robos: 3, bloqueos: 0, exclusiones: 0, turnovers: 1, tirosArco: 7, atajadas: 0 },
      { jugador: jugadoresMock[1], goles: 2, asistencias: 3, robos: 2, bloqueos: 1, exclusiones: 0, turnovers: 1, tirosArco: 5, atajadas: 0 },
      { jugador: jugadoresMock[2], goles: 0, asistencias: 0, robos: 0, bloqueos: 0, exclusiones: 0, turnovers: 0, tirosArco: 0, atajadas: 10 },
      { jugador: jugadoresMock[3], goles: 1, asistencias: 1, robos: 4, bloqueos: 2, exclusiones: 1, turnovers: 0, tirosArco: 3, atajadas: 0 },
      { jugador: jugadoresMock[6], goles: 2, asistencias: 1, robos: 1, bloqueos: 0, exclusiones: 0, turnovers: 2, tirosArco: 4, atajadas: 0 },
    ],
    comentarios: [
      { id: "6", autorNombre: "Laura", texto: "Partidazo de Pérez, 4 goles", minuto: 1680, createdAt: "2026-04-26T20:50:00Z" },
      { id: "7", autorNombre: "Roberto", texto: "Gran victoria para cerrar la fase de grupos", minuto: 2400, createdAt: "2026-04-26T21:15:00Z" },
    ],
  },
];
