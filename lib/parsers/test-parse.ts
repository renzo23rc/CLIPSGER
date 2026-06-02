import * as fs from "fs";
import { parseWorldAquaticsPdf } from "./worldAquaticsMatchPdf";

const fixture = fs.readFileSync(__dirname + "/fixtures/arg-cro-2023.txt", "utf-8");
const result = parseWorldAquaticsPdf(fixture);

for (const equipo of result.equipos) {
  console.log(`\n=== ${equipo.nombre} ===`);
  console.log(`  Jugadores: ${equipo.jugadores.length}`);
  console.log(`  Arqueros: ${equipo.arqueros.length}`);

  // Shot type totals
  const shotTypes = ["A", "C", "D", "X", "6m", "PS", "CA"] as const;
  const totals: Record<string, { g: number; t: number }> = { total: { g: 0, t: 0 } };
  shotTypes.forEach(st => totals[st] = { g: 0, t: 0 });

  for (const j of equipo.jugadores) {
    const g = j.tiros.total.goles;
    const t = j.tiros.total.tiros;
    totals.total.g += g;
    totals.total.t += t;
    
    for (const st of shotTypes) {
      const s = j.tiros[st];
      if (s) {
        totals[st].g += s.goles;
        totals[st].t += s.tiros;
      }
    }
  }

  console.log(`  Totales: ${totals.total.g}/${totals.total.t}`);
  for (const st of shotTypes) {
    if (totals[st].t > 0) {
      console.log(`    ${st.padEnd(3)}: ${totals[st].g}/${totals[st].t} (${Math.round(totals[st].g/totals[st].t*100)}%)`);
    }
  }

  for (const g of equipo.arqueros) {
    const showAta = (a: { atajadas: number; tiros: number } | null) =>
      a ? `${a.atajadas}/${a.tiros}` : "-/-";
    console.log(`  GK #${g.numero} ${g.nombre.padEnd(25)} ${g.atajadas.total.atajadas}/${g.atajadas.total.tiros} (${g.atajadas.total.porcentaje}%)`);
    console.log(`      A:${showAta(g.atajadas.A)} C:${showAta(g.atajadas.C)} D:${showAta(g.atajadas.D)} X:${showAta(g.atajadas.X)} 6m:${showAta(g.atajadas["6m"])} PS:${showAta(g.atajadas.PS)} CA:${showAta(g.atajadas.CA)}`);
  }
}
