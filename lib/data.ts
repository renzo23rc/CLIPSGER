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
