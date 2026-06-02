import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseWorldAquaticsPdf } from "@/lib/parsers/worldAquaticsMatchPdf";

async function fetchAndExtractPdfText(url: string): Promise<string> {
  // Try pdftotext first (server-side)
  const { execSync } = await import("child_process");
  const { writeFileSync, unlinkSync } = await import("fs");
  const { tmpdir } = await import("os");
  const path = await import("path");

  const tmpFile = path.join(tmpdir(), `wp-pdf-${Date.now()}.pdf`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(tmpFile, buf);
    const text = execSync(`pdftotext -layout "${tmpFile}" -`, {
      encoding: "utf-8",
      timeout: 15000,
    });
    return text;
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { pdfText, pdfUrl } = body as { pdfText?: string; pdfUrl?: string };

    let text = pdfText;
    if (!text && pdfUrl) {
      text = await fetchAndExtractPdfText(pdfUrl);
    }

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing pdfText or pdfUrl in body" },
        { status: 400 }
      );
    }

    const partido = await prisma.partido.findUnique({ where: { id } });
    if (!partido) {
      return NextResponse.json(
        { error: "Partido not found" },
        { status: 404 }
      );
    }

    const parsed = parseWorldAquaticsPdf(text);

    const updated = await prisma.partido.update({
      where: { id },
      data: {
        advancedStatsJson: parsed as any,
        advancedStatsSourceUrl: partido.planillaUrl,
      },
      include: {
        jugadores: { include: { jugador: true } },
        comentarios: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error parsing advanced stats:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error parsing advanced stats",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const partido = await prisma.partido.findUnique({
      where: { id },
      select: {
        advancedStatsJson: true,
        advancedStatsSourceUrl: true,
      },
    });

    if (!partido) {
      return NextResponse.json(
        { error: "Partido not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      advancedStatsJson: partido.advancedStatsJson,
      advancedStatsSourceUrl: partido.advancedStatsSourceUrl,
    });
  } catch (error) {
    console.error("Error fetching advanced stats:", error);
    return NextResponse.json(
      { error: "Error fetching advanced stats" },
      { status: 500 }
    );
  }
}
