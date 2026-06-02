/**
 * One-time endpoint to seed the ARG vs CRO test match.
 * Visit /api/seed-arg-cro after deploying to trigger it.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseWorldAquaticsPdf } from "@/lib/parsers/worldAquaticsMatchPdf";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    // Check if already exists
    const existing = await prisma.partido.findFirst({
      where: { rival: "Croacia", torneo: { contains: "World Aquatics" } },
    });
    if (existing) {
      return NextResponse.json({
        message: "Match already exists",
        id: existing.id,
      });
    }

    // Read and parse the fixture
    const fixturePath = path.join(
      process.cwd(),
      "lib",
      "parsers",
      "fixtures",
      "arg-cro-2023.txt"
    );

    if (!fs.existsSync(fixturePath)) {
      return NextResponse.json(
        { error: "Fixture not found - deploy the latest code" },
        { status: 500 }
      );
    }

    const text = fs.readFileSync(fixturePath, "utf-8");
    const parsed = parseWorldAquaticsPdf(text);

    // Create the match
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

    return NextResponse.json({
      message: "Match created successfully",
      id: partido.id,
      rival: partido.rival,
      resultado: partido.resultado,
      hasAdvancedStats: !!partido.advancedStatsJson,
    });
  } catch (error) {
    console.error("Error seeding match:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error seeding match",
      },
      { status: 500 }
    );
  }
}
