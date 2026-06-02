/**
 * Seed/re-parse the ARG vs CRO test match.
 * - First visit: creates the match with advanced stats
 * - Visit with ?reparse=true: re-parses and updates the stats
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseWorldAquaticsPdf } from "@/lib/parsers/worldAquaticsMatchPdf";
import * as fs from "fs";
import * as path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reparse = searchParams.get("reparse") === "true";

    // Read fixture
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

    const existing = await prisma.partido.findFirst({
      where: { rival: "Croacia", torneo: { contains: "World Aquatics" } },
    });

    if (existing && !reparse) {
      return NextResponse.json({
        message: "Match already exists (use ?reparse=true to update)",
        id: existing.id,
      });
    }

    if (existing && reparse) {
      const updated = await prisma.partido.update({
        where: { id: existing.id },
        data: {
          advancedStatsJson: parsed as any,
          advancedStatsSourceUrl: "/fixtures/arg-cro-2023.pdf",
        },
      });
      return NextResponse.json({
        message: "Match re-parsed successfully",
        id: updated.id,
        advancedStats: updated.advancedStatsJson,
      });
    }

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

    return NextResponse.json({
      message: "Match created successfully",
      id: partido.id,
      rival: partido.rival,
      resultado: partido.resultado,
      hasAdvancedStats: !!partido.advancedStatsJson,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
