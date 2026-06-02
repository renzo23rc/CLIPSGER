# Design: Advanced Match Statistics

## Technical Approach

Store parsed World Aquatics PDF stats as versioned JSONB on `Partido`, exposed through a new tab UI. A single `POST /api/partidos/[id]/advanced-stats` endpoint accepts PDF text, runs a server-side parser, persists `advancedStatsJson`, and returns the updated match. The frontend lazily fetches and renders conditionally.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Storage** | JSONB column (`advancedStatsJson Json?`) | No 30+ typed columns. Schema evolves via `schemaVersion`. Prisma JSON queries possible if needed later. |
| **Parser input** | Raw `pdfText: string` (from pdftotext) | Server env may not have pdftotext; accepts pre-parsed text. Also fetches from `planillaUrl` if provided. |
| **Schema versioning** | `schemaVersion: "v1"` at JSON root | Future PDF format changes require new parser + version bump. Viewer renders v1/v2. |
| **API idempotency** | Always re-parses if called again | Stats source-of-truth is the PDF. No partial merge logic needed. |
| **Frontend tab** | "Avanzadas" tab in existing tab bar, rendered only when `advancedStatsJson` exists | Follows existing pattern (Estadísticas/Roster/Comentarios). No layout shifts. |

## Data Flow

```
PDF → pdftotext → raw text
                      ↓
      POST /api/partidos/[id]/advanced-stats { pdfText }
                      ↓
      worldAquaticsMatchPdf.parse(pdfText)
                      ↓
      AdvancedStatsV1 → prisma.partido.update({ advancedStatsJson })
                      ↓
      Return match → Page fetches /api/partidos → "Avanzadas" tab renders
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `advancedStatsJson Json?` and `advancedStatsSourceUrl String?` to Partido |
| `lib/data.ts` | Modify | Add full `AdvancedStatsV1` types; extend `Partido` with optional `advancedStatsJson` |
| `lib/parsers/worldAquaticsMatchPdf.ts` | Create | Parser: raw text → `AdvancedStatsV1` |
| `app/api/partidos/[id]/advanced-stats/route.ts` | Create | POST handler; validate, parse, persist, return |
| `components/AdvancedStatsViewer.tsx` | Create | Conditional sections for shot types, GKs, quarters, EPS |
| `app/partidos/[id]/page.tsx` | Modify | Add "Avanzadas" tab; render viewer when `advancedStatsJson` present |

## JSON Schema: `AdvancedStatsV1`

```typescript
interface AdvancedStatsV1 {
  schemaVersion: "v1";
  players: PlayerStatsV1[];
  goalkeepers: GoalkeeperStatsV1[];
  team: TeamStatsV1;
  legend: Record<string, string>;
}

interface PlayerStatsV1 {
  capNumber: number;
  name: string;
  timePlayed: string;               // e.g. "28:35"
  goals: number;
  shotsTotal: number;
  shotPct: number | null;           // null if no shots
  shotsByType: {
    action: { made: number; attempted: number };
    center: { made: number; attempted: number };
    extraPlayer: { made: number; attempted: number };
    penalty: { made: number; attempted: number };
    fiveMeter: { made: number; attempted: number };
  };
  fouls: {
    exclusion20s: number;
    penaltyFoul: number;
    turnoverFoul: number;
  };
  other: {
    steals: number;
    blocks: number;
    sprints: number;                // swim-off
  };
}

interface GoalkeeperStatsV1 {
  capNumber: number;
  name: string;
  timePlayed: string;
  saves: number;
  shotsFaced: number;
  savePct: number;
  savesByType: {
    action: { saved: number; faced: number };
    center: { saved: number; faced: number };
    extraPlayer: { saved: number; faced: number };
    penalty: { saved: number; faced: number };
    fiveMeter: { saved: number; faced: number };
  };
}

interface TeamStatsV1 {
  playersTotal: {
    goals: number; shotsTotal: number; shotPct: number;
    shotsByType: ShotBreakdown;
    fouls: { exclusion20s: number; penaltyFoul: number; turnoverFoul: number };
    other: { steals: number; blocks: number; sprints: number };
  };
  goalkeepersTotal: {
    saves: number; shotsFaced: number; savePct: number;
    savesByType: ShotBreakdown;
  };
  quarters: QuarterData[];
  eps: { made: number; attempted: number; pct: number };
}

interface QuarterData {
  quarter: 1 | 2 | 3 | 4;
  teamScore: number;
  opponentScore: number;
  teamShotsMade: number;
  teamShotsAttempted: number;
  opponentShotsMade: number;
  opponentShotsAttempted: number;
  possessionPct: number;
  possessions: number;
  possessionTime: string;
}

interface ShotBreakdown {
  action: { made: number; attempted: number };
  center: { made: number; attempted: number };
  extraPlayer: { made: number; attempted: number };
  penalty: { made: number; attempted: number };
  fiveMeter: { made: number; attempted: number };
}
```

## Parser Strategy

`lib/parsers/worldAquaticsMatchPdf.ts` exposes:

```typescript
export function parseWorldAquaticsMatchPdf(text: string): AdvancedStatsV1
```

Regex-based row extraction:
1. Detect **field players** section: rows with cap number `*N` and shot/goal columns.
2. Detect **goalkeepers** section: follows "Goalkeepers:" header line; rows with save columns.
3. Extract **quarter data**: lines matching `Quarter N:` pattern with possession/pct.
4. Extract **EPS row**: line starting with `EPS Efficiency:`.
5. Build **legend** from column abbreviations in the header line.

Error handling: if the text doesn't match expected patterns, throw `ParseError` with `{ reason: string }` — caught by API route and returned as 422.

## API Route Contract

```
POST /api/partidos/[id]/advanced-stats
```

**Request body** (one of):
- `{ pdfText: string }` — raw pdftotext output
- `{}` — when `partido.planillaUrl` exists; server fetches and converts

**Response**:
- `200`: `{ partido: Partido }` — updated match with `advancedStatsJson`
- `400`: `{ error: "Missing pdfText and no planillaUrl" }`
- `422`: `{ error: "Parse failed", reason: string }`
- `404`: partido not found

**Logic**:
1. Load partido by ID.
2. If `pdfText` present → use it. Else if `planillaUrl` → fetch + `pdftotext`. Else → 400.
3. Call `parseWorldAquaticsMatchPdf(text)`.
4. `prisma.partido.update({ advancedStatsJson, advancedStatsSourceUrl })`.
5. Return full partido with relations (same include as GET).

## Component: `AdvancedStatsViewer`

```typescript
interface Props {
  advancedStatsJson: AdvancedStatsV1 | null;
}
```

**Sections** (each wrapped in a card matching existing `border border-border bg-card`):

| Section | Renders when | Content |
|---------|-------------|---------|
| Shot Type Summary | `players.length > 0` | Per-player table: Action/Center/EP/Penalty/5m columns with made/attempted + pct |
| Goalkeeper Comparison | `goalkeepers.length > 0` | Side-by-side cards or table: saves by type, total pct |
| Quarter-by-Quarter | `team.quarters.length > 0` | Table: Q1-Q4 with scoring, possession%, time |
| Possession Summary | `team.quarters.length > 0` | Totals row from quarters |
| EPS Efficiency | `team.eps` present | Highlight card: made/attempted/pct |
| Team Totals | `team.playersTotal` | Steals, blocks, fouls, sprints summary |

Styling: reuse `StatsTable` patterns — `overflow-x-auto` tables, `bg-muted/50` headers, colored stat columns via Tailwind text classes, `framer-motion` `motion.div` with stagger entry.

## Integration in `page.tsx`

1. Add to `tabs` array: `{ id: "avanzadas", label: "Avanzadas", icon: BarChart3 }` — only when `partido.advancedStatsJson` is not null.
2. Add `activeTab === "avanzadas"` block rendering `<AdvancedStatsViewer advancedStatsJson={partido.advancedStatsJson} />`.
3. Add a "Parse PDF" button in the header area (near "Planilla" button), shown only when `partido.planillaUrl && !partido.advancedStatsJson`. Calls the POST endpoint, then refreshes `partido` state.

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Unit | Parser: valid PDF text → correct `AdvancedStatsV1` | Jest/Vitest with sample text fixtures |
| Unit | Parser: garbage input → `ParseError` | Same |
| Integration | API route returns 200/400/422 correctly | Playwright API test or `fetch` in test |
| UI | Viewer renders all sections with mock data | Playwright component test or manual |
| UI | "Avanzadas" tab hidden when null | Playwright E2E |

## Migration

No data migration required — `advancedStatsJson` defaults to `null`. Existing matches show no "Avanzadas" tab. New columns are additive.

## Open Questions

- [ ] Is `pdftotext` available in the production Vercel/serverless runtime? If not, the API route must rely on client-side `pdfText` submission only.
- [ ] Should the API route support batch parsing? (Out of scope for v1, but design allows it.)
