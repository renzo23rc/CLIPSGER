import * as fs from "fs";
import { parseWorldAquaticsPdf } from "./worldAquaticsMatchPdf";

const fixture = fs.readFileSync(__dirname + "/fixtures/arg-cro-2023.txt", "utf-8");
const result = parseWorldAquaticsPdf(fixture);

for (const equipo of result.equipos) {
  console.log(`\n=== ${equipo.nombre} ===`);
  console.log(`  Jugadores: ${equipo.jugadores.length}`);
  console.log(`  Arqueros: ${equipo.arqueros.length}`);

  // Verify team totals
  const e = equipo.equipo;
  console.log(`  Equipo: robos=${e.robos} rebotes=${e.rebotes} bloqueos=${e.bloqueos} timeouts=${e.timeouts}`);
  console.log(`  Dobles exclusión: ${e.doblesExclusiones} Penales cometidos: ${e.penalesCometidos}`);
}
