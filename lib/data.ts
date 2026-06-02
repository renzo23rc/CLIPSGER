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
  advancedStatsJson?: AdvancedStatsV1 | null;
  advancedStatsSourceUrl?: string | null;
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
  perdidas: number;
  tirosTotales: number;
  atajadas: number;
}

export interface Comentario {
  id: string;
  autorNombre: string;
  texto: string;
  minuto: number;
  createdAt: string;
}

// ─── Advanced Match Statistics (v1) ───

export interface AdvancedStatsV1 {
  schemaVersion: "v1";
  sourcePdf: string;
  fecha: string;
  partido: string;
  resultado: string;
  equipos: AdvancedStatsEquipo[];
}

export interface AdvancedStatsEquipo {
  nombre: string;
  pais: string;
  esLocal: boolean;
  jugadores: AdvancedStatsJugador[];
  arqueros: AdvancedStatsArquero[];
  equipo: AdvancedStatsTeamTotals;
  periodos: AdvancedStatsPeriodo[];
  totalPeriodos: AdvancedStatsPeriodo;
}

export interface AdvancedStatsJugador {
  numero: number;
  nombre: string;
  titular: boolean;
  tiempoJugado: string;
  tiros: {
    total: { goles: number; tiros: number; porcentaje: number };
    A: { goles: number; tiros: number } | null;
    C: { goles: number; tiros: number } | null;
    D: { goles: number; tiros: number } | null;
    X: { goles: number; tiros: number } | null;
    "6m": { goles: number; tiros: number } | null;
    PS: { goles: number; tiros: number } | null;
    CA: { goles: number; tiros: number } | null;
  };
  faltas: Record<string, number>;
}

export interface AdvancedStatsArquero {
  numero: number;
  nombre: string;
  titular: boolean;
  atajadas: {
    total: { atajadas: number; tiros: number; porcentaje: number };
    A: { atajadas: number; tiros: number } | null;
    C: { atajadas: number; tiros: number } | null;
    D: { atajadas: number; tiros: number } | null;
    X: { atajadas: number; tiros: number } | null;
    "6m": { atajadas: number; tiros: number } | null;
    PS: { atajadas: number; tiros: number } | null;
    CA: { atajadas: number; tiros: number } | null;
  };
}

export interface AdvancedStatsTeamTotals {
  goles: number;
  tiros: number;
  robos: number;
  rebotes: number;
  bloqueos: number;
  sprints: { ganados: number; total: number } | null;
  timeouts: number;
  exclusiones: { conSustitucion: number; sinSustitucion4min: number };
  doblesExclusiones: number;
  penalesCometidos: number;
}

export interface AdvancedStatsPeriodo {
  numero: number | null;
  posesiones: number;
  tiempoPosesion: string;
  porcentajePosesion: number;
  tirosAA: { goles: number; tiros: number };
  tirosX: { goles: number; tiros: number };
  tirosPS: { goles: number; tiros: number };
  eficienciaEPS: { goles: number; situaciones: number; porcentaje: number } | null;
}


