import type {
  AdvancedStatsV1,
  AdvancedStatsEquipo,
  AdvancedStatsJugador,
  AdvancedStatsArquero,
  AdvancedStatsTeamTotals,
  AdvancedStatsPeriodo,
} from "@/lib/data";

/**
 * Parser for World Aquatics official match PDFs (pdftotext output).
 *
 * Uses column-position-based parsing from the fixed-width layout.
 */

export function parseWorldAquaticsPdf(rawText: string): AdvancedStatsV1 {
  const lines = rawText
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.trim().length > 0);

  const clean = lines.filter(
    (l) =>
      !/Omega|Page\s+\d+\/\d+|Report Created|^\s*Page\s+\d+\s*$|Attendance|Delegates:|Referees:|^─/i.test(l)
  );

  const header = parseMatchHeader(clean);
  const teamBlocks = splitTeamBlocks(clean);

  const equipos: AdvancedStatsEquipo[] = teamBlocks.map((block, i) =>
    parseTeamBlock(block, i === 0)
  );

  return {
    schemaVersion: "v1",
    sourcePdf: "",
    fecha: header.fecha,
    partido: header.partido,
    resultado: header.resultado,
    equipos,
  };
}

// ─── Header ───

interface MatchHeader {
  fecha: string;
  partido: string;
  resultado: string;
}

function parseMatchHeader(lines: string[]): MatchHeader {
  let resultado = "";
  let partido = "";
  let fecha = "";

  for (const line of lines) {
    // "ARG 5 - 24 CRO" or "ARG 5-24 CRO"
    const m = line.match(/([A-Z]{3})\s+(\d+)\s*[–-]\s*(\d+)\s+([A-Z]{3})/);
    if (m) {
      resultado = `${m[1]} ${m[2]} - ${m[3]} ${m[4]}`;
    }
    if (/World Aquatics Championships/i.test(line)) {
      partido = line.trim();
    }
    if (/\d+\s*[–-]\s*\d+\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line)) {
      fecha = line.trim();
    }
  }

  return { fecha, partido, resultado };
}

// ─── Split teams ───

function splitTeamBlocks(lines: string[]): string[][] {
  const teamStartIndices: number[] = [];

  lines.forEach((line, i) => {
    if (/^[A-Z]{3}\s*-\s*(Argentina|Croacia|Croatia|Brasil|Brazil|Serbia|Hungary|España|Spain|Italia|Italy|Australia|USA|Grecia|Greece|Japón|Japan|Sudáfrica|South Africa|Kazajistán|Kazakhstan|Canadá|Canada|China|Francia|France|Alemania|Germany|Montenegro|Georgia|Rumania|Romania|Países Bajos|Netherlands|Israel)/i.test(line)) {
      teamStartIndices.push(i);
    }
  });

  const blocks: string[][] = [];
  for (let t = 0; t < teamStartIndices.length; t++) {
    const start = teamStartIndices[t];
    const end = t + 1 < teamStartIndices.length ? teamStartIndices[t + 1] : lines.length;
    blocks.push(lines.slice(start, end));
  }

  return blocks;
}

// ─── Team block ───

const TEAM_NAME_MAP: Record<string, string> = {
  ARG: "Argentina", CRO: "Croacia", BRA: "Brasil", SRB: "Serbia",
  HUN: "Hungary", ESP: "España", ITA: "Italia", AUS: "Australia",
  USA: "USA", GRE: "Grecia", JPN: "Japón", RSA: "Sudáfrica",
  KAZ: "Kazajistán", CAN: "Canadá", CHN: "China", FRA: "Francia",
  GER: "Alemania", MNE: "Montenegro", GEO: "Georgia", ROU: "Rumania",
  NED: "Países Bajos", ISR: "Israel",
};

/**
 * Column positions determined from the header row layout.
 * Positions are [start, end) character indices.
 * 
 * Header row (after "No."): 
 * cols: No. | Name | Played | Total | % | A | C | D | X | 6m | PS | CA | fouls...
 */
// We detect column boundaries dynamically from the header row

function parseTeamBlock(lines: string[], esLocal: boolean): AdvancedStatsEquipo {
  const headerLine = lines[0];
  const teamCode = headerLine.split(/\s/)[0];
  const nombre = TEAM_NAME_MAP[teamCode] || teamCode;

  // Find the header rows that define column layout.
  // Headers come in 3 rows: Cap row, Name row, No. row.
  // We use "No." row alone to find the start of player table.
  const noColIdx = lines.findIndex((l) => /^\s*No\.?\s/.test(l));
  if (noColIdx < 0) {
    return emptyTeam(nombre, teamCode, esLocal);
  }

  const playerLines: string[] = [];
  const goalieLines: string[] = [];
  let teamTotalsLine = "";
  let inGoalieSection = false;

  const startIdx = noColIdx + 1; // one after "No." row

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];

    // Stop at coaching staff
    if (/^(Head Coach|Assistant Coach|Team Official|Referees|Delegate)/i.test(line)) break;

    // Goalie section
    if (/Goalkeepers|Saves\/Shots/i.test(line)) {
      inGoalieSection = true;
      continue;
    }

    // Skip "Team" solo line
    if (/^\s*Team\s*$/i.test(line)) continue;

    // Totals rows — skip in goalie section (we compute totals ourselves)
    if (/^\s*Totals\s/i.test(line)) {
      if (!inGoalieSection) {
        teamTotalsLine = line;
      }
      continue;
    }

    // Generic noise — be careful not to skip goalie rows that have trailing text
    if (/^\s*Cap\s+\s*$|^\s*Saves\/Shots\s*$/i.test(line)) continue;
    if (/^(Timeouts|Exclusions?\s+(with|w\/)|Exclusions?\s+after)/i.test(line)) continue;

    // Player/goalie row? Starts with optional *, then digits, then name
    // Note: goalie rows may have only 1 space between number and name
    const isRow = /^\s*\*?\s*\d{1,2}\s+[A-ZÁÉÍÓÚÜÑ'][a-záéíóúüñ]/i.test(line);
    if (!isRow) continue;

    if (inGoalieSection) {
      goalieLines.push(line);
    } else {
      playerLines.push(line);
    }
  }

  const jugadores = playerLines.map((l) => parsePlayerRow(l));
  const arqueros = goalieLines.map((l) => parseGoalieRow(l));
  const equipo = parseTeamTotals(teamTotalsLine);

  return {
    nombre,
    pais: teamCode,
    esLocal,
    jugadores,
    arqueros,
    equipo,
    periodos: [],
    totalPeriodos: defaultPeriodo(),
  };
}

function emptyTeam(nombre: string, pais: string, esLocal: boolean): AdvancedStatsEquipo {
  return {
    nombre, pais, esLocal,
    jugadores: [],
    arqueros: [],
    equipo: defaultTeamTotals(),
    periodos: [],
    totalPeriodos: defaultPeriodo(),
  };
}

function defaultTeamTotals(): AdvancedStatsTeamTotals {
  return {
    goles: 0, tiros: 0, robos: 0, rebotes: 0, bloqueos: 0,
    sprints: null, timeouts: 0,
    exclusiones: { conSustitucion: 0, sinSustitucion4min: 0 },
    doblesExclusiones: 0, penalesCometidos: 0,
  };
}

function defaultPeriodo(): AdvancedStatsPeriodo {
  return {
    numero: null, posesiones: 0, tiempoPosesion: "0:00",
    porcentajePosesion: 0,
    tirosAA: { goles: 0, tiros: 0 },
    tirosX: { goles: 0, tiros: 0 },
    tirosPS: { goles: 0, tiros: 0 },
    eficienciaEPS: null,
  };
}

// ─── Position-based field extraction ───

/**
 * Extract substring and trim. Returns empty string if out of bounds.
 */
function field(line: string, start: number, end: number): string {
  if (start >= line.length) return "";
  const s = line.substring(start, Math.min(end, line.length)).trim();
  return s;
}

function parseShotPair(s: string): { goles: number; tiros: number } | null {
  if (!s) return null;
  const m = s.match(/^(\d+)\/(\d+)$/);
  if (!m) return null;
  return { goles: parseInt(m[1]), tiros: parseInt(m[2]) };
}

/**
 * Find all shot pairs (X/Y) in a line at or after `minPos`.
 * Returns array of {match, index} sorted by position.
 */
function findAllShotPairs(line: string, minPos: number = 40): Array<{ match: string; index: number }> {
  const results: Array<{ match: string; index: number }> = [];
  const re = /(\d+)\/(\d+)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m.index >= minPos) {
      results.push({ match: m[0], index: m.index });
    }
  }
  return results;
}

/**
 * Extract a value at a specific column range, trimmed.
 */
function colField(line: string, start: number, end: number): string {
  return line.substring(start, Math.min(end, line.length)).trim();
}

// SHOT_COLUMN_CENTERS is defined later in the file for field players,
// and GOALIE_COLUMN_CENTERS for goalkeepers.

function mapShotPairsToFields(
  pairs: Array<{ match: string; index: number }>,
  startIdx: number
): Record<string, { goles: number; tiros: number } | null> {
  const result: Record<string, { goles: number; tiros: number } | null> = {};
  const remaining = pairs.slice(startIdx);

  for (const col of SHOT_COLUMN_CENTERS) {
    let closest: { match: string; index: number } | null = null;
    let closestDist = Infinity;
    for (const pair of remaining) {
      const dist = Math.abs(pair.index - col.center);
      if (dist < closestDist && dist < col.width) {
        closestDist = dist;
        closest = pair;
      }
    }
    if (closest) {
      const p = parseShotPair(closest.match);
      result[col.field] = p;
      const idx = remaining.indexOf(closest);
      if (idx >= 0) remaining.splice(idx, 1);
    } else {
      result[col.field] = null;
    }
  }

  return result;
}

/**
 * Column positions for the fixed-width layout.
 * Derived from the header: "No.  Name  Played Total % A C D X 6m PS CA TO ST RB BL SP CP FP DS M6 CS DE P EX"
 * 
 * Character positions (0-indexed):
 * No.     = 0-4
 * Name    = 5-32  (varies, use dynamic detection)
 * Played  = 33-42 (roughly)
 * Total   = 43-50
 * %       = 51-55
 * A       = 56-61
 * C       = 62-67
 * D       = 68-73
 * X       = 74-79
 * 6m      = 80-85
 * PS      = 86-91
 * CA      = 92-97
 * TO      = 98-103
 * ST      = 104-109
 * RB      = 110-115
 * BL      = 116-121
 * SP      = 122-127
 * CP      = 128-133
 * FP      = 134-139
 * DS      = 140-145
 * M6      = 146-151
 * CS      = 152-157
 * DE      = 158-163
 * P       = 164-169
 * EX      = 170+
 */

/**
 * Column positions for the fixed-width field player table layout.
 * Calibrated from actual pair positions found in the data:
 * A at ~59, C at ~68, X at ~83, 6m at ~97, CA at ~106
 */
const PLAYER_COLS = {
  no: [1, 5],
  name: [8, 34],
  played: [35, 43],
  total: [44, 51],
  pct: [51, 57],
  A: [57, 65],
  C: [65, 73],
  D: [73, 79],
  X: [79, 84],
  "6m": [84, 91],
  PS: [91, 97],
  CA: [97, 103],
  TO: [103, 109],
  ST: [109, 114],
  RB: [114, 119],
  BL: [119, 125],
  SP: [125, 130],
  CP: [130, 134],
  FP: [134, 138],
  DS: [138, 142],
  M6: [142, 146],
  CS: [146, 150],
  DE: [150, 155],
  P: [155, 164],
  EX: [164, 999],
};

/**
 * Column centers for position-based shot type mapping.
 * Used by mapShotPairsToFields as a fallback/more precise approach.
 */
const SHOT_COLUMN_CENTERS = [
  { field: "A", center: 59, width: 8 },
  { field: "C", center: 68, width: 8 },
  { field: "D", center: 76, width: 4 },
  { field: "X", center: 83, width: 8 },
  { field: "6m", center: 91, width: 6 },
  { field: "PS", center: 97, width: 8 },
  { field: "CA", center: 106, width: 8 },
] as const;

function parsePlayerRow(line: string): AdvancedStatsJugador {
  const titular = line.trim().startsWith("*");

  const noStr = colField(line, PLAYER_COLS.no[0], PLAYER_COLS.no[1]).replace(/[*\s]/g, "");
  const numero = parseInt(noStr) || 0;
  const nombre = colField(line, PLAYER_COLS.name[0], PLAYER_COLS.name[1]);
  const tiempoJugado = colField(line, PLAYER_COLS.played[0], PLAYER_COLS.played[1]);

  // Total shots from its fixed column
  const totalShot = parseShotPair(colField(line, PLAYER_COLS.total[0], PLAYER_COLS.total[1])) || { goles: 0, tiros: 0 };

  // Use position-based mapping for shot types
  const allPairs = findAllShotPairs(line, 40);
  const shotFieldsMap = mapShotPairsToFields(allPairs, 1); // skip total, then map A, C, D, X, 6m, PS, CA

  // Fouls
  const faltas: Record<string, number> = {};
  const foulKeys = ["TO", "ST", "RB", "BL", "SP", "CP", "FP", "DS", "M6", "CS", "DE", "P", "EX"] as const;
  for (const key of foulKeys) {
    const col = PLAYER_COLS[key as keyof typeof PLAYER_COLS];
    const v = colField(line, col[0], col[1]);
    if (v) {
      const n = parseInt(v);
      if (!isNaN(n)) faltas[key] = n;
    }
  }

  return {
    numero,
    nombre,
    titular,
    tiempoJugado,
    tiros: {
      total: {
        goles: totalShot.goles,
        tiros: totalShot.tiros,
        porcentaje: totalShot.tiros > 0 ? Math.round((totalShot.goles / totalShot.tiros) * 100) : 0,
      },
      A: shotFieldsMap["A"] ?? null,
      C: shotFieldsMap["C"] ?? null,
      D: shotFieldsMap["D"] ?? null,
      X: shotFieldsMap["X"] ?? null,
      "6m": shotFieldsMap["6m"] ?? null,
      PS: shotFieldsMap["PS"] ?? null,
      CA: shotFieldsMap["CA"] ?? null,
    },
    faltas,
  };
}

/**
 * Parse a goalkeeper row.
 * Uses the first available "No." row in the goalie section to determine column positions.
 * Goalie data: Total X/Y, %, then A, C, D, X, 6m, PS, CA as X/Y pairs.
 * 
 * Key positions (calibrated from actual goalie lines):
 * Total at ~46, A at ~59, C at ~68, X at ~81, 6m at ~97, CA at ~106
 */
const GOALIE_COLUMN_CENTERS = [
  { field: "A", center: 59, width: 8 },
  { field: "C", center: 68, width: 8 },
  { field: "D", center: 76, width: 4 },
  { field: "X", center: 81, width: 8 },
  { field: "6m", center: 97, width: 12 },
  { field: "PS", center: 102, width: 3 },
  { field: "CA", center: 106, width: 12 },
] as const;

function parseGoalieRow(line: string): AdvancedStatsArquero {
  const titular = line.trim().startsWith("*");

  const noMatch = line.match(/^\s*\*?\s*(\d{1,2})/);
  const numero = noMatch ? parseInt(noMatch[1]) : 0;

  const nameMatch = line.match(/^\s*\*?\s*\d{1,2}\s+([A-ZÁÉÍÓÚÜÑ'][A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.]+?)\s{2,}\d/);
  const nombre = nameMatch ? nameMatch[1].trim() : "";

  const allPairs = findAllShotPairs(line, 40);
  const totalPair = allPairs.length > 0
    ? parseShotPair(allPairs[0].match)
    : null;
  const total = totalPair || { goles: 0, tiros: 0 };

  // Map remaining pairs to columns by position
  const goaliePairs = allPairs.slice(1);
  const atajadas: Record<string, { atajadas: number; tiros: number } | null> = {};

  for (const col of GOALIE_COLUMN_CENTERS) {
    let closest: { match: string; index: number } | null = null;
    let closestDist = Infinity;
    for (const pair of goaliePairs) {
      const dist = Math.abs(pair.index - col.center);
      if (dist < closestDist && dist < col.width) {
        closestDist = dist;
        closest = pair;
      }
    }
    if (closest) {
      const p = parseShotPair(closest.match);
      atajadas[col.field] = p ? { atajadas: p.goles, tiros: p.tiros } : null;
      const idx = goaliePairs.indexOf(closest);
      if (idx >= 0) goaliePairs.splice(idx, 1);
    } else {
      atajadas[col.field] = null;
    }
  }

  return {
    numero,
    nombre,
    titular,
    atajadas: {
      total: {
        atajadas: total.goles,
        tiros: total.tiros,
        porcentaje: total.tiros > 0 ? Math.round((total.goles / total.tiros) * 100) : 0,
      },
      A: atajadas["A"],
      C: atajadas["C"],
      D: atajadas["D"],
      X: atajadas["X"],
      "6m": atajadas["6m"],
      PS: atajadas["PS"],
      CA: atajadas["CA"],
    },
  };
}

function parseTeamTotals(_line: string): AdvancedStatsTeamTotals {
  return defaultTeamTotals();
}
