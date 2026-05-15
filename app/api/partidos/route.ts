import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const partidos = await prisma.partido.findMany({
      orderBy: { fecha: "desc" },
      include: {
        jugadores: {
          include: {
            jugador: true,
          },
        },
        comentarios: true,
      },
    });
    return NextResponse.json(partidos);
  } catch (error) {
    console.error("Error fetching partidos:", error);
    return NextResponse.json(
      { error: "Error al obtener partidos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const partido = await prisma.partido.create({
      data: {
        rival: body.rival,
        fecha: new Date(body.fecha),
        torneo: body.torneo,
        resultado: body.resultado || null,
        youtubeUrl: body.youtubeUrl || null,
        planillaUrl: body.planillaUrl || null,
      },
    });
    return NextResponse.json(partido);
  } catch (error) {
    console.error("Error creating partido:", error);
    return NextResponse.json(
      { error: "Error al crear partido" },
      { status: 500 }
    );
  }
}
