/**
 * Seed the ARG vs CRO test match with advanced stats.
 *
 * This script creates the match entry and stores the pre-parsed
 * advanced statistics from the World Aquatics PDF fixture.
 *
 * Usage: npx tsx scripts/seed-arg-cro.ts
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parseWorldAquaticsPdf } from "../lib/parsers/worldAquaticsMatchPdf";

const prisma = new PrismaClient();

async function main() {
  // Check if already exists
  const existing = await prisma.partido.findFirst({
    where: { rival: "Croacia", torneo: { contains: "World Aquatics" } },
  });

  if (existing) {
    console.log("Match already exists, updating advanced stats...");
    // Parse and store stats
    const fixturePath = path.join(
      __dirname,
      "..",
      "lib",
      "parsers",
      "fixtures",
      "arg-cro-2023.txt"
    );
    const text = fs.readFileSync(fixturePath, "utf-8");
    const parsed = parseWorldAquaticsPdf(text);

    await prisma.partido.update({
      where: { id: existing.id },
      data: {
        advancedStatsJson: parsed as any,
        advancedStatsSourceUrl: "/fixtures/arg-cro-2023.pdf",
      },
    });
    console.log("Updated match:", existing.id, existing.rival);
    return;
  }

  // Parse advanced stats
  const fixturePath = path.join(
    __dirname,
    "..",
    "lib",
    "parsers",
    "fixtures",
    "arg-cro-2023.txt"
  );
  const text = fs.readFileSync(fixturePath, "utf-8");
  const parsed = parseWorldAquaticsPdf(text);

  // Create match
  const partido = await prisma.partido.create({
    data: {
      rival: "Croacia",
      fecha: new Date("2023-07-17"),
      torneo: "World Aquatics Championships 2023 - Fukuoka",
      resultado: "5 - 24",
      planillaUrl: "/fixtures/arg-cro-2023.pdf",
      advancedStatsJson: parsed as any,
      advancedStatsSourceUrl: "/fixtures/arg-cro-2023.pdf",
    },
  });

  console.log("Created match:", partido.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
