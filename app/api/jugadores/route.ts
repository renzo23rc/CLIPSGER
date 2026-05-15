import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const jugadores = await prisma.jugador.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(jugadores);
  } catch (error) {
    console.error("Error fetching jugadores:", error);
    return NextResponse.json(
      { error: "Error al obtener jugadores" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jugador = await prisma.jugador.create({
      data: {
        nombre: body.nombre,
        posiciones: body.posiciones || [],
        fotoUrl: body.fotoUrl || null,
      },
    });
    return NextResponse.json(jugador);
  } catch (error) {
    console.error("Error creating jugador:", error);
    return NextResponse.json(
      { error: "Error al crear jugador" },
      { status: 500 }
    );
  }
}
